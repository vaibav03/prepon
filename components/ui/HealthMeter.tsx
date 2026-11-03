import clsx from "clsx";
import type { RuleStatus } from "@/lib/types";

const TICKS = 14;

const STATE_COLOR: Record<RuleStatus, string> = {
  live: "var(--state-live)",
  proposed: "var(--state-proposed)",
  expiring: "var(--state-expiring)",
  retired: "var(--state-retired)",
};

export interface HealthMeterProps {
  /** 0..1 */
  value: number;
  status?: RuleStatus;
  /** Print the value as a two-decimal reading beside the ticks. */
  showValue?: boolean;
  className?: string;
}

/**
 * An instrument, not a progress bar: a short row of hairline ticks, the lit
 * ones coloured by rule state. No fill animation, no celebration, no score.
 */
export function HealthMeter({
  value,
  status = "live",
  showValue = true,
  className,
}: HealthMeterProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const lit = Math.round(clamped * TICKS);
  const color = STATE_COLOR[status];

  return (
    <span
      className={clsx("inline-flex items-center gap-2", className)}
      role="meter"
      aria-valuenow={Number(clamped.toFixed(2))}
      aria-valuemin={0}
      aria-valuemax={1}
      aria-label="Rule health"
    >
      <span aria-hidden="true" className="inline-flex items-end gap-[2px]">
        {Array.from({ length: TICKS }, (_, i) => (
          <span
            key={i}
            className="inline-block w-[2px] rounded-[1px]"
            style={{
              height: i % 7 === 0 ? 11 : 8,
              backgroundColor: i < lit ? color : "var(--hairline-strong)",
              opacity: i < lit ? 1 : 0.5,
            }}
          />
        ))}
      </span>
      {showValue ? (
        <span className="prepon-numeric text-ui text-secondary">
          {clamped.toFixed(2)}
        </span>
      ) : null}
    </span>
  );
}

export default HealthMeter;
