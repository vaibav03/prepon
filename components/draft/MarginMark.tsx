"use client";

import { motion } from "motion/react";

export interface MarginMarkProps {
  reduce: boolean;
}

/**
 * The quiet confirmation that an edit was recorded. It sits in the margin,
 * says one word, and never asks for anything. Not a toast, not a badge.
 */
export function MarginMark({ reduce }: MarginMarkProps) {
  return (
    <motion.span
      aria-hidden="true"
      contentEditable={false}
      className="pointer-events-none absolute -left-6 top-[0.46em] flex flex-col items-start gap-1 select-none md:-left-8"
      initial={{ opacity: 0, x: reduce ? 0 : -3 }}
      animate={{ opacity: 1, x: 0 }}
      transition={reduce ? { duration: 0.001 } : { duration: 0.22, ease: "easeOut" }}
    >
      <span
        className="block w-[2px] rounded-[1px]"
        style={{ height: 13, backgroundColor: "var(--accent)" }}
      />
      <span
        className="prepon-label hidden origin-top-left md:block"
        style={{ writingMode: "vertical-rl", letterSpacing: "0.1em", fontSize: "0.5625rem" }}
      >
        noted
      </span>
    </motion.span>
  );
}

export default MarginMark;
