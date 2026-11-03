"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import clsx from "clsx";
import type { WinRatePoint } from "@/lib/types";
import {
  DECISION_EDITS,
  KILL_LINE,
  Y_GRIDLINES,
  Y_LABELS,
  Y_MAX,
  Y_MIN,
  clampRate,
  formatPercent,
  readProgress,
} from "./readout";

/** Breathing room inside the plot so points on the domain edge are not clipped. */
const INSET_Y = 8;
const INSET_R = 8;
/** Room reserved outside the plot for the axis labels. */
const PAD_L = 44;
const PAD_B = 28;

const LINE_DURATION = 0.6;

function niceStep(raw: number): number {
  for (const candidate of [5, 10, 20, 25, 50, 100, 200, 500]) {
    if (raw <= candidate) return candidate;
  }
  return 1000;
}

function xTicksFor(xMax: number): number[] {
  const step = niceStep(xMax / 3);
  const ticks: number[] = [];
  for (let t = 0; t <= xMax; t += step) ticks.push(t);
  return ticks;
}

interface Annotation {
  key: string;
  edits: number;
  winRate: number;
  text: string;
  align: "left" | "center" | "right";
  place: "above" | "below";
  color: string;
}

const ALIGN_SHIFT: Record<Annotation["align"], string> = {
  left: "0",
  center: "-50%",
  right: "-100%",
};

export interface WinRateChartProps {
  points: WinRatePoint[];
  className?: string;
}

/**
 * One honest chart. The kill line, the gridlines and both axes are plain CSS, so
 * they are on the page before any data arrives and before any script runs; only
 * the data line and its points need measurement, and they draw in once.
 */
export function WinRateChart({ points, className }: WinRateChartProps) {
  const prefersReduced = Boolean(useReducedMotion());
  const plotRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descId = `${baseId}-desc`;

  useEffect(() => {
    const el = plotRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const reading = readProgress(points);
  const hasData = points.length > 0;
  const xMax = Math.max(reading.editsCaptured, DECISION_EDITS);
  const xTicks = xTicksFor(xMax);

  const yFrac = (value: number) =>
    (Y_MAX - clampRate(value)) / (Y_MAX - Y_MIN);
  const yCss = (value: number, offset = 0) =>
    `calc(${INSET_Y + offset}px + (100% - ${INSET_Y * 2}px) * ${yFrac(value)})`;
  const xCss = (edits: number) =>
    `calc((100% - ${INSET_R}px) * ${Math.min(edits / xMax, 1)})`;

  const xPx = (edits: number) =>
    Math.min(edits / xMax, 1) * Math.max(size.w - INSET_R, 0);
  const yPx = (value: number) =>
    INSET_Y + Math.max(size.h - INSET_Y * 2, 0) * yFrac(value);

  const path = points
    .map(
      (point, i) =>
        `${i === 0 ? "M" : "L"}${xPx(point.edits).toFixed(2)} ${yPx(point.winRate).toFixed(2)}`,
    )
    .join(" ");

  const stateColor = reading.aboveLine
    ? "var(--state-live)"
    : "var(--state-expiring)";

  const annotations: Annotation[] = [];
  if (hasData) {
    const first = reading.first;
    const latest = reading.latest;
    const crossing = reading.crossing;

    annotations.push({
      key: "first",
      edits: first.edits,
      winRate: first.winRate,
      text: `${formatPercent(first.winRate)} at the start`,
      align: "left",
      place: "below",
      color: "var(--text-secondary)",
    });

    if (crossing && crossing !== first && crossing !== latest) {
      annotations.push({
        key: "crossing",
        edits: crossing.edits,
        winRate: crossing.winRate,
        // Anchored to the left of the point and above it: the only quadrant
        // around the crossing that the data line never enters.
        text: `clear at ${crossing.edits} edits`,
        align: "right",
        place: "above",
        color: "var(--text-secondary)",
      });
    }

    if (points.length > 1) {
      annotations.push({
        key: "latest",
        edits: latest.edits,
        winRate: latest.winRate,
        text: `${formatPercent(latest.winRate)} now`,
        align: "right",
        place: "above",
        color: stateColor,
      });
    }
  }

  const title = hasData
    ? `Win rate against a plain prompt, measured over ${reading.checkpoints} checkpoints`
    : "Win rate against a plain prompt, not yet measured";

  const description = hasData
    ? `Line chart. The vertical axis is the share of blind picks that went to the draft written ` +
      `through your rules, from 40 to 80 percent. The horizontal axis is the number of your edits ` +
      `captured, from 0 to ${xMax}. A dashed 60 percent kill line runs across the chart. The line ` +
      `starts at ${formatPercent(reading.first.winRate)} after ${reading.first.edits} edits and ` +
      `reaches ${formatPercent(reading.winRate)} after ${reading.editsCaptured} edits, rising ` +
      `unevenly in between. ` +
      (reading.crossing
        ? `It first held above the kill line at ${reading.crossing.edits} edits and has stayed above it since. `
        : `It has not held above the kill line. `) +
      `The latest reading sits ${reading.aboveLine ? "above" : "below"} the line.`
    : `Line chart, empty. The dashed 60 percent kill line and both axes are drawn, but no win rate ` +
      `has been measured yet. The horizontal axis runs to ${DECISION_EDITS} edits, the point by ` +
      `which the win rate has to be clearly above the line.`;

  return (
    <figure className={clsx("m-0", className)}>
      <div
        className="rounded-[3px] border border-hairline bg-raised px-4 pt-5 pb-3 sm:px-6 sm:pt-6"
      >
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <span className="prepon-label">
            Win rate against a plain prompt
          </span>
          <span className="prepon-numeric text-micro text-faint">
            {hasData ? `${reading.checkpoints} checkpoints` : "no checkpoints yet"}
          </span>
        </div>

        <div style={{ paddingLeft: PAD_L, paddingBottom: PAD_B }}>
          <div
            ref={plotRef}
            className="relative h-[196px] sm:h-[240px] lg:h-[280px]"
          >
            {/* Gridlines: at most four, hairlines, behind everything. */}
            {Y_GRIDLINES.map((value) => (
              <div
                key={value}
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 border-t border-hairline"
                style={{ top: yCss(value) }}
              />
            ))}

            {/* The kill line. Drawn before the data, always visible. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-faint"
              style={{ top: yCss(KILL_LINE) }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-0 text-micro text-faint"
              style={{ top: yCss(KILL_LINE, 6) }}
            >
              the line this has to beat
            </span>

            {/* y axis: percentages, the kill line's own reading set a shade darker. */}
            {Y_LABELS.map((value) => (
              <span
                key={value}
                aria-hidden="true"
                className={clsx(
                  "prepon-numeric pointer-events-none absolute text-right text-micro",
                  value === KILL_LINE ? "text-secondary" : "text-faint",
                )}
                style={{
                  top: yCss(value),
                  left: -PAD_L,
                  width: PAD_L - 10,
                  transform: "translateY(-50%)",
                }}
              >
                {formatPercent(value)}
              </span>
            ))}

            {/* x axis: edits captured. */}
            {xTicks.map((tick) => (
              <span
                key={tick}
                aria-hidden="true"
                className="prepon-numeric pointer-events-none absolute top-full mt-2 text-micro whitespace-nowrap text-faint"
                style={{
                  left: xCss(tick),
                  transform:
                    tick === 0
                      ? "translateX(0)"
                      : tick === xMax
                        ? "translateX(-100%)"
                        : "translateX(-50%)",
                }}
              >
                {tick === xTicks[xTicks.length - 1] ? `${tick} edits` : tick}
              </span>
            ))}

            <svg
              className="absolute inset-0 h-full w-full overflow-visible"
              viewBox={`0 0 ${Math.max(size.w, 1)} ${Math.max(size.h, 1)}`}
              role="img"
              aria-labelledby={titleId}
              aria-describedby={descId}
            >
              <title id={titleId}>{title}</title>
              <desc id={descId}>{description}</desc>

              {size.w > 0 && hasData ? (
                <>
                  <motion.path
                    d={path}
                    fill="none"
                    stroke="var(--text-primary)"
                    strokeWidth={1.75}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={prefersReduced ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={
                      prefersReduced
                        ? { duration: 0 }
                        : { duration: LINE_DURATION, ease: "easeOut" }
                    }
                  />
                  <motion.g
                    initial={prefersReduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={
                      prefersReduced
                        ? { duration: 0 }
                        : {
                            duration: 0.18,
                            delay: LINE_DURATION - 0.08,
                            ease: "easeOut",
                          }
                    }
                  >
                    {points.map((point) => {
                      const isLatest = point === reading.latest;
                      const isKey =
                        isLatest ||
                        point === reading.first ||
                        point === reading.crossing;
                      return (
                        <circle
                          key={`${point.edits}-${point.winRate}`}
                          cx={xPx(point.edits)}
                          cy={yPx(point.winRate)}
                          r={isKey ? 3 : 1.75}
                          fill={
                            isLatest ? stateColor : "var(--text-primary)"
                          }
                          opacity={isKey ? 1 : 0.5}
                        />
                      );
                    })}
                  </motion.g>
                </>
              ) : null}
            </svg>

            {/* Point labels live in HTML so their type does not scale with the box. */}
            {size.w > 0
              ? annotations.map((annotation) => (
                  <motion.span
                    key={annotation.key}
                    aria-hidden="true"
                    className="pointer-events-none absolute text-micro whitespace-nowrap"
                    style={{
                      left: xCss(annotation.edits),
                      top: yCss(annotation.winRate),
                      color: annotation.color,
                      transform: `translate(${ALIGN_SHIFT[annotation.align]}, ${
                        annotation.place === "above"
                          ? "calc(-100% - 9px)"
                          : "9px"
                      })`,
                    }}
                    initial={prefersReduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={
                      prefersReduced
                        ? { duration: 0 }
                        : {
                            duration: 0.18,
                            delay: LINE_DURATION - 0.08,
                            ease: "easeOut",
                          }
                    }
                  >
                    {annotation.text}
                  </motion.span>
                ))
              : null}
          </div>
        </div>
      </div>

      <figcaption className="mt-3 max-w-measure text-ui text-secondary">
        Below 60% after {DECISION_EDITS} edits, the loop adds nothing a plain
        prompt would not, and the honest move is to switch it off.
      </figcaption>
    </figure>
  );
}

export default WinRateChart;
