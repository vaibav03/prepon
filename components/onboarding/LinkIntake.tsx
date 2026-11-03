"use client";

import { useId, useState } from "react";
import ActionButton from "./ActionButton";
import IntakeCard from "./IntakeCard";
import type { NewSource } from "./types";

const EXAMPLES = [
  "linkedin.com/in/your-handle",
  "your-newsletter.com/archive",
  "an RSS or Atom feed",
];

function tidy(value: string): string {
  return value.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

export interface LinkIntakeProps {
  onAdd: (source: NewSource) => void;
}

/**
 * A profile or a feed. Queued rather than fetched: the word count arrives when
 * the thing has actually been read, and until then the ledger says so.
 */
export function LinkIntake({ onAdd }: LinkIntakeProps) {
  const fieldId = useId();
  const [value, setValue] = useState("");
  const [note, setNote] = useState<string | null>(null);

  const cleaned = tidy(value);
  const ready = cleaned.length >= 4 && cleaned.includes(".");

  function commit() {
    if (!ready) return;
    onAdd({ label: cleaned, kind: "link", words: 0, state: "queued" });
    setNote("Queued. It will be read on the next pass, then counted.");
    setValue("");
  }

  return (
    <IntakeCard
      label="Link"
      title="Point at a feed"
      description="A profile, a newsletter archive, a blog. Prepon reads the published posts and nothing else."
      footnote="Read-only. Prepon never posts, replies or follows anything on your behalf."
      note={note}
    >
      <label htmlFor={fieldId} className="sr-only">
        Profile or feed address
      </label>
      <input
        id={fieldId}
        type="text"
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          if (note) setNote(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
        }}
        placeholder="linkedin.com/in/…"
        className="w-full rounded-[3px] border border-hairline bg-surface px-3 py-2.5 text-ui-lg text-primary placeholder:text-faint"
      />

      <div className="flex flex-col gap-1">
        <p className="prepon-label">Works with</p>
        <ul className="flex flex-col gap-0.5">
          {EXAMPLES.map((example) => (
            <li key={example} className="text-ui text-faint">
              {example}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="prepon-numeric text-micro text-faint">
          {ready ? "Ready to queue" : "Nothing queued"}
        </p>
        <ActionButton variant="quiet" onClick={commit} disabled={!ready}>
          Queue for reading
        </ActionButton>
      </div>
    </IntakeCard>
  );
}

export default LinkIntake;
