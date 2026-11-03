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
];

/** 159480 -> "159,480". Fixed locale so server and client agree. */
export function formatWords(n: number): string {
  return n.toLocaleString("en-US");
}

/** 40000 -> "40k". Used on the volume ruler, where space is tight. */
export function formatCompact(n: number): string {
  if (n === 0) return "0";
  if (n < 1000) return String(n);
  const thousands = n / 1000;
  return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}k`;
}

/**
 * ISO string -> "2 Sep". Read in UTC on purpose: a date formatted from the
 * viewer's timezone would differ between the server render and the client one.
 */
export function formatDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

/** Whitespace-separated token count. Good enough, and it is honest about it. */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/** First few words of a pasted passage, for the ledger label. */
export function snippet(text: string, words = 6): string {
  const parts = text.trim().split(/\s+/).slice(0, words);
  if (parts.length === 0) return "Pasted text";
  const joined = parts.join(" ").replace(/[.,;:—-]+$/, "");
  return `${joined}…`;
}
