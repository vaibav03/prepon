"use client";

import clsx from "clsx";
import type { RuleKind, RuleStatus } from "@/lib/types";
import { RULE_STATE_LABEL } from "@/components/ui/RuleStateDot";
import { KIND_LABEL, KIND_ORDER, STATUS_ORDER } from "./ruleMath";

export type StatusFilter = "all" | RuleStatus;
export type KindFilter = "all" | RuleKind;

function Chip({
  label,
  count,
  active,
  onSelect,
}: {
  label: string;
  count: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={clsx(
        "inline-flex items-baseline gap-1.5 rounded-[3px] px-2 py-1",
        "text-ui transition-colors duration-150 ease-out",
        active ? "bg-sunken text-primary" : "text-faint hover:text-secondary",
        count === 0 && !active ? "opacity-55" : null,
      )}
    >
      {label}
      <span
        className={clsx(
          "prepon-numeric text-micro",
          active ? "text-secondary" : "text-faint",
        )}
      >
        {count}
      </span>
    </button>
  );
}

export interface RuleFiltersProps {
  status: StatusFilter;
  kind: KindFilter;
  statusCounts: Record<StatusFilter, number>;
  kindCounts: Record<KindFilter, number>;
  onStatus: (next: StatusFilter) => void;
  onKind: (next: KindFilter) => void;
}

/** Two quiet rows of toggles. Counts are part of the label, not a badge. */
export function RuleFilters({
  status,
  kind,
  statusCounts,
  kindCounts,
  onStatus,
  onKind,
}: RuleFiltersProps) {
  return (
    <div className="flex flex-col gap-1">
      <div
        role="group"
        aria-label="Filter by state"
        className="-ml-2 flex flex-wrap items-center gap-x-0.5"
      >
        <Chip
          label="Everything"
          count={statusCounts.all}
          active={status === "all"}
          onSelect={() => onStatus("all")}
        />
        {STATUS_ORDER.map((value) => (
          <Chip
            key={value}
            label={RULE_STATE_LABEL[value]}
            count={statusCounts[value]}
            active={status === value}
            onSelect={() => onStatus(value)}
          />
        ))}
      </div>

      <div
        role="group"
        aria-label="Filter by kind"
        className="-ml-2 flex flex-wrap items-center gap-x-0.5"
      >
        <Chip
          label="All kinds"
          count={kindCounts.all}
          active={kind === "all"}
          onSelect={() => onKind("all")}
        />
        {KIND_ORDER.map((value) => (
          <Chip
            key={value}
            label={KIND_LABEL[value]}
            count={kindCounts[value]}
            active={kind === value}
            onSelect={() => onKind(value)}
          />
        ))}
      </div>
    </div>
  );
}

export default RuleFilters;
