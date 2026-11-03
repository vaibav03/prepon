"use client";

import clsx from "clsx";
import { STEP_LABEL, STEP_NUMBER } from "./data";
import { STEP_IDS, type StepId } from "./types";

export interface StepRailProps {
  current: StepId;
  /** A short instrument reading under each label, e.g. "4 sources". */
  readings: Record<StepId, string>;
  onSelect: (id: StepId) => void;
}

/**
 * Four passes, all reachable at all times. No locks, no ticks, no completion
 * state — the rail reports where you are and what each pass currently holds,
 * and nothing about it rewards getting to the end.
 */
export function StepRail({ current, readings, onSelect }: StepRailProps) {
  return (
    <nav aria-label="Setup passes" className="border-y border-hairline">
      <ol className="flex w-full overflow-x-auto">
        {STEP_IDS.map((id) => {
          const active = id === current;
          return (
            <li
              key={id}
              className="relative shrink-0 md:min-w-0 md:flex-1 md:shrink"
            >
              <button
                type="button"
                onClick={() => onSelect(id)}
                aria-current={active ? "step" : undefined}
                className={clsx(
                  "flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left",
                  "transition duration-150 ease-out",
                  active
                    ? "text-primary"
                    : "text-faint hover:text-secondary",
                )}
              >
                <span className="prepon-numeric text-micro text-faint">
                  {STEP_NUMBER[id]}
                </span>
                <span className="text-ui-lg whitespace-nowrap md:whitespace-normal">
                  {STEP_LABEL[id]}
                </span>
                <span className="prepon-numeric text-micro text-faint whitespace-nowrap">
                  {readings[id]}
                </span>
              </button>
              <span
                aria-hidden="true"
                className={clsx(
                  "pointer-events-none absolute inset-x-0 -bottom-px h-[2px]",
                  active ? "bg-accent" : "bg-transparent",
                )}
              />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default StepRail;
