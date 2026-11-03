"use client";

import clsx from "clsx";
import { useId, useState } from "react";
import type { MouseEvent } from "react";
import { useReducedMotion } from "motion/react";

import Button from "@/components/site/Button";
import Eyebrow from "@/components/site/Eyebrow";
import Section from "@/components/site/Section";
import Wordmark from "@/components/ui/Wordmark";

interface QA {
  q: string;
  a: string;
}

const FAQ: QA[] = [
  {
    q: "Is this just a system prompt?",
    a: "A system prompt is one block of text you maintain by hand and never find out whether it worked. Prepon writes each rule from a specific edit, replays it against complaints you already filed, and only then lets it touch a reply. The prompt is the output; the replay gate and the expiry are the product.",
  },
  {
    q: "What happens when the model changes?",
    a: "Rules are plain English sentences, not weights or a fine-tune, so they move to whatever model you point them at. On a model change the replay runs again, and a rule that no longer changes the output drops out of the live set. What you keep is the record of what you asked for, not an artefact tied to one version.",
  },
  {
    q: "Who owns the rules?",
    a: "You do. Your sentences, readable as a list, exportable as text, deletable one at a time or all at once. Nothing is pooled: a rule learned from your edits never touches anybody else's replies.",
  },
  {
    q: "How is this different from memory products like Mem0?",
    a: "Memory stores facts about you and retrieves them later — your dog's name, your stack. Prepon stores instructions about delivery: sentence length, hedging, what order the answer arrives in. They need different gates: a wrong fact is a bug, a stale style rule is only irritating, so one is retrieved and the other has to survive a replay first.",
  },
  {
    q: "What if a rule is wrong?",
    a: "Every rule shows the edit it came from and the complaints it was replayed against, so you can read why it exists. Delete it and it stops applying immediately. Or keep reverting what it produces — its own counts drop it below the line and it expires on its own.",
  },
  {
    q: "Does it change what the AI concludes?",
    a: "No. Prepon changes how an answer is said, never what it claims is true. If the model is wrong about a fact, Prepon will make it wrong in your voice. It is a writing instrument, not a fact checker.",
  },
];

/** Smooth in-page scroll that honours prefers-reduced-motion. */
function useAnchorScroll(reduced: boolean | null) {
  return (href: string, event?: MouseEvent<HTMLElement>) => {
    const target = document.querySelector(href);
    if (!target) return;
    event?.preventDefault();
    target.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  };
}

interface FaqRowProps {
  item: QA;
  open: boolean;
  onToggle: () => void;
  index: number;
  baseId: string;
}

function FaqRow({ item, open, onToggle, index, baseId }: FaqRowProps) {
  const buttonId = `${baseId}-q-${index}`;
  const panelId = `${baseId}-a-${index}`;

  return (
    <div className="border-b border-hairline">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full cursor-pointer items-start justify-between gap-6 py-4 text-left"
        >
          <span
            className={clsx(
              "prepon-display text-title transition-colors duration-150 ease-page",
              open ? "text-primary" : "text-primary/85",
            )}
          >
            {item.q}
          </span>
          <span
            aria-hidden="true"
            className="relative mt-2 block h-3 w-3 shrink-0"
          >
            <span className="absolute top-1/2 left-0 h-px w-3 -translate-y-1/2 bg-hairline-strong" />
            <span
              className={clsx(
                "absolute top-0 left-1/2 h-3 w-px -translate-x-1/2 bg-hairline-strong",
                "transition-transform duration-200 ease-page motion-reduce:transition-none",
                open ? "scale-y-0" : "scale-y-100",
              )}
            />
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={clsx(
          "grid transition-[grid-template-rows,opacity] duration-200 ease-page motion-reduce:transition-none",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <p className="max-w-measure pr-8 pb-5 text-ui-lg text-secondary">
            {item.a}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * The end of the page: six questions answered flatly, one closing line, and a
 * quiet footer. There is nothing to sign up for, so nothing here asks.
 */
export function Close() {
  const [open, setOpen] = useState<number | null>(0);
  const reduced = useReducedMotion();
  const scrollTo = useAnchorScroll(reduced);
  const baseId = useId();

  return (
    <>
      <Section
        id="faq"
        className="prepon-band"
        headerClassName="prepon-band-head"
        eyebrow={<Eyebrow rule>Questions</Eyebrow>}
        title={<>The parts people push on.</>}
      >
        <div className="max-w-wide border-t border-hairline">
          {FAQ.map((item, index) => (
            <FaqRow
              key={item.q}
              item={item}
              index={index}
              baseId={baseId}
              open={open === index}
              onToggle={() => setOpen(open === index ? null : index)}
            />
          ))}
        </div>
      </Section>

      <Section raised align="center" className="prepon-band-lg">
        <div className="mx-auto flex max-w-narrow flex-col items-center text-center">
          <h2 className="prepon-display text-h2 max-w-[18ch]">
            Watch the demo one more time.
          </h2>
          <p className="mt-3.5 text-ui-lg text-secondary">
            There is no product to sign up for yet. The scripted scene above
            is the whole claim.
          </p>
          <div className="mt-6">
            <Button size="lg" onClick={(event) => scrollTo("#demo", event)}>
              Replay the demo
            </Button>
          </div>
        </div>
      </Section>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-page flex-col gap-7 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8">
          <div className="max-w-narrow">
            <Wordmark size="md" />
            <p className="mt-3 text-ui text-faint">
              Rules in plain English, replayed before they go live, retired
              when they stop earning their place.
            </p>
          </div>

          <nav aria-label="This page" className="shrink-0">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-ui">
              {[
                { href: "#demo", label: "The demo" },
                { href: "#how", label: "How it works" },
                { href: "#honest", label: "What would make us wrong" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(event) => scrollTo(link.href, event)}
                    className="text-secondary transition-colors duration-150 ease-page hover:text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mx-auto max-w-page px-4 pb-8 sm:px-6 lg:px-8">
          <p className="text-ui text-faint">
            &copy; 2026 Prepon. No users, no revenue, one page.
          </p>
        </div>
      </footer>
    </>
  );
}

export default Close;
