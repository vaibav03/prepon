"use client";

import { useId, useRef, useState } from "react";
import clsx from "clsx";
import ActionButton from "./ActionButton";
import IntakeCard from "./IntakeCard";
import { formatWords } from "./format";
import type { NewSource } from "./types";

/** Rough bytes per word across plain text, markdown and exported documents. */
const BYTES_PER_WORD = 6.2;

interface PendingFile {
  key: string;
  name: string;
  words: number;
}

function estimateWords(size: number): number {
  return Math.max(1, Math.round(size / BYTES_PER_WORD));
}

export interface UploadIntakeProps {
  onAdd: (source: NewSource) => void;
}

/** Files, dropped or chosen. Word counts are estimates and say so. */
export function UploadIntake({ onAdd }: UploadIntakeProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [over, setOver] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  function take(list: FileList | null) {
    if (!list || list.length === 0) return;
    const next: PendingFile[] = Array.from(list).map((file, index) => ({
      key: `${file.name}-${file.size}-${index}-${pending.length}`,
      name: file.name,
      words: estimateWords(file.size),
    }));
    setPending((current) => [...current, ...next]);
    setNote(null);
  }

  function commit() {
    if (pending.length === 0) return;
    const total = pending.reduce((sum, file) => sum + file.words, 0);
    for (const file of pending) {
      onAdd({
        label: file.name,
        kind: "upload",
        words: file.words,
        state: "estimated",
      });
    }
    setNote(
      `Added ${pending.length} ${pending.length === 1 ? "file" : "files"}. About ${formatWords(total)} words, estimated from size.`,
    );
    setPending([]);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <IntakeCard
      label="Upload"
      title="Hand over the files"
      description="Exports, drafts, a folder of sent mail. Plain text, Markdown, .docx or PDF."
      footnote="Word counts are estimated from file size until the file has been read."
      note={note}
    >
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          take(event.dataTransfer.files);
        }}
        className={clsx(
          "flex min-h-[8.5rem] flex-col items-center justify-center gap-2 rounded-[3px] border border-dashed px-4 py-5 text-center",
          "transition duration-150 ease-out",
          over ? "border-accent bg-accent-soft" : "border-hairline-strong",
        )}
      >
        <p className="text-ui text-secondary">Drop files here</p>
        <label
          htmlFor={inputId}
          className="cursor-pointer text-ui text-faint underline decoration-hairline-strong underline-offset-4 transition duration-150 ease-out hover:text-primary"
        >
          or choose them
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept=".txt,.md,.markdown,.docx,.pdf,.rtf"
          className="sr-only"
          onChange={(event) => take(event.target.files)}
        />
      </div>

      {pending.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {pending.map((file) => (
            <li
              key={file.key}
              className="flex items-baseline justify-between gap-3 text-ui"
            >
              <span className="min-w-0 truncate text-secondary">
                {file.name}
              </span>
              <span className="prepon-numeric shrink-0 text-micro text-faint">
                ~{formatWords(file.words)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="prepon-numeric text-micro text-faint">
          {pending.length === 0
            ? "No files chosen"
            : `${pending.length} waiting`}
        </p>
        <ActionButton
          variant="quiet"
          onClick={commit}
          disabled={pending.length === 0}
        >
          Add to corpus
        </ActionButton>
      </div>
    </IntakeCard>
  );
}

export default UploadIntake;
