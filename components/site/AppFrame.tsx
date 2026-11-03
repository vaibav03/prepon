import clsx from "clsx";
import type { ReactNode } from "react";

export interface AppFrameProps {
  children?: ReactNode;
  /** Quiet text in the window's top bar, e.g. "prepon — draft". */
  label?: ReactNode;
  /** Right-hand slot in the top bar: a state dot, a count, a caption. */
  trailing?: ReactNode;
  /** Drop the top bar entirely and show a bare bordered panel. */
  bare?: boolean;
  /** Inner padding on the body. Default "md". */
  padding?: "none" | "sm" | "md";
  /** Lift the frame off the plate it sits on. On by default. */
  shadow?: boolean;
  className?: string;
  /** Classes on the body region below the bar. */
  bodyClassName?: string;
}

const PADDING = {
  none: "",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-6",
} as const;

/**
 * Product-window chrome. A 12px-radius panel with a hairline border and a
 * faint top bar carrying three small dots and an optional label, so simulated
 * product DOM reads as an application and not as a card.
 *
 * It renders no content of its own — pass real components as children.
 */
export function AppFrame({
  children,
  label,
  trailing,
  bare = false,
  padding = "md",
  shadow = true,
  className,
  bodyClassName,
}: AppFrameProps) {
  return (
    <div
      className={clsx(
        "relative isolate overflow-hidden rounded-panel",
        "border border-frame-border bg-frame",
        shadow && "shadow-[var(--frame-shadow)]",
        className,
      )}
    >
      {bare ? null : (
        <div
          className={clsx(
            "flex h-9 shrink-0 items-center gap-3 px-3.5",
            "border-b border-frame-border bg-frame-bar",
          )}
        >
          <span aria-hidden="true" className="flex shrink-0 items-center gap-1.5">
            <span className="size-2 rounded-full bg-white/14" />
            <span className="size-2 rounded-full bg-white/11" />
            <span className="size-2 rounded-full bg-white/8" />
          </span>

          {label ? (
            <span className="truncate text-ui text-faint">{label}</span>
          ) : null}

          {trailing ? (
            <span className="ml-auto shrink-0 text-ui text-faint">
              {trailing}
            </span>
          ) : null}
        </div>
      )}

      <div className={clsx(PADDING[padding], bodyClassName)}>{children}</div>
    </div>
  );
}

export default AppFrame;
