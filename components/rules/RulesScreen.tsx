"use client";

import { useCallback, useMemo, useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Rule } from "@/lib/types";
import Prose from "@/components/ui/Prose";
import { RULE_STATE_LABEL } from "@/components/ui/RuleStateDot";
import CapReadout from "./CapReadout";
import ProposedRule from "./ProposedRule";
import RuleFilters, { type KindFilter, type StatusFilter } from "./RuleFilters";
import RuleRow from "./RuleRow";
import { FilteredEmpty, RulesDayOne } from "./RulesEmpty";
import { CELL, ROW_GRID } from "./rowGrid";
import {
  KIND_LABEL,
  KIND_ORDER,
  LIVE_CAP,
  STATUS_ORDER,
  nextToDisplace,
  occupiesSlot,
  shorten,
  sortActive,
  sortProposed,
} from "./ruleMath";

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

const HEADING = "text-right text-micro text-faint";

const EMPTY_NOTE: Record<StatusFilter, string> = {
  all: "Every rule has been deleted. Push back on a draft and Prepon will start proposing again.",
  live: "Nothing is live. Until something is, drafts come back in the model’s default voice.",
  proposed: "Nothing is waiting on replay. Prepon proposes a rule once it has seen the same complaint more than once.",
  expiring: "Nothing is decaying. Every live rule is still being kept more often than it is reverted.",
  retired: "Nothing has retired yet. Rules land here when they are reverted too often or go unused too long.",
};

export interface RulesScreenProps {
  initialRules: Rule[];
}

export function RulesScreen({ initialRules }: RulesScreenProps) {
  const reduced = useReducedMotion() === true;
  const [ruleSet, setRuleSet] = useState<Rule[]>(initialRules);
  const [editedIds, setEditedIds] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [kind, setKind] = useState<KindFilter>("all");
  const [retiredOpen, setRetiredOpen] = useState(false);

  const transition = reduced ? { duration: 0 } : { duration: 0.2, ease: EASE };

  /* ---------------------------------------------------------------- edits */

  const commitText = useCallback((id: string, text: string) => {
    setRuleSet((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, text } : rule)),
    );
    setEditedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setNotice(null);
  }, []);

  const togglePin = useCallback((id: string) => {
    setRuleSet((prev) =>
      prev.map((rule) =>
        rule.id === id ? { ...rule, pinned: !rule.pinned } : rule,
      ),
    );
    setNotice(null);
  }, []);

  const deleteRule = useCallback((id: string) => {
    setRuleSet((prev) => prev.filter((rule) => rule.id !== id));
    setNotice(null);
  }, []);

  const dismissProposal = useCallback(
    (id: string) => {
      const target = ruleSet.find((rule) => rule.id === id);
      setRuleSet((prev) => prev.filter((rule) => rule.id !== id));
      setNotice(
        target
          ? `Dropped “${shorten(target.text)}”. Prepon will stop proposing it.`
          : null,
      );
    },
    [ruleSet],
  );

  /**
   * Promotion is the only way into the live set, and the set is capped. At the
   * cap the weakest unpinned rule gives up its slot in the same frame.
   */
  const promote = useCallback(
    (id: string) => {
      const target = ruleSet.find((rule) => rule.id === id);
      if (!target) return;
      const atCap = ruleSet.filter(occupiesSlot).length >= LIVE_CAP;
      const displaced = atCap ? nextToDisplace(ruleSet) : null;

      setRuleSet((prev) =>
        prev.map((rule) => {
          if (rule.id === id) return { ...rule, status: "live" as const };
          if (displaced && rule.id === displaced.id) {
            return { ...rule, status: "retired" as const, pinned: false };
          }
          return rule;
        }),
      );

      setNotice(
        displaced
          ? `“${shorten(target.text)}” took the last slot. “${shorten(displaced.text)}” was the weakest rule in the set and retired to make room.`
          : `“${shorten(target.text)}” is live. It goes in before the next draft.`,
      );
    },
    [ruleSet],
  );

  /* ------------------------------------------------------------- readings */

  const proposed = useMemo(
    () => sortProposed(ruleSet.filter((rule) => rule.status === "proposed")),
    [ruleSet],
  );
  const active = useMemo(
    () => sortActive(ruleSet.filter(occupiesSlot)),
    [ruleSet],
  );
  const retired = useMemo(
    () =>
      ruleSet
        .filter((rule) => rule.status === "retired")
        .sort((a, b) => b.applied - a.applied),
    [ruleSet],
  );

  const liveCount = active.length;
  const decayingCount = active.filter(
    (rule) => rule.status === "expiring",
  ).length;
  const atCap = liveCount >= LIVE_CAP;
  const displaces = atCap ? nextToDisplace(ruleSet) : null;

  const statusCounts = useMemo(() => {
    const pool = ruleSet.filter((rule) => kind === "all" || rule.kind === kind);
    const counts = { all: pool.length } as Record<StatusFilter, number>;
    for (const value of STATUS_ORDER) {
      counts[value] = pool.filter((rule) => rule.status === value).length;
    }
    return counts;
  }, [ruleSet, kind]);

  const kindCounts = useMemo(() => {
    const pool = ruleSet.filter(
      (rule) => status === "all" || rule.status === status,
    );
    const counts = { all: pool.length } as Record<KindFilter, number>;
    for (const value of KIND_ORDER) {
      counts[value] = pool.filter((rule) => rule.kind === value).length;
    }
    return counts;
  }, [ruleSet, status]);

  const matchesKind = (rule: Rule) => kind === "all" || rule.kind === kind;
  const visibleProposed =
    status === "all" || status === "proposed" ? proposed.filter(matchesKind) : [];
  const visibleActive = active
    .filter(matchesKind)
    .filter((rule) => status === "all" || rule.status === status);
  const visibleRetired =
    status === "all" || status === "retired" ? retired.filter(matchesKind) : [];

  const showRetired = retiredOpen || status === "retired";
  const nothingVisible =
    visibleProposed.length === 0 &&
    visibleActive.length === 0 &&
    visibleRetired.length === 0;

  const filterLabel =
    status === "all" && kind === "all"
      ? "this view"
      : [
          status === "all" ? null : RULE_STATE_LABEL[status].toLowerCase(),
          kind === "all" ? null : KIND_LABEL[kind].toLowerCase(),
        ]
          .filter(Boolean)
          .join(" · ");

  const emptyNote =
    status === "all" && kind !== "all"
      ? `No rules about ${KIND_LABEL[kind].toLowerCase()} yet. Prepon writes one only after it has seen the same complaint more than once.`
      : EMPTY_NOTE[status];

  const clearFilters = () => {
    setStatus("all");
    setKind("all");
  };

  /* ---------------------------------------------------------------- render */

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 pb-24 pt-7 md:px-6 md:pt-10 xl:px-8">
      <header className="flex flex-col gap-6 border-b border-hairline-strong pb-6 md:flex-row md:items-end md:justify-between md:gap-12">
        <div className="min-w-0">
          <h1 className="font-serif text-headline text-primary md:text-display">
            Rules
          </h1>
          <Prose as="p" width="measure" className="mt-2 text-secondary">
            Everything Prepon has worked out about how you want to be written
            for, in your words. Live rules go in before every draft. Proposed
            rules are still waiting on replay.
          </Prose>
        </div>
        <CapReadout
          live={liveCount}
          decaying={decayingCount}
          proposed={proposed.length}
        />
      </header>

      {ruleSet.length === 0 ? (
        <RulesDayOne />
      ) : (
        <>
          <div className="py-4">
            <RuleFilters
              status={status}
              kind={kind}
              statusCounts={statusCounts}
              kindCounts={kindCounts}
              onStatus={setStatus}
              onKind={setKind}
            />
          </div>

          <AnimatePresence initial={false} mode="wait">
            {notice ? (
              <motion.p
                key={notice}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transition}
                className="mb-5 max-w-wide border-l-2 border-accent pl-3 text-ui-lg text-secondary"
              >
                {notice}
              </motion.p>
            ) : null}
          </AnimatePresence>

          {visibleProposed.length > 0 ? (
            <section className="mb-9" aria-labelledby="proposed-heading">
              <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h2
                  id="proposed-heading"
                  className="font-serif text-title text-proposed"
                >
                  Proposed
                </h2>
                <p className="text-ui text-faint">
                  {visibleProposed.length === 1
                    ? "One sentence asking to go live. It is not being injected yet."
                    : `${visibleProposed.length} sentences asking to go live. None is being injected yet.`}
                </p>
              </div>

              <ul className="rounded-[4px] border border-hairline bg-raised">
                <AnimatePresence initial={false} mode="popLayout">
                  {visibleProposed.map((rule) => (
                    <ProposedRule
                      key={rule.id}
                      rule={rule}
                      edited={editedIds.includes(rule.id)}
                      displaces={displaces}
                      onCommit={commitText}
                      onPromote={promote}
                      onDismiss={dismissProposal}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          ) : null}

          {visibleActive.length > 0 ? (
            <section aria-labelledby="live-heading">
              <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h2 id="live-heading" className="font-serif text-title text-primary">
                  In force
                </h2>
                <p className="max-w-wide text-ui text-faint">
                  {atCap
                    ? `The set is full at ${LIVE_CAP}. The next promotion displaces the weakest rule here.`
                    : `Injected before every draft. The set is capped at ${LIVE_CAP}, so a new rule has to push an old one out.`}
                </p>
              </div>

              <div
                className={clsx(ROW_GRID, "hidden border-b border-hairline-strong pb-1.5 lg:grid")}
                aria-hidden="true"
              >
                <span className={clsx(CELL.text, "prepon-label")}>Rule</span>
                <span className={clsx(CELL.kind, "prepon-label")}>Kind</span>
                <span className={clsx(CELL.applied, HEADING)}>applied</span>
                <span className={clsx(CELL.kept, HEADING)}>kept</span>
                <span className={clsx(CELL.reverted, HEADING)}>reverted</span>
                <span className={clsx(CELL.health, "justify-start")}>
                  <span className="prepon-label">Health</span>
                </span>
                <span className={CELL.actions} />
              </div>

              <ul>
                <AnimatePresence initial={false} mode="popLayout">
                  {visibleActive.map((rule) => (
                    <RuleRow
                      key={rule.id}
                      rule={rule}
                      edited={editedIds.includes(rule.id)}
                      onCommit={commitText}
                      onTogglePin={togglePin}
                      onDelete={deleteRule}
                    />
                  ))}
                </AnimatePresence>
              </ul>

              <p className="mt-3 text-ui text-faint">
                Pinned rules are exempt from decay. Everything else loses health
                when it is reverted or goes unused, and retires itself.
              </p>
            </section>
          ) : null}

          {nothingVisible ? (
            <FilteredEmpty
              headline={`Nothing matches ${filterLabel}.`}
              note={emptyNote}
              onClear={clearFilters}
            />
          ) : null}

          {visibleRetired.length > 0 ? (
            <section className="mt-10 border-t border-hairline pt-4">
              <button
                type="button"
                onClick={() => setRetiredOpen((open) => !open)}
                aria-expanded={showRetired}
                className="prepon-label transition-colors duration-150 ease-out hover:text-secondary"
              >
                {showRetired ? "Hide" : "Show"} retired ·{" "}
                <span className="prepon-numeric">{visibleRetired.length}</span>
              </button>

              {showRetired ? (
                <ul className="mt-2">
                  <AnimatePresence initial={false} mode="popLayout">
                    {visibleRetired.map((rule) => (
                      <RuleRow
                        key={rule.id}
                        rule={rule}
                        edited={editedIds.includes(rule.id)}
                        onCommit={commitText}
                        onTogglePin={togglePin}
                        onDelete={deleteRule}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              ) : null}
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}

export default RulesScreen;
