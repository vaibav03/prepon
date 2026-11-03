"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import type { ComparePair } from "@/lib/types";
import SessionTally from "./SessionTally";
import {
  ORDINAL,
  TONE_TEXT,
  attributionFor,
  type Side,
  type Verdict,
} from "./side";

const BUTTON =
  "flex items-center justify-center gap-2.5 rounded-[3px] border px-4 py-2.5 " +
  "transition-colors duration-150 ease-out";

const KEYCAP =
  "hidden h-[18px] min-w-[18px] items-center justify-center rounded-[2px] " +
  "border border-hairline-strong px-1 text-micro leading-none text-faint min-[720px]:inline-flex";

export interface PickBarProps {
  pairs: ComparePair[];
  pair: ComparePair;
  verdicts: Verdict[];
  picked: Side | null;
  onPick: (side: Side) => void;
  onAdvance: () => void;
  /** True when this is the last pair, so the next step is the summary. */
  isLast: boolean;
}

/**
 * The action rail. Sticky to the bottom of the viewport so the controls are
 * in reach whether the drafts sit side by side or stacked. Nothing in here
 * hints at the answer until a pick has been committed.
 */
export function PickBar({
  pairs,
  pair,
  verdicts,
  picked,
  onPick,
  onAdvance,
  isLast,
}: PickBarProps) {
  const reduced = useReducedMotion() ?? false;
  const revealed = picked !== null;
  const chosen = picked ? attributionFor(pair, picked) : null;

  const enter = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 } };
  const timing = { duration: reduced ? 0.12 : 0.26, ease: "easeOut" } as const;

  return (
    <div className="sticky bottom-0 z-10 mt-10 border-t border-hairline bg-surface">
      <div className="mx-auto w-full max-w-[1480px] px-4 py-3 md:px-8 md:py-4">
        {revealed && chosen ? (
          <div className="flex flex-col gap-3 min-[720px]:flex-row min-[720px]:items-center min-[720px]:justify-between min-[720px]:gap-8">
            <motion.p
              initial={enter.initial}
              animate={enter.animate}
              transition={timing}
              aria-live="polite"
              className="font-serif text-ui-lg text-secondary min-[720px]:text-title"
            >
              You picked{" "}
              <span className={TONE_TEXT[chosen.tone]}>{chosen.name}</span>.
            </motion.p>

            <div className="flex shrink-0 items-center justify-between gap-5">
              <SessionTally pairs={pairs} verdicts={verdicts} />
              <button
                type="button"
                onClick={onAdvance}
                className={clsx(
                  BUTTON,
                  "shrink-0 border-accent bg-accent-soft text-ui text-primary hover:border-hairline-strong",
                )}
              >
                {isLast ? "See the summary" : "Next pair"}
                <span aria-hidden="true" className="text-accent">
                  &rarr;
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 min-[720px]:flex-row min-[720px]:items-center min-[720px]:justify-between min-[720px]:gap-8">
            <div className="flex items-center justify-between gap-5">
              <SessionTally pairs={pairs} verdicts={verdicts} />
              <p className="hidden text-ui text-faint min-[900px]:block">
                Which one would you rather have sent?
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              {(["a", "b"] as const).map((side) => (
                <button
                  key={side}
                  type="button"
                  onClick={() => onPick(side)}
                  className={clsx(
                    BUTTON,
                    "flex-1 border-hairline-strong bg-raised hover:bg-sunken",
                    "min-[720px]:w-[8.5rem] min-[720px]:flex-none",
                  )}
                >
                  {side === "a" ? (
                    <span aria-hidden="true" className={KEYCAP}>
                      &larr;
                    </span>
                  ) : null}
                  <span className="prepon-label text-primary">
                    {ORDINAL[side]}
                  </span>
                  {side === "b" ? (
                    <span aria-hidden="true" className={KEYCAP}>
                      &rarr;
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PickBar;
