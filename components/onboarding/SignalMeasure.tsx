"use client";

import { INFERENCE_FLOOR, VOLUME_SCALE_MIN } from "./data";
import { formatCompact, formatWords } from "./format";
import type { LedgerSource } from "./types";

export interface SignalMeasureProps {
  sources: LedgerSource[];
}

/**
 * Corpus volume against a stated scale. One segment per counted source, so the
 * shape of the bar is the shape of the corpus. The single accent line is the
 * point past which more words stopped changing the inferences.
 */
export function SignalMeasure({ sources }: SignalMeasureProps) {
  const counted = sources.filter((source) => source.words > 0);
  const total = counted.reduce((sum, source) => sum + source.words, 0);

  const scale = Math.max(
    VOLUME_SCALE_MIN,
    Math.ceil(total / 50_000) * 50_000,
  );
  const ticks = [0, scale * 0.25, scale * 0.5, scale * 0.75, scale];
  const floorLeft = (INFERENCE_FLOOR / scale) * 100;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="prepon-label">Corpus volume</h3>
        <p className="prepon-numeric text-ui text-secondary">
          {formatWords(total)} words
        </p>
      </div>

      <div
        className="relative mt-2.5"
        role="img"
        aria-label={`${formatWords(total)} words read, on a scale running to ${formatWords(scale)}. The inference floor sits at ${formatWords(INFERENCE_FLOOR)} words.`}
      >
        <div className="flex h-2.5 w-full overflow-hidden rounded-[1px] border border-hairline bg-sunken">
          {counted.map((source) => (
            <span
              key={source.id}
              className="h-full shrink-0"
              style={{
                width: `${(source.words / scale) * 100}%`,
                backgroundColor: "var(--hairline-strong)",
                borderRight: "1px solid var(--surface-page)",
              }}
            />
          ))}
        </div>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-1 -bottom-1 w-px"
          style={{
            left: `${floorLeft}%`,
            backgroundColor: "var(--accent)",
          }}
        />
      </div>

      <div className="mt-1.5 flex justify-between">
        {ticks.map((tick) => (
          <span key={tick} className="prepon-numeric text-micro text-faint">
            {formatCompact(tick)}
          </span>
        ))}
      </div>

      <p className="mt-3 max-w-measure text-ui text-secondary">
        One segment per source, in the order it was connected. The marked line
        is {formatCompact(INFERENCE_FLOOR)} words — the point past which adding
        more finished writing stopped changing what Prepon inferred. Volume is
        not the constraint any more.
      </p>
    </div>
  );
}

export default SignalMeasure;
