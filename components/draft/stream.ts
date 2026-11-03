import type { Draft, DraftSpan } from "@/lib/types";

/**
 * A span prepared for word-by-word streaming. `tokens` concatenate back to
 * exactly `text`, so revealing them in order never corrupts the spacing the
 * fixtures depend on (spans join with no separator).
 */
export interface SpanPlan extends DraftSpan {
  /** Stable within a draft: "<paragraph>-<span>". */
  id: string;
  /** Word chunks, each carrying its own leading whitespace. */
  tokens: string[];
  /** Index of this span's first token in the draft-wide token order. */
  start: number;
}

export interface DraftPlan {
  draftId: string;
  paragraphs: SpanPlan[][];
  /** Total tokens in the draft; `revealed === total` means fully arrived. */
  total: number;
}

/**
 * Split into word chunks that preserve every space. A chunk is the whitespace
 * before a word plus the word itself; any trailing whitespace is folded into
 * the last chunk so that `tokens.join("") === text`.
 */
export function tokenize(text: string): string[] {
  const matched = text.match(/\s*\S+/g);
  if (!matched || matched.length === 0) {
    return text.length > 0 ? [text] : [];
  }
  const consumed = matched.reduce((n, chunk) => n + chunk.length, 0);
  if (consumed < text.length) {
    matched[matched.length - 1] += text.slice(consumed);
  }
  return matched;
}

export function buildPlan(draft: Draft): DraftPlan {
  let cursor = 0;
  const paragraphs = draft.paragraphs.map((spans, p) =>
    spans.map((span, s) => {
      const tokens = tokenize(span.text);
      const plan: SpanPlan = { ...span, id: `${p}-${s}`, tokens, start: cursor };
      cursor += tokens.length;
      return plan;
    }),
  );
  return { draftId: draft.id, paragraphs, total: cursor };
}

/** How much of a span has arrived at a given global reveal count. */
export function visibleText(span: SpanPlan, revealed: number): string {
  const n = revealed - span.start;
  if (n >= span.tokens.length) return span.text;
  if (n <= 0) return "";
  return span.tokens.slice(0, n).join("");
}

/** True when the leading edge of the stream sits inside this span. */
export function holdsCursor(span: SpanPlan, revealed: number): boolean {
  if (revealed <= 0) return false;
  const last = revealed - 1;
  return last >= span.start && last < span.start + span.tokens.length;
}

/** Flatten a plan back to span order, for sweeps and lookups. */
export function flattenSpans(plan: DraftPlan): SpanPlan[] {
  return plan.paragraphs.flat();
}
