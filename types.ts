export type TowerKind = "archer" | "cannon";
export type Special = "frost" | "ember" | "shadow" | "luminous";
export type EnemyKind = "scout" | "runner" | "brute" | "warden" | "titan";
export type Phase = "menu" | "play" | "pause" | "win" | "lose";
export type TargetMode = "first" | "closest" | "strongest";

export type GameEvent =
  | { t: "shoot"; kind: TowerKind; special: Special | null }
  | { t: "kill"; kind: EnemyKind }
  | { t: "leak" }
  | { t: "wave" }
  | { t: "clear" }
  | { t: "win" }
  | { t: "lose" }
  | { t: "place" }
  | { t: "upgrade" }
  | { t: "sell" }
  | { t: "nope" };

export type Tower = {
  id: number;
  kind: TowerKind;
  c: number;
  r: number;
  level: number;
  special: Special | null;
  cooldown: number;
  spent: number;
  targetMode: TargetMode;
  recoil: number;
  angle: number;
};

export type Enemy = {
  id: number;
  kind: EnemyKind;
  hp: number;
  maxHp: number;
  armor: number;
  speed: number;
  gold: number;
  gx: number;
  gy: number;
  next: number;
  alive: boolean;
  slowT: number;
  slowAmt: number;
  burnT: number;
  burnDps: number;
  curseT: number;
  flash: number;
  anim: number;
  born: number;
  face: number;
  leakLives: number;
  radius: number;
};

export type Shot = {
  kind: TowerKind;
  special: Special | null;
  x: number;
  y: number;
  enemyId: number;
  tx: number;
  ty: number;
  speed: number;
  damage: number;
  splash: number;
  falloff: number;
  pen: number;
  slowAmt: number;
  slowDur: number;
  burnDps: number;
  burnDur: number;
  curseDur: number;
  done: boolean;
  dist0: number;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  text?: string;
};

export type HudTower = {
  id: number;
  kind: TowerKind;
  level: number;
  special: Special | null;
  spent: number;
  targetMode: TargetMode;
  damage: number;
  rate: number;
  range: number;
  upgradeCost: number | null;
};

export type Hud = {
  phase: Phase;
  gold: number;
  lives: number;
  wave: number;
  bestWave: number;
  speed: number;
  placing: TowerKind | null;
  selected: HudTower | null;
  waveActive: boolean;
  message: string;
  enemyCount: number;
  nextLabel: string;
  fieldLabel: string;
};
