"use client";

import clsx from "clsx";
import { motion } from "motion/react";

import { COPY } from "./script";

/**
 * One shared layout identity used in two places in the tree. The chip is
 * mounted over the sentence the writer typed, then mounted again inside the
 * rule card — motion flips it between the two real rects, so the words
 * travel across the frame and then compress into the rule instead of
 * crossfading between two unrelated boxes.
 *
 * Both mounts carry the same typography, ink and wash on purpose: nothing
 * about the chip changes at the moment of the hand-off except where it is,
 * which is the only way the travel reads as one object moving.
 */
export const PHRASE_LAYOUT_ID = "prepon-demo-rule-phrase";

/** Apple-style critically damped spring: no overshoot, ~0.55s to settle. */
const FLIGHT = { type: "spring", bounce: 0, duration: 0.55 } as const;

export interface PhraseChipProps {
  /** Where the chip currently lives. */
  place: "draft" | "card";
  /** The edit has condensed into the rule sentence. */
  condensed: boolean;
  reduced?: boolean;
}

export function PhraseChip({ place, condensed, reduced }: PhraseChipProps) {
  const inCard = place === "card";
  const sizer = condensed ? COPY.rule : COPY.rewrite;

  return (
    <motion.span
      layoutId={reduced ? undefined : PHRASE_LAYOUT_ID}
      layout={reduced ? false : true}
      transition={reduced ? { duration: 0 } : FLIGHT}
      className={clsx(
        "z-30 block rounded-inset bg-ink-user-wash ring-1 ring-ink-user-edge",
        "font-serif text-ui-lg leading-[1.62] text-ink-user sm:text-prose sm:leading-[1.6]",
        inCard
          ? "w-full px-3 py-2"
          : "absolute -top-1 -left-2 w-fit max-w-[calc(100%+1rem)] px-2 py-1",
      )}
    >
      <span className="relative block">
        <span aria-hidden="true" className="invisible block">
          {sizer}
        </span>
        <span
          className={clsx(
            "absolute inset-0 block transition-opacity duration-150 ease-out",
            condensed && "opacity-0",
          )}
        >
          {COPY.rewrite}
        </span>
        <span
          className={clsx(
            "absolute inset-0 block transition-opacity duration-300 ease-out",
            !condensed ? "opacity-0 delay-0" : "delay-100",
          )}
        >
          {COPY.rule}
        </span>
      </span>
    </motion.span>
  );
}

export default PhraseChip;
