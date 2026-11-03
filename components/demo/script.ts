/**
 * The script. Everything the scripted walkthrough says and every moment at
 * which it says it lives in this one file, as data.
 *
 * Beats carry durations; cues are written relative to the beat they belong
 * to and resolved to absolute timeline position by `at()`. The unit stays
 * milliseconds because that is how the beats were cut, but on desktop the
 * number is no longer a clock: it is scroll distance through the pinned
 * section, re-expressed on the same scale. Re-cutting the demo means
 * changing numbers here and nothing else.
 */

export type BeatId = "ask" | "draft" | "pushback" | "rule" | "payoff";

export interface Beat {
  id: BeatId;
  /** Label under the scrubber dot. */
  label: string;
  /** One quiet line describing what is happening, shown in the frame bar. */
  caption: string;
  duration: number;
}

export const BEATS = [
  {
    id: "ask",
    label: "Ask",
    caption: "the writer asks for a draft",
    duration: 2600,
  },
  {
    id: "draft",
    label: "Draft",
    caption: "the model answers everyone the same way",
    duration: 5400,
  },
  {
    id: "pushback",
    label: "Pushback",
    caption: "the writer rewrites it, then says why",
    duration: 6000,
  },
  {
    id: "rule",
    label: "Rule",
    caption: "that edit becomes a rule, and is tested",
    duration: 7600,
  },
  {
    id: "payoff",
    label: "Applied",
    caption: "the next answer already obeys it",
    duration: 4200,
  },
] as const satisfies readonly Beat[];

export const BEAT_STARTS: number[] = BEATS.reduce<number[]>(
  (acc, _beat, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + BEATS[i - 1].duration);
    return acc;
  },
  [],
);

export const LOOP_MS: number =
  BEAT_STARTS[BEATS.length - 1] + BEATS[BEATS.length - 1].duration;

/** The scene dissolves over this long at the end of the run, and arrives
 *  over INTRO_MS at the start, so a restart is a cut to black and not a
 *  frame of half-torn-down state. Only the timer below 900px restarts, so
 *  only the timer dissolves; scrubbing has nowhere to restart from. */
export const RESET_MS = 520;
export const INTRO_MS = 240;

/** Last addressable position. Staying one tick inside the end keeps the
 *  modulo in `deriveScene` from wrapping a fully scrolled section to zero. */
export const END_MS: number = LOOP_MS - 1;

/** How tall the pinned section is, in viewport heights. The frame holds the
 *  viewport for the first 100vh of it, so the remaining 260vh is the scroll
 *  distance that the whole timeline is spread across. */
export const TRACK_VH = 360;

/** The last frame of a beat — the state it has settled into. */
export function beatEnd(beat: number): number {
  return BEAT_STARTS[beat] + BEATS[beat].duration - 1;
}

/** 0..1 position of a beat's first frame, for scrolling the page to it. */
export function beatProgress(beat: number): number {
  return (BEAT_STARTS[beat] ?? 0) / END_MS;
}

/** Which beat a given timeline position falls in. */
export function beatIndexAt(t: number): number {
  for (let i = BEATS.length - 1; i >= 0; i -= 1) {
    if (t >= BEAT_STARTS[i]) return i;
  }
  return 0;
}

/** Absolute timeline position for `ms` into beat `beat`. */
const at = (beat: number, ms: number): number => BEAT_STARTS[beat] + ms;

/* ---------------------------------------------------------------------- */
/* Copy                                                                    */
/* ---------------------------------------------------------------------- */

export const COPY = {
  /** Beat 1. */
  promptA: "Draft a LinkedIn post about why we killed our onboarding flow.",

  /** Beat 2 — long, hedged, question-opener. Bad in the way AI writing is bad. */
  draftOpen: "Have you ever wondered what really drives user activation?",
  draftBody:
    "In today's fast-paced product landscape, onboarding has become something of a sacred cow. We decided to delve into ours, and what we found surprised us.",
  draftTail:
    "...After careful consideration of the data, we ultimately concluded that removing it was the right call. Would love your thoughts!",

  /** Beat 3 — what the writer puts there instead, and what they say. */
  rewrite: "We killed our onboarding flow. Activation went up 12%.",
  pushback: "too long. verdict first.",
  mark: "edit captured",

  /** Beat 4 — the rule, and the replay that gates it. */
  rule: "Give the verdict first.",
  replayCorpus: "replayed against 14 past complaints",
  replayFixedLabel: "would have fixed",
  replayFixed: 11,
  stages: ["reading the edit", "finding the pattern", "checking it"],

  /** Beat 5 — the same machine, one rule later. */
  promptB: "Post about our pricing change.",
  payoffLines: [
    "We raised prices 20% and lost no one.",
    "Two things made that possible: six weeks of notice, and the arithmetic published in full.",
    "Here is what we learned.",
  ],
  appliedLabel: "applied",
} as const;

/* ---------------------------------------------------------------------- */
/* Cues, in absolute timeline milliseconds                                     */
/* ---------------------------------------------------------------------- */

export const CUE = {
  /* Beat 1 — the ask */
  promptA: [at(0, 100), at(0, 1750)] as const,
  sendA: at(0, 1950),
  thinkA: [at(0, 2020), at(1, 150)] as const,

  /* Beat 2 — the generic draft */
  openStream: [at(1, 150), at(1, 820)] as const,
  bodyStream: [at(1, 820), at(1, 3600)] as const,
  tailStream: [at(1, 3600), at(1, 4900)] as const,

  /* Beat 3 — the pushback. The sentence is rewritten first, and only then
     does the writer say why; the two never type at the same time. */
  glide: [at(2, 120), at(2, 780)] as const,
  sweep: [at(2, 780), at(2, 1500)] as const,
  strike: at(2, 1500),
  collapse: at(2, 1950),
  rewrite: [at(2, 2080), at(2, 3400)] as const,
  mark: at(2, 3650),
  pushback: [at(2, 3900), at(2, 5000)] as const,
  pushbackSent: at(2, 5300),

  /* Beat 4 — the agent picks up the rule. The climax: the card shell lands
     and settles first, then the writer's own sentence lifts out of the draft,
     flies across the frame and condenses into the rule. */
  wake: at(3, 100),
  stage0: at(3, 180),
  pair: [at(3, 320), at(3, 1300)] as const,
  shell: at(3, 1500),
  stage1: at(3, 1700),
  lift: at(3, 2000),
  travel: at(3, 2750),
  condense: at(3, 3700),
  stage2: at(3, 4600),
  proposed: at(3, 4700),
  replay: at(3, 5300),
  count: [at(3, 5300), at(3, 6700)] as const,
  live: at(3, 7000),

  /* Beat 5 — the payoff */
  clear: at(4, 0),
  promptB: [at(4, 200), at(4, 920)] as const,
  sendB: at(4, 1080),
  thinkB: [at(4, 1130), at(4, 1450)] as const,
  conciseStream: [at(4, 1500), at(4, 2950)] as const,
  pulse: [at(4, 1780), at(4, 2380)] as const,
  applied: at(4, 1900),
} as const;
