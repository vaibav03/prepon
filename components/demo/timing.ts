/**
 * Pure time maths for the scripted demo.
 *
 * Nothing here knows about React. Every visual state in the scene is a pure
 * function of one number — position along the timeline, in script
 * milliseconds — which is what makes the demo scrubbable in either
 * direction, pausable and trivially re-cuttable.
 */

export const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Progress through the window [start, end], clamped to 0..1. */
export function seg(t: number, start: number, end: number): number {
  if (end <= start) return t >= end ? 1 : 0;
  return clamp01((t - start) / (end - start));
}

/** Cubic ease-out, for values driven straight off the clock. */
export const easeOut = (p: number): number => 1 - Math.pow(1 - clamp01(p), 3);

/** Character-by-character typing. */
export function typeChars(text: string, p: number): string {
  return text.slice(0, Math.round(clamp01(p) * text.length));
}

/** Word-by-word streaming, the way a model actually emits tokens. */
export function streamWords(text: string, p: number): string {
  const words = text.split(" ");
  const n = Math.round(clamp01(p) * words.length);
  return words.slice(0, n).join(" ");
}

/**
 * Stream several lines as one continuous run of words, so the second line
 * only starts once the first has finished.
 */
export function streamLines(lines: readonly string[], p: number): string[] {
  const split = lines.map((line) => line.split(" "));
  const total = split.reduce((sum, words) => sum + words.length, 0);
  let budget = Math.round(clamp01(p) * total);

  return split.map((words) => {
    const take = Math.max(0, Math.min(words.length, budget));
    budget -= take;
    return words.slice(0, take).join(" ");
  });
}

/** Index of the line still being written, or -1 when nothing is in flight. */
export function activeLine(lines: readonly string[], shown: readonly string[]): number {
  if (shown.every((line) => line === "")) return -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (shown[i] !== lines[i]) return i;
  }
  return -1;
}

/** A counter ticking up to `target`. */
export function countTo(target: number, p: number): number {
  return Math.round(clamp01(p) * target);
}
