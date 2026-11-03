"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import type { Rule } from "@/lib/types";
import RuleStateDot from "@/components/ui/RuleStateDot";
import HealthMeter from "@/components/ui/HealthMeter";
import { CELL, ROW_GRID } from "./rowGrid";
import { KIND_LABEL, formatDay, retiresIn, visualWeight } from "./ruleMath";
import { ChevronGlyph, CrossGlyph, PinGlyph } from "./icons";
import InlineRuleEditor from "./InlineRuleEditor";

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

const ACTION =
  "inline-flex h-7 w-7 items-center justify-center rounded-[3px] transition-colors duration-150 ease-out";

const TEXT_TONE: Record<Rule["status"], string> = {
  live: "text-primary",
  proposed: "text-secondary",
  expiring: "text-secondary",
  retired: "text-faint",
};

export interface RuleRowProps {
  rule: Rule;
  /** The reader has rewritten this rule by hand in this session. */
  edited: boolean;
  onCommit: (id: string, text: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
}

export function RuleRow({
  rule,
  edited,
  onCommit,
  onTogglePin,
  onDelete,
}: RuleRowProps) {
  const reduced = useReducedMotion() === true;
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(rule.text);

  const transition = reduced
    ? { duration: 0 }
    : { duration: 0.24, ease: EASE };

  const startEditing = () => {
    setValue(rule.text);
    setEditing(true);
  };

  const commit = () => {
    const next = value.trim();
    setEditing(false);
    if (next.length > 0 && next !== rule.text) onCommit(rule.id, next);
  };

  const cancel = () => {
    setValue(rule.text);
    setEditing(false);
  };

  const revertRate = rule.applied > 0 ? rule.reverted / rule.applied : 0;

  return (
    <motion.li
      layout={editing ? false : "position"}
      initial={{ opacity: 0, y: reduced ? 0 : -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduced ? 0 : -4 }}
      transition={transition}
      className="border-b border-hairline last:border-b-0"
    >
      <div
        className={clsx(
          ROW_GRID,
          "group py-2.5 transition-opacity duration-200 ease-out",
        )}
        style={{ opacity: visualWeight(rule) }}
      >
        <div className={clsx(CELL.text, "flex gap-2.5")}>
          <span className="mt-2 shrink-0">
            <RuleStateDot status={rule.status} size="md" />
          </span>

          <div className="min-w-0 flex-1">
            {editing ? (
              <InlineRuleEditor
                value={value}
                onChange={setValue}
                onCommit={commit}
                onCancel={cancel}
              />
            ) : (
              <button
                type="button"
                onClick={startEditing}
                title="Click to rewrite this rule"
                className={clsx(
                  "block w-full cursor-text text-left font-serif text-prose leading-[1.45]",
                  "decoration-hairline-strong underline-offset-4",
                  "hover:underline hover:decoration-dotted",
                  "focus-visible:underline focus-visible:decoration-dotted",
                  rule.pinned ? "font-medium" : "font-normal",
                  TEXT_TONE[rule.status],
                )}
              >
                {rule.text}
              </button>
            )}

            {!editing && (rule.status === "expiring" || edited) ? (
              <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-ui">
                {rule.status === "expiring" ? (
                  <span className="text-expiring">
                    Retires in {retiresIn(rule)} unused applications
                  </span>
                ) : null}
                {edited ? (
                  <span className="text-faint">
                    Rewritten by you — recorded as a signal
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
        </div>

        <span className={clsx(CELL.kind, "truncate text-ui text-faint")}>
          {KIND_LABEL[rule.kind]}
        </span>

        <span
          className={clsx(
            CELL.applied,
            "prepon-numeric text-right text-ui text-secondary",
          )}
          title={`Applied ${rule.applied} times since ${formatDay(rule.createdAt)}`}
        >
          {rule.applied}
          <span className="sr-only"> applications</span>
        </span>
        <span
          className={clsx(
            CELL.kept,
            "prepon-numeric text-right text-ui text-secondary",
          )}
        >
          {rule.kept}
          <span className="sr-only"> kept</span>
        </span>
        <span
          className={clsx(
            CELL.reverted,
            "prepon-numeric text-right text-ui",
            revertRate > 0.25 ? "text-expiring" : "text-faint",
          )}
          title={`Reverted ${rule.reverted} of ${rule.applied} applications`}
        >
          {rule.reverted}
          <span className="sr-only"> reverted</span>
        </span>

        <span className={clsx(CELL.health, "items-baseline justify-end")}>
          <HealthMeter value={rule.health} status={rule.status} />
        </span>

        <div
          className={clsx(
            CELL.actions,
            "-mr-1 flex items-center justify-end gap-0.5",
          )}
        >
          <button
            type="button"
            onClick={() => onTogglePin(rule.id)}
            aria-pressed={rule.pinned}
            title={rule.pinned ? "Unpin — let it decay again" : "Pin — exempt from decay"}
            className={clsx(
              ACTION,
              rule.pinned
                ? "text-accent"
                : "text-faint hover:text-secondary lg:opacity-0 lg:focus-visible:opacity-100 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100",
            )}
          >
            <PinGlyph filled={rule.pinned} />
            <span className="sr-only">
              {rule.pinned ? "Unpin rule" : "Pin rule"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(rule.id)}
            title="Delete this rule"
            className={clsx(
              ACTION,
              "text-faint hover:text-accent lg:opacity-0 lg:focus-visible:opacity-100 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100",
            )}
          >
            <CrossGlyph />
            <span className="sr-only">Delete rule</span>
          </button>

          <Link
            href={`/app/rules/${rule.id}`}
            title="Open the evidence behind this rule"
            className={clsx(
              ACTION,
              "text-faint hover:text-secondary lg:opacity-0 lg:focus-visible:opacity-100 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100",
            )}
          >
            <ChevronGlyph />
            <span className="sr-only">Open rule detail</span>
          </Link>
        </div>

        <div
          className={clsx(
            CELL.meta,
            "mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1",
          )}
        >
          <span className="text-ui text-faint">
            {KIND_LABEL[rule.kind]}
            <span aria-hidden="true"> · </span>
            <span className="prepon-numeric">{rule.applied}</span> applied
            <span aria-hidden="true"> · </span>
            <span className="prepon-numeric">{rule.kept}</span> kept
            <span aria-hidden="true"> · </span>
            <span className="prepon-numeric">{rule.reverted}</span> reverted
          </span>
          <HealthMeter value={rule.health} status={rule.status} />
        </div>
      </div>
    </motion.li>
  );
}

export default RuleRow;
