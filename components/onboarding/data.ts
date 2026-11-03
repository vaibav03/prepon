import type { CorpusSource, RuleKind } from "@/lib/types";
import type { Observation, Register, StepId } from "./types";

export const STEP_NUMBER: Record<StepId, string> = {
  connect: "01",
  signal: "02",
  specification: "03",
  handoff: "04",
};

export const STEP_LABEL: Record<StepId, string> = {
  connect: "Connect",
  signal: "Read the signal",
  specification: "First specification",
  handoff: "Start writing",
};

export const SOURCE_KIND_LABEL: Record<CorpusSource["kind"], string> = {
  paste: "Pasted",
  upload: "Uploaded",
  link: "Linked",
};

export const KIND_LABEL: Record<RuleKind, string> = {
  avoid_word: "Word",
  sentence_habit: "Sentence",
  structure: "Structure",
  stance: "Stance",
  length: "Length",
};

/**
 * The first specification: seven observations derived from finished writing,
 * ordered strongest first. Nothing here has been replayed against a complaint,
 * because on day one there are no complaints.
 */
export const OBSERVATIONS: Observation[] = [
  {
    id: "o-no-consultant-words",
    text: "Never 'leverage', 'unlock', 'journey' or 'at the end of the day'.",
    kind: "avoid_word",
    basis:
      "None of the four appears once in 159,480 words. Where the obvious sentence would have used one, you wrote around it.",
    sourceId: "c-linkedin-archive",
    confidence: 0.62,
    volatile: false,
  },
  {
    id: "o-short-paragraphs",
    text: "Keep paragraphs to one or two sentences.",
    kind: "length",
    basis:
      "Median paragraph across 64 issues is 1.4 sentences. Six per cent run past three, and all of those are quoted material.",
    sourceId: "c-thursday-note",
    confidence: 0.52,
    volatile: false,
  },
  {
    id: "o-open-on-claim",
    text: "Open on the claim. Nothing before it.",
    kind: "structure",
    basis:
      "61 of 84 posts open on a declarative sentence of twelve words or fewer. Not one opens on a question.",
    sourceId: "c-linkedin-archive",
    confidence: 0.48,
    volatile: false,
  },
  {
    id: "o-one-person",
    text: "Write as one person. Never 'we' when it means you alone.",
    kind: "stance",
    basis:
      "'I' appears 11.2 times per thousand words in sent email. 'We' appears 0.4, and every instance is about a client's team, not yours.",
    sourceId: "c-client-email",
    confidence: 0.44,
    volatile: false,
  },
  {
    id: "o-no-exclamation",
    text: "No exclamation marks.",
    kind: "sentence_habit",
    basis:
      "Three in 159,480 words. All three sit inside a quotation from someone else.",
    sourceId: "c-thursday-note",
    confidence: 0.41,
    volatile: false,
  },
  {
    id: "o-concrete-number",
    text: "Use a figure where a vague quantifier would do.",
    kind: "structure",
    basis:
      "212 figures across 64 issues. 'Many', 'several' and 'a lot of' appear nine times between them.",
    sourceId: "c-thursday-note",
    confidence: 0.37,
    volatile: true,
  },
  {
    id: "o-end-on-statement",
    text: "End on a statement, not a question.",
    kind: "structure",
    basis:
      "Four of 84 posts end on a question. This may be a platform habit rather than yours — the voice notes end on questions constantly.",
    sourceId: "c-voice-notes",
    confidence: 0.33,
    volatile: true,
  },
];

/**
 * The kinds of writing a voice specification wants to see. Four are covered by
 * the connected corpus; two are not, and the gaps are the honest part.
 */
export const REGISTERS: Register[] = [
  {
    id: "reg-short-public",
    label: "Short, public, performed",
    sourceId: "c-linkedin-archive",
  },
  {
    id: "reg-long-own-masthead",
    label: "Long form, your own masthead",
    sourceId: "c-thursday-note",
  },
  {
    id: "reg-one-to-one",
    label: "One to one, unperformed",
    sourceId: "c-client-email",
  },
  {
    id: "reg-spoken",
    label: "Spoken, unedited",
    sourceId: "c-voice-notes",
  },
  {
    id: "reg-abandoned",
    label: "Drafts you abandoned",
    note: "Prepon has only read what you shipped. The sentences you deleted are the ones that would tell it most.",
  },
  {
    id: "reg-ghostwritten",
    label: "Work under a client's byline",
    note: "None connected. If a large share of your output is written to sound like someone else, Prepon is inferring from the smaller half.",
  },
];

/** Below this, inference from volume alone is not worth doing. */
export const INFERENCE_FLOOR = 40_000;

/** The smallest scale the volume measure will draw. */
export const VOLUME_SCALE_MIN = 200_000;
