import type { WinRatePoint } from "@/lib/types";

/**
 * The win rate the loop has to beat to justify its own overhead. Below it, a
 * plain prompt does the same work for free.
 */
export const KILL_LINE = 0.6;

/** The number of captured edits by which the kill line has to have been beaten. */
export const DECISION_EDITS = 100;

/** Under this many edits a win rate is noise, so we refuse to draw it. */
export const MIN_EDITS = 20;

/** Plotted y domain. Deliberately not 0-100: nothing interesting lives there. */
export const Y_MIN = 0.4;
export const Y_MAX = 0.8;

/** At most four, and they are hairlines. 0.6 is the kill line, not a gridline. */
export const Y_GRIDLINES = [0.4, 0.5, 0.7, 0.8] as const;

/** Every labelled value on the y axis, the kill line included. */
export const Y_LABELS = [0.4, 0.5, 0.6, 0.7, 0.8] as const;

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function clampRate(value: number): number {
  return Math.max(Y_MIN, Math.min(Y_MAX, value));
}

export type Verdict = "working" | "early-above" | "early-below" | "failing";

export interface ProgressReading {
  first: WinRatePoint;
  latest: WinRatePoint;
  checkpoints: number;
  editsCaptured: number;
  winRate: number;
  /** Strictly above the kill line. Sitting exactly on it is not above it. */
  aboveLine: boolean;
  pastDecision: boolean;
  /** Start of the unbroken run of readings above the kill line, if there is one. */
  crossing: WinRatePoint | null;
  verdict: Verdict;
  headline: string;
  detail: string;
}

const NOTHING: WinRatePoint = { edits: 0, winRate: KILL_LINE };

/**
 * Find the beginning of the current unbroken run above the kill line. Scanning
 * backwards rather than forwards matters: a rate that touched 60% once at edit
 * 12 and fell away has not crossed anything.
 */
function findSustainedCrossing(points: WinRatePoint[]): WinRatePoint | null {
  if (points.length === 0) return null;
  let i = points.length - 1;
  if (points[i].winRate <= KILL_LINE) return null;
  while (i > 0 && points[i - 1].winRate > KILL_LINE) i -= 1;
  return points[i];
}

/** Everything the page says in words about the chart, derived in one place. */
export function readProgress(points: WinRatePoint[]): ProgressReading {
  const first = points.length > 0 ? points[0] : NOTHING;
  const latest = points.length > 0 ? points[points.length - 1] : NOTHING;
  const editsCaptured = latest.edits;
  const winRate = latest.winRate;
  const aboveLine = points.length > 0 && winRate > KILL_LINE;
  const pastDecision = editsCaptured >= DECISION_EDITS;
  const crossing = findSustainedCrossing(points);

  const rate = formatPercent(winRate);
  const margin = Math.abs(Math.round((winRate - KILL_LINE) * 100));
  const remaining = Math.max(DECISION_EDITS - editsCaptured, 0);

  const verdict: Verdict = aboveLine
    ? pastDecision
      ? "working"
      : "early-above"
    : pastDecision
      ? "failing"
      : "early-below";

  if (verdict === "working") {
    return {
      first,
      latest,
      checkpoints: points.length,
      editsCaptured,
      winRate,
      aboveLine,
      pastDecision,
      crossing,
      verdict,
      headline: "The loop is working.",
      detail:
        `With ${editsCaptured} of your edits behind it, the draft written through your rules takes ` +
        `${rate} of blind picks — ${margin} points clear of the line it had to beat` +
        `${crossing ? `, and clear of it since edit ${crossing.edits}` : ""}. ` +
        `That margin is what pays for the rules. If it ever settles back under 60%, the honest ` +
        `read is that a plain prompt would serve you just as well.`,
    };
  }

  if (verdict === "early-above") {
    return {
      first,
      latest,
      checkpoints: points.length,
      editsCaptured,
      winRate,
      aboveLine,
      pastDecision,
      crossing,
      verdict,
      headline: "Above the line, but too early to bank it.",
      detail:
        `${rate} of blind picks after ${editsCaptured} edits. That is over the line, but a reading ` +
        `this young swings several points on a handful of drafts. The test that counts is whether ` +
        `it is still above 60% at ${DECISION_EDITS} edits — ${remaining} away.`,
    };
  }

  if (verdict === "failing") {
    return {
      first,
      latest,
      checkpoints: points.length,
      editsCaptured,
      winRate,
      aboveLine,
      pastDecision,
      crossing,
      verdict,
      headline: "The loop is not earning its place.",
      detail:
        `${rate} of blind picks after ${editsCaptured} edits — ${margin} points under the line, and ` +
        `past the point where that could be called early. On this evidence a plain prompt would serve ` +
        `you as well and the rules are pure overhead. Cut the live set back to the few with real ` +
        `replay evidence behind them, or switch the loop off.`,
    };
  }

  return {
    first,
    latest,
    checkpoints: points.length,
    editsCaptured,
    winRate,
    aboveLine,
    pastDecision,
    crossing,
    verdict,
    headline: "Under the line, and still early.",
    detail:
      `${rate} of blind picks after ${editsCaptured} edits. Under 60%, which is ordinary this early — ` +
      `the rule set has not seen enough of your corrections to beat a plain prompt yet. ` +
      `${remaining} more edits until that stops being an excuse.`,
  };
}
