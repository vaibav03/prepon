"use client";

import clsx from "clsx";

import { BEATS } from "./script";
import { clamp01 } from "./timing";
import type { TimelineMode } from "./useTimeline";

export interface DemoControlsProps {
  mode: TimelineMode;
  beat: number;
  /** 0..1 position inside the active beat. */
  segmentFill: number;
  userPaused: boolean;
  hoverPaused: boolean;
  onToggle: () => void;
  onJump: (beat: number) => void;
}

/**
 * Position, and the means to move around it.
 *
 * In scroll mode this is a read-out, not a transport: the line shows how far
 * through the pinned section the reader is, and the dots scroll the page to
 * a beat rather than setting any state. There is no play button, because
 * there is nothing running to pause — the reader is the clock.
 *
 * Below 900px the timer is back, and so is play/pause.
 */
export function DemoControls({
  mode,
  beat,
  segmentFill,
  userPaused,
  hoverPaused,
  onToggle,
  onJump,
}: DemoControlsProps) {
  const scrolling = mode === "scroll";

  const status = scrolling
    ? "Scroll to advance"
    : hoverPaused
      ? "Paused while you read"
      : userPaused
        ? "Paused"
        : BEATS[beat].caption;

  return (
    <div>
      <div className="flex h-px w-full" aria-hidden="true">
        {BEATS.map((b, i) => (
          <div
            key={b.id}
            className="relative h-px bg-hairline"
            style={{ flexGrow: b.duration, flexBasis: 0 }}
          >
            <span
              className={clsx(
                "absolute inset-0 origin-left will-change-transform",
                i < beat ? "bg-hairline-strong" : "bg-accent",
              )}
              style={{
                transform: `scaleX(${i < beat ? 1 : i === beat ? clamp01(segmentFill) : 0})`,
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 px-2 py-2 sm:px-3">
        {scrolling ? null : (
          <button
            type="button"
            onClick={onToggle}
            aria-label={
              userPaused ? "Play the walkthrough" : "Pause the walkthrough"
            }
            className="flex size-7 shrink-0 items-center justify-center rounded-full border border-hairline text-faint transition-colors duration-150 hover:border-hairline-strong hover:text-primary"
          >
            {userPaused ? (
              <svg aria-hidden="true" viewBox="0 0 10 10" className="size-2.5">
                <path d="M1.4 0.8 L8.6 5 L1.4 9.2 Z" fill="currentColor" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 10 10" className="size-2.5">
                <rect x="1.6" y="1" width="2.2" height="8" fill="currentColor" />
                <rect x="6.2" y="1" width="2.2" height="8" fill="currentColor" />
              </svg>
            )}
          </button>
        )}

        <div className="flex min-w-0 items-center">
          {BEATS.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => onJump(i)}
              aria-label={
                scrolling
                  ? `Scroll to beat ${i + 1}: ${b.label}`
                  : `Go to beat ${i + 1}: ${b.label}`
              }
              aria-current={i === beat ? "true" : undefined}
              className="group flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 transition-colors duration-150"
            >
              <span
                className={clsx(
                  "size-1.5 shrink-0 rounded-full transition-colors duration-200",
                  i === beat
                    ? "bg-accent"
                    : "bg-hairline-strong group-hover:bg-secondary",
                )}
              />
              <span
                className={clsx(
                  "prepon-label hidden transition-colors duration-200 min-[560px]:inline",
                  i === beat ? "text-primary" : "text-faint",
                )}
              >
                {b.label}
              </span>
            </button>
          ))}
        </div>

        <span className="ml-auto hidden shrink-0 truncate pl-3 text-ui text-faint min-[820px]:block">
          {status}
        </span>
      </div>
    </div>
  );
}

export default DemoControls;
