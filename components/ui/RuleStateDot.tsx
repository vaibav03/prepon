import clsx from "clsx";
import type { RuleStatus } from "@/lib/types";

const SIZES = { sm: 6, md: 8, lg: 10 } as const;

export const RULE_STATE_LABEL: Record<RuleStatus, string> = {
  live: "Live",
  proposed: "Proposed",
  expiring: "Expiring",
  retired: "Retired",
};

/** Tailwind text colour per status, for callers that need matching type. */
export const RULE_STATE_TEXT: Record<RuleStatus, string> = {
  live: "text-live",
  proposed: "text-proposed",
  expiring: "text-expiring",
  retired: "text-retired",
};

const FILL: Record<RuleStatus, string> = {
  live: "var(--state-live)",
  proposed: "transparent",
  expiring: "var(--state-expiring)",
  retired: "transparent",
};

const STROKE: Record<RuleStatus, string> = {
  live: "var(--state-live)",
  proposed: "var(--state-proposed)",
  expiring: "var(--state-expiring)",
  retired: "var(--state-retired)",
};

export interface RuleStateDotProps {
  status: RuleStatus;
  size?: keyof typeof SIZES;
  /** Show the status word next to the dot. */
  withLabel?: boolean;
  className?: string;
}

/**
 * The canonical visual for a RuleStatus. Live is solid, proposed is an open
 * ring, expiring is solid but half-emptied, retired is a faint open ring.
 */
export function RuleStateDot({
  status,
  size = "md",
  withLabel = false,
  className,
}: RuleStateDotProps) {
  const d = SIZES[size];
  const dot = (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 rounded-full"
      style={{
        width: d,
        height: d,
        backgroundColor: FILL[status],
        boxShadow: `inset 0 0 0 1.25px ${STROKE[status]}`,
        opacity: status === "retired" ? 0.65 : 1,
        ...(status === "expiring"
          ? {
              background: `linear-gradient(to top, ${STROKE[status]} 45%, transparent 45%)`,
            }
          : null),
      }}
    />
  );

  if (!withLabel) {
    return (
      <span className={clsx("inline-flex items-center", className)} title={RULE_STATE_LABEL[status]}>
        {dot}
        <span className="sr-only">{RULE_STATE_LABEL[status]}</span>
      </span>
    );
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 text-micro uppercase",
        RULE_STATE_TEXT[status],
        className,
      )}
      style={{ letterSpacing: "0.08em" }}
    >
      {dot}
      {RULE_STATE_LABEL[status]}
    </span>
  );
}

export default RuleStateDot;
