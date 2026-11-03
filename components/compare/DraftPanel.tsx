"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import Prose from "@/components/ui/Prose";
import { TONE_COLOR, TONE_TEXT, type Attribution } from "./side";

export interface DraftPanelProps {
  /** "One" or "Two". Identical treatment on both columns, always. */
  ordinal: string;
  paragraphs: string[];
  /** Who wrote it. Never read until `revealed` is true. */
  attribution: Attribution;
  revealed: boolean;
  chosen: boolean;
  /** Changes when the pair changes; keys the paragraphs. */
  pairId: string;
}

/**
 * One unlabelled draft. Before the pick this is deliberately inert: no
 * entrance animation, no hover state, no colour that could separate it from
 * its twin. Everything that distinguishes the two columns mounts only after
 * the writer has committed.
 */
export function DraftPanel({
  ordinal,
  paragraphs,
  attribution,
  revealed,
  chosen,
  pairId,
}: DraftPanelProps) {
  const reduced = useReducedMotion() ?? false;

  const enter = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 } };
  const timing = {
    duration: reduced ? 0.12 : 0.24,
    ease: "easeOut",
  } as const;

  return (
    <section
      className="min-w-0 min-[900px]:px-7 min-[1200px]:px-10"
      aria-label={
        revealed
          ? `Draft ${ordinal}, written by ${attribution.name}`
          : `Draft ${ordinal}, author hidden`
      }
    >
      <div
        aria-hidden="true"
        className="h-px w-full transition-colors duration-200 ease-out"
        style={{
          backgroundColor: revealed
            ? TONE_COLOR[attribution.tone]
            : "var(--hairline-strong)",
        }}
      />

      {/* Fixed height so the reveal never shifts a line of prose. */}
      <div className="flex h-10 items-center justify-between gap-3">
        <span className="flex items-baseline gap-2.5">
          <span className="prepon-label text-secondary">{ordinal}</span>
          {revealed && chosen ? (
            <motion.span
              initial={enter.initial}
              animate={enter.animate}
              transition={timing}
              className="prepon-label text-accent"
            >
              Your pick
            </motion.span>
          ) : null}
        </span>

        {revealed ? (
          <motion.span
            initial={enter.initial}
            animate={enter.animate}
            transition={timing}
            className="flex min-w-0 items-baseline gap-2 text-right"
          >
            <span
              className={clsx(
                "shrink-0 text-ui",
                TONE_TEXT[attribution.tone],
              )}
            >
              {attribution.name}
            </span>
            <span className="hidden truncate text-ui text-faint min-[560px]:inline">
              {attribution.detail}
            </span>
          </motion.span>
        ) : null}
      </div>

      <Prose as="article" size="prose-lg" width="measure" className="pb-2">
        {paragraphs.map((paragraph, i) => (
          <p key={`${pairId}-${i}`}>{paragraph}</p>
        ))}
      </Prose>
    </section>
  );
}

export default DraftPanel;
