export type UiScale = "auto" | "small" | "medium" | "large";

export type SaveData = {
  version: 2;
  bestWave: number;
  victories: number;
  runs: number;
  music: number;
  sfx: number;
  muted: boolean;
  shake: boolean;
  uiScale: UiScale;
  hints: boolean;
};

export const SAVE_VERSION = 2;
export const SAVE_KEY = "sky-defenders-v2";
const LEGACY_KEY = "sky-defenders-v1";

export const DEFAULT_SAVE: SaveData = {
  version: 2,
  bestWave: 0,
  victories: 0,
  runs: 0,
  music: 0.35,
  sfx: 0.8,
  muted: false,
  shake: true,
  uiScale: "auto",
  hints: true,
};

function clamp01(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(1, Math.max(0, n));
}

function clampInt(value: unknown, min: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function isScale(value: unknown): value is UiScale {
  return value === "auto" || value === "small" || value === "medium" || value === "large";
}

/** Accepts a v1 blob, a v2 blob, or garbage. Always returns a complete v2 save. */
export function migrateSave(raw: unknown): SaveData {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_SAVE };
  const parsed = raw as Record<string, unknown>;
  const looksLegacy =
    parsed.version === 1 ||
    (parsed.music === undefined && parsed.sfx === undefined && typeof parsed.muted === "boolean");
  return {
    version: SAVE_VERSION,
    bestWave: clampInt(parsed.bestWave, 0, 99),
    victories: clampInt(parsed.victories, 0, 9999),
    runs: clampInt(parsed.runs, 0, 9999),
    music: looksLegacy ? DEFAULT_SAVE.music : clamp01(parsed.music, DEFAULT_SAVE.music),
    sfx: looksLegacy ? DEFAULT_SAVE.sfx : clamp01(parsed.sfx, DEFAULT_SAVE.sfx),
    muted: Boolean(parsed.muted),
    shake: parsed.shake !== false,
    uiScale: isScale(parsed.uiScale) ? parsed.uiScale : "auto",
    hints: parsed.hints !== false,
  };
}

export function loadSave(): SaveData {
  try {
    const current = localStorage.getItem(SAVE_KEY);
    if (current) return migrateSave(JSON.parse(current) as unknown);
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const migrated = migrateSave(JSON.parse(legacy) as unknown);
      writeSave(migrated);
      return migrated;
    }
    return { ...DEFAULT_SAVE };
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function writeSave(data: SaveData): void {
  try {
    const payload = migrateSave(data);
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch {
    /* private mode or quota — the run still plays */
  }
}
