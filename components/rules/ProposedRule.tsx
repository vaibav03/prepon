"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import type { Rule } from "@/lib/types";
import RuleStateDot from "@/components/ui/RuleStateDot";
import HealthMeter from "@/components/ui/HealthMeter";
import { KIND_LABEL, formatDay, shorten } from "./ruleMath";
import { CheckGlyph, CrossGlyph } from "./icons";
import InlineRuleEditor from "./InlineRuleEditor";

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

export interface ProposedRuleProps {
  rule: Rule;
  edited: boolean;
  /** The rule a promotion would push out, when the live set is at its cap. */
  displaces: Rule | null;
  onCommit: (id: string, text: string) => void;
  onPromote: (id: string) => void;
  onDismiss: (id: string) => void;
}

/**
 * A proposed rule is asking for something, so it is allowed more room than a
 * live one: the sentence, the replay evidence that would promote it, and one
 * of the complaints it was replayed against, in the reader's own words.
 */
export function ProposedRule({
  rule,
  edited,
  displaces,
  onCommit,
  onPromote,
  onDismiss,
}: ProposedRuleProps) {
  const reduced = useReducedMotion() === true;
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(rule.text);

  const transition = reduced ? { duration: 0 } : { duration: 0.24, ease: EASE };
  const sample = rule.evidence.sampled[0];

  const commit = () => {
    const next = value.trim();
    setEditing(false);
    if (next.length > 0 && next !== rule.text) onCommit(rule.id, next);
  };

  return (
    <motion.li
      layout={editing ? false : "position"}
      initial={{ opacity: 0, y: reduced ? 0 : -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduced ? 0 : -4 }}
      transition={transition}
      className="border-b border-hairline last:border-b-0"
    >
      <div className="flex gap-2.5 px-4 py-4 md:px-5">
        <span className="mt-2 shrink-0">
          <RuleStateDot status="proposed" size="md" />
        </span>

        <div className="min-w-0 flex-1">
          {editing ? (
            <InlineRuleEditor
              value={value}
              onChange={setValue}
              onCommit={commit}
              onCancel={() => {
                setValue(rule.text);
                setEditing(false);
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setValue(rule.text);
                setEditing(true);
              }}
              title="Click to rewrite this rule before promoting it"
              className={clsx(
                "block w-full cursor-text text-left font-serif text-prose leading-[1.45]",
                "font-normal text-primary",
                "decoration-hairline-strong underline-offset-4",
                "hover:underline hover:decoration-dotted",
                "focus-visible:underline focus-visible:decoration-dotted",
              )}
            >
              {rule.text}
            </button>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <p className="text-ui text-secondary">
              Replayed against{" "}
              <span className="prepon-numeric text-primary">
                {rule.evidence.complaints}
              </span>{" "}
              past complaints · would have fixed{" "}
              <span className="prepon-numeric text-primary">
                {rule.evidence.fixed}
              </span>
            </p>
            <span className="flex items-baseline gap-2">
              <span className="prepon-label">Replay confidence</span>
              <HealthMeter value={rule.health} status="proposed" />
            </span>
          </div>

          {sample && !editing ? (
            <blockquote className="mt-2.5 border-l border-hairline-strong pl-3">
              <p className="font-serif text-ui-lg italic leading-[1.55] text-secondary">
                {sample}
              </p>
            </blockquote>
          ) : null}

          {displaces ? (
            <p className="mt-2.5 text-ui text-expiring">
              The live set is full. Promoting this displaces “
              {shorten(displaces.text)}”.
            </p>
          ) : null}

          {edited ? (
            <p className="mt-2 text-ui text-faint">
              Rewritten by you — the replay will run again on your wording.
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2">
            <button
              type="button"
              onClick={() => onPromote(rule.id)}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-[3px] border border-live px-2.5 py-1",
                "text-ui text-live transition-colors duration-150 ease-out hover:bg-live-wash",
              )}
            >
              <CheckGlyph />
              Put it live
            </button>
            <button
              type="button"
              onClick={() => onDismiss(rule.id)}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-[3px] border border-transparent px-2.5 py-1",
                "text-ui text-faint transition-colors duration-150 ease-out hover:text-secondary",
              )}
            >
              <CrossGlyph />
              Not my voice
            </button>
            <span className="ml-auto flex items-baseline gap-3 text-ui text-faint">
              <span className="hidden sm:inline">
                {KIND_LABEL[rule.kind]} · proposed {formatDay(rule.createdAt)}
              </span>
              <Link
                href={`/app/rules/${rule.id}`}
                className="text-ui text-secondary underline decoration-hairline-strong underline-offset-4 transition-colors duration-150 ease-out hover:text-primary"
              >
                All {rule.evidence.complaints} complaints
              </Link>
            </span>
          </div>
        </div>
      </div>
    </motion.li>
  );
}

export default ProposedRule;
