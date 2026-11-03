import type { ReactNode } from "react";
import clsx from "clsx";

export interface SectionProps {
  id: string;
  /** The ordinal shown beside the section label. */
  index: number;
  label: string;
  question: string;
  lede?: string;
  children: ReactNode;
  className?: string;
}

/**
 * One answered question. The ordinal matters: the page reads top to bottom as
 * "where it came from", then "why it was allowed to run", then "how it is doing".
 */
export function Section({
  id,
  index,
  label,
  question,
  lede,
  children,
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={clsx("mt-14 border-t border-hairline pt-7 sm:mt-16", className)}
    >
      <header className="mb-7">
        <p className="prepon-label flex items-baseline gap-2.5">
          <span className="prepon-numeric text-faint">
            {String(index).padStart(2, "0")}
          </span>
          <span>{label}</span>
        </p>
        <h2
          id={`${id}-heading`}
          className="mt-2.5 max-w-measure font-serif text-ui-lg text-primary sm:text-title"
        >
          {question}
        </h2>
        {lede ? (
          <p className="prepon-prose mt-2.5 max-w-measure text-ui-lg text-secondary">
            {lede}
          </p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

export default Section;
