import type { EnemyKind, Special, TowerKind } from "./types.ts";

/** Logical grid. Path cells are never buildable. */
export const COLS = 12;
export const ROWS = 7;

export const START_GOLD = 260;
export const START_LIVES = 20;
export const FINAL_WAVE = 12;
export const SELL_RATE = 0.65;

/** Cells per second / cells of range. Tuned against a 1-cell tile. */
export const COSTS: Record<TowerKind, number> = { archer: 45, cannon: 100 };
export const BASE_DAMAGE: Record<TowerKind, number> = { archer: 15, cannon: 36 };
export const BASE_COOLDOWN: Record<TowerKind, number> = { archer: 0.52, cannon: 1.18 };
export const BASE_RANGE: Record<TowerKind, number> = { archer: 3.45, cannon: 2.75 };
/** Gold to leave tier 1, 2, and 3. Tier 4 is a specialization, not a stat bump alone. */
export const UPGRADE_COSTS = [70, 110, 165] as const;

/**
 * Spec sheets are 2×2: t-1 frost, t-2 ember, t-3 shadow, t-4 luminous.
 * Line sheets t-1…t-4 are the unspecialized tiers.
 */
export const SPEC_ORDER: Special[] = ["frost", "ember", "shadow", "luminous"];

export const SPEC_COPY: Record<Special, { name: string; blurb: string }> = {
  frost: { name: "Frost", blurb: "Slows creeps for a few seconds." },
  ember: { name: "Ember", blurb: "Splash and a burning damage over time." },
  shadow: { name: "Shadow", blurb: "Heavy hits, armor pierce, and a curse." },
  luminous: { name: "Luminous", blurb: "Much longer range. Buffs nearby towers." },
};

export const TOWER_COPY: Record<TowerKind, { name: string; blurb: string }> = {
  archer: { name: "Archer", blurb: "Long range, quick shots." },
  cannon: { name: "Cannon", blurb: "Slow shells that splash." },
};

/**
 * Winding road, orthogonal and contiguous.
 * Enters from the west rift and leaves through the east gate.
 */
export const PATH: { c: number; r: number }[] = [
  { c: 0, r: 1 },
  { c: 1, r: 1 },
  { c: 2, r: 1 },
  { c: 3, r: 1 },
  { c: 4, r: 1 },
  { c: 5, r: 1 },
  { c: 5, r: 2 },
  { c: 5, r: 3 },
  { c: 4, r: 3 },
  { c: 3, r: 3 },
  { c: 2, r: 3 },
  { c: 2, r: 4 },
  { c: 2, r: 5 },
  { c: 3, r: 5 },
  { c: 4, r: 5 },
  { c: 5, r: 5 },
  { c: 6, r: 5 },
  { c: 7, r: 5 },
  { c: 8, r: 5 },
  { c: 9, r: 5 },
  { c: 10, r: 5 },
  { c: 11, r: 5 },
];

const PATH_KEY = new Set(PATH.map((p) => `${p.c},${p.r}`));

export function isPath(c: number, r: number): boolean {
  return PATH_KEY.has(`${c},${r}`);
}

export function inBounds(c: number, r: number): boolean {
  return c >= 0 && r >= 0 && c < COLS && r < ROWS;
}

export type EnemyDef = {
  hp: number;
  speed: number;
  gold: number;
  armor: number;
  leak: number;
  radius: number;
};

export const ENEMIES: Record<EnemyKind, EnemyDef> = {
  scout: { hp: 44, speed: 0.9, gold: 8, armor: 0, leak: 1, radius: 0.24 },
  runner: { hp: 32, speed: 1.5, gold: 9, armor: 0, leak: 1, radius: 0.2 },
  brute: { hp: 128, speed: 0.5, gold: 18, armor: 4, leak: 1, radius: 0.32 },
  warden: { hp: 200, speed: 0.42, gold: 26, armor: 9, leak: 2, radius: 0.32 },
  titan: { hp: 780, speed: 0.32, gold: 150, armor: 14, leak: 4, radius: 0.56 },
};

export type WaveGroup = { kind: EnemyKind; count: number; gap: number };

/** Wave 12 contains exactly one titan. Callers must not append a second boss. */
export function wavePlan(wave: number): WaveGroup[] {
  if (wave === FINAL_WAVE) {
    return [
      { kind: "titan", count: 1, gap: 1.6 },
      { kind: "warden", count: 5, gap: 0.85 },
      { kind: "brute", count: 4, gap: 0.7 },
    ];
  }
  if (wave % 4 === 0) {
    return [
      { kind: "warden", count: 2 + Math.floor(wave / 3), gap: 0.9 },
      { kind: "brute", count: 3 + Math.floor(wave / 2), gap: 0.72 },
      { kind: "runner", count: 2 + Math.floor(wave / 2), gap: 0.46 },
    ];
  }
  const groups: WaveGroup[] = [{ kind: "scout", count: 5 + wave, gap: 0.58 }];
  if (wave >= 2) groups.push({ kind: "runner", count: 2 + Math.floor(wave / 2), gap: 0.45 });
  if (wave >= 3) groups.push({ kind: "brute", count: 1 + Math.floor(wave / 3), gap: 0.82 });
  if (wave >= 6) groups.push({ kind: "warden", count: 1 + Math.floor((wave - 6) / 2), gap: 0.95 });
  return groups;
}

export function expandWave(wave: number): { kind: EnemyKind; gap: number }[] {
  const list: { kind: EnemyKind; gap: number }[] = [];
  for (const group of wavePlan(wave)) {
    for (let i = 0; i < group.count; i++) list.push({ kind: group.kind, gap: group.gap });
  }
  return list;
}

export function waveLabel(wave: number): string {
  return wavePlan(wave)
    .map((g) => `${g.count} ${g.kind}${g.count > 1 ? "s" : ""}`)
    .join(" · ");
}

const ENEMY_NAME: Record<EnemyKind, string> = {
  scout: "Scout",
  runner: "Runner",
  brute: "Brute",
  warden: "Warden",
  titan: "Titan",
};

export function prettyWave(wave: number): string {
  return wavePlan(wave)
    .map((g) => `${g.count} ${ENEMY_NAME[g.kind]}${g.count > 1 ? "s" : ""}`)
    .join(", ");
}

export type ProfileInput = {
  kind: TowerKind;
  level: number;
  special: Special | null;
};

export type ShotProfile = {
  damage: number;
  cooldown: number;
  range: number;
  speed: number;
  splash: number;
  falloff: number;
  pen: number;
  slowAmt: number;
  slowDur: number;
  burnDps: number;
  burnDur: number;
  curseDur: number;
};

export function shotProfile(
  tower: ProfileInput,
  aura: { dmg: number; rate: number } = { dmg: 1, rate: 1 },
): ShotProfile {
  const level = tower.level;
  const grown = 1 + (level - 1) * 0.65;
  let damage = BASE_DAMAGE[tower.kind] * grown * aura.dmg;
  let cooldown =
    (BASE_COOLDOWN[tower.kind] * (1 - (level - 1) * 0.08)) / Math.max(0.2, aura.rate);
  let range = BASE_RANGE[tower.kind] + (level - 1) * 0.26;
  let splash = tower.kind === "cannon" ? 1.05 : 0;
  let falloff = 0.58;
  let pen = 0;
  let slowAmt = 0;
  let slowDur = 0;
  let burnDps = 0;
  let burnDur = 0;
  let curseDur = 0;
  const speed = tower.kind === "archer" ? 9.2 : 5.5;

  switch (tower.special) {
    case "frost":
      damage *= 0.9;
      slowAmt = tower.kind === "archer" ? 0.5 : 0.42;
      slowDur = tower.kind === "archer" ? 2.8 : 2.4;
      if (tower.kind === "cannon") splash = 1.2;
      break;
    case "ember":
      damage *= 0.8;
      burnDps = tower.kind === "cannon" ? 18 : 10;
      burnDur = 3.1;
      if (tower.kind === "archer") {
        splash = 0.7;
        falloff = 0.5;
      } else {
        splash = 1.4;
      }
      break;
    case "shadow":
      damage *= 1.55;
      pen = 0.75;
      curseDur = 3.2;
      if (tower.kind === "cannon") {
        splash = 0.42;
        falloff = 0.4;
      }
      break;
    case "luminous":
      damage *= 1.08;
      range *= 1.42;
      cooldown *= 0.9;
      break;
    default:
      break;
  }

  cooldown = Math.max(0.16, cooldown);
  return {
    damage,
    cooldown,
    range,
    speed,
    splash,
    falloff,
    pen,
    slowAmt,
    slowDur,
    burnDps,
    burnDur,
    curseDur,
  };
}

export function auraFor(
  selfId: number,
  c: number,
  r: number,
  towers: { id: number; c: number; r: number; special: Special | null }[],
): { dmg: number; rate: number } {
  let n = 0;
  for (const other of towers) {
    if (other.id === selfId || other.special !== "luminous") continue;
    const dx = other.c - c;
    const dy = other.r - r;
    if (dx * dx + dy * dy <= 2.8 * 2.8) n += 1;
  }
  n = Math.min(2, n);
  return { dmg: 1 + 0.1 * n, rate: 1 + 0.15 * n };
}

export function upgradeCost(level: number): number | null {
  if (level < 1 || level > 3) return null;
  return UPGRADE_COSTS[level - 1];
}

export function sellValue(spent: number): number {
  return Math.floor(spent * SELL_RATE);
}

export function artKey(kind: TowerKind, level: number, special: Special | null): string {
  if (level >= 4 && special) return `${kind}-${special}`;
  return `${kind}-${level}`;
}

export type Layout = {
  cell: number;
  originX: number;
  originY: number;
  w: number;
  h: number;
};

export function layoutFor(w: number, h: number): Layout {
  const marginX = Math.max(12, Math.min(48, w * 0.04));
  const marginY = Math.max(12, Math.min(40, h * 0.05));
  const cell = Math.max(8, Math.min((w - marginX * 2) / COLS, (h - marginY * 2) / ROWS));
  const boardW = cell * COLS;
  const boardH = cell * ROWS;
  return {
    cell,
    originX: (w - boardW) / 2,
    originY: (h - boardH) / 2,
    w,
    h,
  };
}

export function cellCenter(c: number, r: number): { x: number; y: number } {
  return { x: c + 0.5, y: r + 0.5 };
}
