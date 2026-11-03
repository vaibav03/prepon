import type { Rule, RuleKind, RuleStatus } from "@/lib/types";

/**
 * Derived readings for the rule set. Pure functions, no state, no formatting
 * of anything a reader would call a score.
 */

/** The live set is capped: a new rule has to displace an older one to get in. */
export const LIVE_CAP = 60;

/** Health a live rule gives up for each application it goes unused. */
const DECAY_PER_UNUSED_APPLICATION = 0.02;

export const KIND_LABEL: Record<RuleKind, string> = {
  structure: "Structure",
  sentence_habit: "Sentence habit",
  avoid_word: "Word choice",
  stance: "Stance",
  length: "Length",
};

export const KIND_ORDER: RuleKind[] = [
  "structure",
  "sentence_habit",
  "avoid_word",
  "stance",
  "length",
];

export const STATUS_ORDER: RuleStatus[] = [
  "live",
  "proposed",
  "expiring",
  "retired",
];

/** Live and expiring rules both hold a slot in the capped live set. */
export function occupiesSlot(rule: Rule): boolean {
  return rule.status === "live" || rule.status === "expiring";
}

/** Applications a decaying rule has left before it retires itself. */
export function retiresIn(rule: Rule): number {
  return Math.max(1, Math.ceil(rule.health / DECAY_PER_UNUSED_APPLICATION));
}

/** Pinned first, then by health, then oldest first. */
export function sortActive(list: Rule[]): Rule[] {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (b.health !== a.health) return b.health - a.health;
    return a.createdAt < b.createdAt ? -1 : 1;
  });
}

/** Strongest replay evidence first: a proposed rule is asking to be promoted. */
export function sortProposed(list: Rule[]): Rule[] {
  return [...list].sort((a, b) => {
    if (b.health !== a.health) return b.health - a.health;
    return a.createdAt < b.createdAt ? -1 : 1;
  });
}

/** The weakest unpinned rule holding a slot: the one a promotion pushes out. */
export function nextToDisplace(list: Rule[]): Rule | null {
  const holding = list.filter((rule) => occupiesSlot(rule) && !rule.pinned);
  if (holding.length === 0) return null;
  return holding.reduce((weakest, rule) =>
    rule.health < weakest.health ? rule : weakest,
  );
}

/** Opacity for a decaying rule: it loses weight as its health falls. */
export function visualWeight(rule: Rule): number {
  if (rule.status === "retired") return 0.6;
  if (rule.status === "expiring") {
    return Math.min(1, 0.62 + rule.health * 0.55);
  }
  return 1;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

/** Deterministic and timezone-free, so the server and the client agree. */
export function formatDay(iso: string): string {
  const parts = iso.slice(0, 10).split("-");
  const month = MONTHS[Number(parts[1]) - 1];
  if (!month) return iso.slice(0, 10);
  return `${month} ${Number(parts[2])}`;
}

/** Shortens a rule to something that fits in a sentence about it. */
export function shorten(text: string, max = 46): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}
