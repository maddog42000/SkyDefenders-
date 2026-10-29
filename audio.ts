import type { GameEvent } from "./types.ts";

const PENTA = [196, 233.08, 261.63, 293.66, 349.23, 392];

export type Mix = { music: number; sfx: number; muted: boolean };

export class Soundscape {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private nextNote = 0;
  private step = 0;
  musicVol = 0.35;
  sfxVol = 0.8;
  muted = false;

  unlock(): void {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    if (!this.ctx) {
      this.ctx = new AC({ latencyHint: "interactive" });
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
      this.applyGains();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMix(mix: Mix): void {
    this.musicVol = clampVol(mix.music);
    this.sfxVol = clampVol(mix.sfx);
    this.muted = mix.muted;
    this.applyGains();
  }

  preview(): void {
    if (this.muted || this.sfxVol <= 0) return;
    this.unlock();
    this.tone(this.sfxGain, 660, 0.08, "sine", 0.05);
  }

  tick(): void {
    if (!this.ctx || !this.musicGain || this.muted || this.musicVol <= 0) return;
    if (this.ctx.state !== "running") return;
    const now = this.ctx.currentTime;
    if (this.nextNote === 0) this.nextNote = now + 0.2;
    if (now + 0.05 < this.nextNote) return;
    const freq = PENTA[this.step % PENTA.length] ?? 220;
    this.step += 1;
    this.tone(this.musicGain, freq, 0.45, "sine", 0.02, now);
    this.nextNote += 0.62;
  }

  play(event: GameEvent): void {
    if (this.muted || this.sfxVol <= 0) return;
    this.unlock();
    const jitter = 0.94 + Math.random() * 0.12;
    const bus = this.sfxGain;
    switch (event.t) {
      case "shoot":
        if (event.special === "frost") this.tone(bus, 880 * jitter, 0.07, "sine", 0.03);
        else if (event.special === "ember") this.tone(bus, 180 * jitter, 0.1, "triangle", 0.04);
        else if (event.special === "shadow") this.tone(bus, 140 * jitter, 0.09, "sawtooth", 0.025);
        else if (event.special === "luminous") this.tone(bus, 720 * jitter, 0.08, "triangle", 0.03);
        else if (event.kind === "cannon") this.tone(bus, 130 * jitter, 0.12, "triangle", 0.05);
        else this.tone(bus, 640 * jitter, 0.045, "square", 0.02);
        break;
      case "kill":
        this.tone(bus, event.kind === "titan" ? 520 : 760, event.kind === "titan" ? 0.2 : 0.06, "sine", 0.04);
        break;
      case "leak":
        this.tone(bus, 98, 0.22, "sawtooth", 0.04);
        break;
      case "place":
        this.tone(bus, 230, 0.08, "triangle", 0.045);
        break;
      case "upgrade":
        this.tone(bus, 520, 0.09, "triangle", 0.04);
        this.tone(bus, 780, 0.12, "sine", 0.03);
        break;
      case "sell":
        this.tone(bus, 180, 0.08, "sine", 0.035);
        break;
      case "wave":
        this.tone(bus, 392, 0.12, "triangle", 0.04);
        this.tone(bus, 523, 0.16, "sine", 0.03);
        break;
      case "clear":
        this.tone(bus, 659, 0.12, "sine", 0.04);
        break;
      case "win":
        this.tone(bus, 523, 0.18, "triangle", 0.04);
        this.tone(bus, 659, 0.22, "sine", 0.035);
        this.tone(bus, 784, 0.28, "sine", 0.03);
        break;
      case "lose":
        this.tone(bus, 90, 0.4, "sawtooth", 0.04);
        break;
      case "nope":
        this.tone(bus, 110, 0.06, "square", 0.03);
        break;
      default:
        break;
    }
  }

  playAll(events: GameEvent[]): void {
    for (const event of events) this.play(event);
  }

  private applyGains(): void {
    if (!this.ctx || !this.musicGain || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const music = this.muted ? 0 : this.musicVol;
    const sfx = this.muted ? 0 : this.sfxVol;
    this.musicGain.gain.setTargetAtTime(music, now, 0.03);
    this.sfxGain.gain.setTargetAtTime(sfx, now, 0.03);
  }

  private tone(
    bus: GainNode | null,
    freq: number,
    dur: number,
    type: OscillatorType,
    gain: number,
    when?: number,
  ): void {
    if (!this.ctx || !bus) return;
    const t = when ?? this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(amp);
    amp.connect(bus);
    osc.start(t);
    osc.stop(t + dur + 0.02);
    osc.onended = () => {
      osc.disconnect();
      amp.disconnect();
    };
  }
}

function clampVol(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
