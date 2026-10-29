import {
  BASE_RANGE,
  COSTS,
  ENEMIES,
  FINAL_WAVE,
  PATH,
  START_GOLD,
  START_LIVES,
  auraFor,
  cellCenter,
  expandWave,
  inBounds,
  isPath,
  layoutFor,
  prettyWave,
  sellValue,
  shotProfile,
  upgradeCost,
  type Layout,
} from "./balance.ts";
import type {
  Enemy,
  EnemyKind,
  GameEvent,
  Hud,
  Particle,
  Phase,
  Shot,
  Special,
  TargetMode,
  Tower,
  TowerKind,
} from "./types.ts";

const CURSE_AMP = 1.22;

export class SkySim {
  phase: Phase = "menu";
  gold = START_GOLD;
  lives = START_LIVES;
  wave = 0;
  bestWave = 0;
  speed = 1;
  juice = true;
  placing: TowerKind | null = null;
  selectedId: number | null = null;
  towers: Tower[] = [];
  enemies: Enemy[] = [];
  shots: Shot[] = [];
  particles: Particle[] = [];
  queue: { kind: EnemyKind; gap: number }[] = [];
  spawnTimer = 0;
  waveActive = false;
  message = "";
  messageT = 0;
  trauma = 0;
  hitstop = 0;
  spawnLog: EnemyKind[] = [];
  layout: Layout = layoutFor(800, 480);
  hover: { c: number; r: number } | null = null;
  private nextId = 1;
  private out: GameEvent[] = [];

  resetRun(): void {
    this.phase = "play";
    this.gold = START_GOLD;
    this.lives = START_LIVES;
    this.wave = 0;
    this.speed = 1;
    this.placing = null;
    this.selectedId = null;
    this.towers = [];
    this.enemies = [];
    this.shots = [];
    this.particles = [];
    this.queue = [];
    this.spawnTimer = 0;
    this.waveActive = false;
    this.trauma = 0;
    this.hitstop = 0;
    this.spawnLog = [];
    this.say("Place towers on the grass, then call the wave.");
  }

  say(text: string): void {
    this.message = text;
    this.messageT = 2.4;
  }

  flush(): GameEvent[] {
    const ev = this.out;
    this.out = [];
    return ev;
  }

  decayJuice(dt: number): void {
    if (this.messageT > 0) this.messageT = Math.max(0, this.messageT - dt);
    this.trauma = Math.max(0, this.trauma - dt * 1.35);
    for (const tower of this.towers) tower.recoil = Math.max(0, tower.recoil - dt * 4);
    if (this.phase !== "play") {
      for (const p of this.particles) {
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
      this.particles = this.particles.filter((p) => p.life > 0);
    }
  }

  step(dt: number): GameEvent[] {
    if (this.phase !== "play") return this.flush();
    if (this.hitstop > 0 && this.juice) {
      const eat = Math.min(this.hitstop, dt);
      this.hitstop -= eat;
      dt -= eat;
      if (dt <= 0) return this.flush();
    }

    if (this.waveActive) this.spawn(dt);

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      enemy.anim += dt;
      enemy.born = Math.min(1, enemy.born + dt * 4.5);
      if (enemy.slowT > 0) enemy.slowT = Math.max(0, enemy.slowT - dt);
      if (enemy.curseT > 0) enemy.curseT = Math.max(0, enemy.curseT - dt);
      if (enemy.flash > 0) enemy.flash = Math.max(0, enemy.flash - dt);
      if (enemy.burnT > 0) {
        const burnDt = Math.min(dt, enemy.burnT);
        enemy.burnT -= burnDt;
        this.hurt(enemy, enemy.burnDps * burnDt, "burn");
      }
      if (!enemy.alive) continue;
      this.advance(enemy, dt);
    }

    for (const tower of this.towers) {
      tower.cooldown -= dt;
      if (tower.cooldown > 0) continue;
      const profile = shotProfile(tower, auraFor(tower.id, tower.c, tower.r, this.towers));
      const target = this.pickTarget(tower, profile.range);
      if (!target) continue;
      this.fire(tower, target, profile);
    }

    for (const shot of this.shots) this.fly(shot, dt);

    this.enemies = this.enemies.filter((e) => e.alive);
    this.shots = this.shots.filter((s) => !s.done);
    this.particles = this.particles.filter((p) => p.life > 0);

    if (this.waveActive && this.queue.length === 0 && this.enemies.length === 0 && this.shots.length === 0) {
      this.waveActive = false;
      if (this.wave >= FINAL_WAVE) {
        this.phase = "win";
        this.bestWave = Math.max(this.bestWave, this.wave);
        this.say("The gate still stands.");
        this.out.push({ t: "win" });
      } else {
        const bonus = 6 + this.wave * 2;
        this.gold += bonus;
        this.bestWave = Math.max(this.bestWave, this.wave);
        this.say(`Wave ${this.wave} cleared  +${bonus}`);
        this.out.push({ t: "clear" });
      }
    }

    return this.flush();
  }

  private spawn(dt: number): void {
    this.spawnTimer -= dt;
    while (this.queue.length > 0 && this.spawnTimer <= 0) {
      const job = this.queue.shift();
      if (!job) break;
      this.spawnEnemy(job.kind);
      this.spawnTimer += job.gap;
    }
  }

  spawnEnemy(kind: EnemyKind, wave = this.wave): Enemy {
    const def = ENEMIES[kind];
    const hpScale = 1 + Math.max(0, wave - 1) * 0.12;
    const speedScale = 1 + Math.max(0, wave - 1) * 0.016;
    const goldScale = 1 + Math.max(0, wave - 1) * 0.05;
    const start = cellCenter(PATH[0].c, PATH[0].r);
    const hp = def.hp * hpScale;
    const enemy: Enemy = {
      id: this.nextId++,
      kind,
      hp,
      maxHp: hp,
      armor: def.armor,
      speed: def.speed * speedScale,
      gold: Math.round(def.gold * goldScale),
      gx: start.x,
      gy: start.y,
      next: 1,
      alive: true,
      slowT: 0,
      slowAmt: 0,
      burnT: 0,
      burnDps: 0,
      curseT: 0,
      flash: 0,
      anim: 0,
      born: 0,
      face: 0,
      leakLives: def.leak,
      radius: def.radius,
    };
    this.enemies.push(enemy);
    this.spawnLog.push(kind);
    this.burst(start.x, start.y, kind === "titan" ? "#d38cff" : "#d6c7a1", kind === "titan" ? 16 : 6);
    return enemy;
  }

  private advance(enemy: Enemy, dt: number): void {
    const wp = PATH[enemy.next];
    if (!wp) {
      this.leak(enemy);
      return;
    }
    const dest = cellCenter(wp.c, wp.r);
    const dx = dest.x - enemy.gx;
    const dy = dest.y - enemy.gy;
    const dist = Math.hypot(dx, dy);
    const slow = enemy.slowT > 0 ? 1 - enemy.slowAmt : 1;
    const step = enemy.speed * slow * dt;
    if (dist <= step || dist < 0.015) {
      enemy.gx = dest.x;
      enemy.gy = dest.y;
      enemy.next += 1;
      if (enemy.next >= PATH.length) this.leak(enemy);
      return;
    }
    enemy.face = Math.atan2(dy, dx);
    enemy.gx += (dx / dist) * step;
    enemy.gy += (dy / dist) * step;
  }

  private leak(enemy: Enemy): void {
    if (!enemy.alive) return;
    enemy.alive = false;
    this.lives -= enemy.leakLives;
    this.kick(enemy.kind === "titan" ? 0.55 : 0.28);
    this.out.push({ t: "leak" });
    this.say(enemy.kind === "titan" ? "The Titan reached the gate" : "A creep escaped");
    if (this.lives <= 0) {
      this.lives = 0;
      this.phase = "lose";
      this.bestWave = Math.max(this.bestWave, Math.max(0, this.wave - 1));
      this.out.push({ t: "lose" });
    }
  }

  private pickTarget(tower: Tower, range: number): Enemy | null {
    const origin = cellCenter(tower.c, tower.r);
    const rr = range * range;
    let best: Enemy | null = null;
    let bestScore = -Infinity;
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const dx = enemy.gx - origin.x;
      const dy = enemy.gy - origin.y;
      if (dx * dx + dy * dy > rr) continue;
      const score = this.scoreTarget(tower.targetMode, enemy, dx * dx + dy * dy);
      if (score > bestScore) {
        bestScore = score;
        best = enemy;
      }
    }
    return best;
  }

  private scoreTarget(mode: TargetMode, enemy: Enemy, dist2: number): number {
    if (mode === "closest") return -dist2;
    if (mode === "strongest") return enemy.hp + enemy.maxHp * 0.01;
    const prev = PATH[Math.max(0, enemy.next - 1)];
    const from = prev ? cellCenter(prev.c, prev.r) : { x: enemy.gx, y: enemy.gy };
    const along = Math.hypot(enemy.gx - from.x, enemy.gy - from.y);
    return enemy.next * 10 + along;
  }

  private fire(tower: Tower, target: Enemy, profile: ReturnType<typeof shotProfile>): void {
    const origin = cellCenter(tower.c, tower.r);
    const dx = target.gx - origin.x;
    const dy = target.gy - origin.y;
    tower.angle = Math.atan2(dy, dx);
    tower.cooldown = profile.cooldown;
    tower.recoil = 1;
    const dist0 = Math.max(0.2, Math.hypot(dx, dy));
    this.shots.push({
      kind: tower.kind,
      special: tower.special,
      x: origin.x,
      y: origin.y,
      enemyId: target.id,
      tx: target.gx,
      ty: target.gy,
      speed: profile.speed,
      damage: profile.damage,
      splash: profile.splash,
      falloff: profile.falloff,
      pen: profile.pen,
      slowAmt: profile.slowAmt,
      slowDur: profile.slowDur,
      burnDps: profile.burnDps,
      burnDur: profile.burnDur,
      curseDur: profile.curseDur,
      done: false,
      dist0,
    });
    this.out.push({ t: "shoot", kind: tower.kind, special: tower.special });
  }

  private fly(shot: Shot, dt: number): void {
    const live = this.enemies.find((e) => e.id === shot.enemyId && e.alive);
    if (live) {
      shot.tx = live.gx;
      shot.ty = live.gy;
    }
    const dx = shot.tx - shot.x;
    const dy = shot.ty - shot.y;
    const dist = Math.hypot(dx, dy);
    const step = shot.speed * dt;
    if (dist <= step + 0.08) {
      shot.x = shot.tx;
      shot.y = shot.ty;
      this.impact(shot);
      shot.done = true;
      return;
    }
    shot.x += (dx / dist) * step;
    shot.y += (dy / dist) * step;
  }

  private impact(shot: Shot): void {
    const victims: { enemy: Enemy; direct: boolean }[] = [];
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const dx = enemy.gx - shot.x;
      const dy = enemy.gy - shot.y;
      const d = Math.hypot(dx, dy);
      if (enemy.id === shot.enemyId && d < 0.45) {
        victims.push({ enemy, direct: true });
      } else if (shot.splash > 0 && d <= shot.splash) {
        victims.push({ enemy, direct: false });
      }
    }
    if (victims.length === 0) {
      const fallback = this.enemies.find((e) => e.id === shot.enemyId && e.alive);
      if (fallback) victims.push({ enemy: fallback, direct: true });
    }
    for (const { enemy, direct } of victims) {
      const scale = direct ? 1 : shot.falloff;
      this.applyHit(enemy, shot, scale);
    }
    const color = shotColor(shot.special, shot.kind);
    this.burst(shot.x, shot.y, color, shot.splash > 0.8 ? 12 : 6);
    if (shot.kind === "cannon") this.kick(0.16);
  }

  /** Test seam and combat resolution. `scale` is splash falloff. */
  applyHit(enemy: Enemy, shot: Pick<
    Shot,
    "damage" | "pen" | "slowAmt" | "slowDur" | "burnDps" | "burnDur" | "curseDur" | "special"
  >, scale = 1): void {
    if (!enemy.alive) return;
    const pen = shot.pen;
    const armor = enemy.armor * (1 - pen);
    let amount = Math.max(0.75, shot.damage * scale - armor);
    if (enemy.curseT > 0) amount *= CURSE_AMP;
    if (shot.curseDur > 0) enemy.curseT = Math.max(enemy.curseT, shot.curseDur);
    if (shot.slowDur > 0 && shot.slowAmt > 0) {
      enemy.slowT = Math.max(enemy.slowT, shot.slowDur);
      enemy.slowAmt = Math.max(enemy.slowAmt, shot.slowAmt);
    }
    if (shot.burnDur > 0 && shot.burnDps > 0) {
      const dps = shot.burnDps * (scale < 1 ? 0.65 : 1);
      if (enemy.burnT <= 0 || dps >= enemy.burnDps) enemy.burnDps = dps;
      enemy.burnT = Math.max(enemy.burnT, shot.burnDur);
    }
    this.hurt(enemy, amount, "hit");
    if (enemy.kind === "titan" || amount >= 28) {
      this.float(enemy.gx, enemy.gy - enemy.radius, String(Math.round(amount)), "#f4ecd8");
    }
  }

  private hurt(enemy: Enemy, amount: number, cause: "hit" | "burn"): void {
    if (!enemy.alive || amount <= 0) return;
    enemy.hp -= amount;
    enemy.flash = 0.08;
    if (cause === "hit" && enemy.kind === "titan") this.kick(0.2);
    if (enemy.hp <= 0) this.kill(enemy);
  }

  private kill(enemy: Enemy): void {
    if (!enemy.alive) return;
    enemy.alive = false;
    this.gold += enemy.gold;
    this.float(enemy.gx, enemy.gy - 0.2, `+${enemy.gold}`, "#e7c56a");
    this.burst(enemy.gx, enemy.gy, enemy.kind === "titan" ? "#d38cff" : "#f4ecd8", enemy.kind === "titan" ? 22 : 10);
    this.kick(enemy.kind === "titan" ? 0.45 : 0.1);
    if (this.juice) this.hitstop = Math.max(this.hitstop, enemy.kind === "titan" ? 0.07 : 0.03);
    this.out.push({ t: "kill", kind: enemy.kind });
  }

  boardClick(c: number, r: number): GameEvent[] {
    if (this.phase !== "play") return this.flush();
    const occupied = this.towers.find((t) => t.c === c && t.r === r);
    if (occupied) {
      this.selectedId = occupied.id;
      this.placing = null;
      return this.flush();
    }
    if (!this.placing) {
      this.selectedId = null;
      return this.flush();
    }
    if (!inBounds(c, r) || isPath(c, r)) {
      this.say(isPath(c, r) ? "The road is for creeps" : "Can't build there");
      this.out.push({ t: "nope" });
      return this.flush();
    }
    const cost = COSTS[this.placing];
    if (this.gold < cost) {
      this.say("Not enough gold");
      this.out.push({ t: "nope" });
      return this.flush();
    }
    this.gold -= cost;
    const tower: Tower = {
      id: this.nextId++,
      kind: this.placing,
      c,
      r,
      level: 1,
      special: null,
      cooldown: 0.25,
      spent: cost,
      targetMode: "first",
      recoil: 0,
      angle: 0,
    };
    this.towers.push(tower);
    this.selectedId = tower.id;
    this.placing = null;
    this.say(`${tower.kind === "archer" ? "Archer" : "Cannon"} placed`);
    this.out.push({ t: "place" });
    this.burst(c + 0.5, r + 0.5, "#e7c56a", 8);
    return this.flush();
  }

  upgradeSelected(): GameEvent[] {
    const tower = this.selected();
    if (!tower || this.phase !== "play") return this.flush();
    if (tower.level >= 4) {
      this.say("This tower is fully ascended");
      return this.flush();
    }
    if (tower.level === 3) {
      this.say("Choose a specialization");
      return this.flush();
    }
    const cost = upgradeCost(tower.level);
    if (cost == null) return this.flush();
    if (this.gold < cost) {
      this.say("Not enough gold");
      this.out.push({ t: "nope" });
      return this.flush();
    }
    this.gold -= cost;
    tower.level += 1;
    tower.spent += cost;
    this.say(`Tier ${tower.level}`);
    this.burst(tower.c + 0.5, tower.r + 0.5, "#e7c56a", 12);
    this.out.push({ t: "upgrade" });
    return this.flush();
  }

  specialize(special: Special): GameEvent[] {
    const tower = this.selected();
    if (!tower || this.phase !== "play") return this.flush();
    if (tower.level !== 3 || tower.special) {
      this.say("Specializations open at the fourth tier");
      return this.flush();
    }
    const cost = upgradeCost(3);
    if (cost == null) return this.flush();
    if (this.gold < cost) {
      this.say("Not enough gold");
      this.out.push({ t: "nope" });
      return this.flush();
    }
    this.gold -= cost;
    tower.level = 4;
    tower.special = special;
    tower.spent += cost;
    this.say(`${labelSpecial(special)} awakened`);
    this.burst(tower.c + 0.5, tower.r + 0.5, shotColor(special, tower.kind), 16);
    this.out.push({ t: "upgrade" });
    return this.flush();
  }

  sellSelected(): GameEvent[] {
    const tower = this.selected();
    if (!tower || this.phase !== "play") return this.flush();
    const refund = sellValue(tower.spent);
    this.gold += refund;
    this.towers = this.towers.filter((t) => t.id !== tower.id);
    this.selectedId = null;
    this.say(`Sold for ${refund}`);
    this.out.push({ t: "sell" });
    return this.flush();
  }

  cycleTarget(): void {
    const tower = this.selected();
    if (!tower) return;
    const order: TargetMode[] = ["first", "closest", "strongest"];
    const i = order.indexOf(tower.targetMode);
    tower.targetMode = order[(i + 1) % order.length] ?? "first";
  }

  startWave(): boolean {
    if (this.phase !== "play" || this.waveActive || this.wave >= FINAL_WAVE) return false;
    this.wave += 1;
    this.queue = expandWave(this.wave);
    this.spawnTimer = 0.35;
    this.waveActive = true;
    this.say(this.wave === FINAL_WAVE ? "The Titan wakes" : `Wave ${this.wave}`);
    this.out.push({ t: "wave" });
    return true;
  }

  hoverAt(px: number, py: number): void {
    const c = Math.floor((px - this.layout.originX) / this.layout.cell);
    const r = Math.floor((py - this.layout.originY) / this.layout.cell);
    if (!inBounds(c, r)) {
      this.hover = null;
      return;
    }
    this.hover = { c, r };
  }

  clickAt(px: number, py: number): GameEvent[] {
    const c = Math.floor((px - this.layout.originX) / this.layout.cell);
    const r = Math.floor((py - this.layout.originY) / this.layout.cell);
    if (!inBounds(c, r)) {
      this.selectedId = null;
      return this.flush();
    }
    return this.boardClick(c, r);
  }

  selected(): Tower | null {
    return this.towers.find((t) => t.id === this.selectedId) ?? null;
  }

  canBuild(c: number, r: number): boolean {
    if (!inBounds(c, r) || isPath(c, r)) return false;
    return !this.towers.some((t) => t.c === c && t.r === r);
  }

  hud(): Hud {
    const selected = this.selected();
    let selectedHud: Hud["selected"] = null;
    if (selected) {
      const aura = auraFor(selected.id, selected.c, selected.r, this.towers);
      const profile = shotProfile(selected, aura);
      selectedHud = {
        id: selected.id,
        kind: selected.kind,
        level: selected.level,
        special: selected.special,
        spent: selected.spent,
        targetMode: selected.targetMode,
        damage: profile.damage,
        rate: 1 / profile.cooldown,
        range: profile.range,
        upgradeCost: upgradeCost(selected.level),
      };
    }
    const next = this.wave >= FINAL_WAVE ? "" : prettyWave(this.wave + 1);
    return {
      phase: this.phase,
      gold: this.gold,
      lives: this.lives,
      wave: this.wave,
      bestWave: this.bestWave,
      speed: this.speed,
      placing: this.placing,
      selected: selectedHud,
      waveActive: this.waveActive,
      message: this.messageT > 0 ? this.message : "",
      enemyCount: this.enemies.length,
      nextLabel: next,
      fieldLabel: this.waveActive ? `${this.enemies.length} on the road` : "Road is clear",
    };
  }

  fingerprint(): string {
    const s = this.selected();
    return [
      this.phase,
      this.gold,
      this.lives,
      this.wave,
      this.bestWave,
      this.speed,
      this.placing ?? "-",
      s ? `${s.id}:${s.level}:${s.special}:${s.targetMode}` : "-",
      this.waveActive ? 1 : 0,
      this.messageT > 0 ? this.message : "",
      this.enemies.length,
      this.towers.length,
    ].join("|");
  }

  rangeOf(tower: Tower): number {
    return shotProfile(tower, auraFor(tower.id, tower.c, tower.r, this.towers)).range;
  }

  private kick(amount: number): void {
    if (!this.juice) return;
    this.trauma = Math.min(1, this.trauma + amount);
  }

  private burst(x: number, y: number, color: string, count: number): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length > 280) this.particles.shift();
      const a = Math.random() * Math.PI * 2;
      const s = 0.4 + Math.random() * 1.4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 0.2,
        life: 0.25 + Math.random() * 0.35,
        max: 0.6,
        size: 0.06 + Math.random() * 0.08,
        color,
      });
    }
  }

  private float(x: number, y: number, text: string, color: string): void {
    if (this.particles.length > 280) this.particles.shift();
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: -0.45,
      life: 0.8,
      max: 0.8,
      size: 0.22,
      color,
      text,
    });
  }
}

export function shotColor(special: Special | null, kind: TowerKind): string {
  if (special === "frost") return "#8fd4ff";
  if (special === "ember") return "#ff8a3d";
  if (special === "shadow") return "#c084fc";
  if (special === "luminous") return "#ffe08a";
  return kind === "archer" ? "#f3e2b0" : "#e38b4a";
}

function labelSpecial(special: Special): string {
  if (special === "frost") return "Frost";
  if (special === "ember") return "Ember";
  if (special === "shadow") return "Shadow";
  return "Luminous";
}

export function ghostRange(kind: TowerKind): number {
  return BASE_RANGE[kind];
}
