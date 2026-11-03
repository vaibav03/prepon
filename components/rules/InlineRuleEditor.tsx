"use client";

import { useLayoutEffect, useRef } from "react";
import clsx from "clsx";

export interface InlineRuleEditorProps {
  value: string;
  onChange: (next: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}

/**
 * Edit in place: same serif, same size, same position as the sentence it
 * replaces, so nothing moves and the caret lands where the reader clicked.
 * This component only mounts while a row is being edited, so its measuring
 * layout effect never runs during server rendering.
 */
export function InlineRuleEditor({
  value,
  onChange,
  onCommit,
  onCancel,
}: InlineRuleEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const end = el.value.length;
    el.setSelectionRange(end, end);
  }, []);

  return (
    <div>
      <textarea
        ref={ref}
        value={value}
        rows={1}
        spellCheck
        aria-label="Edit this rule"
        onChange={(event) => onChange(event.target.value)}
        onBlur={onCommit}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
          }
          if (event.key === "Enter") {
            event.preventDefault();
            onCommit();
          }
        }}
        className={clsx(
          "-mx-1 block w-full resize-none overflow-hidden rounded-[2px] bg-sunken px-1",
          "font-serif text-prose leading-[1.45] text-primary",
          "outline-none focus-visible:outline-none",
        )}
      />
      <p className="prepon-label mt-1">
        Enter saves · Esc cancels · an edit is itself a signal
      </p>
    </div>
  );
}

export default InlineRuleEditor;
