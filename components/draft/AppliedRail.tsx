"use client";

import { useState } from "react";
import clsx from "clsx";
import { motion } from "motion/react";
import type { Rule } from "@/lib/types";
import RailRuleCard from "./RailRuleCard";

export interface AppliedRailProps {
  /** Rules the draft arrived with, in the order the draft lists them. */
  applied: Rule[];
  /** Rules born from rewrites in this session, newest first. */
  born: Rule[];
  /** Rule ids whose cards are still mid-flight and must stay invisible. */
  arrivingRuleIds: ReadonlySet<string>;
  activeRuleId: string | null;
  selectedRuleId: string | null;
  reduce: boolean;
  onHover: (ruleId: string | null) => void;
  onSelect: (ruleId: string) => void;
}

/**
 * The quiet rail. On a wide screen it is a column beside the draft; below
 * 1024px it becomes a bottom sheet that opens over the draft. Both are in the
 * DOM at once so nothing flashes on resize, and only the visible one is ever
 * measured as a landing site for a new rule.
 */
export function AppliedRail(props: AppliedRailProps) {
  return (
    <>
      <aside
        aria-label="Rules applied to this draft"
        className="hidden shrink-0 border-l border-hairline lg:block lg:w-[278px]"
      >
        <div className="sticky top-0 max-h-dvh overflow-y-auto px-3 py-6">
          <RailContents {...props} />
        </div>
      </aside>
      <RailSheet {...props} />
    </>
  );
}

function RailContents({
  applied,
  born,
  arrivingRuleIds,
  activeRuleId,
  selectedRuleId,
  reduce,
  onHover,
  onSelect,
}: AppliedRailProps) {
  const liveCount = applied.filter((rule) => rule.status === "live").length;

  return (
    <div className="flex flex-col gap-6">
      <section>
        <header className="mb-2 flex items-baseline justify-between gap-2 px-3">
          <h2 className="prepon-label">Shaped this draft</h2>
          <span className="prepon-numeric text-micro text-faint">
            {liveCount} live
          </span>
        </header>
        <ul className="flex flex-col gap-0.5">
          {applied.map((rule) => (
            <RailRuleCard
              key={rule.id}
              rule={rule}
              isNew={false}
              arriving={false}
              active={activeRuleId === rule.id}
              selected={selectedRuleId === rule.id}
              reduce={reduce}
              onHover={onHover}
              onSelect={onSelect}
            />
          ))}
        </ul>
      </section>

      <section>
        <header className="mb-2 flex items-baseline justify-between gap-2 px-3">
          <h2 className="prepon-label">Proposed from your edits</h2>
          <span className="prepon-numeric text-micro text-faint">{born.length}</span>
        </header>
        {born.length === 0 ? (
          <p className="px-3 text-ui leading-[1.5] text-faint">
            Rewrite a line in the draft. Prepon reads the pair and writes the
            rule back to you here.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {born.map((rule) => (
              <RailRuleCard
                key={rule.id}
                rule={rule}
                isNew
                arriving={arrivingRuleIds.has(rule.id)}
                active={activeRuleId === rule.id}
                selected={selectedRuleId === rule.id}
                reduce={reduce}
                onHover={onHover}
                onSelect={onSelect}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function RailSheet(props: AppliedRailProps) {
  const [open, setOpen] = useState(false);
  const total = props.applied.length + props.born.length;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
      <motion.div
        data-rail-hidden={open ? "false" : "true"}
        aria-hidden={!open}
        className="absolute inset-x-0 bottom-full max-h-[58dvh] overflow-y-auto border-t border-hairline bg-raised px-3 py-5"
        initial={false}
        animate={{
          opacity: open ? 1 : 0,
          y: open ? 0 : props.reduce ? 0 : 8,
        }}
        transition={
          props.reduce ? { duration: 0.001 } : { duration: 0.2, ease: "easeOut" }
        }
        style={{ pointerEvents: open ? "auto" : "none" }}
      >
        <RailContents {...props} />
      </motion.div>

      <button
        type="button"
        data-rail-fallback=""
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={clsx(
          "flex w-full items-center justify-between gap-3 border-t border-hairline bg-raised px-4 py-3",
          "text-left transition-colors duration-150 ease-out",
        )}
      >
        <span className="prepon-label">Rules on this draft</span>
        <span className="flex items-center gap-3">
          <span className="prepon-numeric text-ui text-secondary">{total}</span>
          <motion.span
            aria-hidden="true"
            className="block"
            initial={false}
            animate={{ rotate: open ? -135 : 45 }}
            transition={
              props.reduce ? { duration: 0.001 } : { duration: 0.18, ease: "easeOut" }
            }
            style={{
              width: 6,
              height: 6,
              marginBottom: open ? 0 : 3,
              borderRight: "1px solid var(--hairline-strong)",
              borderBottom: "1px solid var(--hairline-strong)",
            }}
          />
        </span>
      </button>
    </div>
  );
}

export default AppliedRail;
