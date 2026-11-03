import clsx from "clsx";
import type { ElementType, ReactNode } from "react";

export interface ProseProps {
  children: ReactNode;
  /** Defaults to a <div>; pass "article" or "blockquote" where it reads better. */
  as?: ElementType;
  /** Reading measure. "measure" is the default ~65ch. */
  width?: "narrow" | "measure" | "wide" | "full";
  size?: "prose" | "prose-lg";
  className?: string;
}

const WIDTH = {
  narrow: "max-w-narrow",
  measure: "max-w-measure",
  wide: "max-w-wide",
  full: "max-w-none",
} as const;

/** The serif prose wrapper. Everything the writer reads as prose goes in one. */
export function Prose({
  children,
  as: Tag = "div",
  width = "measure",
  size = "prose",
  className,
}: ProseProps) {
  return (
    <Tag
      className={clsx(
        "prepon-prose",
        size === "prose-lg" ? "text-prose-lg" : "text-prose",
        WIDTH[width],
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export default Prose;
