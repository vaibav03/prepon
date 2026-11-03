import clsx from "clsx";

export interface StatProps {
  label: string;
  value: number | string;
  /** Dims the number when the reading is not meaningful yet (e.g. applied=0). */
  muted?: boolean;
  /** Short trailing note, e.g. "of 41" or "since Sept". */
  note?: string;
  className?: string;
}

/** A labelled number. Tabular figures, label beneath, no card, no icon. */
export function Stat({ label, value, muted = false, note, className }: StatProps) {
  return (
    <span className={clsx("inline-flex flex-col gap-0.5", className)}>
      <span
        className={clsx(
          "prepon-numeric text-ui-lg",
          muted ? "text-faint" : "text-primary",
        )}
      >
        {value}
        {note ? (
          <span className="text-ui text-faint"> {note}</span>
        ) : null}
      </span>
      <span className="prepon-label">{label}</span>
    </span>
  );
}

export default Stat;
