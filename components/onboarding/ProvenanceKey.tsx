"use client";

/**
 * Two provenances, side by side, so the weaker one cannot be mistaken for the
 * stronger one further down the page. Learned rules carry replay evidence and
 * can go live. Inferred observations carry a word count and cannot.
 */
export function ProvenanceKey() {
  return (
    <div className="grid gap-px overflow-hidden rounded-[4px] border border-hairline bg-hairline sm:grid-cols-2">
      <div className="bg-raised px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="inline-block h-3 w-[3px] rounded-[1px]"
            style={{ backgroundColor: "var(--state-live)" }}
          />
          <p className="prepon-label text-live">Learned from pushback</p>
        </div>
        <p className="mt-2 max-w-measure text-ui text-secondary">
          Written from a correction you actually made. Replayed against your
          past complaints, promoted only if it would have fixed them, then
          tracked until it stops earning its place.
        </p>
        <p className="prepon-numeric mt-2 text-micro text-faint">
          Can go live · has evidence · decays
        </p>
      </div>

      <div className="bg-raised px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="inline-block h-3 w-[3px]"
            style={{ borderLeft: "3px dashed var(--hairline-strong)" }}
          />
          <p className="prepon-label">Inferred from corpus</p>
        </div>
        <p className="mt-2 max-w-measure text-ui text-secondary">
          Counted out of writing you already finished. No complaint behind it,
          so there is nothing for the replay gate to replay and no evidence to
          promote it on.
        </p>
        <p className="prepon-numeric mt-2 text-micro text-faint">
          Cannot go live · no evidence · replaced, not decayed
        </p>
      </div>
    </div>
  );
}

export default ProvenanceKey;
