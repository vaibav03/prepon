import clsx from "clsx";

const SIZES = {
  sm: "text-[0.9375rem]",
  md: "text-title",
  lg: "text-headline",
  xl: "text-display",
} as const;

export interface WordmarkProps {
  size?: keyof typeof SIZES;
  className?: string;
  /** Renders the short "P." mark instead of the full word. */
  compact?: boolean;
}

/**
 * The single swappable brand component. Typographic only: no logo mark.
 * The period is set in the accent because a rule, like a sentence, ends.
 */
export function Wordmark({ size = "md", className, compact = false }: WordmarkProps) {
  return (
    <span
      className={clsx(
        "font-serif text-primary select-none",
        SIZES[size],
        className,
      )}
      style={{ letterSpacing: "-0.02em" }}
    >
      {compact ? "P" : "Prepon"}
      <span className="text-accent">.</span>
    </span>
  );
}

export default Wordmark;
