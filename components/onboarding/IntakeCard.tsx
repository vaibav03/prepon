"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export interface IntakeCardProps {
  label: string;
  title: string;
  description: string;
  footnote: string;
  /** Short receipt shown after something is added. Cleared by the caller. */
  note?: string | null;
  children: ReactNode;
}

/**
 * The shell all three ways in share. Identical header, identical footer,
 * identical weight — paste is not a tab and upload is not the real one.
 */
export function IntakeCard({
  label,
  title,
  description,
  footnote,
  note,
  children,
}: IntakeCardProps) {
  const reduce = useReducedMotion();

  return (
    <section className="flex min-w-0 flex-col rounded-[4px] border border-hairline bg-raised">
      <header className="border-b border-hairline px-4 py-3.5">
        <p className="prepon-label">{label}</p>
        <h3
          className="mt-1.5 font-serif text-title text-primary"
          style={{ letterSpacing: "-0.012em" }}
        >
          {title}
        </h3>
        <p className="mt-1.5 text-ui text-secondary">{description}</p>
      </header>

      <div className="flex flex-1 flex-col gap-3 px-4 py-4">{children}</div>

      <div className="px-4" aria-live="polite">
        <AnimatePresence initial={false} mode="wait">
          {note ? (
            <motion.p
              key={note}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.09 } }}
              transition={{
                duration: reduce ? 0 : 0.18,
                ease: [0.22, 0.61, 0.36, 1],
              }}
              className="prepon-numeric border-l-2 border-accent pb-3 pl-2.5 text-ui text-secondary"
            >
              {note}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      <footer className="border-t border-hairline px-4 py-2.5">
        <p className="text-micro text-faint">{footnote}</p>
      </footer>
    </section>
  );
}

export default IntakeCard;
