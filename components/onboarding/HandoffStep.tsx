"use client";

import Link from "next/link";
import Prose from "@/components/ui/Prose";
import Stat from "@/components/ui/Stat";
import { OBSERVATIONS, REGISTERS } from "./data";
import { formatWords } from "./format";
import type { LedgerSource } from "./types";

export interface HandoffStepProps {
  sources: LedgerSource[];
  keptCount: number;
  onBackToSpecification: () => void;
}

/** The end state. One accented control, pointing at a draft. */
export function HandoffStep({
  sources,
  keptCount,
  onBackToSpecification,
}: HandoffStepProps) {
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
          Nothing left to set up
        </h2>
        <Prose as="p" width="measure" size="prose-lg">
          Setup is the shortest part of this product, and it is over. The rest
          of it happens while you write.
        </Prose>
      </header>

      <section className="border-y border-hairline py-5">
        <div className="flex flex-wrap gap-x-12 gap-y-5">
          <Stat label="Sources" value={sources.length} />
          <Stat label="Words read" value={formatWords(total)} />
          <Stat
            label="Registers covered"
            value={`${coveredCount} of ${REGISTERS.length}`}
          />
          <Stat
            label="Observations kept"
            value={`${keptCount} of ${OBSERVATIONS.length}`}
            muted={keptCount === 0}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <Prose as="p" width="measure">
          Your first draft will be wrong, but it will be wrong in your
          direction. You will fix it in three or four places. Those fixes are
          the actual input — each one becomes a proposed rule, gets replayed
          against whatever you have complained about before, and only goes live
          if it would have fixed those complaints too.
        </Prose>
        <Prose as="p" width="measure">
          {keptCount === 0
            ? "You dropped every observation, which is allowed. The first draft goes out with no voice specification at all and Prepon learns from nothing but what you change."
            : `The ${keptCount} ${keptCount === 1 ? "observation" : "observations"} you kept sit in front of the model on that first draft, and are marked in the margin wherever one of them changed a sentence. They are not rules yet. Correct one and it stops being a guess.`}
        </Prose>
      </section>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link
          href="/app/draft"
          className="inline-flex items-center rounded-[3px] bg-accent px-4 py-2 text-ui-lg text-accent-contrast transition duration-150 ease-out hover:opacity-85"
        >
          Open a draft
        </Link>
        <Link
          href="/app/rules"
          className="text-ui text-secondary underline decoration-hairline-strong underline-offset-4 transition duration-150 ease-out hover:text-primary"
        >
          See the rules this becomes
        </Link>
        <button
          type="button"
          onClick={onBackToSpecification}
          className="text-ui text-faint underline decoration-hairline-strong underline-offset-4 transition duration-150 ease-out hover:text-primary"
        >
          Back to the specification
        </button>
      </div>
    </div>
  );
}

export default HandoffStep;
