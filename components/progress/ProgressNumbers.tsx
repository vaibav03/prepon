import clsx from "clsx";
import Stat from "@/components/ui/Stat";
import type { ProgressReading } from "./readout";
import { formatPercent } from "./readout";

export interface ProgressNumbersProps {
  reading: ProgressReading;
  liveRules: number;
  totalRules: number;
  className?: string;
}

/**
 * The four readings the chart is answerable to. Instruments, not scores: no
 * deltas dressed in green arrows, no targets, nothing to beat.
 */
export function ProgressNumbers({
  reading,
  liveRules,
  totalRules,
  className,
}: ProgressNumbersProps) {
  return (
    <div
      className={clsx(
        "flex flex-wrap gap-x-10 gap-y-5 border-t border-hairline pt-5",
        className,
      )}
    >
      <Stat label="Edits captured" value={reading.editsCaptured} />
      <Stat
        label="Rules live"
        value={liveRules}
        note={`of ${totalRules}`}
      />
      <Stat
        label="Win rate"
        value={formatPercent(reading.winRate)}
        note="blind picks"
      />
      <Stat
        label={reading.crossing ? "Clear of the line since" : "Clear of the line"}
        value={reading.crossing ? reading.crossing.edits : "not yet"}
        muted={!reading.crossing}
        note={reading.crossing ? "edits" : undefined}
      />
    </div>
  );
}

export default ProgressNumbers;
