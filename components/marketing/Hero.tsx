"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";

import Button from "@/components/site/Button";
import Eyebrow from "@/components/site/Eyebrow";
import { DURATION, EASE_OUT, STAGGER } from "./motion";

export interface HeroProps {
  className?: string;
}

/** Anchor of the scripted demo, immediately below. */
const DEMO_ANCHOR = "#demo";
/** Anchor of the step-by-step walk through the loop. */
const STEPS_ANCHOR = "#how";

/** One rise-and-fade, staggered, on mount. Nothing after that. */
const CONTAINER: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: STAGGER, delayChildren: 0.04 } },
};

const ITEM: Variants = {
  hidden: { opacity: 0, y: 12 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.enter, ease: EASE_OUT },
  },
};

/**
 * The opener. Positioning line, the claim, two sentences of plain English,
 * two pills. No product image — the scripted demo directly beneath this is
 * the hero image, and this block exists to hand it over quickly.
 */
export function Hero({ className }: HeroProps) {
  const reduced = useReducedMotion() ?? false;

  const scrollTo = (hash: string) => () => {
    const target = document.querySelector(hash);
    if (!target) return;
    target.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
    window.history.replaceState(null, "", hash);
  };

  return (
    <section
      id="top"
      className={clsx(
        "relative w-full px-4 pt-26 pb-10 sm:px-6 sm:pt-30 sm:pb-12 lg:px-8",
        className,
      )}
    >
      <motion.div
        variants={CONTAINER}
        initial={reduced ? false : "hidden"}
        animate="shown"
        className="mx-auto flex w-full max-w-page flex-col items-center text-center"
      >
        <motion.div variants={ITEM}>
          <Eyebrow>Personalization layer for AI products</Eyebrow>
        </motion.div>

        <motion.h1
          variants={ITEM}
          className="prepon-display mt-4 max-w-[20ch] text-h2 sm:mt-5 sm:max-w-none sm:text-h1"
        >
          <span className="sm:block">AI that learns how each user</span>{" "}
          <span className="sm:block">wants to be answered.</span>
        </motion.h1>

        <motion.p
          variants={ITEM}
          className="mt-4 max-w-[54ch] text-ui-lg text-secondary sm:mt-5"
        >
          Your users already tell you how they want to be written for: they
          rewrite your drafts, they say &ldquo;too long&rdquo;. Prepon turns
          that into a rule, proves it against their past complaints, and
          applies it to every reply after.
        </motion.p>

        <motion.div
          variants={ITEM}
          className="mt-7 flex w-full flex-col items-stretch gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:items-center"
        >
          <Button size="lg" onClick={scrollTo(DEMO_ANCHOR)}>
            Watch the demo
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={scrollTo(STEPS_ANCHOR)}
          >
            How it works
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Hero;
