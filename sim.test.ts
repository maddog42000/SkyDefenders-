import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  COSTS,
  COLS,
  PATH,
  ROWS,
  UPGRADE_COSTS,
  auraFor,
  isPath,
  shotProfile,
  wavePlan,
} from "./balance.ts";
import { SkySim } from "./sim.ts";
import type { Shot, Special } from "./types.ts";

function fresh(): SkySim {
  const sim = new SkySim();
  sim.resetRun();
  sim.juice = false;
  return sim;
}

describe("path", () => {
  it("is an orthogonal walk that never leaves the board", () => {
    assert.equal(new Set(PATH.map((p) => `${p.c},${p.r}`)).size, PATH.length);
    for (let i = 1; i < PATH.length; i++) {
      const a = PATH[i - 1]!;
      const b = PATH[i]!;
      assert.equal(Math.abs(a.c - b.c) + Math.abs(a.r - b.r), 1);
      assert.ok(a.c >= 0 && a.r >= 0 && a.c < COLS && a.r < ROWS);
    }
    assert.equal(isPath(0, 0), false);
    assert.equal(isPath(0, 1), true);
  });
});

describe("economy", () => {
  it("rejects the road, spends gold, upgrades, and refunds a partial sell", () => {
    const sim = fresh();
    sim.placing = "archer";
    sim.boardClick(0, 1);
    assert.equal(sim.towers.length, 0);
    assert.equal(sim.gold, 260);
    sim.placing = "archer";
    sim.boardClick(0, 0);
    assert.equal(sim.towers.length, 1);
    assert.equal(sim.gold, 260 - COSTS.archer);
    const tower = sim.towers[0]!;
    sim.selectedId = tower.id;
    sim.upgradeSelected();
    assert.equal(tower.level, 2);
    assert.equal(sim.gold, 260 - COSTS.archer - UPGRADE_COSTS[0]);
    sim.upgradeSelected();
    sim.upgradeSelected();
    assert.equal(tower.level, 3);
    sim.upgradeSelected();
    assert.equal(tower.level, 3);
    const spent = tower.spent;
    sim.sellSelected();
    assert.equal(sim.towers.length, 0);
    assert.equal(sim.gold, 260 - COSTS.archer - UPGRADE_COSTS[0] - UPGRADE_COSTS[1] + Math.floor(spent * 0.65));
  });

  it("specializes only from tier 3 and changes the shot", () => {
    const sim = fresh();
    sim.placing = "cannon";
    sim.boardClick(1, 0);
    const tower = sim.towers[0]!;
    sim.selectedId = tower.id;
    sim.specialize("ember");
    assert.equal(tower.level, 1);
    sim.gold = 5000;
    sim.upgradeSelected();
    sim.upgradeSelected();
    assert.equal(tower.level, 3);
    sim.specialize("shadow");
    assert.equal(tower.level, 4);
    assert.equal(tower.special, "shadow");
    const profile = shotProfile(tower, { dmg: 1, rate: 1 });
    assert.ok(profile.pen > 0.5);
    assert.equal(profile.curseDur > 0, true);
  });
});

describe("combat effects", () => {
  it("frost slows and the timer ticks down to zero", () => {
    const slowed = fresh();
    const plain = fresh();
    const a = slowed.spawnEnemy("scout", 1);
    const b = plain.spawnEnemy("scout", 1);
    const frost: Pick<Shot, "damage" | "pen" | "slowAmt" | "slowDur" | "burnDps" | "burnDur" | "curseDur" | "special"> = {
      damage: 1,
      pen: 1,
      slowAmt: 0.5,
      slowDur: 2.5,
      burnDps: 0,
      burnDur: 0,
      curseDur: 0,
      special: "frost",
    };
    slowed.applyHit(a, frost);
    assert.ok(a.slowT > 2);
    slowed.step(0.4);
    plain.step(0.4);
    assert.ok(a.slowT < 2.5);
    assert.ok(a.gx < b.gx);
    slowed.step(3);
    assert.equal(a.slowT, 0);
  });

  it("ember burns after the hit", () => {
    const sim = fresh();
    const enemy = sim.spawnEnemy("brute", 1);
    enemy.hp = 200;
    sim.applyHit(enemy, {
      damage: 1,
      pen: 1,
      slowAmt: 0,
      slowDur: 0,
      burnDps: 12,
      burnDur: 3,
      curseDur: 0,
      special: "ember",
    });
    const afterHit = enemy.hp;
    sim.step(1);
    assert.ok(enemy.hp < afterHit - 8);
    assert.ok(enemy.burnT > 0);
  });

  it("shadow pierces armor and curses the next hit", () => {
    const sim = fresh();
    const enemy = sim.spawnEnemy("titan", 1);
    enemy.hp = 300;
    enemy.armor = 10;
    const shot = {
      damage: 20,
      pen: 0.75,
      slowAmt: 0,
      slowDur: 0,
      burnDps: 0,
      burnDur: 0,
      curseDur: 3,
      special: "shadow" as Special,
    };
    sim.applyHit(enemy, shot);
    assert.ok(Math.abs(enemy.hp - (300 - 17.5)) < 0.001);
    sim.applyHit(enemy, shot);
    assert.ok(Math.abs(enemy.hp - (300 - 17.5 - 17.5 * 1.22)) < 0.001);
  });

  it("luminous reaches farther and hastens a neighbor", () => {
    const plain = shotProfile({ kind: "archer", level: 4, special: null });
    const holy = shotProfile({ kind: "archer", level: 4, special: "luminous" });
    assert.ok(holy.range > plain.range * 1.3);
    const aura = auraFor(1, 2, 2, [
      { id: 1, c: 2, r: 2, special: null },
      { id: 2, c: 3, r: 2, special: "luminous" },
    ]);
    assert.ok(aura.rate > 1);
    const buffed = shotProfile({ kind: "cannon", level: 2, special: null }, aura);
    const solo = shotProfile({ kind: "cannon", level: 2, special: null });
    assert.ok(buffed.cooldown < solo.cooldown);
    assert.ok(buffed.damage > solo.damage);
  });
});

describe("waves", () => {
  it("spawns the titan exactly once and then declares victory", () => {
    const sim = fresh();
    for (let i = 0; i < 12; i++) {
      assert.equal(sim.startWave(), true);
      let guard = 0;
      while (sim.waveActive && guard++ < 8000) {
        sim.step(0.25);
        for (const enemy of sim.enemies) enemy.alive = false;
      }
      assert.equal(sim.waveActive, false, `wave ${i + 1} did not end`);
    }
    assert.equal(sim.phase, "win");
    assert.equal(sim.spawnLog.filter((kind) => kind === "titan").length, 1);
    assert.equal(wavePlan(12).filter((g) => g.kind === "titan")[0]?.count, 1);
    assert.equal(sim.startWave(), false);
  });

  it("loses at zero lives and can restart", () => {
    const sim = fresh();
    sim.lives = 1;
    sim.startWave();
    const enemy = sim.enemies[0] ?? sim.spawnEnemy("scout", 1);
    enemy.next = PATH.length;
    sim.step(0.05);
    assert.equal(sim.phase, "lose");
    assert.equal(sim.lives, 0);
    const best = sim.bestWave;
    sim.resetRun();
    assert.equal(sim.phase, "play");
    assert.equal(sim.lives, 20);
    assert.equal(sim.towers.length, 0);
    assert.equal(sim.bestWave, best);
  });

  it("a prepared defense survives every wave", () => {
    const sim = fresh();
    const spots = buildSpots();
    let guard = 0;
    while (sim.phase === "play" && guard++ < 80000) {
      bolster(sim, spots);
      sim.step(0.1);
    }
    assert.equal(sim.phase, "win");
    assert.ok(sim.lives > 0, `lives left ${sim.lives} wave ${sim.wave}`);
  });
});

function buildSpots(): { c: number; r: number; score: number }[] {
  const list: { c: number; r: number; score: number }[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (isPath(c, r)) continue;
      let score = 0;
      for (const cell of PATH) {
        if (Math.abs(cell.c - c) + Math.abs(cell.r - r) === 1) score += 1;
      }
      if (score > 0) list.push({ c, r, score });
    }
  }
  list.sort((a, b) => b.score - a.score || a.r - b.r || a.c - b.c);
  return list;
}

function bolster(sim: SkySim, spots: { c: number; r: number }[]): void {
  const open = spots.find((spot) => sim.canBuild(spot.c, spot.r));
  const lowest = [...sim.towers].sort((a, b) => a.level - b.level || a.id - b.id)[0];
  if (sim.towers.length >= 4 && lowest && lowest.level < 3) {
    const cost = UPGRADE_COSTS[lowest.level - 1] ?? 9999;
    if (sim.gold >= cost) {
      sim.selectedId = lowest.id;
      sim.upgradeSelected();
      return;
    }
  }
  const ready = sim.towers.find((tower) => tower.level === 3);
  if (ready && sim.towers.length >= 5 && sim.gold >= UPGRADE_COSTS[2]) {
    sim.selectedId = ready.id;
    const specs: Special[] = ["ember", "shadow", "luminous", "frost"];
    const spec = specs[sim.towers.filter((tower) => tower.special).length % specs.length] ?? "frost";
    sim.specialize(spec);
    return;
  }
  const cannons = sim.towers.filter((tower) => tower.kind === "cannon").length;
  if (open && cannons < 2 && sim.gold >= COSTS.cannon && sim.towers.length < 8) {
    sim.placing = "cannon";
    sim.boardClick(open.c, open.r);
    return;
  }
  if (open && sim.towers.length < 7 && sim.gold >= COSTS.archer) {
    sim.placing = "archer";
    sim.boardClick(open.c, open.r);
    return;
  }
  if (!sim.waveActive) sim.startWave();
}
