"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import HealthMeter from "@/components/ui/HealthMeter";
import RuleStateDot from "@/components/ui/RuleStateDot";
import type { Rule, RuleKind } from "@/lib/types";

const KIND_LABEL: Record<RuleKind, string> = {
  avoid_word: "word",
  sentence_habit: "habit",
  structure: "structure",
  stance: "stance",
  length: "length",
};

export interface RailRuleCardProps {
  rule: Rule;
  /** Selected or hovered: its spans are sweeping in the draft. */
  active: boolean;
  selected: boolean;
  /** Held invisible while the birth animation is still in flight. */
  arriving: boolean;
  /** Born from an edit in this session rather than loaded with the draft. */
  isNew: boolean;
  reduce: boolean;
  onHover: (ruleId: string | null) => void;
  onSelect: (ruleId: string) => void;
}

export function RailRuleCard({
  rule,
  active,
  selected,
  arriving,
  isNew,
  reduce,
  onHover,
  onSelect,
}: RailRuleCardProps) {
  const proposed = rule.status === "proposed";

  return (
    <motion.li
      data-rail-slot={rule.id}
      initial={isNew ? { opacity: 0, y: reduce ? 0 : 3 } : false}
      animate={{ opacity: arriving ? 0 : 1, y: 0 }}
      transition={reduce ? { duration: 0.001 } : { duration: 0.2, ease: "easeOut" }}
    >
      <button
        type="button"
        onMouseEnter={() => onHover(rule.id)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(rule.id)}
        onBlur={() => onHover(null)}
        onClick={() => onSelect(rule.id)}
        aria-pressed={selected}
        className={clsx(
          "w-full rounded-[3px] border px-3 py-2.5 text-left",
          "transition-colors duration-150 ease-out",
          active
            ? "border-hairline-strong bg-sunken"
            : "border-transparent hover:border-hairline hover:bg-sunken/60",
        )}
      >
        <span className="mb-1.5 flex items-center justify-between gap-2">
          <RuleStateDot status={rule.status} withLabel size="sm" />
          <span className="prepon-label">{KIND_LABEL[rule.kind]}</span>
        </span>

        <span className="block font-serif text-ui-lg leading-[1.45] text-primary">
          {rule.text}
        </span>

        {proposed ? (
          <span className="mt-2 block">
            <span className="flex items-center gap-2">
              <HealthMeter value={rule.health} status="proposed" showValue={false} />
              <span className="prepon-numeric text-micro text-faint">
                replay {rule.health.toFixed(2)}
              </span>
            </span>
            <span className="prepon-numeric mt-1 block text-micro text-secondary">
              {rule.evidence.complaints} past complaints · {rule.evidence.fixed} would be fixed
            </span>
            <span className="mt-1 block text-micro text-faint">
              Not live until it clears replay.
            </span>
          </span>
        ) : (
          <span className="mt-2 block">
            <span className="flex items-center gap-2">
              <HealthMeter value={rule.health} status={rule.status} showValue={false} />
              <span className="prepon-numeric text-micro text-faint">
                health {rule.health.toFixed(2)}
              </span>
            </span>
            <span className="prepon-numeric mt-1 block text-micro text-secondary">
              applied {rule.applied} · kept {rule.kept} · reverted {rule.reverted}
            </span>
          </span>
        )}
      </button>
    </motion.li>
  );
}

export default RailRuleCard;
