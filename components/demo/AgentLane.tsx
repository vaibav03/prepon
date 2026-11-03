"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

import { RuleCard } from "./RuleCard";
import { COPY } from "./script";
import { clamp01 } from "./timing";
import type { LaneScene } from "./scene";

export interface AgentLaneProps {
  lane: LaneScene;
  reduced: boolean;
}

interface StageRowProps {
  index: number;
  label: string;
  state: "waiting" | "active" | "done";
  fill: number;
  children?: ReactNode;
}

function StageRow({ index, label, state, fill, children }: StageRowProps) {
  return (
    <div className="relative pb-2">
      <div className="flex items-baseline gap-2.5">
        <span
          className={clsx(
            "prepon-numeric text-micro",
            state === "waiting" ? "text-faint/50" : "text-faint",
          )}
        >
          {index + 1}
        </span>
        <span
          className={clsx(
            "text-ui transition-colors duration-300",
            state === "active"
              ? "text-primary"
              : state === "done"
                ? "text-faint"
                : "text-faint/55",
          )}
        >
          {label}
        </span>
        {state === "done" ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            className="ml-auto size-3 shrink-0"
          >
            <path
              d="M2.5 6.4 L4.8 8.7 L9.5 3.6"
              fill="none"
              stroke="var(--state-live)"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </div>

      {children}

      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-px w-full bg-hairline"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-px w-full origin-left bg-accent will-change-transform"
        style={{ transform: `scaleX(${clamp01(fill)})` }}
      />
    </div>
  );
}

interface PairRowProps {
  label: string;
  text: string;
  tone: "was" | "now";
  reveal: number;
}

function PairRow({ label, text, tone, reveal }: PairRowProps) {
  return (
    <div
      className="flex gap-2.5 will-change-transform"
      style={{
        opacity: reveal,
        transform: `translate3d(${(1 - reveal) * -10}px, 0, 0)`,
      }}
    >
      <span className="prepon-label mt-0.5 w-7 shrink-0">{label}</span>
      <p
        className={clsx(
          "min-w-0 text-ui",
          tone === "was"
            ? "text-retired line-clamp-2 line-through decoration-from-font"
            : "text-ink-user",
        )}
      >
        {text}
      </p>
    </div>
  );
}

/**
 * The agent's half of the frame. It sits visibly idle until the writer
 * pushes back, then works in three legible stages: read the edit, find the
 * pattern, check it against what this writer has complained about before.
 *
 * The lane reserves no height of its own. It used to hold ~470px open from
 * the first frame for a rule card that does not exist until the fourth beat,
 * which is most of why the demo opened as a tall empty box.
 */
export function AgentLane({ lane, reduced }: AgentLaneProps) {
  const stageState = (i: number): "waiting" | "active" | "done" =>
    lane.stage > i ? "done" : lane.stage === i ? "active" : "waiting";

  const pairA = clamp01(lane.pairIn * 2);
  const pairB = clamp01(lane.pairIn * 2 - 1);

  return (
    <div className="flex min-w-0 flex-col rounded-card border border-hairline bg-sunken p-3 min-[560px]:p-3.5">
      <div className="mb-3 flex items-center gap-2">
        <span className="prepon-label">Agent</span>
        <span className="ml-auto flex items-center gap-2 text-ui text-faint">
          <motion.span
            className={clsx(
              "size-1.5 rounded-full",
              lane.live ? "bg-live" : lane.awake ? "bg-proposed" : "bg-faint/60",
            )}
            animate={
              reduced || !lane.awake || lane.live
                ? { opacity: 1 }
                : { opacity: [1, 0.35, 1] }
            }
            transition={
              reduced || !lane.awake || lane.live
                ? { duration: 0.2 }
                : { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
            }
          />
          {lane.live ? "rule live" : lane.awake ? "working" : "watching"}
        </span>
      </div>

      <AnimatePresence initial={false} mode="wait">
      {lane.awake ? (
        <motion.div
          key="stages"
          className="flex flex-col gap-2"
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <StageRow
            index={0}
            label={COPY.stages[0]}
            state={stageState(0)}
            fill={lane.stageFill[0]}
          >
            <div className="mt-2 flex flex-col gap-1.5">
              <PairRow
                label="was"
                text={COPY.draftOpen}
                tone="was"
                reveal={pairA}
              />
              <PairRow
                label="now"
                text={COPY.rewrite}
                tone="now"
                reveal={pairB}
              />
            </div>
          </StageRow>

          <StageRow
            index={1}
            label={COPY.stages[1]}
            state={stageState(1)}
            fill={lane.stageFill[1]}
          />
          <StageRow
            index={2}
            label={COPY.stages[2]}
            state={stageState(2)}
            fill={lane.stageFill[2]}
          />
        </motion.div>
      ) : (
        <motion.p
          key="idle"
          className="text-ui text-faint/80"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.16, ease: [0.22, 0.61, 0.36, 1] }}
        >
          Nothing fires until the writer pushes back.
        </motion.p>
      )}
      </AnimatePresence>

      {/* No reserved slot: the card brings its own space when it arrives,
          and the lane is exactly as tall as what is in it. */}
      <AnimatePresence initial={false}>
        {lane.cardPresent ? (
          <RuleCard key="card" lane={lane} reduced={reduced} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default AgentLane;
