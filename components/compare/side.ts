import type { ComparePair } from "@/lib/types";
import { rules } from "@/lib/fixtures";

/** Which column of a ComparePair we are talking about. `a` renders first. */
export type Side = "a" | "b";

/** A verdict the writer has committed to for one pair. */
export interface Verdict {
  pairId: string;
  picked: Side;
}

/**
 * The two writers under test. `prepon` is this user's live rule set; `guide`
 * is the same model handed the style guide the user wrote once and froze.
 */
export type Tone = "prepon" | "guide";

export const ORDINAL: Record<Side, string> = { a: "One", b: "Two" };

const LIVE_COUNT = rules.filter((rule) => rule.status === "live").length;

export interface Attribution {
  tone: Tone;
  name: string;
  detail: string;
}

export const ATTRIBUTION: Record<Tone, Attribution> = {
  prepon: {
    tone: "prepon",
    name: "Prepon",
    detail: `${LIVE_COUNT} live rules applied`,
  },
  guide: {
    tone: "guide",
    name: "Style guide",
    detail: "frozen 12 June, unchanged",
  },
};

export function attributionFor(pair: ComparePair, side: Side): Attribution {
  return side === pair.prepon ? ATTRIBUTION.prepon : ATTRIBUTION.guide;
}

/** Raw CSS variables, for inline colour on hairlines and ticks. */
export const TONE_COLOR: Record<Tone, string> = {
  prepon: "var(--state-live)",
  guide: "var(--state-retired)",
};

/** Matching Tailwind text colour. */
export const TONE_TEXT: Record<Tone, string> = {
  prepon: "text-live",
  guide: "text-retired",
};

/** Resolve a pair to the tone the writer actually chose, or null if unjudged. */
export function outcomeOf(
  pair: ComparePair,
  verdicts: Verdict[],
): Tone | null {
  const verdict = verdicts.find((entry) => entry.pairId === pair.id);
  if (!verdict) return null;
  return verdict.picked === pair.prepon ? "prepon" : "guide";
}
