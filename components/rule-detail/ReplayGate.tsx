"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Rule, RuleStatus } from "@/lib/types";
import { ActionButton, MetMark } from "./controls";
import type { GateReport } from "./gate";
import { timing } from "./phase";
import type { PromotePhase } from "./phase";

const TALLY_MS = 780;

function verdictSentence(
  rule: Rule,
  status: RuleStatus,
  justPromoted: boolean,
  overridden: boolean,
): string {
  if (justPromoted && overridden) {
    return `Promoted just now, over the gate. It runs from here on, and Prepon will keep showing you that it went live on ${rule.evidence.fixed} of ${rule.evidence.complaints}.`;
  }
  if (justPromoted) {
    return "Promoted just now. It is injected before every answer from here on, and it starts decaying from today.";
  }
  if (status === "retired") {
    return `It cleared the gate on ${rule.evidence.fixed} of ${rule.evidence.complaints} — thin evidence. What took it out of the set afterwards was decay, not the gate.`;
  }
  if (status === "expiring") {
    return "It cleared the gate on this evidence. What is putting it at risk now is decay, not the gate.";
  }
  return "It cleared the gate on this evidence, which is the only reason it is running.";
}

export interface ReplayGateProps {
  rule: Rule;
  status: RuleStatus;
  gate: GateReport;
  phase: PromotePhase;
  reduceMotion: boolean;
  /** True when the writer promoted this rule past an unmet gate, this session. */
  overridden: boolean;
  onTallyDone: () => void;
  onPromote: (options: { override: boolean }) => void;
}

/**
 * The promotion gate. The fraction is the most legible number on the page
 * because it is the whole argument: a rule is only allowed to run if replaying
 * it against the writer's own past complaints would have fixed them.
 */
export function ReplayGate({
  rule,
  status,
  gate,
  phase,
  reduceMotion,
  overridden,
  onTallyDone,
  onPromote,
}: ReplayGateProps) {
  const { complaints, fixed, sampled } = rule.evidence;
  const [tally, setTally] = useState<number | null>(null);
  const justPromoted = phase === "settling" || phase === "settled";

  useEffect(() => {
    if (phase !== "counting") return;
    if (reduceMotion) {
      const id = window.setTimeout(onTallyDone, 0);
      return () => window.clearTimeout(id);
    }

    let frame = 0;
    const started = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - started) / TALLY_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      setTally(Math.round(eased * fixed));
      if (t < 1) {
        frame = requestAnimationFrame(step);
      } else {
        onTallyDone();
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [phase, reduceMotion, fixed, onTallyDone]);

  /* The tally only drives the numeral while it is running. */
  const shown = phase === "counting" ? (tally ?? 0) : fixed;

  return (
    <div>
      <div className="flex flex-wrap items-end gap-x-9 gap-y-5">
        <p className="prepon-numeric flex items-baseline gap-1.5 font-serif leading-none text-primary">
          <span className="sr-only">
            {fixed} of {complaints} replayed complaints fixed.
          </span>
          <span className="text-display sm:text-hero" aria-hidden="true">
            {shown}
          </span>
          <span
            className="text-headline text-faint sm:text-display"
            aria-hidden="true"
          >
            /
          </span>
          <span
            className="text-title text-secondary sm:text-headline"
            aria-hidden="true"
          >
            {complaints}
          </span>
        </p>

        <p className="prepon-prose w-full max-w-narrow text-secondary sm:w-auto sm:flex-1">
          Replayed against{" "}
          <span className="prepon-numeric text-primary">{complaints}</span> past
          complaints. It would have fixed{" "}
          <span className="prepon-numeric text-primary">{fixed}</span>.
        </p>
      </div>

      <ul className="mt-9">
        {gate.conditions.map((condition) => (
          <li
            key={condition.id}
            className="flex items-start gap-3 border-t border-hairline py-3"
          >
            <MetMark met={condition.met} />
            <span className="sr-only">{condition.met ? "Met." : "Not met."}</span>
            <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <span className="w-full text-ui text-secondary sm:w-auto sm:flex-1">
                {condition.requirement}
              </span>
              <span
                className="prepon-numeric text-ui"
                style={{
                  color: condition.met
                    ? "var(--text-primary)"
                    : "var(--text-faint)",
                }}
              >
                {condition.reading}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <motion.div
        initial={false}
        animate={
          phase === "settling"
            ? { y: [-4, 0], scale: [1.006, 1] }
            : { y: 0, scale: 1 }
        }
        transition={timing(reduceMotion, 0.3)}
        style={{ originX: 0, originY: 0 }}
        className="mt-8 border-t border-hairline pt-6"
      >
        {status === "proposed" ? (
          <div>
            <p className="prepon-prose max-w-measure text-primary">
              {gate.met
                ? "The gate is met. Promoting puts this rule in front of every answer from now on."
                : `The gate is not met, so this rule is not running. ${gate.shortfall ?? ""}`}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
              <ActionButton
                variant="primary"
                disabled={!gate.met || phase === "counting"}
                onClick={() => onPromote({ override: false })}
              >
                {phase === "counting" ? "Replaying…" : "Promote to live"}
              </ActionButton>
              {gate.met ? null : (
                <ActionButton
                  variant="quiet"
                  disabled={phase === "counting"}
                  onClick={() => onPromote({ override: true })}
                >
                  Promote without the gate
                </ActionButton>
              )}
            </div>
            {gate.met ? null : (
              <p className="mt-3 max-w-narrow text-ui text-faint">
                It is your rule. Prepon will run it if you insist, and will keep
                showing you that it went live on evidence this thin.
              </p>
            )}
          </div>
        ) : (
          <AnimatePresence initial={false} mode="wait">
            <motion.p
              key={justPromoted ? "promoted" : status}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.15, ease: "easeOut" }}
              className="prepon-prose max-w-measure text-primary"
            >
              {verdictSentence(rule, status, justPromoted, overridden)}
            </motion.p>
          </AnimatePresence>
        )}
      </motion.div>

      <div className="mt-12">
        <p className="prepon-label">
          The complaints, sampled ({sampled.length} of {complaints})
        </p>
        <ul className="mt-5 space-y-5">
          {sampled.map((complaint) => (
            <li
              key={complaint}
              className="border-l-2 pl-4 sm:pl-5"
              style={{ borderColor: "var(--ink-user-edge)" }}
            >
              <p
                className="prepon-prose max-w-measure"
                style={{ color: "var(--ink-user)" }}
              >
                &ldquo;{complaint}&rdquo;
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ReplayGate;
