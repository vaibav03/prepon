"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import HealthMeter from "@/components/ui/HealthMeter";
import Prose from "@/components/ui/Prose";
import ActionButton from "./ActionButton";
import { KIND_LABEL } from "./data";
import type { Observation } from "./types";

export interface ObservationRowProps {
  observation: Observation;
  /** Label of the corpus source it was derived from. */
  sourceLabel: string;
  /** Position in the stagger. */
  index: number;
  /** False once the specification has already assembled in this session. */
  animate: boolean;
  reduce: boolean;
  dropped: boolean;
  onToggleDrop: () => void;
}

/** 0.06 + 6 × 0.12 + 0.22 ≈ 1.0s for the whole stagger, once. */
const STAGGER_STEP = 0.12;
const STAGGER_LEAD = 0.06;

export function ObservationRow({
  observation,
  sourceLabel,
  index,
  animate,
  reduce,
  dropped,
  onToggleDrop,
}: ObservationRowProps) {
  const delay = reduce ? 0 : STAGGER_LEAD + index * STAGGER_STEP;

  return (
    <motion.li
      initial={
        animate ? (reduce ? { opacity: 0 } : { opacity: 0, y: 8 }) : false
      }
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{
        duration: reduce ? 0 : 0.22,
        delay,
        ease: [0.22, 0.61, 0.36, 1],
      }}
      className="relative py-5 pl-4 sm:pl-5"
    >
      <span
        aria-hidden="true"
        className="absolute top-5 bottom-5 left-0 w-0"
        style={{ borderLeft: "1px dashed var(--hairline-strong)" }}
      />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="prepon-label">
          {dropped ? "Dropped" : "Inferred"}
        </span>
        <span
          aria-hidden="true"
          className="text-micro text-faint"
        >
          ·
        </span>
        <span
          className="text-micro text-faint uppercase"
          style={{ letterSpacing: "0.08em" }}
        >
          {KIND_LABEL[observation.kind]}
        </span>
      </div>

      <Prose
        as="p"
        width="measure"
        size="prose-lg"
        className={clsx(
          "mt-2 transition-colors duration-150 ease-out",
          dropped ? "text-faint line-through decoration-hairline-strong" : "text-ink-ai",
        )}
      >
        {observation.text}
      </Prose>

      <p className="mt-2.5 max-w-measure text-ui text-secondary">
        {observation.basis}
      </p>

      <p className="mt-1 text-micro text-faint">
        Derived from {sourceLabel}
      </p>

      <div className="mt-3.5 flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="flex items-center gap-2.5">
          <HealthMeter
            value={observation.confidence}
            status="proposed"
            showValue
          />
          <span className="prepon-label">inferred confidence</span>
        </span>
        <ActionButton variant="plain" onClick={onToggleDrop}>
          {dropped ? "Put it back" : "Drop it"}
        </ActionButton>
      </div>

      {observation.volatile && !dropped ? (
        <p className="mt-2.5 text-micro text-expiring">
          Thin evidence. Expect your first correction in this area to overwrite
          it.
        </p>
      ) : null}
    </motion.li>
  );
}

export default ObservationRow;
