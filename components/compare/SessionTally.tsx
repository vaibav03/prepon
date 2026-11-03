"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import type { ComparePair } from "@/lib/types";
import { TONE_COLOR, outcomeOf, type Verdict } from "./side";

export interface SessionTallyProps {
  pairs: ComparePair[];
  verdicts: Verdict[];
  className?: string;
}

/**
 * The running count, read as an instrument: one tick per pair in the session,
 * lit in the colour of whichever writer took it. No score, no celebration.
 */
export function SessionTally({ pairs, verdicts, className }: SessionTallyProps) {
  const reduced = useReducedMotion() ?? false;
  const outcomes = pairs.map((pair) => outcomeOf(pair, verdicts));
  const prepon = outcomes.filter((tone) => tone === "prepon").length;
  const guide = outcomes.filter((tone) => tone === "guide").length;

  return (
    <div
      className={clsx("flex items-center gap-3", className)}
      aria-label={`Session tally: Prepon ${prepon}, style guide ${guide}, of ${pairs.length} pairs`}
    >
      <span aria-hidden="true" className="flex items-end gap-[3px]">
        {outcomes.map((tone, i) => (
          <span
            key={pairs[i].id}
            className="inline-block w-[2px] rounded-[1px] transition-colors duration-200 ease-out"
            style={{
              height: 11,
              backgroundColor: tone
                ? TONE_COLOR[tone]
                : "var(--hairline-strong)",
              opacity: tone ? 1 : 0.5,
            }}
          />
        ))}
      </span>

      <span aria-hidden="true" className="flex items-baseline gap-2 text-ui">
        <motion.span
          key={`prepon-${prepon}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0.12 : 0.2, ease: "easeOut" }}
          className="prepon-numeric text-live"
        >
          Prepon {prepon}
        </motion.span>
        <span className="text-faint">/</span>
        <motion.span
          key={`guide-${guide}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0.12 : 0.2, ease: "easeOut" }}
          className="prepon-numeric text-retired"
        >
          Guide {guide}
        </motion.span>
      </span>
    </div>
  );
}

export default SessionTally;
