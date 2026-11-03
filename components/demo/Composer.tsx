"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";

import { Caret, Thinking, EASE } from "./atoms";

export interface ComposerProps {
  text: string;
  /** The longest prompt the box will ever hold. Reserves the height so the
   *  composer does not change size between the first ask and the second. */
  sizer: string;
  caret: boolean;
  sent: boolean;
  thinking: boolean;
  reduced?: boolean;
}

/**
 * The prompt box at the top of the frame. It dims once the prompt is sent,
 * which is how the frame says "that one is already gone" without a chat log.
 */
export function Composer({
  text,
  sizer,
  caret,
  sent,
  thinking,
  reduced,
}: ComposerProps) {
  return (
    <div
      className={clsx(
        "rounded-inset border border-hairline bg-sunken transition-opacity duration-300",
        sent ? "opacity-60" : "opacity-100",
      )}
    >
      <div className="flex items-start gap-3 px-3 py-2.5 sm:px-3.5">
        <span className="prepon-label mt-1 shrink-0">You</span>
        <div className="relative min-w-0 flex-1">
          <p aria-hidden="true" className="invisible text-ui-lg">
            {sizer}
          </p>
          <p className="absolute inset-0 text-ui-lg text-primary">
            {text}
            {caret ? <Caret reduced={reduced} /> : null}
          </p>
        </div>
      </div>

      <div className="flex h-8 items-center gap-2 border-t border-hairline px-3 sm:px-3.5">
        <AnimatePresence initial={false} mode="wait">
          {thinking ? (
            <motion.span
              key="thinking"
              className="flex items-center gap-2 text-ui text-faint"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduced ? undefined : { opacity: 0 }}
              transition={{ duration: 0.16, ease: EASE }}
            >
              <Thinking reduced={reduced} />
              thinking
            </motion.span>
          ) : (
            <motion.span
              key="state"
              className="text-ui text-faint"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduced ? undefined : { opacity: 0 }}
              transition={{ duration: 0.16, ease: EASE }}
            >
              {sent ? "sent" : "drafting"}
            </motion.span>
          )}
        </AnimatePresence>

        <span
          className={clsx(
            "prepon-label ml-auto rounded-full border px-2 py-0.5 transition-colors duration-200",
            sent
              ? "border-hairline text-faint"
              : "border-hairline-strong text-secondary",
          )}
        >
          Return
        </span>
      </div>
    </div>
  );
}

export default Composer;
