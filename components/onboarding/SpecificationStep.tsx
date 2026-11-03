"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import Prose from "@/components/ui/Prose";
import ObservationRow from "./ObservationRow";
import ProvenanceKey from "./ProvenanceKey";
import { OBSERVATIONS } from "./data";
import type { LedgerSource } from "./types";

export interface SpecificationStepProps {
  sources: LedgerSource[];
  dropped: ReadonlySet<string>;
  onToggleDrop: (id: string) => void;
  /** False once the stagger has already played in this session. */
  shouldAssemble: boolean;
  onAssembled: () => void;
}

/**
 * The cold start. No edits exist, so the corpus is the only signal, and
 * everything here is a guess that says it is one.
 */
export function SpecificationStep({
  sources,
  dropped,
  onToggleDrop,
  shouldAssemble,
  onAssembled,
}: SpecificationStepProps) {
  const reduce = !!useReducedMotion();

  // Decided once, at mount, so telling the parent cannot restart the stagger.
  const [assembling] = useState(() => shouldAssemble);

  useEffect(() => {
    if (assembling) onAssembled();
  }, [assembling, onAssembled]);

  const labels = new Map(sources.map((source) => [source.id, source.label]));
  const kept = OBSERVATIONS.filter(
    (observation) => !dropped.has(observation.id),
  ).length;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <h2 className="font-serif text-headline text-primary">
          The first specification
        </h2>
        <Prose as="p" width="measure" size="prose-lg">
          You have not corrected anything yet, so Prepon has nothing it has
          learned. What it has is {OBSERVATIONS.length} observations counted out
          of your finished writing — how you open, how long you let a paragraph
          run, which words you have never once used.
        </Prose>
        <Prose as="p" width="measure">
          These are guesses. They describe the writing you shipped, which is not
          quite the same thing as the writing you wanted. The first time you
          rewrite a sentence, Prepon will trust that one correction more than
          everything on this page, and it should.
        </Prose>
      </header>

      <ProvenanceKey />

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-hairline-strong pb-2">
          <h3 className="prepon-label">
            Inferred observations · strongest first
          </h3>
          <p className="prepon-numeric text-ui text-faint">
            {kept} of {OBSERVATIONS.length} kept
          </p>
        </div>

        <ol className="divide-y divide-hairline">
          {OBSERVATIONS.map((observation, index) => (
            <ObservationRow
              key={observation.id}
              observation={observation}
              sourceLabel={
                labels.get(observation.sourceId) ?? "your connected sources"
              }
              index={index}
              animate={assembling}
              reduce={reduce}
              dropped={dropped.has(observation.id)}
              onToggleDrop={() => onToggleDrop(observation.id)}
            />
          ))}
        </ol>
      </section>

      <footer className="border-t border-hairline pt-5">
        <Prose as="p" width="measure">
          None of these is live, and none of them can be. A rule goes live by
          passing the replay gate — replayed against your past complaints, kept
          only if it would have fixed them — and the gate has nothing to replay
          until you push back on something. These seed your first draft, then
          get written over.
        </Prose>
      </footer>
    </div>
  );
}

export default SpecificationStep;
