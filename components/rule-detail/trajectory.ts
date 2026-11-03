import type { Rule } from "@/lib/types";
import { TODAY_MS } from "./format";

const WEEK_MS = 7 * 86_400_000;

export interface TrajectoryWeek {
  index: number;
  /** Start of the week, in ms. */
  atMs: number;
  applied: number;
  kept: number;
  reverted: number;
  /** 0..1. The last point always equals the rule's stored health. */
  health: number;
}

export type Direction = "rising" | "holding" | "falling";

export interface Trajectory {
  weeks: TrajectoryWeek[];
  peakApplied: number;
  direction: Direction;
  /** Change in health over the last three readings. */
  delta: number;
}

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/** FNV-1a. Same rule id, same trajectory, every render, on both sides. */
function seedFrom(text: string): number {
  let h = 2_166_136_261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16_777_619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Split `total` across `weights` as whole numbers that sum to exactly `total`. */
function allocate(total: number, weights: number[]): number[] {
  const out = weights.map(() => 0);
  const sum = weights.reduce((a, b) => a + Math.max(0, b), 0);
  if (total <= 0 || sum <= 0) return out;

  const exact = weights.map((w) => (Math.max(0, w) / sum) * total);
  exact.forEach((value, i) => {
    out[i] = Math.floor(value);
  });

  let left = total - out.reduce((a, b) => a + b, 0);
  const byRemainder = exact
    .map((value, i) => ({ i, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder || a.i - b.i);

  for (let k = 0; k < byRemainder.length && left > 0; k += 1, left -= 1) {
    out[byRemainder[k].i] += 1;
  }
  for (let i = 0; left > 0 && i < out.length; i += 1, left -= 1) {
    out[i] += 1;
  }
  return out;
}

/** As `allocate`, but no bucket may exceed its cap. Overflow is re-offered. */
function allocateCapped(
  total: number,
  weights: number[],
  caps: number[],
): number[] {
  const out = weights.map(() => 0);
  const capacity = caps.reduce((a, b) => a + b, 0);
  let left = Math.min(total, capacity);

  for (let pass = 0; pass < 6 && left > 0; pass += 1) {
    const open = out.map((value, i) => (value < caps[i] ? weights[i] : 0));
    if (open.every((w) => w <= 0)) break;
    const offer = allocate(left, open);
    let placed = 0;
    for (let i = 0; i < out.length; i += 1) {
      const take = Math.min(caps[i] - out[i], offer[i]);
      out[i] += take;
      placed += take;
    }
    if (placed === 0) break;
    left -= placed;
  }
  for (let i = 0; left > 0 && i < out.length; i += 1) {
    const take = Math.min(caps[i] - out[i], left);
    out[i] += take;
    left -= take;
  }
  return out;
}

/**
 * The weekly shape behind a rule's stored counters.
 *
 * The fixtures carry totals, not a time series. This spreads those totals over
 * the weeks the rule has existed: a rule the writer has settled into is applied
 * more as time passes and reverted mostly in its first weeks, while a decaying
 * rule is applied less and reverted more as the writer turns against it. The
 * weekly numbers always sum back to `applied`, `kept` and `reverted`, and the
 * final health reading is always the rule's stored `health`.
 */
export function buildTrajectory(rule: Rule): Trajectory {
  if (rule.applied <= 0) {
    return { weeks: [], peakApplied: 0, direction: "holding", delta: 0 };
  }

  const startMs = Date.parse(rule.createdAt);
  const span = clamp(Math.round((TODAY_MS - startMs) / WEEK_MS), 4, 10);
  const step = span > 1 ? (TODAY_MS - startMs) / (span - 1) : WEEK_MS;
  const random = mulberry32(seedFrom(rule.id));
  const decaying = rule.health < 0.55;

  const usage: number[] = [];
  const reverts: number[] = [];
  for (let i = 0; i < span; i += 1) {
    const t = span > 1 ? i / (span - 1) : 1;
    usage.push((decaying ? 1.2 - 0.72 * t : 0.6 + 0.64 * t) * (0.8 + 0.4 * random()));
    reverts.push((decaying ? 0.28 + 1.5 * t : 1.3 - 0.9 * t) * (0.7 + 0.6 * random()));
  }

  const applied = allocate(rule.applied, usage);
  const reverted = allocateCapped(rule.reverted, reverts, applied);

  const smoothed: number[] = [];
  for (let i = 0; i < span; i += 1) {
    const total = applied[i];
    const rate = total > 0 ? (total - reverted[i]) / total : (smoothed[i - 1] ?? 1);
    smoothed.push(i === 0 ? rate : smoothed[i - 1] + 0.45 * (rate - smoothed[i - 1]));
  }
  const settled = smoothed[span - 1];

  const weeks: TrajectoryWeek[] = applied.map((count, i) => ({
    index: i,
    atMs: startMs + i * step,
    applied: count,
    kept: count - reverted[i],
    reverted: reverted[i],
    health: clamp(rule.health + (smoothed[i] - settled), 0.04, 0.99),
  }));

  const from = weeks[Math.max(0, span - 3)].health;
  const delta = rule.health - from;
  const direction: Direction =
    delta > 0.03 ? "rising" : delta < -0.03 ? "falling" : "holding";

  return {
    weeks,
    peakApplied: weeks.reduce((max, w) => Math.max(max, w.applied), 1),
    direction,
    delta,
  };
}

/** The reading below which a live rule drops out of the set. */
export const EXPIRY_THRESHOLD = 0.25;

export const DIRECTION_SENTENCE: Record<Direction, string> = {
  rising: "Health is rising: you are leaving it alone more often than you were.",
  holding: "Health is holding. Applications and reverts are both steady.",
  falling: "Health is falling: you are reverting it more often than you were.",
};
