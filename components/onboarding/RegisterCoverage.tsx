"use client";

import { REGISTERS } from "./data";
import { formatWords } from "./format";
import type { LedgerSource } from "./types";

export interface RegisterCoverageProps {
  sources: LedgerSource[];
}

/**
 * The constraint that actually binds. Volume is fine; coverage is not. A
 * missing register is stated as what it costs, not as a gap to be filled in.
 */
export function RegisterCoverage({ sources }: RegisterCoverageProps) {
  const byId = new Map(sources.map((source) => [source.id, source]));
  const covered = REGISTERS.filter((register) =>
    register.sourceId ? byId.has(register.sourceId) : false,
  );
  const missing = REGISTERS.filter((register) => !covered.includes(register));

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="prepon-label">Register coverage</h3>
        <p className="prepon-numeric text-ui text-secondary">
          {covered.length} of {REGISTERS.length}
        </p>
      </div>

      <div className="mt-3 grid gap-x-10 gap-y-6 sm:grid-cols-2">
        <ul className="flex flex-col gap-2.5">
          {covered.map((register) => {
            const source = register.sourceId
              ? byId.get(register.sourceId)
              : undefined;
            return (
              <li key={register.id} className="flex items-baseline gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-[0.45rem] inline-block size-1.5 shrink-0 self-start rounded-full"
                  style={{ backgroundColor: "var(--state-live)" }}
                />
                <span className="min-w-0">
                  <span className="text-ui-lg text-primary">
                    {register.label}
                  </span>
                  {source ? (
                    <span className="prepon-numeric ml-2 text-ui text-faint">
                      {formatWords(source.words)}
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>

        <ul className="flex flex-col gap-4">
          {missing.map((register) => (
            <li key={register.id} className="flex items-baseline gap-2.5">
              <span
                aria-hidden="true"
                className="mt-[0.4rem] inline-block size-1.5 shrink-0 self-start rounded-full border border-dashed"
                style={{ borderColor: "var(--hairline-strong)" }}
              />
              <span className="min-w-0">
                <span className="text-ui-lg text-faint">
                  {register.label}
                </span>
                {register.note ? (
                  <span className="mt-1 block max-w-measure text-ui text-secondary">
                    {register.note}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default RegisterCoverage;
