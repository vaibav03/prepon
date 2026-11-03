import type { CorpusSource, RuleKind } from "@/lib/types";

/** The four passes of setup. Order matters only for the prev/next links. */
export const STEP_IDS = [
  "connect",
  "signal",
  "specification",
  "handoff",
] as const;

export type StepId = (typeof STEP_IDS)[number];

/**
 * How much Prepon actually knows about a source.
 * - read       the whole thing has been counted
 * - estimated  a file is in hand, the word count is from its size
 * - queued     a link is registered, nothing has been read yet
 */
export type SourceState = "read" | "estimated" | "queued";

export interface LedgerSource extends CorpusSource {
  state: SourceState;
}

/**
 * A line of the first specification. Not a Rule: it has no replay evidence,
 * no applied/kept/reverted history, and it cannot go live. It is what Prepon
 * guessed by reading finished work, before the writer corrected anything.
 */
export interface Observation {
  id: string;
  /** Plain English, phrased the way a rule is phrased. */
  text: string;
  kind: RuleKind;
  /** What was counted to arrive at it. */
  basis: string;
  /** id of the CorpusSource it was derived from. */
  sourceId: string;
  /** 0..1. Deliberately low: inference is weaker than correction. */
  confidence: number;
  /** True when the inference is thin enough that one correction will kill it. */
  volatile: boolean;
}

/** A kind of writing the corpus either covers or does not. */
export interface Register {
  id: string;
  label: string;
  /** Present when this register is covered by a connected source. */
  sourceId?: string;
  /** Why its absence matters, for the ones that are missing. */
  note?: string;
}

/** What an intake hands back; the client assigns the id and timestamp. */
export type NewSource = Pick<
  LedgerSource,
  "label" | "kind" | "words" | "state"
>;
