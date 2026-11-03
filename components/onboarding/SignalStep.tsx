"use client";

import Prose from "@/components/ui/Prose";
import CorpusLedger from "./CorpusLedger";
import RegisterCoverage from "./RegisterCoverage";
import SignalMeasure from "./SignalMeasure";
import { REGISTERS } from "./data";
import { formatWords } from "./format";
import type { LedgerSource } from "./types";

export interface SignalStepProps {
  sources: LedgerSource[];
}

/**
 * What Prepon has to work with, stated plainly, including the part where it
 * is not enough. No score, no readiness percentage, no green light.
 */
export function SignalStep({ sources }: SignalStepProps) {
  const total = sources.reduce((sum, source) => sum + source.words, 0);
  const coveredCount = REGISTERS.filter(
    (register) =>
      register.sourceId !== undefined &&
      sources.some((source) => source.id === register.sourceId),
  ).length;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <h2 className="font-serif text-headline text-primary">
          What Prepon has to work with
        </h2>
        <Prose as="p" width="measure" size="prose-lg">
          {formatWords(total)} words across {sources.length} sources, covering{" "}
          {coveredCount} of the {REGISTERS.length} kinds of writing a voice
          specification wants to see.
        </Prose>
      </header>

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-hairline-strong pb-2">
          <h3 className="prepon-label">Sources</h3>
          <p className="prepon-numeric text-ui text-faint">
            {formatWords(total)} words
          </p>
        </div>
        <CorpusLedger sources={sources} className="mt-1" />
      </section>

      <SignalMeasure sources={sources} />

      <RegisterCoverage sources={sources} />

      <section className="border-t border-hairline pt-6">
        <h3 className="prepon-label">Enough signal?</h3>
        <Prose as="p" width="measure" size="prose-lg" className="mt-3">
          Enough to guess with. Not enough to be right.
        </Prose>
        <Prose as="p" width="measure" className="mt-3">
          There is plenty of writing here, and more would not help. What is
          missing is correction: not one line of this corpus is a case of you
          telling an AI it got your voice wrong. Until that exists the replay
          gate stays shut, nothing goes live, and everything in the next pass is
          an inference with a confidence reading attached to it.
        </Prose>
      </section>
    </div>
  );
}

export default SignalStep;
