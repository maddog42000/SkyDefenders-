import { COLS, PATH, ROWS, artKey, cellCenter, isPath, type Layout } from "./balance.ts";
import { ghostRange, shotColor, type SkySim } from "./sim.ts";
import type { Enemy, EnemyKind, Tower, TowerKind } from "./types.ts";

export type ArtMap = Map<string, HTMLImageElement>;

const STAR_SEED = 20261029;

export function drawWorld(
  ctx: CanvasRenderingContext2D,
  sim: SkySim,
  art: ArtMap,
  time: number,
): void {
  const { layout } = sim;
  const mag = sim.juice ? sim.trauma * sim.trauma * Math.min(12, layout.cell * 0.2) : 0;
  ctx.save();
  ctx.translate(Math.sin(time * 46) * mag, Math.cos(time * 37) * mag);
  sky(ctx, layout, time);
  marginIsles(ctx, layout, time);
  island(ctx, layout);
  grass(ctx, layout, sim, time);
  road(ctx, layout, time);
  markers(ctx, layout, time);
  if (sim.placing && sim.hover && sim.phase === "play") {
    drawRange(
      ctx,
      layout,
      sim.hover.c + 0.5,
      sim.hover.r + 0.5,
      ghostRange(sim.placing),
      sim.canBuild(sim.hover.c, sim.hover.r),
    );
  }
  const selected = sim.selected();
  if (selected && sim.phase !== "menu") {
    drawRange(ctx, layout, selected.c + 0.5, selected.r + 0.5, sim.rangeOf(selected), true);
    auraLinks(ctx, layout, sim, selected);
  }

  const sprites: { y: number; paint: () => void }[] = [];
  for (const tower of sim.towers) {
    sprites.push({
      y: tower.r + 0.5,
      paint: () => drawTower(ctx, layout, art, tower, tower.id === sim.selectedId),
    });
  }
  if (sim.placing && sim.hover && sim.phase === "play") {
    const ok = sim.canBuild(sim.hover.c, sim.hover.r) && sim.gold >= costOf(sim.placing);
    sprites.push({
      y: sim.hover.r + 0.55,
      paint: () => drawGhost(ctx, layout, art, sim.placing as TowerKind, sim.hover!.c, sim.hover!.r, ok),
    });
  }
  for (const enemy of sim.enemies) {
    if (!enemy.alive) continue;
    sprites.push({ y: enemy.gy, paint: () => drawEnemy(ctx, layout, enemy) });
  }
  sprites.sort((a, b) => a.y - b.y);
  for (const sprite of sprites) sprite.paint();

  for (const shot of sim.shots) drawShot(ctx, layout, shot, time);
  for (const p of sim.particles) drawParticle(ctx, layout, p);
  vignette(ctx, layout);
  ctx.restore();
}

function costOf(kind: TowerKind): number {
  return kind === "archer" ? 45 : 100;
}

function sky(ctx: CanvasRenderingContext2D, layout: Layout, time: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, layout.h);
  g.addColorStop(0, "#070b18");
  g.addColorStop(0.45, "#14203a");
  g.addColorStop(1, "#1b3048");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, layout.w, layout.h);
  const rnd = mulberry(STAR_SEED);
  for (let i = 0; i < 70; i++) {
    const x = rnd() * layout.w;
    const y = rnd() * layout.h * 0.72;
    const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 2 + i));
    ctx.globalAlpha = 0.25 + tw * 0.55;
    ctx.fillStyle = i % 7 === 0 ? "#ffe08a" : "#d5def2";
    ctx.beginPath();
    ctx.arc(x, y, i % 11 === 0 ? 1.6 : 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  drawCloud(ctx, layout, time * 8, 0.18, 0.22, 0.9);
  drawCloud(ctx, layout, time * 5 + 200, 0.62, 0.12, 0.7);
  drawCloud(ctx, layout, time * 6 + 80, 0.4, 0.78, 0.45);
}

function drawCloud(
  ctx: CanvasRenderingContext2D,
  layout: Layout,
  drift: number,
  yNorm: number,
  scale: number,
  alpha: number,
): void {
  const w = layout.w + 240;
  const x = ((drift * 18) % w) - 120;
  const y = yNorm * layout.h;
  ctx.save();
  ctx.globalAlpha = alpha * 0.28;
  ctx.fillStyle = "#c9d7ef";
  const s = layout.cell * scale;
  ctx.beginPath();
  ctx.ellipse(x, y, s * 1.8, s * 0.55, 0, 0, Math.PI * 2);
  ctx.ellipse(x + s * 0.9, y + s * 0.1, s * 1.2, s * 0.42, 0, 0, Math.PI * 2);
  ctx.ellipse(x - s * 0.8, y + s * 0.12, s, s * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function marginIsles(ctx: CanvasRenderingContext2D, layout: Layout, time: number): void {
  const bob = Math.sin(time * 0.6) * 4;
  const spots = [
    { x: layout.w * 0.08, y: layout.h * 0.16 + bob, s: layout.cell * 1.4 },
    { x: layout.w * 0.9, y: layout.h * 0.14 - bob, s: layout.cell * 1.1 },
    { x: layout.w * 0.84, y: layout.h * 0.86 + bob, s: layout.cell * 1.3 },
  ];
  for (const spot of spots) {
    if (spot.x > layout.originX - 10 && spot.x < layout.originX + COLS * layout.cell + 10 &&
        spot.y > layout.originY - 10 && spot.y < layout.originY + ROWS * layout.cell + 20) {
      continue;
    }
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(spot.x, spot.y + spot.s * 0.45, spot.s * 0.9, spot.s * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#243044";
    ctx.beginPath();
    ctx.ellipse(spot.x, spot.y, spot.s, spot.s * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3e6a48";
    ctx.beginPath();
    ctx.ellipse(spot.x, spot.y - spot.s * 0.08, spot.s * 0.82, spot.s * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function island(ctx: CanvasRenderingContext2D, layout: Layout): void {
  const cell = layout.cell;
  const x = layout.originX - cell * 0.18;
  const y = layout.originY - cell * 0.08;
  const w = COLS * cell + cell * 0.36;
  const h = ROWS * cell + cell * 0.62;
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  roundRect(ctx, x + cell * 0.12, y + cell * 0.45, w, h, cell * 0.28);
  ctx.fill();
  const rock = ctx.createLinearGradient(x, y, x, y + h);
  rock.addColorStop(0, "#4a3424");
  rock.addColorStop(0.35, "#2a1c12");
  rock.addColorStop(1, "#140e0a");
  ctx.fillStyle = rock;
  roundRect(ctx, x, y + cell * 0.22, w, h, cell * 0.26);
  ctx.fill();
  ctx.fillStyle = "#5a4632";
  roundRect(ctx, x, y, w, ROWS * cell + cell * 0.16, cell * 0.22);
  ctx.fill();
}

function grass(ctx: CanvasRenderingContext2D, layout: Layout, sim: SkySim, time: number): void {
  const cell = layout.cell;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (isPath(c, r)) continue;
      const x = layout.originX + c * cell;
      const y = layout.originY + r * cell;
      const n = hash(c, r);
      const shade = n % 3;
      ctx.fillStyle = shade === 0 ? "#3d6b46" : shade === 1 ? "#46784e" : "#356243";
      roundRect(ctx, x + 1.5, y + 1.5, cell - 3, cell - 3, Math.min(8, cell * 0.16));
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(x + 4, y + 4, cell * 0.35, 2);
      if (n % 5 === 0) {
        ctx.fillStyle = n % 2 === 0 ? "#d7e38a" : "#f1c1d4";
        ctx.beginPath();
        ctx.arc(x + cell * 0.72, y + cell * 0.68, Math.max(1.2, cell * 0.035), 0, Math.PI * 2);
        ctx.fill();
      }
      if (sim.placing && sim.phase === "play" && sim.canBuild(c, r)) {
        ctx.fillStyle = `rgba(231,197,106,${0.18 + 0.1 * Math.sin(time * 3 + c)})`;
        ctx.beginPath();
        ctx.arc(x + cell / 2, y + cell / 2, Math.max(2, cell * 0.06), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  if (sim.hover && sim.phase === "play") {
    const { c, r } = sim.hover;
    const x = layout.originX + c * layout.cell;
    const y = layout.originY + r * layout.cell;
    const ok = sim.placing ? sim.canBuild(c, r) : !isPath(c, r);
    ctx.strokeStyle = ok ? "rgba(231,197,106,0.9)" : "rgba(224,122,114,0.9)";
    ctx.lineWidth = 2;
    roundRect(ctx, x + 2, y + 2, layout.cell - 4, layout.cell - 4, 6);
    ctx.stroke();
  }
}

function road(ctx: CanvasRenderingContext2D, layout: Layout, time: number): void {
  const pts = PATH.map((p) => {
    const center = cellCenter(p.c, p.r);
    return {
      x: layout.originX + center.x * layout.cell,
      y: layout.originY + center.y * layout.cell,
    };
  });
  strokePath(ctx, pts, layout.cell * 0.82, "#5c4128");
  strokePath(ctx, pts, layout.cell * 0.64, "#c6a36a");
  strokePath(ctx, pts, layout.cell * 0.1, "rgba(255,236,206,0.35)");
  ctx.fillStyle = "rgba(90,60,30,0.35)";
  for (let i = 0; i < pts.length; i += 2) {
    const p = pts[i];
    if (!p) continue;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((i % 4) * 0.2);
    ctx.fillRect(-layout.cell * 0.08, -2, layout.cell * 0.16, 3);
    ctx.restore();
  }
  void time;
}

function markers(ctx: CanvasRenderingContext2D, layout: Layout, time: number): void {
  const start = cellCenter(PATH[0].c, PATH[0].r);
  const end = cellCenter(PATH[PATH.length - 1].c, PATH[PATH.length - 1].r);
  const sx = layout.originX + start.x * layout.cell;
  const sy = layout.originY + start.y * layout.cell;
  const ex = layout.originX + end.x * layout.cell;
  const ey = layout.originY + end.y * layout.cell;
  const spin = time * 1.6;
  ctx.save();
  ctx.translate(sx, sy);
  ctx.strokeStyle = "rgba(143,212,255,0.85)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, layout.cell * 0.28, spin, spin + 2.2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(192,132,252,0.8)";
  ctx.beginPath();
  ctx.arc(0, 0, layout.cell * 0.18, -spin, -spin + 1.8);
  ctx.stroke();
  ctx.fillStyle = "#d5def2";
  ctx.font = `600 ${Math.max(10, layout.cell * 0.16)}px Outfit, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("RIFT", 0, -layout.cell * 0.42);
  ctx.restore();

  ctx.save();
  ctx.translate(ex, ey);
  const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, layout.cell * 0.55);
  glow.addColorStop(0, "rgba(255,224,138,0.85)");
  glow.addColorStop(1, "rgba(255,224,138,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, layout.cell * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f4ecd8";
  ctx.beginPath();
  ctx.moveTo(0, -layout.cell * 0.34);
  ctx.lineTo(layout.cell * 0.12, 0);
  ctx.lineTo(0, layout.cell * 0.16);
  ctx.lineTo(-layout.cell * 0.12, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#e7c56a";
  ctx.font = `600 ${Math.max(10, layout.cell * 0.16)}px Outfit, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("GATE", 0, -layout.cell * 0.42);
  ctx.restore();
}

function drawRange(
  ctx: CanvasRenderingContext2D,
  layout: Layout,
  gx: number,
  gy: number,
  range: number,
  ok: boolean,
): void {
  const x = layout.originX + gx * layout.cell;
  const y = layout.originY + gy * layout.cell;
  ctx.beginPath();
  ctx.arc(x, y, range * layout.cell, 0, Math.PI * 2);
  ctx.fillStyle = ok ? "rgba(231,197,106,0.1)" : "rgba(224,122,114,0.1)";
  ctx.fill();
  ctx.strokeStyle = ok ? "rgba(231,197,106,0.55)" : "rgba(224,122,114,0.6)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function auraLinks(ctx: CanvasRenderingContext2D, layout: Layout, sim: SkySim, tower: Tower): void {
  if (tower.special !== "luminous") return;
  ctx.strokeStyle = "rgba(255,224,138,0.45)";
  ctx.lineWidth = 1.5;
  const a = toPx(layout, tower.c + 0.5, tower.r + 0.5);
  for (const other of sim.towers) {
    if (other.id === tower.id) continue;
    const dx = other.c - tower.c;
    const dy = other.r - tower.r;
    if (dx * dx + dy * dy > 2.8 * 2.8) continue;
    const b = toPx(layout, other.c + 0.5, other.r + 0.5);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

function drawTower(
  ctx: CanvasRenderingContext2D,
  layout: Layout,
  art: ArtMap,
  tower: Tower,
  selected: boolean,
): void {
  const p = toPx(layout, tower.c + 0.5, tower.r + 0.5);
  const size = layout.cell * (1.18 - tower.recoil * 0.04);
  ctx.save();
  ctx.translate(p.x, p.y + tower.recoil * layout.cell * 0.03);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(0, layout.cell * 0.28, layout.cell * 0.28, layout.cell * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  if (tower.special) {
    ctx.fillStyle = shotColor(tower.special, tower.kind);
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.arc(0, layout.cell * 0.05, layout.cell * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  const img = art.get(artKey(tower.kind, tower.level, tower.special));
  if (img) ctx.drawImage(img, -size / 2, -size / 2, size, size);
  else placeholderTower(ctx, layout.cell, tower.kind);
  if (selected) {
    ctx.strokeStyle = "rgba(244,236,216,0.85)";
    ctx.lineWidth = 2;
    ctx.strokeRect(-size * 0.42, -size * 0.46, size * 0.84, size * 0.9);
  }
  const badge = layout.cell * 0.18;
  ctx.fillStyle = "#10182c";
  ctx.beginPath();
  ctx.arc(size * 0.32, -size * 0.32, badge, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e7c56a";
  ctx.font = `700 ${Math.max(9, badge)}px Outfit, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(tower.level), size * 0.32, -size * 0.32);
  ctx.restore();
}

function drawGhost(
  ctx: CanvasRenderingContext2D,
  layout: Layout,
  art: ArtMap,
  kind: TowerKind,
  c: number,
  r: number,
  ok: boolean,
): void {
  const p = toPx(layout, c + 0.5, r + 0.5);
  const size = layout.cell * 1.12;
  ctx.save();
  ctx.globalAlpha = ok ? 0.62 : 0.4;
  const img = art.get(artKey(kind, 1, null));
  if (img) ctx.drawImage(img, p.x - size / 2, p.y - size / 2, size, size);
  if (!ok) {
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = "#e07a72";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.x - size * 0.2, p.y - size * 0.2);
    ctx.lineTo(p.x + size * 0.2, p.y + size * 0.2);
    ctx.moveTo(p.x + size * 0.2, p.y - size * 0.2);
    ctx.lineTo(p.x - size * 0.2, p.y + size * 0.2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEnemy(ctx: CanvasRenderingContext2D, layout: Layout, enemy: Enemy): void {
  const p = toPx(layout, enemy.gx, enemy.gy);
  const s = layout.cell * enemy.radius * (0.72 + 0.28 * easeOut(enemy.born));
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(enemy.face);
  if (enemy.flash > 0) ctx.globalAlpha = 0.85;
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(0, s * 0.85, s * 0.9, s * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  paintCreature(ctx, enemy.kind, s, enemy.anim, enemy.slowT > 0, enemy.burnT > 0, enemy.curseT > 0);
  if (enemy.flash > 0) {
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(0, 0, s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  const bw = Math.max(16, s * 2.4);
  const ratio = Math.max(0, enemy.hp / enemy.maxHp);
  const bx = p.x - bw / 2;
  const by = p.y - s - layout.cell * 0.22;
  ctx.fillStyle = "rgba(7,11,22,0.7)";
  ctx.fillRect(bx, by, bw, 4);
  ctx.fillStyle = ratio > 0.45 ? "#8fce7a" : "#e07a72";
  ctx.fillRect(bx, by, bw * ratio, 4);
  if (enemy.kind === "titan") {
    ctx.fillStyle = "#f4ecd8";
    ctx.font = `700 ${Math.max(10, layout.cell * 0.2)}px Cinzel, serif`;
    ctx.textAlign = "center";
    ctx.fillText("TITAN", p.x, by - 4);
  }
}

function paintCreature(
  ctx: CanvasRenderingContext2D,
  kind: EnemyKind,
  s: number,
  anim: number,
  slow: boolean,
  burn: boolean,
  curse: boolean,
): void {
  const flap = Math.sin(anim * (kind === "runner" ? 14 : 8)) * 0.35;
  if (kind === "scout") {
    ctx.fillStyle = "rgba(143,212,255,0.45)";
    wing(ctx, -s * 0.2, flap, s);
    wing(ctx, s * 0.2, -flap, s);
    ctx.fillStyle = "#d7f1ff";
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.55, s * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1b3c55";
    eye(ctx, -s * 0.16, -s * 0.05, s * 0.12);
    eye(ctx, s * 0.16, -s * 0.05, s * 0.12);
  } else if (kind === "runner") {
    ctx.fillStyle = "#f0c14a";
    ctx.beginPath();
    ctx.moveTo(s * 1.15, 0);
    ctx.lineTo(-s * 0.7, s * 0.45);
    ctx.lineTo(-s * 0.2, 0);
    ctx.lineTo(-s * 0.7, -s * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff4cc";
    ctx.beginPath();
    ctx.arc(s * 0.35, 0, s * 0.22, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "brute") {
    ctx.fillStyle = "#a86850";
    roundRect(ctx, -s * 0.7, -s * 0.55, s * 1.4, s * 1.15, s * 0.3);
    ctx.fill();
    ctx.fillStyle = "#6a3b2e";
    ctx.fillRect(-s * 0.15, -s * 0.9, s * 0.3, s * 0.4);
    ctx.fillStyle = "#2a140f";
    eye(ctx, -s * 0.22, -s * 0.05, s * 0.1);
    eye(ctx, s * 0.22, -s * 0.05, s * 0.1);
  } else if (kind === "warden") {
    ctx.fillStyle = "#9aadc8";
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.85, -s * 0.1);
    ctx.lineTo(s * 0.55, s * 0.85);
    ctx.lineTo(-s * 0.55, s * 0.85);
    ctx.lineTo(-s * 0.85, -s * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#243044";
    ctx.beginPath();
    ctx.arc(0, -s * 0.15, s * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e7c56a";
    ctx.fillRect(-s * 0.08, -s * 0.95, s * 0.16, s * 0.28);
  } else {
    ctx.fillStyle = "rgba(192,132,252,0.35)";
    wing(ctx, -s * 0.1, flap * 0.6, s * 1.3);
    wing(ctx, s * 0.15, -flap * 0.6, s * 1.3);
    ctx.fillStyle = "#6e4d88";
    ctx.beginPath();
    ctx.ellipse(-s * 0.55, s * 0.1, s * 0.7, s * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#b794d6";
    ctx.beginPath();
    ctx.ellipse(s * 0.25, 0, s * 0.85, s * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a1024";
    ctx.beginPath();
    ctx.arc(s * 0.45, -s * 0.05, s * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f4ecd8";
    ctx.beginPath();
    ctx.arc(s * 0.5, -s * 0.05, s * 0.07, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#e7c56a";
    ctx.lineWidth = Math.max(1.5, s * 0.08);
    ctx.beginPath();
    ctx.moveTo(s * 0.15, -s * 0.55);
    ctx.lineTo(s * 0.35, -s * 0.95);
    ctx.moveTo(s * 0.45, -s * 0.6);
    ctx.lineTo(s * 0.7, -s * 1.05);
    ctx.stroke();
  }
  if (slow) ring(ctx, s, "#8fd4ff");
  if (burn) ring(ctx, s * 1.15, "#ff8a3d");
  if (curse) ring(ctx, s * 1.3, "#c084fc");
}

function wing(ctx: CanvasRenderingContext2D, x: number, flap: number, s: number): void {
  ctx.beginPath();
  ctx.ellipse(x, -s * 0.15, s * 0.7, s * 0.28, flap, 0, Math.PI * 2);
  ctx.fill();
}

function eye(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ring(ctx: CanvasRenderingContext2D, s: number, color: string): void {
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, s * 1.05, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawShot(
  ctx: CanvasRenderingContext2D,
  layout: Layout,
  shot: { x: number; y: number; tx: number; ty: number; kind: TowerKind; special: import("./types.ts").Special | null; dist0: number },
  time: number,
): void {
  const from = toPx(layout, shot.x, shot.y);
  let yLift = 0;
  if (shot.kind === "cannon") {
    const left = Math.hypot(shot.tx - shot.x, shot.ty - shot.y);
    const t = 1 - Math.min(1, left / shot.dist0);
    yLift = Math.sin(t * Math.PI) * layout.cell * 0.45;
  }
  const color = shotColor(shot.special, shot.kind);
  ctx.save();
  ctx.translate(from.x, from.y - yLift);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(0, 0, shot.kind === "cannon" ? Math.max(4, layout.cell * 0.09) : Math.max(2.5, layout.cell * 0.05), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  void time;
}

function drawParticle(ctx: CanvasRenderingContext2D, layout: Layout, p: { x: number; y: number; life: number; max: number; size: number; color: string; text?: string }): void {
  const pos = toPx(layout, p.x, p.y);
  const alpha = Math.max(0, Math.min(1, p.life / p.max));
  ctx.save();
  ctx.globalAlpha = alpha;
  if (p.text) {
    ctx.fillStyle = p.color;
    ctx.font = `700 ${Math.max(12, layout.cell * 0.28)}px Outfit, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(p.text, pos.x, pos.y);
  } else {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, Math.max(1.5, p.size * layout.cell), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function vignette(ctx: CanvasRenderingContext2D, layout: Layout): void {
  const g = ctx.createRadialGradient(
    layout.w / 2,
    layout.h / 2,
    layout.w * 0.2,
    layout.w / 2,
    layout.h / 2,
    layout.w * 0.72,
  );
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.28)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, layout.w, layout.h);
}

function placeholderTower(ctx: CanvasRenderingContext2D, cell: number, kind: TowerKind): void {
  ctx.fillStyle = kind === "archer" ? "#8d6230" : "#5c5146";
  ctx.fillRect(-cell * 0.16, -cell * 0.28, cell * 0.32, cell * 0.4);
}

function toPx(layout: Layout, gx: number, gy: number): { x: number; y: number } {
  return { x: layout.originX + gx * layout.cell, y: layout.originY + gy * layout.cell };
}

function strokePath(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  width: number,
  color: string,
): void {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]!.x, pts[i]!.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rad = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function hash(c: number, r: number): number {
  return ((c * 37 + r * 17 + 11) * 13) & 255;
}

function easeOut(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

function mulberry(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
