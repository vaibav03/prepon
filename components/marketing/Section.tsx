import clsx from "clsx";
import type { ReactNode } from "react";

export interface SectionProps {
  /** Small-caps rail label, e.g. "The loop". */
  label: string;
  title: ReactNode;
  children: ReactNode;
  id?: string;
  className?: string;
  /** Drops the top hairline for the section that follows the hero. */
  flush?: boolean;
}

/**
 * The marketing page's only layout primitive: a hairline-separated band with a
 * small-caps label, a serif heading and a content column.
 */
export function Section({
  label,
  title,
  children,
  id,
  className,
  flush = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={clsx(!flush && "border-t border-hairline", className)}
    >
      <div className="mx-auto max-w-wide px-4 py-16 sm:px-8 sm:py-24">
        <p className="prepon-label">{label}</p>
        <h2 className="mt-3 max-w-wide font-serif text-headline text-balance text-primary sm:text-display">
          {title}
        </h2>
        <div className="mt-10 sm:mt-12">{children}</div>
      </div>
    </section>
  );
}

export default Section;
