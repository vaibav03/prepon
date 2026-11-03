"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import { useMemo, useRef } from "react";
import type { CSSProperties } from "react";

import { AgentLane } from "./AgentLane";
import { DemoControls } from "./DemoControls";
import { DraftPane } from "./DraftPane";
import { deriveScene } from "./scene";
import { BEATS, TRACK_VH, beatEnd } from "./script";
import { useAutoHeight } from "./useAutoHeight";
import { useMediaQuery } from "./useMediaQuery";
import { useTimeline } from "./useTimeline";
import type { TimelineMode } from "./useTimeline";

import AppFrame from "@/components/site/AppFrame";

export interface DemoProps {
  className?: string;
}

const FOOTNOTE = "Scripted walkthrough. No live model calls.";

/** Padding on the scene, and the grid the two halves sit in. */
const SCENE_PAD = "p-3.5 sm:p-5 min-[900px]:p-6";
const SCENE_GRID = clsx(
  "grid gap-4 sm:gap-5",
  "min-[900px]:grid-cols-[minmax(0,1fr)_300px] min-[900px]:gap-6",
  /* A floor, not a reserve: it keeps the opening beat from reading as a
     sliver, and every beat past it is taller than this anyway. */
  "min-h-[180px] min-[900px]:min-h-[210px]",
);

/**
 * Critically damped, no overshoot. The frame is not thrown between sizes —
 * it settles into the height its content now needs.
 */
const HEIGHT_SPRING = { type: "spring", bounce: 0, duration: 0.45 } as const;

/** Below this the frame is not pinned and the timer plays it instead. */
const PINNED = "(min-width: 900px)";

function Summary() {
  return (
    <p className="sr-only">
      Scripted walkthrough in five beats. A writer asks for a draft, the model
      returns a long hedged one, the writer rewrites the opening sentence and
      says &quot;too long, verdict first&quot;, and the agent turns that edit
      into the rule &quot;give the verdict first&quot;, replays it against
      fourteen past complaints before it takes effect, and applies it to the
      next reply.
    </p>
  );
}

/* ---------------------------------------------------------------------- */

/**
 * The walkthrough, driven by the reader.
 *
 * At 900px and up the frame is pinned inside a tall section and the page's
 * scroll position *is* the timeline: scrolling down plays the five beats,
 * scrolling up plays them backwards — the rule un-promotes, the words
 * un-type — because every pixel on screen is a pure function of one number
 * and nothing in the scene remembers how it got there. Below that, three
 * viewports of hijacked scroll on a phone would be miserable, so the old
 * play-on-enter timer runs instead, play/pause and all.
 */
function LiveDemo({ className }: DemoProps) {
  const pinned = useMediaQuery(PINNED, true);
  const mode: TimelineMode = pinned ? "scroll" : "timer";

  const trackRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);

  const timeline = useTimeline({ mode, track: trackRef, frame: frameRef });
  const scene = useMemo(
    // Only the timer wraps, so only the timer needs the dissolve that covers
    // the restart. A scrubbed scene has nowhere to restart from.
    () => deriveScene(timeline.t, { looping: mode === "timer" }),
    [timeline.t, mode],
  );
  const [measureScene, sceneHeight] = useAutoHeight();

  const beat = BEATS[timeline.beat];
  const hover = mode === "timer";

  return (
    <div className={clsx("w-full", className)}>
      <div
        ref={trackRef}
        className="relative min-[900px]:h-[var(--demo-track)]"
        style={{ "--demo-track": `${TRACK_VH}vh` } as CSSProperties}
      >
        {/* The frame holds the viewport while the page scrolls past it. The
            top padding keeps it clear of the fixed nav pill, and `safe`
            centring gives that padding priority on a short viewport: rather
            than centring a tall beat until its own top bar slides under the
            nav, the frame parks below the nav and overflows downwards. */}
        <div
          className={clsx(
            "min-[900px]:sticky min-[900px]:top-0",
            "min-[900px]:flex min-[900px]:h-svh min-[900px]:flex-col",
            "min-[900px]:pt-20 min-[900px]:pb-8",
            "min-[900px]:[justify-content:safe_center]",
          )}
        >
          <div
            ref={frameRef}
            /* Only a real pointer pauses the timer. A touch fires
               pointerenter and never a matching leave, which would freeze
               the demo on a phone. */
            onPointerEnter={
              hover
                ? (event) => {
                    if (event.pointerType === "mouse") timeline.onPointerEnter();
                  }
                : undefined
            }
            onPointerLeave={
              hover
                ? (event) => {
                    if (event.pointerType === "mouse") timeline.onPointerLeave();
                  }
                : undefined
            }
          >
            <AppFrame
              label="prepon — draft"
              padding="none"
              trailing={
                <span className="hidden min-[560px]:inline">{beat.caption}</span>
              }
            >
              <motion.div
                className="overflow-hidden"
                initial={false}
                animate={{ height: sceneHeight ?? "auto" }}
                transition={HEIGHT_SPRING}
              >
                <div ref={measureScene} aria-hidden="true" className={SCENE_PAD}>
                  <div className={SCENE_GRID} style={{ opacity: scene.veil }}>
                    <DraftPane scene={scene} reduced={false} />
                    <AgentLane lane={scene.lane} reduced={false} />
                  </div>
                </div>
              </motion.div>

              <Summary />

              <DemoControls
                mode={mode}
                beat={timeline.beat}
                segmentFill={timeline.segmentFill}
                userPaused={timeline.userPaused}
                hoverPaused={timeline.hoverPaused}
                onToggle={timeline.togglePlay}
                onJump={timeline.jumpTo}
              />
            </AppFrame>
          </div>

          <p className="mt-3 text-ui text-faint">{FOOTNOTE}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */

/** The five beats, each at the state it settles into. Computed once. */
const END_STATES = BEATS.map((_beat, i) =>
  deriveScene(beatEnd(i), { looping: false }),
);

/**
 * Reduced motion: no pinning, no scrubbing, nothing that moves under the
 * reader. The timeline collapses to its five end states, stacked and
 * captioned, which is the same story told as a strip rather than as film.
 */
function StaticDemo({ className }: DemoProps) {
  return (
    <div className={clsx("w-full", className)}>
      <Summary />

      <ol className="flex flex-col gap-10">
        {BEATS.map((b, i) => (
          <li key={b.id}>
            <AppFrame
              label="prepon — draft"
              padding="none"
              trailing={
                <span className="prepon-numeric">
                  {i + 1} / {BEATS.length}
                </span>
              }
            >
              <div aria-hidden="true" className={SCENE_PAD}>
                <div className={SCENE_GRID}>
                  <DraftPane scene={END_STATES[i]} reduced />
                  <AgentLane lane={END_STATES[i].lane} reduced />
                </div>
              </div>
            </AppFrame>

            <p className="mt-3 flex items-baseline gap-2.5 text-ui text-faint">
              <span className="prepon-numeric text-micro">
                {String(i + 1).padStart(2, "0")}
              </span>
              {b.caption}
            </p>
          </li>
        ))}
      </ol>

      <p className="mt-8 text-ui text-faint">{FOOTNOTE}</p>
    </div>
  );
}

/* ---------------------------------------------------------------------- */

/**
 * The scripted walkthrough: a writer, an agent and one shared surface.
 *
 * Five beats — ask, generic draft, pushback, rule, payoff — all derived from
 * a single position along one timeline. What supplies that position is the
 * only thing that changes between the three ways this renders.
 */
export function Demo({ className }: DemoProps) {
  const reduced = useReducedMotion() === true;
  return reduced ? (
    <StaticDemo className={className} />
  ) : (
    <LiveDemo className={className} />
  );
}

export default Demo;
