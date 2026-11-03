"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";

import { EASE } from "./atoms";
import { PhraseChip } from "./PhraseChip";
import { COPY } from "./script";
import type { LaneScene } from "./scene";

export interface RuleCardProps {
  lane: LaneScene;
  reduced: boolean;
}

/** Critically damped, no overshoot — the card is not thrown, it arrives. */
const SETTLE = { type: "spring", bounce: 0, duration: 0.4 } as const;

/**
 * One rule, from empty shell to live.
 *
 * The shell lands and settles a beat before the writer's sentence flies into
 * it, so the destination is already still when the words arrive — a card
 * fading in underneath a travelling phrase would read as a crossfade.
 * The slot is sized by an invisible clone of the longest text it will hold,
 * so the card never resizes: the chip condenses inside a fixed box.
 */
export function RuleCard({ lane, reduced }: RuleCardProps) {
  const badge = lane.live ? "live" : lane.proposed ? "proposed" : null;

  return (
    <motion.div
      className={clsx(
        "relative mt-3.5 overflow-hidden rounded-card border bg-raised p-3",
        "transition-colors duration-300 ease-out",
        lane.live ? "border-live/35" : "border-hairline",
      )}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, scale: lane.pulse ? 1.015 : 1 }}
      transition={reduced ? { duration: 0 } : SETTLE}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-live transition-opacity duration-300 ease-out"
        style={{ opacity: lane.live ? 1 : 0 }}
      />

      <div className="mb-2.5 flex items-center gap-2 pl-1.5">
        <span className="prepon-label">Rule</span>

        <span className="ml-auto flex h-5 items-center">
          <AnimatePresence initial={false} mode="wait">
            {badge ? (
              <motion.span
                key={badge}
                className={clsx(
                  "prepon-label rounded-full px-2 py-0.5",
                  badge === "live"
                    ? "bg-live-wash text-live"
                    : "bg-proposed-wash text-proposed",
                )}
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -6 }}
                transition={
                  reduced ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.3 }
                }
              >
                {badge === "live" ? "Live" : "Proposed"}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </span>
      </div>

      <div className="pl-1.5">
        <div className="relative">
          <div
            aria-hidden="true"
            className="invisible px-3 py-2 font-serif text-ui-lg leading-[1.62] sm:text-prose sm:leading-[1.6]"
          >
            {COPY.rewrite}
          </div>
          {lane.chipInCard ? (
            <span className="absolute inset-x-0 top-0 block">
              <PhraseChip
                place="card"
                condensed={lane.condensed}
                reduced={reduced}
              />
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-2.5 flex items-start gap-3 pl-1.5">
        <p
          className="prepon-numeric min-w-0 text-ui text-faint transition-opacity duration-300 ease-out"
          style={{ opacity: lane.replayIn }}
        >
          {COPY.replayCorpus}
          <span aria-hidden="true" className="px-1.5 text-hairline-strong">
            ·
          </span>
          {COPY.replayFixedLabel}{" "}
          <span className={clsx(lane.live ? "text-live" : "text-secondary")}>
            {lane.fixed}
          </span>
        </p>

        <AnimatePresence initial={false}>
          {lane.applied ? (
            <motion.span
              key="applied"
              className="prepon-label ml-auto shrink-0 pt-0.5 text-live"
              initial={reduced ? false : { opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? undefined : { opacity: 0 }}
              transition={{ duration: 0.22, ease: EASE }}
            >
              {COPY.appliedLabel}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default RuleCard;
