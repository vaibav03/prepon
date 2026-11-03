"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Prose from "@/components/ui/Prose";
import { corpus } from "@/lib/fixtures";
import ConnectStep from "./ConnectStep";
import HandoffStep from "./HandoffStep";
import SignalStep from "./SignalStep";
import SpecificationStep from "./SpecificationStep";
import StepRail from "./StepRail";
import { OBSERVATIONS, STEP_LABEL } from "./data";
import { formatWords } from "./format";
import { STEP_IDS, type LedgerSource, type NewSource, type StepId } from "./types";

/** The fixture corpus has been read end to end; anything added here has not. */
const INITIAL_SOURCES: LedgerSource[] = corpus.map((source) => ({
  ...source,
  state: "read",
}));

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function OnboardingClient() {
  const reduce = !!useReducedMotion();

  const [step, setStep] = useState<StepId>("connect");
  const [sources, setSources] = useState<LedgerSource[]>(INITIAL_SOURCES);
  const [dropped, setDropped] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );
  const [hasAssembled, setHasAssembled] = useState(false);

  const addSource = useCallback((incoming: NewSource) => {
    setSources((current) => [
      ...current,
      {
        ...incoming,
        id: `c-added-${current.length + 1}-${incoming.kind}`,
        addedAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const toggleDrop = useCallback((id: string) => {
    setDropped((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const markAssembled = useCallback(() => setHasAssembled(true), []);

  const totalWords = useMemo(
    () => sources.reduce((sum, source) => sum + source.words, 0),
    [sources],
  );

  const keptCount = OBSERVATIONS.filter(
    (observation) => !dropped.has(observation.id),
  ).length;

  const readings: Record<StepId, string> = {
    connect: `${sources.length} ${sources.length === 1 ? "source" : "sources"}`,
    signal: `${formatWords(totalWords)} words`,
    specification: `${keptCount} inferred`,
    handoff: "ready when you are",
  };

  const position = STEP_IDS.indexOf(step);
  const previous = position > 0 ? STEP_IDS[position - 1] : null;
  const next =
    position < STEP_IDS.length - 1 ? STEP_IDS[position + 1] : null;

  return (
    <div className="mx-auto w-full max-w-[64rem] px-4 pb-20 md:px-10">
      <header className="flex flex-col gap-4 pt-8 pb-7 md:pt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <p className="prepon-label">Setup · Sources</p>
          <button
            type="button"
            onClick={() => setStep("handoff")}
            className="text-ui text-faint underline decoration-hairline-strong underline-offset-4 transition duration-150 ease-out hover:text-primary"
          >
            Skip to writing
          </button>
        </div>
        <h1
          className="font-serif text-display text-primary"
          style={{ textWrap: "balance" }}
        >
          Prepon reads before it writes.
        </h1>
        <Prose as="p" width="measure" size="prose-lg">
          Four passes. Nothing here is gated — skip ahead, come back, leave in
          the middle. The only pass that changes anything permanently is the
          last one, where you start writing and start correcting.
        </Prose>
      </header>

      <StepRail current={step} readings={readings} onSelect={setStep} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          key={step}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={
            reduce
              ? { opacity: 0, transition: { duration: 0 } }
              : { opacity: 0, y: -6, transition: { duration: 0.09 } }
          }
          transition={{ duration: reduce ? 0 : 0.15, ease: EASE }}
          aria-label={STEP_LABEL[step]}
          className="pt-10"
        >
          {step === "connect" ? (
            <ConnectStep
              sources={sources}
              onAdd={addSource}
              onGoToSignal={() => setStep("signal")}
            />
          ) : null}

          {step === "signal" ? <SignalStep sources={sources} /> : null}

          {step === "specification" ? (
            <SpecificationStep
              sources={sources}
              dropped={dropped}
              onToggleDrop={toggleDrop}
              shouldAssemble={!hasAssembled}
              onAssembled={markAssembled}
            />
          ) : null}

          {step === "handoff" ? (
            <HandoffStep
              sources={sources}
              keptCount={keptCount}
              onBackToSpecification={() => setStep("specification")}
            />
          ) : null}
        </motion.section>
      </AnimatePresence>

      <nav
        aria-label="Move between passes"
        className="mt-12 flex items-baseline justify-between gap-6 border-t border-hairline pt-5"
      >
        {previous ? (
          <button
            type="button"
            onClick={() => setStep(previous)}
            className="text-left text-ui text-faint transition duration-150 ease-out hover:text-primary"
          >
            <span className="prepon-label block">Back</span>
            <span className="text-ui-lg">{STEP_LABEL[previous]}</span>
          </button>
        ) : (
          <span />
        )}

        {next ? (
          <button
            type="button"
            onClick={() => setStep(next)}
            className="text-right text-ui text-faint transition duration-150 ease-out hover:text-primary"
          >
            <span className="prepon-label block">Next</span>
            <span className="text-ui-lg">{STEP_LABEL[next]}</span>
          </button>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}

export default OnboardingClient;
