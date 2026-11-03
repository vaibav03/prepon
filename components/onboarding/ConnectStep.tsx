"use client";

import Prose from "@/components/ui/Prose";
import CorpusLedger from "./CorpusLedger";
import LinkIntake from "./LinkIntake";
import PasteIntake from "./PasteIntake";
import UploadIntake from "./UploadIntake";
import { formatWords } from "./format";
import type { LedgerSource, NewSource } from "./types";

export interface ConnectStepProps {
  sources: LedgerSource[];
  onAdd: (source: NewSource) => void;
  onGoToSignal: () => void;
}

/** Three ways in, all the same size, because they are the same decision. */
export function ConnectStep({
  sources,
  onAdd,
  onGoToSignal,
}: ConnectStepProps) {
  const counted = sources.reduce((sum, source) => sum + source.words, 0);
  const queued = sources.filter((source) => source.state === "queued").length;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <h2 className="font-serif text-headline text-primary">
          Connect what you have already written
        </h2>
        <Prose as="p" width="measure" size="prose-lg">
          Prepon starts by reading, not by asking. Give it whatever is easiest
          to hand over — a paste is as good as an upload, and most people paste.
        </Prose>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <PasteIntake onAdd={onAdd} />
        <UploadIntake onAdd={onAdd} />
        <LinkIntake onAdd={onAdd} />
      </div>

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-hairline-strong pb-2">
          <h3 className="prepon-label">Connected</h3>
          <p className="prepon-numeric text-ui text-faint">
            {sources.length} {sources.length === 1 ? "source" : "sources"} ·{" "}
            {formatWords(counted)} words
            {queued > 0 ? ` · ${queued} not read yet` : ""}
          </p>
        </div>
        <CorpusLedger sources={sources} dense className="mt-1" />
        <p className="mt-4 text-ui text-faint">
          The full ledger, with dates and what has actually been read, is in{" "}
          <button
            type="button"
            onClick={onGoToSignal}
            className="text-secondary underline decoration-hairline-strong underline-offset-4 transition duration-150 ease-out hover:text-primary"
          >
            Read the signal
          </button>
          .
        </p>
      </section>
    </div>
  );
}

export default ConnectStep;
