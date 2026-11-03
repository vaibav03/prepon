"use client";

import { motion } from "motion/react";

export interface GhostSpec {
  id: string;
  text: string;
  top: number;
  left: number;
  width: number;
}

export interface EditGhostProps {
  ghost: GhostSpec;
  reduce: boolean;
}

/**
 * What the sentence used to say, shown for a moment where it used to be, then
 * dimmed and contracted out of the way. Purely decorative in the DOM sense:
 * fixed, aria-hidden, pointer-events none, so it cannot touch the caret.
 */
export function EditGhost({ ghost, reduce }: EditGhostProps) {
  return (
    <motion.span
      aria-hidden="true"
      className="prepon-prose pointer-events-none fixed z-40 block select-none"
      style={{
        top: ghost.top,
        left: ghost.left,
        width: ghost.width,
        maxWidth: "min(92vw, 42rem)",
        color: "var(--text-faint)",
        transformOrigin: "left top",
        maxHeight: "6.4em",
        overflow: "hidden",
      }}
      initial={{ opacity: 0.5, scale: 1, y: 0 }}
      animate={{ opacity: 0, scale: reduce ? 1 : 0.965, y: reduce ? 0 : -4 }}
      transition={
        reduce ? { duration: 0.001 } : { duration: 0.28, ease: [0.3, 0.1, 0.2, 1] }
      }
    >
      {ghost.text}
    </motion.span>
  );
}

export default EditGhost;
