import clsx from "clsx";
import Prose from "@/components/ui/Prose";
import type { ProgressReading } from "./readout";

const MARK_COLOR: Record<ProgressReading["verdict"], string> = {
  working: "var(--state-live)",
  "early-above": "var(--state-proposed)",
  "early-below": "var(--state-proposed)",
  failing: "var(--state-expiring)",
};

export interface ProgressVerdictProps {
  reading: ProgressReading;
  className?: string;
}

/**
 * The plain-English read. When the latest point sits under the kill line this
 * says so in the first sentence rather than burying it under the chart.
 */
export function ProgressVerdict({ reading, className }: ProgressVerdictProps) {
  return (
    <section className={clsx("flex gap-4", className)} aria-label="The read">
      <span
        aria-hidden="true"
        className="mt-1.5 w-[2px] shrink-0 rounded-[1px]"
        style={{ backgroundColor: MARK_COLOR[reading.verdict] }}
      />
      <div className="min-w-0">
        <h2 className="font-serif text-title text-primary">
          {reading.headline}
        </h2>
        <Prose className="mt-2">
          <p>{reading.detail}</p>
        </Prose>
      </div>
    </section>
  );
}

export default ProgressVerdict;
