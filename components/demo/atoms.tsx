"use client";

import clsx from "clsx";
import { motion } from "motion/react";

export const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

/* ---------------------------------------------------------------------- */

export interface CaretProps {
  reduced?: boolean;
  className?: string;
}

/** The blinking insertion point. Silent under reduced motion. */
export function Caret({ reduced, className }: CaretProps) {
  if (reduced) return null;
  return (
    <motion.span
      aria-hidden="true"
      className={clsx(
        "ml-0.5 inline-block h-[1em] w-px translate-y-[0.14em] bg-primary align-baseline",
        className,
      )}
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{
        duration: 1.05,
        repeat: Infinity,
        times: [0, 0.5, 0.5, 1],
        ease: "linear",
      }}
    />
  );
}

/* ---------------------------------------------------------------------- */

export interface StreamTextProps {
  /** The finished string. Rendered invisibly to reserve its exact height. */
  full: string;
  /** What has arrived so far. */
  shown: string;
  caret?: boolean;
  reduced?: boolean;
  className?: string;
}

/**
 * Streaming text that never reflows the page: a hidden clone of the finished
 * string holds the box open and the arriving words are painted over it.
 * No height is ever animated.
 */
export function StreamText({
  full,
  shown,
  caret = false,
  reduced,
  className,
}: StreamTextProps) {
  return (
    <span className="relative block">
      <span aria-hidden="true" className={clsx("invisible block", className)}>
        {full}
      </span>
      <span className={clsx("absolute inset-0 block", className)}>
        {shown}
        {caret ? <Caret reduced={reduced} /> : null}
      </span>
    </span>
  );
}

/* ---------------------------------------------------------------------- */

export interface SelectableLineProps {
  full: string;
  shown: string;
  /** 0..1 — how far the selection has swept across the sentence. */
  select: number;
  struck: boolean;
  caret?: boolean;
  reduced?: boolean;
  className?: string;
}

/**
 * The sentence the writer selects and deletes. The highlight is a real
 * per-word sweep, so it wraps the way a text selection wraps instead of
 * painting a rectangle over the paragraph.
 */
export function SelectableLine({
  full,
  shown,
  select,
  struck,
  caret = false,
  reduced,
  className,
}: SelectableLineProps) {
  const words = full.split(" ");
  const shownWords = shown === "" ? [] : shown.split(" ");
  const selected = Math.round(select * words.length);

  return (
    <span className="relative block">
      <span aria-hidden="true" className={clsx("invisible block", className)}>
        {full}
      </span>
      <span
        className={clsx(
          "absolute inset-0 block transition-opacity duration-200",
          struck && "opacity-50",
          className,
        )}
      >
        {shownWords.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className={clsx(
              i < selected && "bg-accent-soft text-primary",
              struck && i < selected && "line-through decoration-from-font",
            )}
          >
            {word}
            {i < shownWords.length - 1 ? " " : null}
          </span>
        ))}
        {caret ? <Caret reduced={reduced} /> : null}
      </span>
    </span>
  );
}

/* ---------------------------------------------------------------------- */

export interface TextCursorProps {
  /** 0..1 travel into the text. */
  glide: number;
  /** 0..1 position along the line being selected. */
  sweep: number;
  visible: boolean;
}

/** The writer's pointer, moving in and then dragging across the sentence. */
export function TextCursor({ glide, sweep, visible }: TextCursorProps) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -top-1 z-20 block will-change-transform"
      style={{
        left: `${Math.min(sweep, 0.97) * 100}%`,
        opacity: visible ? 1 : 0,
        transform: `translate3d(${(1 - glide) * 168}px, ${(1 - glide) * 108}px, 0)`,
        transition: "opacity 180ms linear",
      }}
    >
      <svg viewBox="0 0 12 17" className="h-4 w-3 drop-shadow-sm">
        <path
          d="M1 1 L1 13.4 L4.3 10.3 L6.3 15.2 L8.6 14.2 L6.6 9.4 L10.8 9.2 Z"
          fill="var(--text-primary)"
          stroke="var(--surface-sunken)"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/* ---------------------------------------------------------------------- */

export interface ThinkingProps {
  reduced?: boolean;
}

/** Three dots while the model is between the ask and the answer. */
export function Thinking({ reduced }: ThinkingProps) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1 rounded-full bg-faint"
          animate={reduced ? undefined : { opacity: [0.25, 1, 0.25] }}
          transition={
            reduced
              ? undefined
              : {
                  duration: 0.9,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.14,
                }
          }
        />
      ))}
    </span>
  );
}
