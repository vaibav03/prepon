"use client";

import { motion, useReducedMotion } from "motion/react";

import Eyebrow from "@/components/site/Eyebrow";
import Section from "@/components/site/Section";
import { EASE_OUT } from "./motion";

/* ---------------------------------------------------------------------------
   The kill-line chart.

   Sample data, drawn to show the shape of the test rather than a result.
   Geometry is fixed in a 360x184 viewBox: plot area x 34 -> 352, y 14 -> 150,
   vertical domain 40% -> 80% win rate, horizontal domain 0 -> 100 edits.
   --------------------------------------------------------------------------- */

/** Four hairline gridlines. The 60% line is drawn separately, as the threshold. */
const GRIDLINES = [
  { y: 14, label: "80%" },
  { y: 48, label: null },
  { y: 116, label: null },
  { y: 150, label: "40%" },
] as const;

const KILL_Y = 82;

const X_TICKS = [
  { x: 34, label: "0", anchor: "start" as const },
  { x: 193, label: "50", anchor: "middle" as const },
  { x: 352, label: "100", anchor: "end" as const },
];

const SERIES = "M34 126 L98 119 L161 102 L225 89 L288 72 L352 58";

function KillLineChart() {
  const reduced = useReducedMotion();

  return (
    <figure className="mx-auto mt-6 w-full max-w-[480px]">
      <div className="rounded-panel border border-hairline bg-card px-4 pt-4 pb-3 sm:px-5">
        <svg
          viewBox="0 0 360 184"
          width="100%"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-labelledby="killchart-title killchart-desc"
          className="block h-auto w-full overflow-visible"
        >
          <title id="killchart-title">
            Win rate against blind pairs as captured edits accumulate
          </title>
          <desc id="killchart-desc">
            Sample data. Win rate starts at 47 percent with no captured edits
            and rises to 67 percent at one hundred captured edits, crossing the
            60 percent kill line at roughly seventy.
          </desc>

          {/* gridlines */}
          {GRIDLINES.map((line) => (
            <line
              key={line.y}
              x1={34}
              x2={352}
              y1={line.y}
              y2={line.y}
              stroke="var(--hairline)"
              strokeWidth={1}
            />
          ))}

          {/* y labels */}
          {GRIDLINES.filter((line) => line.label).map((line) => (
            <text
              key={`y-${line.y}`}
              x={28}
              y={line.y}
              dy={3}
              textAnchor="end"
              fontSize={10}
              fill="var(--text-faint)"
              className="prepon-numeric"
            >
              {line.label}
            </text>
          ))}

          {/* the 60% kill line, drawn before the data */}
          <line
            x1={34}
            x2={352}
            y1={KILL_Y}
            y2={KILL_Y}
            stroke="var(--state-expiring)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <text
            x={34}
            y={KILL_Y - 6}
            textAnchor="start"
            fontSize={10}
            fill="var(--state-expiring)"
          >
            60% &mdash; kill line
          </text>

          {/* the data */}
          <motion.path
            d={SERIES}
            fill="none"
            stroke="var(--text-primary)"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduced ? false : { pathLength: 0 }}
            whileInView={reduced ? undefined : { pathLength: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          />

          {/* x labels */}
          {X_TICKS.map((tick) => (
            <text
              key={tick.label}
              x={tick.x}
              y={170}
              textAnchor={tick.anchor}
              fontSize={10}
              fill="var(--text-faint)"
              className="prepon-numeric"
            >
              {tick.label}
            </text>
          ))}
        </svg>

        <p className="prepon-label mt-1 text-center">Edits captured</p>
      </div>

      <figcaption className="mt-2.5 text-ui text-faint">
        Sample data, not a measurement. It shows the shape of the test: win
        rate in blind pairs crossing the 60% line somewhere around seventy
        captured edits — or the rules do not earn their keep.
      </figcaption>
    </figure>
  );
}

/**
 * The kill line. This occupies the slot a reference site gives to a customer
 * story, so it has to carry more: the baseline we measure against, the number
 * that would end this, and what is plainly not true yet.
 */
export function HonestNote() {
  return (
    <Section
      id="honest"
      className="prepon-band"
      align="center"
      eyebrow={<Eyebrow rule>What would make us wrong</Eyebrow>}
      title={<>The number that would kill this.</>}
      headerClassName="prepon-band-head"
    >
      <div className="mx-auto w-full max-w-narrow text-center">
        <p className="text-ui-lg text-secondary">
          The baseline is not a stripped-down model. It is the same frontier
          model handed a style guide the writer wrote themselves, in one
          sitting, then frozen.
        </p>
        <p className="mt-3.5 text-ui-lg text-secondary">
          Same prompts, same model, two sets of instructions: one written by
          hand, one learned from edits. Both answers go into a blind pair and
          the writer picks. If Prepon is not winning more than 60% of those
          pairs after a hundred captured edits, the rules cost more attention
          than they return, and we say so.
        </p>

        <KillLineChart />

        <p className="mx-auto mt-5 max-w-[46ch] text-ui-lg text-primary">
          No users yet. No revenue. The test above is the one we intend to run,
          not one we have run.
        </p>
      </div>
    </Section>
  );
}

export default HonestNote;
