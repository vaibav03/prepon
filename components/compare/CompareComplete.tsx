"use client";

import Link from "next/link";
import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import type { ComparePair } from "@/lib/types";
import Prose from "@/components/ui/Prose";
import {
  ATTRIBUTION,
  TONE_TEXT,
  outcomeOf,
  type Verdict,
} from "./side";

export interface CompareCompleteProps {
  pairs: ComparePair[];
  verdicts: Verdict[];
  onRestart: () => void;
}

function reading(prepon: number, total: number): string {
  if (total === 0) return "Nothing judged yet.";
  if (prepon === total) {
    return "Every pair went the same way. At this sample size that is still thin evidence, but it is the direction you would want.";
  }
  if (prepon === 0) {
    return "None of them. The guide you froze is doing more work than the live set is. Worth reading the live rules with that in mind before the next session.";
  }
  if (prepon * 2 > total) {
    return "More often than not. Not proof at this many pairs, but no reason to touch the live set either.";
  }
  if (prepon * 2 === total) {
    return "An even split, which at this many pairs is what no difference at all usually looks like.";
  }
  return "Less than half. Check which rules were applied to these briefs: one of them is probably costing you more than it earns.";
}

/**
 * The end of a run. Facts and a short reading, not a result screen.
 */
export function CompareComplete({
  pairs,
  verdicts,
  onRestart,
}: CompareCompleteProps) {
  const reduced = useReducedMotion() ?? false;
  const outcomes = pairs.map((pair) => outcomeOf(pair, verdicts));
  const prepon = outcomes.filter((tone) => tone === "prepon").length;

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.12 : 0.28, ease: "easeOut" }}
      className="mx-auto w-full max-w-[1480px] px-4 pt-8 pb-16 md:px-8 md:pt-14"
    >
      <p className="prepon-label">Run complete</p>

      <h1 className="mt-3 max-w-wide font-serif text-headline text-primary min-[720px]:text-display">
        <span className="prepon-numeric">{prepon}</span> of{" "}
        <span className="prepon-numeric">{pairs.length}</span> went to Prepon.
      </h1>

      <Prose as="p" width="measure" className="mt-5 text-secondary">
        {reading(prepon, pairs.length)}
      </Prose>

      <ol className="mt-10 max-w-wide border-t border-hairline">
        {pairs.map((pair, i) => {
          const tone = outcomes[i];
          return (
            <li
              key={pair.id}
              className="flex flex-col gap-1.5 border-b border-hairline py-4 min-[720px]:flex-row min-[720px]:items-baseline min-[720px]:gap-6"
            >
              <span className="prepon-label prepon-numeric shrink-0 min-[720px]:w-8">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 font-serif text-prose text-secondary">
                {pair.prompt}
              </span>
              <span
                className={clsx(
                  "shrink-0 text-ui min-[720px]:w-28 min-[720px]:text-right",
                  tone ? TONE_TEXT[tone] : "text-faint",
                )}
              >
                {tone ? ATTRIBUTION[tone].name : "Not judged"}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 flex flex-col gap-2.5 min-[560px]:flex-row min-[560px]:items-center">
        <button
          type="button"
          onClick={onRestart}
          className="flex items-center justify-center gap-2.5 rounded-[3px] border border-accent bg-accent-soft px-4 py-2.5 text-ui text-primary transition-colors duration-150 ease-out hover:border-hairline-strong"
        >
          Run the four again
        </button>
        <Link
          href="/app/rules"
          className="flex items-center justify-center gap-2.5 rounded-[3px] border border-hairline-strong bg-raised px-4 py-2.5 text-ui text-primary transition-colors duration-150 ease-out hover:bg-sunken"
        >
          Read the live rules
        </Link>
      </div>

      <p className="mt-8 max-w-measure text-ui text-faint">
        A blind pick is the only reading on this screen your rules cannot
        flatter. Nothing here changes a rule on its own.
      </p>
    </motion.div>
  );
}

export default CompareComplete;
