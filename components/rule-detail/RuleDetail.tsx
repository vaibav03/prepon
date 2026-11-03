"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import type { Rule, RuleStatus } from "@/lib/types";
import { ActionButton } from "./controls";
import DecayTrajectory from "./DecayTrajectory";
import { evaluateGate } from "./gate";
import Provenance from "./Provenance";
import ReplayGate from "./ReplayGate";
import RuleHeadline from "./RuleHeadline";
import Section from "./Section";
import type { PromotePhase } from "./phase";

export interface RuleDetailProps {
  rule: Rule;
  /** How many rules are in the live set right now; the set is capped at 60. */
  liveCount: number;
}

/**
 * Two questions, answered in order: where the rule came from, and why it was
 * allowed to run. Then how it is holding up.
 *
 * Everything the writer changes here is session state. Prepon has no database
 * in this build, so a promotion, a retirement or an edit lasts until reload.
 */
export function RuleDetail({ rule, liveCount }: RuleDetailProps) {
  const reduceMotion = useReducedMotion() ?? false;

  const [status, setStatus] = useState<RuleStatus>(rule.status);
  const [previousStatus, setPreviousStatus] = useState<RuleStatus | null>(null);
  const [pinned, setPinned] = useState(rule.pinned);
  const [text, setText] = useState(rule.text);
  const [savedText, setSavedText] = useState(rule.text);
  const [edited, setEdited] = useState(false);
  const [phase, setPhase] = useState<PromotePhase>("idle");
  const [overridden, setOverridden] = useState(false);

  const headRef = useRef<HTMLDivElement | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const gate = evaluateGate(rule, liveCount);
  const justPromoted = phase === "settling" || phase === "settled";

  const promote = useCallback(
    ({ override }: { override: boolean }) => {
      if (status !== "proposed" || phase === "counting") return;
      setOverridden(override);
      if (reduceMotion) {
        setStatus("live");
        setPhase("settled");
        return;
      }
      setPhase("counting");
    },
    [status, phase, reduceMotion],
  );

  /* The tally has finished. Bring the rule back into view if the reader has
     scrolled past it, then let it settle into the live set. */
  const handleTallyDone = useCallback(() => {
    const node = headRef.current;
    let delay = 120;
    if (node) {
      const { top } = node.getBoundingClientRect();
      if (top < 0 || top > window.innerHeight * 0.55) {
        node.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
        delay = reduceMotion ? 0 : 380;
      }
    }
    const settleAt = window.setTimeout(() => {
      setStatus("live");
      setPhase("settling");
      const restAt = window.setTimeout(() => setPhase("settled"), 340);
      timers.current.push(restAt);
    }, delay);
    timers.current.push(settleAt);
  }, [reduceMotion]);

  const retire = useCallback(() => {
    setPreviousStatus(status);
    setStatus("retired");
    setPhase("idle");
  }, [status]);

  const restore = useCallback(() => {
    setStatus(previousStatus ?? "live");
    setPreviousStatus(null);
  }, [previousStatus]);

  const save = useCallback(() => {
    const next = text.trim();
    if (!next) return;
    setText(next);
    setSavedText(next);
    setEdited(true);
  }, [text]);

  const revert = useCallback(() => setText(savedText), [savedText]);

  return (
    <div className="mx-auto w-full max-w-[58rem] px-4 pt-8 pb-28 sm:px-8 sm:pt-12">
      <nav aria-label="Breadcrumb">
        <Link
          href="/app/rules"
          className="text-ui text-faint transition-colors duration-150 ease-out hover:text-secondary"
        >
          <span aria-hidden="true">&larr;</span> All rules
        </Link>
      </nav>

      <div className="mt-7">
        <RuleHeadline
          rule={rule}
          status={status}
          pinned={pinned}
          text={text}
          savedText={savedText}
          edited={edited}
          phase={phase}
          reduceMotion={reduceMotion}
          anchorRef={headRef}
          onTextChange={setText}
          onSave={save}
          onRevert={revert}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-3 border-t border-hairline pt-5">
        <ActionButton onClick={() => setPinned((value) => !value)} aria-pressed={pinned}>
          {pinned ? "Unpin" : "Pin"}
        </ActionButton>
        {status === "retired" ? (
          <ActionButton onClick={restore} disabled={previousStatus === null}>
            Restore
          </ActionButton>
        ) : (
          <ActionButton onClick={retire}>Retire</ActionButton>
        )}
        {status === "proposed" ? (
          <a
            href="#gate"
            className="text-ui text-faint underline decoration-hairline-strong underline-offset-4 transition-colors duration-150 ease-out hover:text-secondary"
          >
            The promotion gate <span aria-hidden="true">&darr;</span>
          </a>
        ) : null}
        <p className="basis-full text-ui text-faint sm:basis-auto">
          {status === "retired" && previousStatus !== null
            ? "Retired. It stops running from now; the record stays here."
            : pinned
              ? "Pinned rules hold their slot in the live set and are not displaced."
              : "Nothing here is permanent. A rule you delete stops being injected the same minute."}
        </p>
      </div>

      <Section
        id="provenance"
        index={1}
        label="Provenance"
        question="Where this rule came from"
        lede="Prepon did not invent the sentence above. It read these corrections, found the same complaint running through them, and wrote one rule that covers all of them."
      >
        <Provenance edits={rule.sourceEdits} />
      </Section>

      <Section
        id="gate"
        index={2}
        label="Replay evidence"
        question={
          status === "proposed"
            ? "Why it has not gone live"
            : "Why it was allowed to go live"
        }
        lede="A proposed rule is replayed against the complaints you have already made. It only goes live if it would have fixed them."
      >
        <ReplayGate
          rule={rule}
          status={status}
          gate={gate}
          phase={phase}
          reduceMotion={reduceMotion}
          overridden={overridden && justPromoted}
          onTallyDone={handleTallyDone}
          onPromote={promote}
        />
      </Section>

      <Section
        id="decay"
        index={3}
        label="Decay"
        question="How it is holding up"
        lede="Rules expire. Every time this one applies, Prepon records whether you left the sentence alone or put your own back."
      >
        <DecayTrajectory rule={rule} status={status} pinned={pinned} />
      </Section>
    </div>
  );
}

export default RuleDetail;
