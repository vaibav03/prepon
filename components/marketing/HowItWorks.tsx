"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import clsx from "clsx";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";

import AppFrame from "@/components/site/AppFrame";
import Eyebrow from "@/components/site/Eyebrow";
import Plate from "@/components/site/Plate";
import Section from "@/components/site/Section";
import { DURATION, EASE_OUT } from "./motion";

/* How long one step holds before it advances. */
const STEP_MS = 5000;

/* --------------------------------------------------------------------------
   Small pieces of scripted product chrome. These are written here on purpose:
   the landing page shows its own scene and does not reach into the product
   components.
   -------------------------------------------------------------------------- */

type ChipTone = "proposed" | "live" | "expiring" | "retired";

const CHIP_TONE: Record<ChipTone, string> = {
  proposed: "bg-proposed-wash text-proposed",
  live: "bg-live-wash text-live",
  expiring: "bg-expiring-wash text-expiring",
  retired: "bg-retired-wash text-retired",
};

function Chip({ tone, children }: { tone: ChipTone; children: ReactNode }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-[3px] text-micro uppercase",
        CHIP_TONE[tone],
      )}
    >
      {children}
    </span>
  );
}

function Ticks({
  total,
  hit,
  className,
}: {
  total: number;
  hit: number;
  className?: string;
}) {
  return (
    <span aria-hidden="true" className={clsx("flex gap-[3px]", className)}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={clsx(
            "h-3.5 w-1.5 rounded-[1px]",
            i < hit ? "bg-live" : "bg-white/12",
          )}
        />
      ))}
    </span>
  );
}

const CARD_CLASS = "w-full max-w-[400px]";

function PushbackCard() {
  return (
    <AppFrame
      label="Draft — reply to Priya"
      trailing="edited just now"
      padding="sm"
      className={CARD_CLASS}
    >
      <p className="text-ui text-ink-ai">
        <span className="text-faint line-through decoration-white/25">
          Happy to help! I can walk you through the options if that would be
          useful.
        </span>{" "}
        There are three options.
      </p>

      <div className="mt-3 rounded-inset border-l-2 border-ink-user-edge bg-ink-user-wash px-3 py-2.5">
        <p className="prepon-label">You, rewriting it</p>
        <p className="mt-1.5 text-ui text-ink-user">There are three options.</p>
      </div>

      <p className="mt-3 border-t border-hairline pt-3 text-ui text-faint">
        Both versions kept, side by side.
      </p>
    </AppFrame>
  );
}

function RuleCard() {
  return (
    <AppFrame
      label="Rule written from that edit"
      trailing={<Chip tone="proposed">Proposed</Chip>}
      padding="sm"
      className={CARD_CLASS}
    >
      <p className="prepon-display text-title">
        &ldquo;Answer first. No offers to help, no asking permission.&rdquo;
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-hairline pt-3">
        <span className="text-ui text-faint">One sentence, plain English</span>
        <span className="text-ui text-faint">Editable. Not live yet.</span>
      </div>
    </AppFrame>
  );
}

function ReplayCard() {
  return (
    <AppFrame
      label="Replay — against your past complaints"
      padding="sm"
      className={CARD_CLASS}
    >
      <div className="flex items-baseline gap-2.5">
        <span className="prepon-display prepon-numeric text-h2 text-primary">
          11
        </span>
        <span className="text-ui text-faint">of 14 complaints fixed</span>
      </div>

      <Ticks total={14} hit={11} className="mt-3.5" />

      <p className="mt-3.5 border-t border-hairline pt-3 text-ui text-secondary">
        Passes the gate. The three it misses stay listed, and open.
      </p>
    </AppFrame>
  );
}

const LIVE_COUNTS: Array<{ label: string; value: string }> = [
  { label: "applied", value: "32" },
  { label: "kept", value: "29" },
  { label: "reverted", value: "3" },
];

function LiveCard() {
  return (
    <AppFrame
      label="Rule 07"
      trailing={<Chip tone="live">Live</Chip>}
      padding="sm"
      className={CARD_CLASS}
    >
      <p className="prepon-display text-title">
        &ldquo;Answer first. No offers to help.&rdquo;
      </p>

      <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-hairline pt-3">
        {LIVE_COUNTS.map((count) => (
          <div key={count.label}>
            <dt className="prepon-label">{count.label}</dt>
            <dd className="prepon-numeric mt-1 text-title text-primary">
              {count.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 text-ui text-faint">
        Injected ahead of every reply from here on.
      </p>
    </AppFrame>
  );
}

function DecayCard() {
  const reduce = Boolean(useReducedMotion());

  const row = (y: number) =>
    reduce
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : {
          initial: { y, opacity: 0 },
          animate: { y: 0, opacity: 1 },
        };

  return (
    <AppFrame
      label="Live set"
      trailing={<span className="prepon-numeric">60 / 60</span>}
      padding="sm"
      className={CARD_CLASS}
    >
      <motion.div
        {...row(-12)}
        transition={{
          duration: reduce ? 0 : DURATION.swap,
          ease: EASE_OUT,
          delay: 0.06,
        }}
        className="flex items-center justify-between gap-3 rounded-inset bg-white/[0.035] px-3 py-2.5"
      >
        <span className="text-ui text-primary">
          Answer first. No offers to help.
        </span>
        <Chip tone="live">Live</Chip>
      </motion.div>

      <motion.div
        {...row(12)}
        transition={{
          duration: reduce ? 0 : DURATION.swap,
          ease: EASE_OUT,
          delay: 0.06,
        }}
        className="mt-2 flex items-center justify-between gap-3 rounded-inset px-3 py-2.5 opacity-55"
      >
        <span className="text-ui text-faint">
          Open with a one-line summary.
        </span>
        <Chip tone="retired">Retired</Chip>
      </motion.div>

      <p className="mt-3.5 border-t border-hairline pt-3 text-ui text-faint">
        Reverted 4 of its last 9. The weakest rule leaves so the new one fits.
      </p>
    </AppFrame>
  );
}

/* -------------------------------------------------------------------------- */

interface Step {
  id: string;
  name: string;
  /** One line, always shown when the step is open. */
  body: string;
  /** The second line the open step carries, so the column has real weight. */
  detail: string;
  Card: () => ReactNode;
}

const STEPS: Step[] = [
  {
    id: "pushback",
    name: "Pushback",
    body: "You rewrite a sentence, or say “too long”. Prepon keeps the before and the after.",
    detail:
      "Both versions stay on the draft, so whatever comes next can point at the exact sentence it came from.",
    Card: PushbackCard,
  },
  {
    id: "rule",
    name: "Rule",
    body: "The edit becomes one sentence of plain English. Not live yet.",
    detail:
      "You can reword it or throw it away. Until it clears the gate below, it touches nothing you send.",
    Card: RuleCard,
  },
  {
    id: "replay",
    name: "Replay",
    body: "Tested against your past complaints. It fixes 11 of 14, so it passes.",
    detail:
      "Same prompts, same rewrites, counted rather than claimed. The three it misses stay listed and open.",
    Card: ReplayCard,
  },
  {
    id: "live",
    name: "Live",
    body: "It goes in before every reply, and starts counting applied, kept, reverted.",
    detail:
      "Those three counts are the rule's whole performance record, kept per rule rather than per account.",
    Card: LiveCard,
  },
  {
    id: "decay",
    name: "Decay",
    body: "Reverted rules drop fast. Only 60 stay live, so a new rule displaces an old one.",
    detail:
      "A retired rule stays readable, with the edit that created it, in case you want it back.",
    Card: DecayCard,
  },
];

export interface HowItWorksProps {
  id?: string;
  className?: string;
}

/**
 * The signature section: five steps of the loop on the left as an
 * auto-advancing accordion, the matching piece of scripted product UI on the
 * right. The accent progress line under the active step is the only accent on
 * the page body.
 *
 * The two columns stretch to a shared height and the step list spreads into
 * it, so the list and the plate start and finish on the same line instead of
 * leaving a dead lower-left quadrant.
 *
 * The anchor is #how: the footer nav and the hero's secondary button point
 * at it. The nav pill's "Demo" link goes to #demo instead.
 */
export function HowItWorks({ id = "how", className }: HowItWorksProps) {
  const reduce = Boolean(useReducedMotion());

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const progress = useMotionValue(0);
  const elapsed = useRef(0);

  const jump = useCallback(
    (index: number) => {
      elapsed.current = 0;
      progress.set(0);
      setActive(index);
    },
    [progress],
  );

  useEffect(() => {
    if (reduce || paused) return;

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      elapsed.current += now - last;
      last = now;

      if (elapsed.current >= STEP_MS) {
        elapsed.current = 0;
        progress.set(0);
        setActive((current) => (current + 1) % STEPS.length);
      } else {
        progress.set(elapsed.current / STEP_MS);
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, progress, reduce]);

  const ActiveCard = STEPS[active].Card;

  return (
    <Section
      id={id}
      className={clsx("prepon-band prepon-band-seam", className)}
      headerClassName="prepon-band-head"
      eyebrow={<Eyebrow rule>How it works</Eyebrow>}
      title="Pushback, rule, replay, live, decay."
      lede="One edit, followed all the way through. Each step carries its own scripted frame."
    >
      <div
        className="flex flex-col gap-8 min-[900px]:flex-row min-[900px]:items-stretch min-[900px]:gap-12"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {/* --- the five steps ---------------------------------------------
            flex-1 + justify-between: the list fills whatever height the
            plate sets and spreads its own slack between the steps, so the
            last hairline lands level with the bottom of the right column. */}
        <div className="flex w-full flex-col min-[900px]:w-[42%]">
          <ol className="flex flex-1 flex-col justify-between">
            {STEPS.map((step, index) => {
              const open = reduce || index === active;
              const isActive = index === active;

              return (
                <li key={step.id} className="relative">
                  <button
                    type="button"
                    onClick={() => jump(index)}
                    aria-expanded={open}
                    aria-controls={`loop-step-${step.id}`}
                    className="flex w-full cursor-pointer items-baseline gap-4 py-3 text-left"
                  >
                    <span
                      className={clsx(
                        "prepon-numeric text-micro transition-colors duration-150 ease-page",
                        isActive ? "text-primary" : "text-faint",
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={clsx(
                        "prepon-display text-title transition-colors duration-150 ease-page",
                        isActive ? "text-primary" : "text-secondary",
                      )}
                    >
                      {step.name}
                    </span>
                  </button>

                  {reduce ? (
                    <div id={`loop-step-${step.id}`} className="pb-3.5 pl-9">
                      <StepBody step={step} />
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {open ? (
                        <motion.div
                          id={`loop-step-${step.id}`}
                          key="body"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: DURATION.disclose,
                            ease: EASE_OUT,
                          }}
                          className="overflow-hidden"
                        >
                          <div className="pb-3.5 pl-9">
                            <StepBody step={step} />
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  )}

                  {/* The rail between steps, and the only accent in the page
                      body: it fills under the step that is playing. */}
                  <span
                    aria-hidden="true"
                    className="block h-px w-full overflow-hidden bg-hairline"
                  >
                    {isActive && !reduce ? (
                      <motion.span
                        className="block h-px w-full origin-left bg-accent"
                        style={{ scaleX: progress }}
                      />
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* --- the scripted scene ----------------------------------------- */}
        <div className="flex w-full flex-col min-[900px]:w-[58%]">
          <Plate
            tone="dune"
            aspect="auto"
            padding="md"
            className="min-[900px]:flex-1"
            contentClassName="min-h-[260px] sm:min-h-[280px] min-[900px]:min-h-[300px]"
          >
            <div className="relative min-h-0 flex-1">
              <AnimatePresence initial={false}>
                <motion.div
                  key={STEPS[active].id}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: reduce ? 0 : DURATION.swap,
                      ease: EASE_OUT,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    transition: {
                      duration: reduce ? 0 : DURATION.swapOut,
                      ease: EASE_OUT,
                    },
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <ActiveCard />
                </motion.div>
              </AnimatePresence>
            </div>
          </Plate>

          <p className="mt-3 text-ui text-faint">
            Scripted scene. No account, no live data.
          </p>
        </div>
      </div>
    </Section>
  );
}

/** The open step's copy: one line of claim, one line of detail. */
function StepBody({ step }: { step: Step }) {
  return (
    <>
      <p className="max-w-[46ch] text-ui-lg text-secondary">{step.body}</p>
      <p className="mt-1.5 max-w-[46ch] text-ui text-faint">{step.detail}</p>
    </>
  );
}

export default HowItWorks;
