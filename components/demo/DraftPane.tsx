"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";

import { Caret, EASE, SelectableLine, StreamText, TextCursor } from "./atoms";
import { Composer } from "./Composer";
import { PhraseChip } from "./PhraseChip";
import { COPY } from "./script";
import type { Scene } from "./scene";

export interface DraftPaneProps {
  scene: Scene;
  reduced: boolean;
}

const PROSE = "font-serif text-ui-lg leading-[1.62] sm:text-prose sm:leading-[1.6]";
const AI_INK = "text-ink-ai";
const USER_INK = "text-ink-user";

/** A block arriving or leaving: opacity only. Its height is the frame's job. */
const BLOCK_FADE = { duration: 0.2, ease: EASE } as const;

/**
 * The writer's half of the frame: one composer and one living document. The
 * draft streams in, gets selected, struck and rewritten in place — all of it
 * real DOM, none of it a screenshot.
 *
 * Height discipline runs at two scales. Inside a block, an invisible clone of
 * the finished sentence holds the box open, so arriving words never reflow
 * what is already written. Between blocks, nothing is reserved at all: a
 * paragraph exists only once the model is about to write it, and the frame
 * around this pane eases to whatever the document currently is. The old
 * single sizer — tall enough for the fullest beat, present from the first
 * frame — is what made the demo open as an empty box.
 */
export function DraftPane({ scene, reduced }: DraftPaneProps) {
  const { draft, pointer, payoff, composer } = scene;

  /* Once the second ask lands, the dissolving first draft is taken out of
     flow so it stops holding the well open on its way out, and the payoff
     is what the frame sizes itself to. */
  const handover = payoff.visible;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Composer
        text={composer.text}
        sizer={COPY.promptA}
        caret={composer.caret}
        sent={composer.sent}
        thinking={composer.thinking}
        reduced={reduced}
      />

      <div className="relative min-w-0">
        {draft.visible ? (
          <div
            className={clsx(
              "flex flex-col",
              handover && "pointer-events-none absolute inset-x-0 top-0",
            )}
            style={{ opacity: draft.fade }}
          >
            <AnimatePresence initial={false}>
              {draft.openPresent ? (
                <motion.div
                  key="open"
                  layout={!reduced}
                  className="relative mb-3 overflow-hidden"
                  exit={
                    reduced
                      ? undefined
                      : {
                          opacity: 0,
                          height: 0,
                          marginBottom: 0,
                          transition: { duration: 0.28, ease: EASE },
                        }
                  }
                >
                  <SelectableLine
                    full={COPY.draftOpen}
                    shown={draft.openShown}
                    select={draft.openSelect}
                    struck={draft.openStruck}
                    caret={draft.streaming === 0}
                    reduced={reduced}
                    className={clsx(PROSE, AI_INK)}
                  />
                  <TextCursor
                    visible={pointer.visible}
                    glide={pointer.glide}
                    sweep={pointer.sweep}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>

            {draft.rewritePresent ? (
              <motion.div
                layout={!reduced}
                className="relative mb-3"
                transition={{ duration: 0.28, ease: EASE }}
              >
                <span className="relative block">
                  <span aria-hidden="true" className={clsx("invisible block", PROSE)}>
                    {COPY.rewrite}
                  </span>
                  <span
                    className={clsx(
                      "absolute inset-0 block transition-opacity duration-200 ease-out",
                      PROSE,
                      USER_INK,
                      draft.chipInDraft && "opacity-0",
                    )}
                  >
                    {draft.rewriteShown}
                    {draft.rewriteCaret ? <Caret reduced={reduced} /> : null}
                  </span>
                  {draft.chipInDraft ? (
                    <PhraseChip place="draft" condensed={false} reduced={reduced} />
                  ) : null}
                </span>

                <AnimatePresence initial={false}>
                  {draft.mark ? (
                    <motion.span
                      key="mark"
                      className="prepon-label mt-2 flex items-center gap-2"
                      initial={reduced ? false : { opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduced ? undefined : { opacity: 0 }}
                      transition={{ duration: 0.22, ease: EASE }}
                    >
                      <span
                        aria-hidden="true"
                        className="h-px w-4 bg-ink-user-edge"
                      />
                      {COPY.mark}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            ) : null}

            <AnimatePresence initial={false}>
              {draft.bodyPresent ? (
                <motion.div
                  key="body"
                  layout={!reduced}
                  className="mb-3"
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduced ? undefined : { opacity: 0 }}
                  transition={BLOCK_FADE}
                >
                  <StreamText
                    full={COPY.draftBody}
                    shown={draft.bodyShown}
                    caret={draft.streaming === 1}
                    reduced={reduced}
                    className={clsx(PROSE, AI_INK)}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {draft.tailPresent ? (
                <motion.div
                  key="tail"
                  layout={!reduced}
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduced ? undefined : { opacity: 0 }}
                  transition={BLOCK_FADE}
                >
                  <StreamText
                    full={COPY.draftTail}
                    shown={draft.tailShown}
                    caret={draft.streaming === 2}
                    reduced={reduced}
                    className={clsx(PROSE, AI_INK)}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ) : null}

        {payoff.visible ? (
          <div className="flex flex-col gap-3">
            {COPY.payoffLines.map((line, i) => (
              <StreamText
                key={line}
                full={line}
                shown={payoff.shown[i] ?? ""}
                caret={payoff.streaming === i}
                reduced={reduced}
                className={clsx(PROSE, AI_INK)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default DraftPane;
