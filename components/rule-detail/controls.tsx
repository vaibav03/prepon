"use client";

import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "quiet";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-contrast border border-transparent hover:opacity-90 disabled:opacity-35 disabled:hover:opacity-35",
  secondary:
    "border border-hairline-strong text-secondary hover:text-primary hover:border-primary/40 disabled:opacity-40",
  quiet:
    "border border-transparent text-faint hover:text-secondary underline underline-offset-4 decoration-hairline-strong",
};

export interface ActionButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

/** The only button in the detail view. Rectangular, sans, no icon. */
export function ActionButton({
  variant = "secondary",
  className,
  type = "button",
  ...rest
}: ActionButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        "rounded-[3px] px-3 py-1.5 text-ui transition-colors duration-150 ease-out",
        "disabled:cursor-not-allowed",
        VARIANT[variant],
        className,
      )}
      {...rest}
    />
  );
}

export interface MetMarkProps {
  met: boolean;
}

/** A filled square for a condition the rule meets, an open one for one it does not. */
export function MetMark({ met }: MetMarkProps) {
  return (
    <span
      aria-hidden="true"
      className="mt-[7px] inline-block h-[7px] w-[7px] shrink-0 rounded-[1px]"
      style={{
        backgroundColor: met ? "var(--state-live)" : "transparent",
        boxShadow: met ? "none" : "inset 0 0 0 1.25px var(--hairline-strong)",
      }}
    />
  );
}

export default ActionButton;
