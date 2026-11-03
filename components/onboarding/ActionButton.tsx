"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

export interface ActionButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "quiet" | "plain";
}

/**
 * The only button shape in setup. Square-ish, hairline, no shadow, no icon.
 * `primary` is the one accented control on a screen; there is never a second.
 */
export function ActionButton({
  variant = "quiet",
  className,
  type = "button",
  ...rest
}: ActionButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-[3px] text-ui",
        "transition duration-150 ease-out",
        "disabled:cursor-not-allowed disabled:opacity-40",
        variant === "plain"
          ? "text-faint underline decoration-hairline-strong underline-offset-4 hover:text-primary"
          : "px-3 py-1.5",
        variant === "primary" &&
          "bg-accent text-accent-contrast hover:opacity-85",
        variant === "quiet" &&
          "border border-hairline-strong text-secondary hover:border-accent hover:text-primary",
        className,
      )}
    />
  );
}

export default ActionButton;
