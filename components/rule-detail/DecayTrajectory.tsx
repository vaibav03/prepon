import type { Rule, RuleStatus } from "@/lib/types";
import HealthMeter from "@/components/ui/HealthMeter";
import Stat from "@/components/ui/Stat";
import { formatDay } from "./format";
import {
  buildTrajectory,
  DIRECTION_SENTENCE,
  EXPIRY_THRESHOLD,
} from "./trajectory";

const STATE_COLOR: Record<RuleStatus, string> = {
  live: "var(--state-live)",
  proposed: "var(--state-proposed)",
  expiring: "var(--state-expiring)",
  retired: "var(--state-retired)",
};

/* Plot geometry. One viewBox, scaled by CSS; no text inside the SVG, so the
   labels stay legible at 390px and at 1400px alike. */
const W = 640;
const H = 150;
const PAD_X = 5;
const HEALTH_TOP = 8;
const HEALTH_BOTTOM = 78;
const DIVIDER_Y = 90;
const COLUMN_BASE = 146;
const COLUMN_MAX = 50;

export interface DecayTrajectoryProps {
  rule: Rule;
  status: RuleStatus;
  pinned: boolean;
}

/**
 * Applied, kept and reverted week by week, with the health reading those
 * counters produce. An instrument: no axes, no gridlines, one threshold line
 * because the threshold is the only number on it that means anything.
 */
export function DecayTrajectory({ rule, status, pinned }: DecayTrajectoryProps) {
  const { weeks, peakApplied, direction, delta } = buildTrajectory(rule);
  const color = STATE_COLOR[status];

  if (weeks.length === 0) {
    return (
      <div className="max-w-measure">
        <p className="prepon-prose text-secondary">
          {status === "proposed"
            ? "Nothing to plot yet. Decay starts the day a rule goes live: every time it applies, Prepon records whether you left the sentence alone or put your own back."
            : "This rule has only just gone live. The first health reading lands once it has applied twenty times."}
        </p>
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-hairline pt-5">
          <div>
            <Stat label="Applied" value={0} muted />
          </div>
          <div>
            <Stat label="Kept" value={0} muted />
          </div>
          <div>
            <Stat label="Reverted" value={0} muted />
          </div>
        </div>
      </div>
    );
  }

  const n = weeks.length;
  const inner = W - PAD_X * 2;
  const x = (i: number) => PAD_X + (n === 1 ? inner / 2 : (inner * i) / (n - 1));
  const yHealth = (h: number) =>
    HEALTH_BOTTOM - h * (HEALTH_BOTTOM - HEALTH_TOP);
  const columnWidth = Math.max(3, Math.min(11, (inner / n) * 0.4));

  const line = weeks
    .map((w, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(2)} ${yHealth(w.health).toFixed(2)}`)
    .join(" ");
  const area = `${line} L${x(n - 1).toFixed(2)} ${HEALTH_BOTTOM} L${x(0).toFixed(2)} ${HEALTH_BOTTOM} Z`;

  const last = weeks[n - 1];
  const totalApplied = weeks.reduce((sum, w) => sum + w.applied, 0);
  const expired = rule.health < EXPIRY_THRESHOLD;

  return (
    <div>
      <div className="flex flex-wrap gap-x-10 gap-y-5 border-b border-hairline pb-6">
        <div>
          <Stat label="Applied" value={rule.applied} note="times" />
        </div>
        <div>
          <Stat label="Kept as written" value={rule.kept} />
        </div>
        <div>
          <Stat label="Reverted by you" value={rule.reverted} />
        </div>
        <div className="flex flex-col gap-0.5">
          <HealthMeter value={rule.health} status={status} />
          <span className="prepon-label">
            {status === "proposed" ? "Replay confidence" : "Health"}
          </span>
        </div>
      </div>

      <figure className="mt-7">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={`Weekly trajectory. Applied ${totalApplied} times across ${n} weeks, ending at a health reading of ${rule.health.toFixed(2)}.`}
        >
          {/* 0.25: below this a rule drops out of the live set. */}
          <line
            x1={PAD_X}
            x2={W - PAD_X}
            y1={yHealth(EXPIRY_THRESHOLD)}
            y2={yHealth(EXPIRY_THRESHOLD)}
            stroke="var(--hairline-strong)"
            strokeWidth={1}
            strokeDasharray="3 4"
            vectorEffect="non-scaling-stroke"
          />
          <path d={area} fill={color} fillOpacity={0.09} />
          <path
            d={line}
            fill="none"
            stroke={color}
            strokeWidth={1.75}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx={x(n - 1)} cy={yHealth(last.health)} r={3} fill={color} />

          <line
            x1={0}
            x2={W}
            y1={DIVIDER_Y}
            y2={DIVIDER_Y}
            stroke="var(--hairline)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />

          {weeks.map((w, i) => {
            const height = (w.applied / peakApplied) * COLUMN_MAX;
            const revertedHeight =
              w.applied > 0 ? (w.reverted / w.applied) * height : 0;
            const keptHeight = height - revertedHeight;
            const left = x(i) - columnWidth / 2;
            return (
              <g key={w.index}>
                {keptHeight > 0 ? (
                  <rect
                    x={left}
                    y={COLUMN_BASE - keptHeight}
                    width={columnWidth}
                    height={keptHeight}
                    fill={color}
                    fillOpacity={0.3}
                  />
                ) : null}
                {revertedHeight > 0 ? (
                  <rect
                    x={left}
                    y={COLUMN_BASE - height}
                    width={columnWidth}
                    height={Math.max(1.5, revertedHeight)}
                    fill="var(--accent)"
                    fillOpacity={0.85}
                  />
                ) : null}
              </g>
            );
          })}
        </svg>

        <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <span className="prepon-numeric text-micro uppercase text-faint" style={{ letterSpacing: "0.06em" }}>
            {formatDay(rule.createdAt)}
          </span>
          <span className="prepon-label">This week</span>
        </figcaption>
      </figure>

      <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-hairline pt-4">
        <li className="flex items-center gap-2 text-ui text-faint">
          <span
            aria-hidden="true"
            className="inline-block h-[8px] w-[8px] rounded-[1px]"
            style={{ backgroundColor: color, opacity: 0.3 }}
          />
          Kept
        </li>
        <li className="flex items-center gap-2 text-ui text-faint">
          <span
            aria-hidden="true"
            className="inline-block h-[8px] w-[8px] rounded-[1px]"
            style={{ backgroundColor: "var(--accent)", opacity: 0.85 }}
          />
          Reverted
        </li>
        <li className="flex items-center gap-2 text-ui text-faint">
          <span
            aria-hidden="true"
            className="inline-block h-[2px] w-[14px]"
            style={{ backgroundColor: color }}
          />
          Health
        </li>
        <li className="flex items-center gap-2 text-ui text-faint">
          <span
            aria-hidden="true"
            className="inline-block h-0 w-[14px]"
            style={{ borderTop: "1px dashed var(--hairline-strong)" }}
          />
          0.25, where a rule expires
        </li>
      </ul>

      <p className="prepon-prose mt-7 max-w-measure text-secondary">
        {DIRECTION_SENTENCE[direction]}{" "}
        <span className="prepon-numeric">
          {delta >= 0 ? "+" : "−"}
          {Math.abs(delta).toFixed(2)}
        </span>{" "}
        over the last three weeks.{" "}
        {pinned
          ? "Pinned, so it holds its slot in the live set whatever the reading does."
          : expired
            ? "It is already under 0.25, which is why it is no longer running."
            : status === "expiring"
              ? `At ${rule.health.toFixed(2)} it is close to the 0.25 line. Keep it and the reading recovers; revert it twice more and it drops out.`
              : "A rule decays when weeks pass without it applying, and drops fast when you revert it."}
      </p>
    </div>
  );
}

export default DecayTrajectory;
