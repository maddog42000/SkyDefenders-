import type { UiScale } from "./save.ts";

/** Root font size in px. rem-based chrome scales with it; 44px tap targets stay in CSS px. */
export function uiRootPx(mode: UiScale, width: number, height: number): number {
  if (mode === "small") return 14;
  if (mode === "medium") return 16;
  if (mode === "large") return 18;
  const short = Math.min(width, height);
  if (short < 360) return 13;
  if (width < 430 || height < 680) return 14.5;
  if (width >= 1400 && height >= 860) return 18;
  if (width >= 1100) return 16.5;
  return 16;
}

export function applyUiScale(mode: UiScale, width = window.innerWidth, height = window.innerHeight): number {
  const px = uiRootPx(mode, width, height);
  document.documentElement.style.fontSize = `${px}px`;
  document.documentElement.dataset.uiScale = mode;
  return px;
}
