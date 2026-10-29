import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { migrateSave } from "./save.ts";
import { uiRootPx } from "./ui-scale.ts";

describe("save migration", () => {
  it("keeps a v1 best wave and mute without inventing an account", () => {
    const next = migrateSave({ version: 1, bestWave: 7, muted: true, shake: false });
    assert.equal(next.version, 2);
    assert.equal(next.bestWave, 7);
    assert.equal(next.muted, true);
    assert.equal(next.shake, false);
    assert.equal(next.victories, 0);
    assert.equal(next.runs, 0);
    assert.equal(next.uiScale, "auto");
    assert.equal(next.music, 0.35);
    assert.equal(next.sfx, 0.8);
  });

  it("drops corrupt blobs back to defaults", () => {
    const next = migrateSave("nope");
    assert.equal(next.bestWave, 0);
    assert.equal(next.hints, true);
    assert.equal(next.uiScale, "auto");
  });

  it("clamps volumes and rejects an unknown scale", () => {
    const next = migrateSave({
      version: 2,
      bestWave: 40,
      victories: 2,
      runs: 9,
      music: 4,
      sfx: -1,
      muted: false,
      shake: true,
      uiScale: "huge",
      hints: false,
    });
    assert.equal(next.bestWave, 40);
    assert.equal(next.music, 1);
    assert.equal(next.sfx, 0);
    assert.equal(next.uiScale, "auto");
    assert.equal(next.hints, false);
  });
});

describe("ui scale", () => {
  it("follows the window in auto and honors an explicit size", () => {
    assert.equal(uiRootPx("auto", 390, 844), 14.5);
    assert.equal(uiRootPx("auto", 844, 390), 14.5);
    assert.equal(uiRootPx("auto", 1280, 800), 16.5);
    assert.equal(uiRootPx("auto", 1600, 900), 18);
    assert.equal(uiRootPx("large", 390, 844), 18);
    assert.equal(uiRootPx("small", 1600, 900), 14);
  });
});
