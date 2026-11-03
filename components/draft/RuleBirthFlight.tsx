"use client";

import { motion } from "motion/react";

export interface FlightSpec {
  id: string;
  phrase: string;
  from: { top: number; left: number; width: number };
  to: { top: number; left: number; width: number };
}

export interface RuleBirthFlightProps {
  flight: FlightSpec;
}

/**
 * The most important animation in the product: the phrase the writer just
 * rewrote leaves the draft and compresses into the rule card waiting in the
 * rail. A measured FLIP — the real rects of both ends — so it reads as one
 * object moving through space rather than one thing fading into another.
 *
 * It never runs under reduced motion; the caller skips straight to the card.
 */
export function RuleBirthFlight({ flight }: RuleBirthFlightProps) {
  return (
    <motion.span
      aria-hidden="true"
      className="prepon-prose pointer-events-none fixed z-50 block select-none"
      style={{
        color: "var(--text-secondary)",
        maxHeight: "4.2em",
        overflow: "hidden",
      }}
      initial={{
        top: flight.from.top,
        left: flight.from.left,
        width: flight.from.width,
        fontSize: "1.0625rem",
        lineHeight: 1.72,
        opacity: 1,
      }}
      animate={{
        top: flight.to.top,
        left: flight.to.left,
        width: flight.to.width,
        fontSize: "0.9375rem",
        lineHeight: 1.45,
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 0.33,
        ease: [0.22, 0.61, 0.36, 1],
        opacity: { duration: 0.33, times: [0, 0.62, 1], ease: "linear" },
      }}
    >
      {flight.phrase}
    </motion.span>
  );
}

export default RuleBirthFlight;
