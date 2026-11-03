import clsx from "clsx";
import type { ElementType, ReactNode } from "react";

export interface EyebrowProps {
  children: ReactNode;
  /** Defaults to a <p>. Pass "span" inline, "div" above a heading. */
  as?: ElementType;
  /** Precede the label with a short hairline rule, as section headers do. */
  rule?: boolean;
  className?: string;
}

/**
 * Small uppercase tracked label in --text-faint. Positioning lines, section
 * eyebrows, frame captions. Never a credential or a badge.
 */
export function Eyebrow({
  children,
  as: Tag = "p",
  rule = false,
  className,
}: EyebrowProps) {
  return (
    <Tag
      className={clsx(
        "prepon-label inline-flex items-center gap-2.5 leading-none",
        className,
      )}
    >
      {rule ? (
        <span
          aria-hidden="true"
          className="h-px w-6 shrink-0 bg-hairline-strong"
        />
      ) : null}
      {children}
    </Tag>
  );
}

export default Eyebrow;
