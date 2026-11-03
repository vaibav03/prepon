import Link from "next/link";
import Prose from "@/components/ui/Prose";

/**
 * Day one, which is the first thing most people see. It says what will happen,
 * not that a table is empty.
 */
export function RulesDayOne() {
  return (
    <div className="py-10 md:py-16">
      <h2 className="font-serif text-title text-primary">No rules yet.</h2>

      <Prose as="div" width="measure" className="mt-3 text-secondary">
        <p>
          Prepon doesn’t arrive with opinions about your writing. It waits for
          the moments you push back — a sentence you rewrite, a “too long”, the
          second time you ask for the same thing — and writes each one down as a
          sentence you could have said yourself.
        </p>
        <p>
          Proposals usually start appearing after a dozen or so edits. None of
          them goes live until it has been replayed against the complaints you
          have already made and shown to fix them. You will see the working:{" "}
          <span className="font-sans text-ui-lg text-primary">
            replayed against 14 past complaints, would have fixed 11
          </span>
          .
        </p>
        <p>
          Everything that lands here is yours. One sentence each, plain English,
          editable and deletable by hand. Rules that stop earning their place
          expire on their own, and the live set never grows past sixty.
        </p>
      </Prose>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Link
          href="/app/onboarding"
          className="text-ui text-accent underline decoration-hairline-strong underline-offset-4 transition-colors duration-150 ease-out hover:decoration-accent"
        >
          Give it something you’ve written
        </Link>
        <Link
          href="/app/draft"
          className="text-ui text-secondary underline decoration-hairline-strong underline-offset-4 transition-colors duration-150 ease-out hover:text-primary"
        >
          Or write a draft and push back on it
        </Link>
      </div>
    </div>
  );
}

export interface FilteredEmptyProps {
  headline: string;
  note: string;
  onClear: () => void;
}

/** Nothing matches the current filter. Still a sentence, still not "No data". */
export function FilteredEmpty({ headline, note, onClear }: FilteredEmptyProps) {
  return (
    <div className="border-t border-hairline py-10">
      <p className="font-serif text-prose-lg text-primary">{headline}</p>
      <p className="mt-1.5 max-w-measure text-ui-lg text-secondary">{note}</p>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 text-ui text-accent underline decoration-hairline-strong underline-offset-4 transition-colors duration-150 ease-out hover:decoration-accent"
      >
        Show everything again
      </button>
    </div>
  );
}
