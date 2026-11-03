import type { RuleKind, RuleStatus } from "@/lib/types";

/**
 * The product's reference "now". Fixtures are static, so the page must be too:
 * a real clock would make the server and the client disagree on every relative
 * date and re-render the page differently after hydration.
 */
export const TODAY_MS = Date.UTC(2026, 10, 2);

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** "27 Oct" — UTC parts only, so server and client always agree. */
export function formatDay(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

/** "27 Oct 2026". */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "9 days ago", "today", "5 weeks ago". */
export function relativeDay(iso: string): string {
  const days = Math.max(
    0,
    Math.round((TODAY_MS - Date.parse(iso)) / 86_400_000),
  );
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 9) return `${weeks} weeks ago`;
  return `${Math.round(days / 30)} months ago`;
}

export const KIND_LABEL: Record<RuleKind, string> = {
  avoid_word: "Word to avoid",
  sentence_habit: "Sentence habit",
  structure: "Structure",
  stance: "Stance",
  length: "Length",
};

/** What the rule is doing right now, said in one clause. */
export const STATUS_SENTENCE: Record<RuleStatus, string> = {
  live: "In use. Injected before every answer.",
  proposed: "Not in use. Held until the replay gate clears it.",
  expiring: "Still in use, but decaying. It will drop out unless you keep it.",
  retired: "Out of use. Kept here as a record.",
};

export function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
