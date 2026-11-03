import clsx from "clsx";
import type { ReactNode } from "react";

export type SectionSpace = "sm" | "md" | "lg";

/** Generous between sections, tight inside components. */
const SPACE: Record<SectionSpace, string> = {
  sm: "py-16 md:py-20",
  md: "py-20 md:py-30", // ~120px
  lg: "py-24 md:py-40", // ~160px
};

export interface SectionProps {
  children?: ReactNode;
  /** Anchor target for in-page nav. */
  id?: string;
  /** Small uppercase label above the heading. */
  eyebrow?: ReactNode;
  /** Serif h2. Normal weight, ~34px — handled here, do not restyle. */
  title?: ReactNode;
  /** One or two sans lines under the heading. */
  lede?: ReactNode;
  /** Buttons or links beside/below the header block. */
  actions?: ReactNode;
  /** Lifts the whole band off the page with --surface-raised + hairlines. */
  raised?: boolean;
  /** Vertical rhythm. Defaults to "md" (~120px). */
  space?: SectionSpace;
  /** Header alignment. Body content is never centred by this component. */
  align?: "left" | "center";
  /** Drop the 1200px cap on the children (header stays capped). */
  fullBleed?: boolean;
  className?: string;
  /** Classes for the inner content wrapper, e.g. a grid. */
  innerClassName?: string;
  headerClassName?: string;
}

/**
 * The page's structural unit: centred 1200px column, standard vertical
 * rhythm, an optional raised band, and an optional eyebrow + serif h2 header.
 * It composes nothing else — sections bring their own content.
 */
export function Section({
  children,
  id,
  eyebrow,
  title,
  lede,
  actions,
  raised = false,
  space = "md",
  align = "left",
  fullBleed = false,
  className,
  innerClassName,
  headerClassName,
}: SectionProps) {
  const hasHeader = Boolean(eyebrow || title || lede || actions);

  return (
    <section
      id={id}
      className={clsx(
        "relative w-full",
        SPACE[space],
        raised && "bg-raised border-y border-hairline",
        className,
      )}
    >
      <div
        className={clsx(
          "mx-auto w-full px-4 sm:px-6 lg:px-8",
          !fullBleed && "max-w-page",
        )}
      >
        {hasHeader ? (
          <header
            className={clsx(
              "flex flex-col gap-4",
              align === "center" && "items-center text-center",
              children ? "mb-12 md:mb-16" : null,
              headerClassName,
            )}
          >
            {eyebrow ? <div>{eyebrow}</div> : null}
            {title ? (
              <h2 className="prepon-display text-h2 max-w-[20ch]">{title}</h2>
            ) : null}
            {lede ? (
              <div className="max-w-[52ch] text-ui-lg text-secondary">
                {lede}
              </div>
            ) : null}
            {actions ? (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {actions}
              </div>
            ) : null}
          </header>
        ) : null}

        {children ? <div className={innerClassName}>{children}</div> : null}
      </div>
    </section>
  );
}

export default Section;
