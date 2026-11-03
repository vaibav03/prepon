import type { EditPair } from "@/lib/types";
import { formatDay, relativeDay } from "./format";

function BeforeAfter({ pair }: { pair: EditPair }) {
  /* When the writer put the original back, there is nothing to supersede. */
  const reinstated = pair.before === pair.after;

  if (reinstated) {
    return (
      <div
        className="border-l-2 pl-4 sm:pl-5"
        style={{ borderColor: "var(--ink-user-edge)" }}
      >
        <p
          className="prepon-label mb-2"
          style={{ color: "var(--ink-user-edge)" }}
        >
          You put it back
        </p>
        <p
          className="prepon-prose max-w-measure"
          style={{ color: "var(--ink-user)" }}
        >
          {pair.after}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="prepon-label mb-2">The AI wrote</p>
        <p
          className="prepon-prose max-w-measure"
          style={{
            color: "var(--ink-ai)",
            opacity: 0.72,
            textDecorationLine: "line-through",
            textDecorationThickness: "1px",
            textDecorationColor: "var(--ink-ai-edge)",
          }}
        >
          {pair.before}
        </p>
      </div>

      <div
        className="border-l-2 pl-4 sm:pl-5"
        style={{ borderColor: "var(--ink-user-edge)" }}
      >
        <p
          className="prepon-label mb-2"
          style={{ color: "var(--ink-user-edge)" }}
        >
          You rewrote it as
        </p>
        <p
          className="prepon-prose max-w-measure"
          style={{ color: "var(--ink-user)" }}
        >
          {pair.after}
        </p>
      </div>
    </div>
  );
}

export interface ProvenanceProps {
  edits: EditPair[];
}

/**
 * The cluster of corrections the rule was abstracted from. Prose, set at the
 * reading measure: these are sentences the writer actually fixed, not a diff.
 */
export function Provenance({ edits }: ProvenanceProps) {
  const first = edits[0];
  const last = edits[edits.length - 1];

  return (
    <div>
      <p className="prepon-numeric text-ui text-faint">
        {edits.length} {edits.length === 1 ? "edit" : "edits"}, clustered
        {first && last
          ? first.capturedAt === last.capturedAt
            ? ` on ${formatDay(first.capturedAt)}`
            : ` between ${formatDay(first.capturedAt)} and ${formatDay(last.capturedAt)}`
          : null}
        .
      </p>

      <ol className="mt-7 space-y-10 sm:space-y-12">
        {edits.map((pair, i) => (
          <li key={pair.id}>
            <p className="prepon-label mb-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="prepon-numeric text-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-secondary normal-case tracking-normal text-ui">
                {pair.context}
              </span>
              <span aria-hidden="true" className="text-faint">
                &middot;
              </span>
              <span>{relativeDay(pair.capturedAt)}</span>
            </p>
            <BeforeAfter pair={pair} />
          </li>
        ))}
      </ol>
    </div>
  );
}

export default Provenance;
