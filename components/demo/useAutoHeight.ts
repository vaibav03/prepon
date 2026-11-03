"use client";

import { useEffect, useState } from "react";

export type MeasureRef = (node: HTMLElement | null) => void;

/**
 * Measure an element's natural height so an ancestor can animate to it.
 *
 * The frame used to reserve one constant height, sized for its fullest beat,
 * which meant the first beat was mostly empty box. Instead the content is
 * allowed to be exactly as tall as it is and the frame eases to that height.
 * Per-line reservation still lives inside the streaming text, so arriving
 * words never reflow their own block: what changes here are whole blocks
 * appearing and leaving, which is a handful of discrete steps a spring can
 * absorb rather than a continuous twitch.
 *
 * Returns a callback ref to put on the content, and its height — null until
 * the observer has reported, which is the one frame where the caller should
 * fall back to `auto`.
 */
export function useAutoHeight(enabled = true): [MeasureRef, number | null] {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!node || !enabled || typeof ResizeObserver === "undefined") return;

    // ResizeObserver reports once on observe, so there is no need to measure
    // synchronously here as well.
    const observer = new ResizeObserver(() => {
      // Round up: a fractional height clipped by the wrapper shaves a pixel
      // off a descender and reads as a rendering bug.
      setHeight(Math.ceil(node.getBoundingClientRect().height));
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, enabled]);

  return [setNode, height];
}

export default useAutoHeight;
