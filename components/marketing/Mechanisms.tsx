"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { motion, useReducedMotion, type Variants } from "motion/react";

import AppFrame from "@/components/site/AppFrame";
import Eyebrow from "@/components/site/Eyebrow";
import Plate from "@/components/site/Plate";
import Section from "@/components/site/Section";
import { DURATION, EASE_OUT, STAGGER } from "./motion";

/* --------------------------------------------------------------------------
   Scripted frames. Written here rather than imported: the landing page owns
   its own scene.
   -------------------------------------------------------------------------- */

function ReplayFrame() {
  return (
    <AppFrame
      label="Replay — rule 07"
      trailing="before promotion"
      padding="md"
      className="w-full max-w-[400px]"
    >
      <div className="flex items-baseline gap-3">
        <span className="prepon-display prepon-numeric text-h1 text-primary">
          11
        </span>
        <span className="prepon-display prepon-numeric text-h3 text-faint">
          / 14
        </span>
      </div>

      <p className="prepon-label mt-1">complaints it would have fixed</p>

      <span aria-hidden="true" className="mt-4 flex gap-[3px]">
        {Array.from({ length: 14 }, (_, i) => (
          <span
            key={i}
            className={clsx(
              "h-4 w-1.5 rounded-[1px]",
              i < 11 ? "bg-live" : "bg-white/12",
            )}
          />
        ))}
      </span>

      <p className="mt-4 border-t border-hairline pt-3 text-ui text-secondary">
        Passes. All 14 stay listed, and open to the draft they came from.
      </p>
    </AppFrame>
  );
}

const HEALTH: Array<{ day: string; value: number }> = [
  { day: "day 1", value: 78 },
  { day: "day 4", value: 61 },
  { day: "day 7", value: 34 },
  { day: "day 9", value: 12 },
];

function DecayFrame() {
  /* A plain readout, not a gauge: four points, the last one under the line. */
  const points = HEALTH.map((entry, i) => {
    const x = (i / (HEALTH.length - 1)) * 100;
    const y = 36 - (entry.value / 100) * 32;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <AppFrame
      label="Rule 22 — nine days live"
      trailing={<span className="prepon-numeric">60 / 60</span>}
      padding="md"
      className="w-full max-w-[400px]"
    >
      <dl className="grid grid-cols-3 gap-3">
        {[
          { label: "applied", value: "41" },
          { label: "kept", value: "28" },
          { label: "reverted", value: "13" },
        ].map((count) => (
          <div key={count.label}>
            <dt className="prepon-label">{count.label}</dt>
            <dd className="prepon-numeric mt-1 text-title text-primary">
              {count.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 border-t border-hairline pt-3">
        <div className="flex items-baseline justify-between">
          <span className="prepon-label">health</span>
          <span className="prepon-numeric text-ui text-expiring">
            78 &rarr; 12
          </span>
        </div>

        <svg
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="mt-2 h-10 w-full"
        >
          <line
            x1="0"
            y1="26"
            x2="100"
            y2="26"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="2 3"
            className="text-faint"
          />
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="text-expiring"
          />
        </svg>

        <div className="flex items-center justify-between">
          <span className="text-ui text-faint">below the line</span>
          <span className="inline-flex items-center rounded-full bg-retired-wash px-2 py-[3px] text-micro uppercase text-retired">
            Retired
          </span>
        </div>
      </div>
    </AppFrame>
  );
}

/* -------------------------------------------------------------------------- */

interface Passage {
  id: string;
  title: string;
  paragraphs: [string, string];
  frame: ReactNode;
  tone: "coast" | "dusk";
  caption: string;
}

const PASSAGES: Passage[] = [
  {
    id: "earn",
    title: "Rules have to earn their place.",
    paragraphs: [
      "A rule does not go live because you made an edit. It is replayed against the complaints you already made — same prompts, same rewrites — and what comes back is a count, not a claim.",
      "Replayed against 14, fixed 11. That fraction is the only reason it gets near your next reply, and all 14 stay listed so you can open one and disagree.",
    ],
    frame: <ReplayFrame />,
    tone: "coast",
    caption: "Scripted: the replay readout a rule has to pass.",
  },
  {
    id: "expire",
    title: "Rules expire.",
    paragraphs: [
      "Every live rule carries three counts: how often it applied, how often you kept the result, how often you reverted it. A few reverts and it is under the line within days.",
      "Only 60 rules stay live. A new rule gets in by being healthier than the weakest one there, which retires and stays readable, with the edit that created it.",
    ],
    frame: <DecayFrame />,
    tone: "dusk",
    caption: "Scripted: a rule losing health and retiring.",
  },
];

export interface MechanismsProps {
  id?: string;
  className?: string;
  /**
   * Accepted so older call sites keep compiling. The landing page quotes no
   * counts it cannot back, so these are not rendered.
   */
  liveCount?: number;
  proposedCount?: number;
  cap?: number;
}

/**
 * The argument: the two things that make this more than a prompt wrapper.
 * Text and frame alternate sides; everything fades and rises once on entry.
 */
export function Mechanisms({ id = "mechanisms", className }: MechanismsProps) {
  const reduce = Boolean(useReducedMotion());

  const group: Variants = {
    hidden: {},
    shown: {
      transition: { staggerChildren: reduce ? 0 : STAGGER },
    },
  };

  const item: Variants = reduce
    ? {
        hidden: { opacity: 0 },
        shown: { opacity: 1, transition: { duration: 0 } },
      }
    : {
        hidden: { opacity: 0, y: 16 },
        shown: {
          opacity: 1,
          y: 0,
          transition: { duration: DURATION.enter, ease: EASE_OUT },
        },
      };

  return (
    <Section
      id={id}
      className={clsx("prepon-band", className)}
      headerClassName="prepon-band-head"
      raised
      eyebrow={<Eyebrow rule>Why this is not a prompt wrapper</Eyebrow>}
      title="Two rules about the rules."
    >
      {/* Two passages, moderately apart. Inside each one the text and its
          frame sit tight against each other. */}
      <div className="flex flex-col gap-12 md:gap-16">
        {PASSAGES.map((passage, index) => {
          const flipped = index % 2 === 1;

          return (
            <motion.article
              key={passage.id}
              variants={group}
              initial="hidden"
              whileInView="shown"
              viewport={{ once: true, amount: 0.25 }}
              className="grid items-center gap-7 min-[900px]:grid-cols-2 min-[900px]:gap-12"
            >
              <motion.div
                variants={item}
                className={clsx(flipped && "min-[900px]:order-2")}
              >
                <h3 className="prepon-display text-h2 max-w-[18ch]">
                  {passage.title}
                </h3>

                <div className="mt-4 flex max-w-[48ch] flex-col gap-3.5">
                  {passage.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-ui-lg text-secondary">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.div>

              <motion.div
                variants={item}
                className={clsx(flipped && "min-[900px]:order-1")}
              >
                <Plate
                  tone={passage.tone}
                  aspect="auto"
                  padding="md"
                  center
                  contentClassName="min-h-[260px] sm:min-h-[280px]"
                >
                  {passage.frame}
                </Plate>

                <p className="mt-3 text-ui text-faint">{passage.caption}</p>
              </motion.div>
            </motion.article>
          );
        })}
      </div>
    </Section>
  );
}

export default Mechanisms;
