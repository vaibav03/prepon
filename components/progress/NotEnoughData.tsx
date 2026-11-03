import clsx from "clsx";
import Prose from "@/components/ui/Prose";
import Stat from "@/components/ui/Stat";
import WinRateChart from "./WinRateChart";
import { DECISION_EDITS, MIN_EDITS } from "./readout";

export interface NotEnoughDataProps {
  editsCaptured: number;
  liveRules: number;
  className?: string;
}

/**
 * The honest empty state: the frame and the kill line are drawn, the line is
 * not, and the copy says why rather than showing a flattering early number.
 */
export function NotEnoughData({
  editsCaptured,
  liveRules,
  className,
}: NotEnoughDataProps) {
  const remaining = Math.max(MIN_EDITS - editsCaptured, 0);

  return (
    <div className={clsx(className)}>
      <div className="flex flex-wrap gap-x-10 gap-y-5 border-t border-hairline pt-5">
        <Stat label="Edits captured" value={editsCaptured} note={`of ${MIN_EDITS}`} />
        <Stat label="Rules live" value={liveRules} />
        <Stat label="Win rate" value="—" muted note="not measured" />
      </div>

      <WinRateChart points={[]} className="mt-8" />

      <section className="mt-10 flex gap-4" aria-label="The read">
        <span
          aria-hidden="true"
          className="mt-1.5 w-[2px] shrink-0 rounded-[1px]"
          style={{ backgroundColor: "var(--state-proposed)" }}
        />
        <div className="min-w-0">
          <h2 className="font-serif text-title text-primary">
            Not enough yet to draw an honest line.
          </h2>
          <Prose className="mt-2">
            <p>
              Prepon has {editsCaptured}{" "}
              {editsCaptured === 1 ? "edit" : "edits"} from you. A win rate
              computed on fewer than {MIN_EDITS} is noise with an axis drawn
              under it, so there is no line here — {remaining} more edits and the
              first checkpoint lands. The 60% it will have to beat by{" "}
              {DECISION_EDITS} edits is already on the chart, and it was set
              before any of this ran.
            </p>
          </Prose>
        </div>
      </section>
    </div>
  );
}

export default NotEnoughData;
