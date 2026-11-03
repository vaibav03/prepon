/**
 * The promotion choreography. `counting` tallies the replay evidence,
 * `settling` is the one-shot where the rule changes weight and position and
 * locks into the live set, `settled` is the resting state afterwards.
 */
export type PromotePhase = "idle" | "counting" | "settling" | "settled";

/** Natural ease-out. Everything in this view uses it. */
export const EASE_OUT = [0.22, 0.61, 0.36, 1] as const;

/**
 * Every animation in the detail view collapses to an instant change when the
 * reader has asked for reduced motion.
 */
export function timing(reduceMotion: boolean, duration: number) {
  return reduceMotion
    ? { duration: 0 }
    : { duration, ease: EASE_OUT };
}
