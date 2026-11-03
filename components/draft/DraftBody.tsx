"use client";

import { Fragment, useMemo } from "react";
import type { CSSProperties, ClipboardEvent, KeyboardEvent } from "react";
import clsx from "clsx";
import { motion } from "motion/react";
import type { DraftPlan, SpanPlan } from "./stream";
import { holdsCursor, visibleText } from "./stream";
import MarginMark from "./MarginMark";

export type CursorState = "none" | "live" | "fading";

export interface DraftBodyProps {
  plan: DraftPlan;
  revealed: number;
  /** Streaming locks editing; once ready the prose becomes contentEditable. */
  streaming: boolean;
  cursor: CursorState;
  reduce: boolean;
  /** Span ids the writer has rewritten; they take the user-ink treatment. */
  rewritten: ReadonlySet<string>;
  /** Paragraph indices that carry a capture mark in the margin. */
  markedParagraphs: ReadonlySet<number>;
  /** Span currently flashing after a capture, and which half of the flash. */
  flash: { spanId: string; phase: "on" | "off" } | null;
  /** Rule being hovered or selected in the rail; its spans sweep. */
  sweepRuleId: string | null;
  /** Spans that belong to the active rule because an edit there produced it. */
  sweepSpanIds: ReadonlySet<string>;
  registerSpan: (id: string, el: HTMLElement | null) => void;
  onParagraphInput: (paragraph: number) => void;
  onParagraphBlur: (paragraph: number) => void;
}

const SWEEP_STEP = 55;

/**
 * The writing surface. Paragraphs are contentEditable once the draft has
 * arrived; the span elements inside them are never re-rendered with new text,
 * so React can restyle a span without disturbing the caret or the typing.
 */
export function DraftBody({
  plan,
  revealed,
  streaming,
  cursor,
  reduce,
  rewritten,
  markedParagraphs,
  flash,
  sweepRuleId,
  sweepSpanIds,
  registerSpan,
  onParagraphInput,
  onParagraphBlur,
}: DraftBodyProps) {
  // Reading order of the spans a rule shaped, for the left-to-right sweep.
  const sweepOrder = useMemo(() => {
    const order = new Map<string, number>();
    if (!sweepRuleId) return order;
    let i = 0;
    for (const paragraph of plan.paragraphs) {
      for (const span of paragraph) {
        if (span.ruleId === sweepRuleId || sweepSpanIds.has(span.id)) {
          order.set(span.id, i);
          i += 1;
        }
      }
    }
    return order;
  }, [plan, sweepRuleId, sweepSpanIds]);

  function handleKeyDown(event: KeyboardEvent<HTMLParagraphElement>) {
    // Rewriting a line is in scope; restructuring the draft is not.
    if (event.key === "Enter") event.preventDefault();
  }

  function handlePaste(event: ClipboardEvent<HTMLParagraphElement>) {
    const text = event.clipboardData.getData("text/plain");
    if (!text) return;
    event.preventDefault();
    const plain = text.replace(/\s+/g, " ");
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const node = document.createTextNode(plain);
      range.insertNode(node);
      range.setStartAfter(node);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    onParagraphInput(Number(event.currentTarget.dataset.paragraph));
  }

  function spanStyle(span: SpanPlan): CSSProperties {
    const isUser = span.origin === "user" || rewritten.has(span.id);
    const order = sweepOrder.get(span.id);
    const sweeping = order !== undefined;
    const flashing = flash?.spanId === span.id;
    const flashOn = flashing && flash?.phase === "on";

    const base: CSSProperties = {
      color: isUser ? "var(--ink-user)" : "var(--ink-ai)",
      backgroundColor: flashOn
        ? "var(--accent-soft)"
        : isUser
          ? "var(--ink-user-wash)"
          : "transparent",
      backgroundImage:
        "linear-gradient(90deg, var(--accent-soft), var(--accent-soft))",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "left center",
      backgroundSize: sweeping ? "100% 100%" : "0% 100%",
      boxDecorationBreak: "clone",
      WebkitBoxDecorationBreak: "clone",
      borderRadius: "2px",
      // Identical on every span so a rewrite never reflows the line.
      padding: "0.04em 0.09em",
      transition: flashOn
        ? "none"
        : reduce
          ? "background-color 1ms linear, background-size 1ms linear"
          : [
              "background-color 380ms ease-out",
              `background-size 220ms cubic-bezier(0.22, 0.61, 0.36, 1) ${
                sweeping && order !== undefined ? order * SWEEP_STEP : 0
              }ms`,
            ].join(", "),
    };
    return base;
  }

  // The left gutter the marks live in is supplied by the page column, so the
  // prompt, the title and the prose all sit on the same vertical line.
  return (
    <div className="prepon-prose max-w-measure">
        {plan.paragraphs.map((spans, p) => {
          const anyVisible = spans.some((span) => revealed > span.start);
          if (!anyVisible) return null;

          return (
            <div key={`${plan.draftId}-p${p}`} className={clsx("relative", p > 0 && "mt-[1.1em]")}>
              {markedParagraphs.has(p) ? <MarginMark reduce={reduce} /> : null}
              <p
                data-paragraph={p}
                contentEditable={!streaming}
                suppressContentEditableWarning
                spellCheck={!streaming}
                onInput={() => onParagraphInput(p)}
                onBlur={() => onParagraphBlur(p)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                className="outline-none focus-visible:outline-none"
                style={{ caretColor: "var(--accent)" }}
              >
                {spans.map((span) => {
                  const text = streaming ? visibleText(span, revealed) : span.text;
                  const showCursor =
                    (cursor === "live" && holdsCursor(span, revealed)) ||
                    (cursor === "fading" &&
                      p === plan.paragraphs.length - 1 &&
                      span === spans[spans.length - 1]);

                  return (
                    <Fragment key={span.id}>
                      <span
                        data-span-id={span.id}
                        ref={(el) => {
                          registerSpan(span.id, el);
                          return () => registerSpan(span.id, null);
                        }}
                        style={spanStyle(span)}
                      >
                        {text}
                      </span>
                      {showCursor ? <StreamCursor state={cursor} reduce={reduce} /> : null}
                    </Fragment>
                  );
                })}
              </p>
            </div>
          );
        })}
    </div>
  );
}

function StreamCursor({ state, reduce }: { state: CursorState; reduce: boolean }) {
  const shared = {
    display: "inline-block" as const,
    width: "1px",
    height: "1.02em",
    marginLeft: "1.5px",
    verticalAlign: "-0.14em",
    backgroundColor: "var(--accent)",
    transformOrigin: "bottom center",
  };

  if (state === "fading") {
    return (
      <motion.span
        aria-hidden="true"
        contentEditable={false}
        style={shared}
        initial={{ opacity: 1, scaleY: 1 }}
        animate={{ opacity: 0, scaleY: reduce ? 1 : 0.55 }}
        transition={
          reduce
            ? { duration: 0.001 }
            : { duration: 0.22, delay: 0.16, ease: "easeOut" }
        }
      />
    );
  }

  return <span aria-hidden="true" style={shared} />;
}

export default DraftBody;
