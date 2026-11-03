import clsx from "clsx";

export interface MethodNoteProps {
  checkpoints: number;
  className?: string;
}

/** How the number is made, and what it cannot tell you. Small print, not hidden. */
export function MethodNote({ checkpoints, className }: MethodNoteProps) {
  return (
    <section
      className={clsx("border-t border-hairline pt-6", className)}
      aria-labelledby="method-note"
    >
      <h2 id="method-note" className="prepon-label">
        How this is measured
      </h2>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <p className="max-w-narrow text-ui-lg text-secondary">
          Every so often Prepon writes the same piece twice — once through your
          live rules, once through the bare prompt — strips the labels, and asks
          which one you would send. Each point above is one checkpoint: the share
          of those blind picks that went to the rules-on draft, scored over at
          least twenty pairs.{" "}
          {checkpoints > 0
            ? `${checkpoints} checkpoints so far. `
            : "No checkpoints so far. "}
          The pairs come from your own prompts, never a benchmark set, which is
          why the chart starts near a coin flip.
        </p>

        <p className="max-w-narrow text-ui-lg text-secondary">
          What it does not tell you: the win rate says you preferred a draft. It
          says nothing about whether the draft is true. Prepon changes how
          something is said and never what it concludes, so a rule can make a
          wrong claim read beautifully. It also cannot separate a better draft
          from one that merely sounds more like you — for this product those are
          the same thing, and for a fact-checker they are not.
        </p>
      </div>
    </section>
  );
}

export default MethodNote;
