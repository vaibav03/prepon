"use client";

import { useId, useState } from "react";
import ActionButton from "./ActionButton";
import IntakeCard from "./IntakeCard";
import { countWords, formatWords, snippet } from "./format";
import type { NewSource } from "./types";

const MINIMUM_WORDS = 40;

export interface PasteIntakeProps {
  onAdd: (source: NewSource) => void;
}

/**
 * Paste is first because it is what people actually do, and because it is the
 * only way in where you can see exactly what you handed over.
 */
export function PasteIntake({ onAdd }: PasteIntakeProps) {
  const fieldId = useId();
  const [text, setText] = useState("");
  const [note, setNote] = useState<string | null>(null);

  const words = countWords(text);
  const ready = words >= MINIMUM_WORDS;

  function commit() {
    if (!ready) return;
    onAdd({
      label: `“${snippet(text)}”`,
      kind: "paste",
      words,
      state: "read",
    });
    setNote(`Added. ${formatWords(words)} words, counted exactly.`);
    setText("");
  }

  return (
    <IntakeCard
      label="Paste"
      title="Paste what you wrote"
      description="A post, a whole newsletter, a thread of emails. Prepon reads it as one passage."
      footnote="Counted here, in this page. Nothing is sent anywhere until you add it."
      note={note}
    >
      <label htmlFor={fieldId} className="sr-only">
        Paste writing to add to your corpus
      </label>
      <textarea
        id={fieldId}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          if (note) setNote(null);
        }}
        spellCheck={false}
        placeholder="Most founders discount because they are frightened, not because the buyer asked…"
        style={{ borderLeftWidth: 2, borderLeftColor: "var(--ink-user-edge)" }}
        className="min-h-[8.5rem] w-full resize-y rounded-[3px] border border-hairline bg-surface px-3 py-2.5 font-serif text-prose text-ink-user placeholder:text-faint"
      />

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="prepon-numeric text-micro text-faint">
          {words === 0
            ? `${MINIMUM_WORDS} words minimum`
            : ready
              ? `${formatWords(words)} words`
              : `${formatWords(words)} of ${MINIMUM_WORDS} words`}
        </p>
        <ActionButton variant="quiet" onClick={commit} disabled={!ready}>
          Add to corpus
        </ActionButton>
      </div>
    </IntakeCard>
  );
}

export default PasteIntake;
