"use client";

import clsx from "clsx";
import { SOURCE_KIND_LABEL } from "./data";
import { formatDay, formatWords } from "./format";
import type { LedgerSource } from "./types";

function wordReading(source: LedgerSource): string {
  if (source.state === "queued") return "not read";
  if (source.state === "estimated") return `~${formatWords(source.words)}`;
  return formatWords(source.words);
}

export interface CorpusLedgerProps {
  sources: LedgerSource[];
  /** Label and word count only; used under the three ways in. */
  dense?: boolean;
  className?: string;
}

/** What Prepon has been given, in the order it was given. */
export function CorpusLedger({
  sources,
  dense = false,
  className,
}: CorpusLedgerProps) {
  if (sources.length === 0) {
    return (
      <p className={clsx("text-ui text-faint", className)}>
        Nothing connected yet.
      </p>
    );
  }

  return (
    <ul className={clsx("flex flex-col", className)}>
      {sources.map((source) => (
        <li
          key={source.id}
          className={clsx(
            "flex flex-col gap-1 border-b border-hairline last:border-b-0",
            dense
              ? "py-2 sm:flex-row sm:items-baseline sm:gap-4"
              : "py-3 sm:flex-row sm:items-baseline sm:gap-5",
          )}
        >
          <span
            className={clsx(
              "min-w-0 flex-1",
              dense ? "text-ui text-secondary" : "text-ui-lg text-primary",
              source.state === "queued" && "text-faint",
            )}
          >
            {source.label}
          </span>

          <span className="flex shrink-0 items-baseline gap-4 sm:gap-5">
            {dense ? null : (
              <span className="prepon-label w-[4.25rem]">
                {SOURCE_KIND_LABEL[source.kind]}
              </span>
            )}
            <span
              className={clsx(
                "prepon-numeric w-[4.5rem] text-right text-ui",
                source.state === "read" ? "text-secondary" : "text-faint",
              )}
            >
              {wordReading(source)}
            </span>
            {dense ? null : (
              <span className="prepon-numeric w-[3.25rem] text-right text-ui text-faint">
                {formatDay(source.addedAt)}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default CorpusLedger;
