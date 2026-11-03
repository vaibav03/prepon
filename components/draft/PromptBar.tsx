"use client";

import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import clsx from "clsx";

export interface PromptBarProps {
  value: string;
  onValueChange: (value: string) => void;
  streaming: boolean;
  onSubmit: () => void;
}

/**
 * What the writer asks for. Serif, because it is their own text, and because
 * the prompt and the draft belong to the same document.
 */
export function PromptBar({
  value,
  onValueChange,
  streaming,
  onSubmit,
}: PromptBarProps) {
  const areaRef = useRef<HTMLTextAreaElement | null>(null);
  const empty = value.trim().length === 0;

  // Grow to the text rather than scrolling inside a fixed box.
  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    area.style.height = "auto";
    area.style.height = `${area.scrollHeight}px`;
  }, [value]);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!empty && !streaming) onSubmit();
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!empty && !streaming) onSubmit();
      }}
      className="border-b border-hairline pb-4"
    >
      <label htmlFor="prepon-prompt" className="prepon-label mb-2 block">
        Ask for a draft
      </label>
      <textarea
        id="prepon-prompt"
        ref={areaRef}
        rows={1}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="A LinkedIn post about why the retainer model collapsed this year."
        className="prepon-prose block w-full max-w-measure resize-none bg-transparent outline-none placeholder:text-faint"
        style={{ color: "var(--ink-user)", caretColor: "var(--accent)" }}
      />
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="submit"
          disabled={streaming || empty}
          className={clsx(
            "rounded-[3px] px-3 py-1.5 text-ui transition-colors duration-150 ease-out",
            streaming || empty
              ? "cursor-default bg-sunken text-faint"
              : "bg-accent text-accent-contrast hover:opacity-90",
          )}
        >
          {streaming ? "Writing" : "Write it"}
        </button>
        <span className="prepon-label">
          {streaming ? "Click anywhere to finish" : "Return to send"}
        </span>
      </div>
    </form>
  );
}

export default PromptBar;
