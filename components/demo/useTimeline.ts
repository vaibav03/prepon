"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";

import {
  BEATS,
  BEAT_STARTS,
  END_MS,
  LOOP_MS,
  beatIndexAt,
  beatProgress,
} from "./script";
import { clamp01 } from "./timing";

/**
 * Where the one number comes from.
 *
 * `scroll`  — the frame is pinned inside a tall section and the page's own
 *             scroll position *is* the timeline. Nothing moves unless the
 *             reader does, in either direction.
 * `timer`   — below 900px, where pinning three viewports of scroll would be
 *             miserable. The old play-on-enter clock, unchanged.
 */
export type TimelineMode = "scroll" | "timer";

export interface TimelineOptions {
  mode: TimelineMode;
  /** The tall track the frame is pinned inside. Read in scroll mode. */
  track: RefObject<HTMLElement | null>;
  /** The frame itself. Watched so the timer only runs while it is on screen. */
  frame: RefObject<HTMLElement | null>;
}

export interface Timeline {
  /** Position along the timeline, in script milliseconds. */
  t: number;
  beat: number;
  /** 0..1 position inside the current beat. */
  segmentFill: number;
  /** The timer is actually advancing right now. Always false while scrolling. */
  running: boolean;
  /** The viewer pressed pause. Timer mode only. */
  userPaused: boolean;
  /** Paused only because the pointer is resting on the frame. */
  hoverPaused: boolean;
  togglePlay: () => void;
  /** Move to the first frame of a beat — by scrolling the page, in scroll mode. */
  jumpTo: (beat: number) => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}

/**
 * The single source of the demo's one number.
 *
 * Both modes resolve to the same scale, so every component downstream stays
 * a pure function of position and knows nothing about where it came from.
 * Scrolling up walks the number back down and the whole scene plays in
 * reverse for free: the rule un-promotes, the words un-type.
 */
export function useTimeline({ mode, track, frame }: TimelineOptions): Timeline {
  /* -- scroll-driven ---------------------------------------------------- */
  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });
  const [scrollT, setScrollT] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setScrollT(clamp01(p) * END_MS);
  });

  // Landing mid-section (a refresh, a #demo link) must not start at zero.
  // A frame late, so the scroll container has been measured by then.
  useEffect(() => {
    if (mode !== "scroll") return;
    const raf = requestAnimationFrame(() => {
      setScrollT(clamp01(scrollYProgress.get()) * END_MS);
    });
    return () => cancelAnimationFrame(raf);
  }, [mode, scrollYProgress]);

  /* -- timer-driven ----------------------------------------------------- */
  const clock = useRef(0);
  const [timerT, setTimerT] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  // Environments without IntersectionObserver (and the server pass) simply run.
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  const running = mode === "timer" && inView && !userPaused && !hovered;

  useEffect(() => {
    const el = frame.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (entry) setInView(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-12% 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [frame]);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    let pushed = 0;

    const tick = (now: number) => {
      const dt = Math.min(now - last, 120);
      last = now;
      clock.current = (clock.current + dt) % LOOP_MS;
      if (now - pushed >= 24) {
        pushed = now;
        setTimerT(clock.current);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  /* -- navigation ------------------------------------------------------- */
  const jumpTo = useCallback(
    (beat: number) => {
      const start = BEAT_STARTS[beat] ?? 0;

      if (mode === "timer") {
        clock.current = start;
        setTimerT(start);
        return;
      }

      /* In scroll mode the dots are not a state setter — they move the page,
         and the timeline follows the page the way it always does. */
      const el = track.current;
      if (!el) return;
      const range = el.offsetHeight - window.innerHeight;
      if (range <= 0) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      window.scrollTo({
        top: Math.round(top + range * beatProgress(beat)),
        behavior: reduced ? "auto" : "smooth",
      });
    },
    [mode, track],
  );

  const togglePlay = useCallback(() => setUserPaused((p) => !p), []);
  const onPointerEnter = useCallback(() => setHovered(true), []);
  const onPointerLeave = useCallback(() => setHovered(false), []);

  const t = mode === "scroll" ? scrollT : timerT;
  const beat = beatIndexAt(t);

  return {
    t,
    beat,
    segmentFill: clamp01((t - BEAT_STARTS[beat]) / BEATS[beat].duration),
    running,
    userPaused: mode === "timer" && userPaused,
    hoverPaused: mode === "timer" && !userPaused && hovered && inView,
    togglePlay,
    jumpTo,
    onPointerEnter,
    onPointerLeave,
  };
}
