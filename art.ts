import { SPEC_ORDER } from "./balance.ts";
import type { Special, TowerKind } from "./types.ts";

export const ART_REV = "2";

export function lineArt(kind: TowerKind, level = 1): string {
  return `/art/${kind}-line/t-${level}.png?v=${ART_REV}`;
}

export function specArt(kind: TowerKind, spec: Special): string {
  const index = Math.max(0, SPEC_ORDER.indexOf(spec));
  return `/art/${kind}-spec/t-${index + 1}.png?v=${ART_REV}`;
}
