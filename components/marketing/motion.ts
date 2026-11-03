/**
 * The landing page's motion vocabulary.
 *
 * One entering curve, one on-screen curve, four durations. Every animated
 * marketing component imports from here rather than hand-typing a
 * cubic-bezier, so the page reads as one system instead of five.
 *
 * The curve is a strong ease-out: it starts fast, so whatever is being
 * revealed is legible almost immediately. Nothing here uses ease-in — on UI
 * it delays the exact moment the eye is already on.
 *
 * The CSS equivalents live in globals.css as --ease-out / --ease-in-out.
 */

/** A cubic-bezier, in the shape Motion's `ease` option takes. */
export type Bezier = [number, number, number, number];

/** Strong ease-out. Entrances, exits, reveals. The default. */
export const EASE_OUT: Bezier = [0.22, 0.61, 0.36, 1];

/** Strong ease-in-out. Only for something already on screen that moves. */
export const EASE_IN_OUT: Bezier = [0.77, 0, 0.175, 1];

/** Durations, in seconds. Marketing may run longer than UI, but not by much. */
export const DURATION = {
  /** A swap between two states that are both already visible. */
  swap: 0.26,
  /** The outgoing half of that swap — always quicker than the incoming half. */
  swapOut: 0.14,
  /** A panel opening or closing. */
  disclose: 0.24,
  /** A block arriving on scroll. */
  enter: 0.34,
} as const;

/** Stagger between siblings arriving together. Decorative; never blocking. */
export const STAGGER = 0.06;
