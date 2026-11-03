import Stat from "@/components/ui/Stat";
import { LIVE_CAP } from "./ruleMath";

export interface CapReadoutProps {
  live: number;
  decaying: number;
  proposed: number;
}

/**
 * The cap, read as an instrument: three counts in tabular figures. Not a bar,
 * not a target — 60 is a ceiling the set presses against, not a goal.
 */
export function CapReadout({ live, decaying, proposed }: CapReadoutProps) {
  return (
    <div className="flex flex-wrap items-start gap-x-8 gap-y-4 md:justify-end">
      <Stat label="Live" value={live} note={`of ${LIVE_CAP}`} />
      <Stat label="Decaying" value={decaying} muted={decaying === 0} />
      <Stat label="Proposed" value={proposed} muted={proposed === 0} />
    </div>
  );
}

export default CapReadout;
