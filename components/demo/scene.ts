/**
 * One pure function from timeline position to everything on screen.
 *
 * No component in the demo owns animation state: they all render whatever
 * `deriveScene` says for the current position. That is what makes the
 * scroll-driven desktop timeline, the timer below 900px and the static
 * reduced-motion view fall out for free — each is only a different number
 * handed to this function, and because nothing here remembers anything,
 * running the number backwards runs the scene backwards.
 */

import { beatIndexAt, COPY, CUE, INTRO_MS, LOOP_MS, RESET_MS } from "./script";
import {
  activeLine,
  countTo,
  easeOut,
  seg,
  streamLines,
  streamWords,
  typeChars,
} from "./timing";

export interface ComposerScene {
  text: string;
  caret: boolean;
  sent: boolean;
  thinking: boolean;
}

export interface GenericDraftScene {
  visible: boolean;
  /** 0..1 — the draft dissolves before the second ask rather than cutting. */
  fade: number;
  /** The opening sentence, before the writer deletes it. */
  openPresent: boolean;
  openShown: string;
  /** 0..1 sweep of the selection highlight across the opening sentence. */
  openSelect: number;
  openStruck: boolean;
  /** The model's second and third blocks only reserve their height once
   *  they are about to be written, so an empty pane is never held open. */
  bodyPresent: boolean;
  bodyShown: string;
  tailPresent: boolean;
  tailShown: string;
  /** Which of the three streamed blocks currently carries the cursor. */
  streaming: number;
  /** The sentence the writer typed in its place. */
  rewritePresent: boolean;
  rewriteShown: string;
  rewriteCaret: boolean;
  /** The phrase is lifted but has not left the draft yet. */
  chipInDraft: boolean;
  mark: boolean;
}

export interface PointerScene {
  visible: boolean;
  /** 0..1 travel of the cursor into the text. */
  glide: number;
  /** 0..1 position along the sentence being selected. */
  sweep: number;
}

export interface LaneScene {
  awake: boolean;
  /** -1 idle, else index into COPY.stages. */
  stage: number;
  stageFill: number[];
  /** 0..1 reveal of the before/after pair. */
  pairIn: number;
  cardPresent: boolean;
  chipInCard: boolean;
  condensed: boolean;
  proposed: boolean;
  live: boolean;
  replayIn: number;
  fixed: number;
  applied: boolean;
  pulse: boolean;
}

export interface Scene {
  t: number;
  beat: number;
  /** 0..1 opacity of the whole scene, so a restart comes out of black. */
  veil: number;
  composer: ComposerScene;
  draft: GenericDraftScene;
  pointer: PointerScene;
  payoff: { visible: boolean; shown: string[]; streaming: number };
  lane: LaneScene;
}

export interface SceneOptions {
  /**
   * The timeline wraps and so plays the dissolve at each end. True for the
   * timer below 900px; false while scrolling, where there is no restart to
   * cover and a veiled scene at rest would just read as broken.
   */
  looping?: boolean;
}

export function deriveScene(time: number, options: SceneOptions = {}): Scene {
  const { looping = true } = options;
  const t = ((time % LOOP_MS) + LOOP_MS) % LOOP_MS;
  const beat = beatIndexAt(t);
  const second = t >= CUE.clear;

  /* -- composer ------------------------------------------------------- */
  let text: string;
  let sent: boolean;
  let caret: boolean;

  if (second) {
    text = typeChars(COPY.promptB, seg(t, CUE.promptB[0], CUE.promptB[1]));
    sent = t >= CUE.sendB;
    caret = !sent && t >= CUE.promptB[0];
  } else if (t >= CUE.pushback[0]) {
    text = typeChars(COPY.pushback, seg(t, CUE.pushback[0], CUE.pushback[1]));
    sent = t >= CUE.pushbackSent;
    caret = !sent;
  } else {
    text = typeChars(COPY.promptA, seg(t, CUE.promptA[0], CUE.promptA[1]));
    sent = t >= CUE.sendA;
    caret = !sent && t >= CUE.promptA[0];
  }

  const thinking =
    (t >= CUE.thinkA[0] && t < CUE.thinkA[1]) ||
    (t >= CUE.thinkB[0] && t < CUE.thinkB[1]);

  /* -- the generic draft and the edit made to it ----------------------- */
  const draftOut = seg(t, CUE.clear, CUE.clear + 240);
  const draftVisible = second
    ? draftOut < 1
    : t >= CUE.openStream[0];
  const openShown = streamWords(
    COPY.draftOpen,
    seg(t, CUE.openStream[0], CUE.openStream[1]),
  );
  const bodyShown = streamWords(
    COPY.draftBody,
    seg(t, CUE.bodyStream[0], CUE.bodyStream[1]),
  );
  const tailShown = streamWords(
    COPY.draftTail,
    seg(t, CUE.tailStream[0], CUE.tailStream[1]),
  );
  /* A block appears a breath before its first word so the frame has grown
     by the time the words land, and never before — nothing holds height for
     text that is still two beats away. */
  const LEAD = 140;
  const bodyPresent = draftVisible && (second || t >= CUE.bodyStream[0] - LEAD);
  const tailPresent = draftVisible && (second || t >= CUE.tailStream[0] - LEAD);

  const streaming = draftVisible
    ? activeLine(
        [COPY.draftOpen, COPY.draftBody, COPY.draftTail],
        [openShown, bodyShown, tailShown],
      )
    : -1;

  const rewriteShown = typeChars(
    COPY.rewrite,
    seg(t, CUE.rewrite[0], CUE.rewrite[1]),
  );

  const draft: GenericDraftScene = {
    visible: draftVisible,
    fade: second ? 1 - draftOut : 1,
    openPresent: draftVisible && t < CUE.collapse,
    openShown,
    openSelect: seg(t, CUE.sweep[0], CUE.sweep[1]),
    openStruck: t >= CUE.strike,
    bodyPresent,
    bodyShown,
    tailPresent,
    tailShown,
    streaming,
    rewritePresent: draftVisible && t >= CUE.collapse,
    rewriteShown,
    rewriteCaret: t >= CUE.rewrite[0] && t < CUE.rewrite[1] + 500,
    chipInDraft: t >= CUE.lift && t < CUE.travel,
    mark: draftVisible && t >= CUE.mark,
  };

  const pointer: PointerScene = {
    visible: !second && t >= CUE.glide[0] && t < CUE.strike + 260,
    glide: easeOut(seg(t, CUE.glide[0], CUE.glide[1])),
    sweep: seg(t, CUE.sweep[0], CUE.sweep[1]),
  };

  /* -- the payoff reply ------------------------------------------------ */
  const payoffShown = streamLines(
    COPY.payoffLines,
    seg(t, CUE.conciseStream[0], CUE.conciseStream[1]),
  );

  /* -- the agent lane -------------------------------------------------- */
  const lane: LaneScene = {
    awake: t >= CUE.wake,
    stage:
      t >= CUE.stage2 ? 2 : t >= CUE.stage1 ? 1 : t >= CUE.stage0 ? 0 : -1,
    stageFill: [
      seg(t, CUE.stage0, CUE.stage1),
      seg(t, CUE.stage1, CUE.stage2),
      seg(t, CUE.stage2, CUE.live),
    ],
    pairIn: seg(t, CUE.pair[0], CUE.pair[1]),
    /* The shell lands early so it is still by the time the chip flies in. */
    cardPresent: t >= CUE.shell,
    chipInCard: t >= CUE.travel,
    condensed: t >= CUE.condense,
    proposed: t >= CUE.proposed,
    live: t >= CUE.live,
    replayIn: seg(t, CUE.replay, CUE.replay + 320),
    fixed: countTo(COPY.replayFixed, seg(t, CUE.count[0], CUE.count[1])),
    applied: second && t >= CUE.applied,
    pulse: t >= CUE.pulse[0] && t < CUE.pulse[1],
  };

  const veil = looping
    ? Math.min(seg(t, 0, INTRO_MS), 1 - seg(t, LOOP_MS - RESET_MS, LOOP_MS))
    : 1;

  return {
    t,
    beat,
    veil,
    composer: { text, caret, sent, thinking },
    draft,
    pointer,
    payoff: {
      visible: second,
      shown: payoffShown,
      streaming: second ? activeLine(COPY.payoffLines, payoffShown) : -1,
    },
    lane,
  };
}
