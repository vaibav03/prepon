"use client";

import type { RefObject } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Rule, RuleStatus } from "@/lib/types";
import RuleStateDot from "@/components/ui/RuleStateDot";
import { ActionButton } from "./controls";
import { formatDate, KIND_LABEL, relativeDay, STATUS_SENTENCE } from "./format";
import { timing } from "./phase";
import type { PromotePhase } from "./phase";

const STATE_COLOR: Record<RuleStatus, string> = {
  live: "var(--state-live)",
  proposed: "var(--state-proposed)",
  expiring: "var(--state-expiring)",
  retired: "var(--state-retired)",
};

/* The field and its invisible mirror must be set identically, or the textarea
   will not grow to exactly the height of its own text. */
const FIELD_TYPE =
  "col-start-1 row-start-1 px-1.5 py-1 -mx-1.5 font-serif text-title leading-snug sm:text-headline";

export interface RuleHeadlineProps {
  rule: Rule;
  status: RuleStatus;
  pinned: boolean;
  text: string;
  savedText: string;
  edited: boolean;
  phase: PromotePhase;
  reduceMotion: boolean;
  anchorRef: RefObject<HTMLDivElement | null>;
  onTextChange: (value: string) => void;
  onSave: () => void;
  onRevert: () => void;
}

/**
 * The rule itself. Editable in place, because the rule is the writer's
 * property: a sentence they can argue with, not a setting.
 *
 * When a proposed rule is promoted the sentence gains weight and shifts left
 * as the dashed marker resolves into a solid one. Nothing flashes; it settles.
 */
export function RuleHeadline({
  rule,
  status,
  pinned,
  text,
  savedText,
  edited,
  phase,
  reduceMotion,
  anchorRef,
  onTextChange,
  onSave,
  onRevert,
}: RuleHeadlineProps) {
  const proposed = status === "proposed";
  const dirty = text.trim() !== savedText && text.trim().length > 0;
  const shift = timing(reduceMotion, 0.28);
  const settle = timing(reduceMotion, 0.3);
  const fade = timing(reduceMotion, 0.15);

  return (
    <div ref={anchorRef} className="scroll-mt-20">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={status}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            <RuleStateDot status={status} withLabel size="md" />
          </motion.span>
        </AnimatePresence>
        <span className="prepon-label">{KIND_LABEL[rule.kind]}</span>
        {pinned ? (
          <span className="prepon-label" style={{ color: "var(--accent)" }}>
            Pinned
          </span>
        ) : null}
      </div>

      <motion.div
        initial={false}
        animate={
          phase === "settling"
            ? { y: [-5, 0], scale: [1.008, 1] }
            : { y: 0, scale: 1 }
        }
        transition={settle}
        style={{ originX: 0, originY: 0 }}
        className="relative mt-5 pl-4 sm:pl-5"
      >
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{ opacity: proposed ? 1 : 0 }}
          transition={shift}
          className="absolute left-0 top-1 bottom-1 w-[2px]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, var(--state-proposed) 0 4px, transparent 4px 9px)",
          }}
        />
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{ opacity: proposed ? 0 : 1 }}
          transition={shift}
          className="absolute left-0 top-1 bottom-1 w-[2px]"
          style={{ backgroundColor: STATE_COLOR[status] }}
        />

        <motion.div
          initial={false}
          animate={{ x: proposed ? 12 : 0, fontWeight: proposed ? 400 : 520 }}
          transition={shift}
          className="grid"
          style={{ letterSpacing: "-0.012em" }}
        >
          <label htmlFor="rule-text" className="sr-only">
            Rule
          </label>
          {/* Sets the row height from the text itself, with no measuring pass. */}
          <span
            aria-hidden="true"
            className={`${FIELD_TYPE} invisible whitespace-pre-wrap break-words`}
          >
            {text}{" "}
          </span>
          <textarea
            id="rule-text"
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            rows={1}
            spellCheck={false}
            className={`${FIELD_TYPE} block w-full resize-none overflow-hidden rounded-[3px] bg-transparent transition-colors duration-150 ease-out outline-none hover:bg-raised focus:bg-raised`}
            style={{ fontWeight: "inherit", color: "var(--text-primary)" }}
          />
        </motion.div>
      </motion.div>

      <AnimatePresence initial={false} mode="wait">
        {dirty ? (
          <motion.div
            key="edit-actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={timing(reduceMotion, 0.18)}
            className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2"
          >
            <ActionButton variant="primary" onClick={onSave}>
              Save the rule
            </ActionButton>
            <ActionButton variant="quiet" onClick={onRevert}>
              Discard the change
            </ActionButton>
            <p className="text-ui text-faint">
              Prepon reads an edit as a signal of its own.
            </p>
          </motion.div>
        ) : (
          <motion.p
            key="edit-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={timing(reduceMotion, 0.18)}
            className="mt-4 max-w-measure text-ui text-faint"
          >
            Plain English, because you have to be able to argue with it. Click
            the sentence to change the wording.
          </motion.p>
        )}
      </AnimatePresence>

      {edited && savedText !== rule.text ? (
        <p className="mt-4 max-w-measure text-ui text-secondary">
          Edited today. Prepon will replay the new wording against your past
          complaints before the change takes effect. It read{" "}
          <span
            className="font-serif"
            style={{
              color: "var(--ink-ai)",
              textDecorationLine: "line-through",
              textDecorationThickness: "1px",
              textDecorationColor: "var(--ink-ai-edge)",
            }}
          >
            {rule.text}
          </span>
        </p>
      ) : null}

      <div className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-ui text-faint">
        <span className="prepon-numeric">
          Created {formatDate(rule.createdAt)}
        </span>
        <span aria-hidden="true">&middot;</span>
        <span>{relativeDay(rule.createdAt)}</span>
      </div>

      <AnimatePresence initial={false} mode="wait">
        <motion.p
          key={status}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fade}
          className="prepon-prose mt-2 max-w-narrow text-secondary"
        >
          {STATUS_SENTENCE[status]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export default RuleHeadline;
