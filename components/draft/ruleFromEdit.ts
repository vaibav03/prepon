import type { EditPair, Rule, RuleKind } from "@/lib/types";

/**
 * Turns one in-place rewrite into a proposed rule, the way Prepon would:
 * read what the writer took out, say it back in one plain sentence, and attach
 * the replay evidence that would have to clear before it goes live.
 *
 * Nothing here goes live. Everything it returns has status 'proposed' and
 * applied/kept/reverted at zero, so `health` reads as replay confidence.
 */

const BANNED_WORDS = [
  "delve",
  "leverage",
  "utilize",
  "robust",
  "seamless",
  "unlock",
  "elevate",
  "landscape",
  "realm",
  "testament",
  "crucial",
  "pivotal",
  "holistic",
  "synergy",
  "ecosystem",
  "curate",
  "harness",
  "myriad",
  "plethora",
  "furthermore",
  "moreover",
  "game-changing",
  "in today's",
  "fast-paced",
  "at the end of the day",
];

const HEDGES = [
  "i think",
  "i believe",
  "it seems",
  "perhaps",
  "arguably",
  "somewhat",
  "fairly",
  "in my opinion",
  "it could be argued",
  "sort of",
  "kind of",
  "a little bit",
];

const PERMISSION = [
  "you can apply if you want",
  "feel free",
  "if you want",
  "you might want to",
  "you may wish",
  "don't hesitate",
  "should you choose",
  "you could consider",
];

const WARM_UPS = [
  "so,",
  "well,",
  "now,",
  "honestly,",
  "look,",
  "basically,",
  "of course,",
  "actually,",
  "here's the thing",
  "the truth is",
  "it's worth noting that",
];

const COMPLAINTS: Record<RuleKind, string[]> = {
  avoid_word: [
    "I have never once said this word to a client out loud.",
    "Strike it everywhere. It is the tell that a machine wrote the sentence.",
    "Every draft reaches for the same vocabulary. Change the vocabulary.",
    "This is the word I delete first, every single time.",
    "If I would not say it in a voice note, do not put it in a post.",
  ],
  sentence_habit: [
    "Two of these punctuation marks in one paragraph and the whole thing reads as a press release.",
    "I rewrite this construction by hand in almost every draft.",
    "Stop building sentences this way. Short, then stop.",
    "This is a habit, not a style. Drop it.",
    "The rhythm is wrong and it is wrong the same way each time.",
  ],
  structure: [
    "I had to read four sentences to find out what you actually thought.",
    "Put the answer first. I can read the reasoning underneath it.",
    "The shape of this is backwards. Conclusion, then evidence.",
    "Stop warming up. Start where it matters.",
    "Give me the number instead of the adjective.",
  ],
  stance: [
    "Say it. Do not ask me whether I would like you to say it.",
    "The hedging makes it sound like you do not believe your own point.",
    "I am paying for a position, not a survey of positions.",
    "Nobody needs permission to read a paragraph.",
    "Take the softening out. The claim is the whole value.",
  ],
  length: [
    "This took three paragraphs to do one paragraph of work.",
    "Half the length, same argument. Every time.",
    "I cut this down by hand before sending it. Do it for me.",
    "Length is where the draft loses the reader, not the idea.",
    "Say it once and move on.",
  ],
};

interface Detected {
  text: string;
  kind: RuleKind;
}

function hash(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 33 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function sentenceCount(text: string): number {
  const matches = text.match(/[.!?](?=\s|$)/g);
  return matches ? matches.length : 1;
}

function countOf(text: string, needle: string): number {
  return text.split(needle).length - 1;
}

/**
 * Whole-word match for single words so that removing "accurate" is never read
 * as removing "curate"; phrases fall back to a plain substring test.
 */
function occurs(haystack: string, needle: string): boolean {
  if (/\s/.test(needle)) return haystack.includes(needle);
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`).test(haystack);
}

function removed(before: string, after: string, needles: string[]): string | null {
  const b = before.toLowerCase();
  const a = after.toLowerCase();
  for (const needle of needles) {
    if (occurs(b, needle) && !occurs(a, needle)) return needle;
  }
  return null;
}

function titleCase(phrase: string): string {
  return phrase.charAt(0).toUpperCase() + phrase.slice(1);
}

/** Trim a phrase to something that fits on one line of a rule card. */
export function clipPhrase(text: string, maxWords = 9): string {
  const words = text.trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
  const head = words.slice(0, maxWords).join(" ").replace(/[.,;:—]$/, "");
  return words.length > maxWords ? `${head}…` : head;
}

/**
 * Strip the words the two versions share at each end so the fallback rule
 * quotes what actually changed, not the sentence it happens to sit in.
 */
function diffPhrase(before: string, after: string): { from: string; to: string } {
  const b = before.trim().split(/\s+/).filter(Boolean);
  const a = after.trim().split(/\s+/).filter(Boolean);

  let head = 0;
  while (head < b.length && head < a.length && b[head].toLowerCase() === a[head].toLowerCase()) {
    head += 1;
  }

  let tail = 0;
  while (
    tail < b.length - head &&
    tail < a.length - head &&
    b[b.length - 1 - tail].toLowerCase() === a[a.length - 1 - tail].toLowerCase()
  ) {
    tail += 1;
  }

  const from = b.slice(head, b.length - tail).join(" ");
  const to = a.slice(head, a.length - tail).join(" ");
  return { from: from || before.trim(), to: to || after.trim() };
}

function detect(before: string, after: string): Detected {
  const bannedWord = removed(before, after, BANNED_WORDS);
  if (bannedWord) {
    return { text: `Never write "${bannedWord}".`, kind: "avoid_word" };
  }

  const hedge = removed(before, after, HEDGES);
  if (hedge) {
    return { text: `Cut "${titleCase(hedge)}". State it flat.`, kind: "stance" };
  }

  if (removed(before, after, PERMISSION)) {
    return {
      text: "Never offer permission. Say the thing and stop.",
      kind: "stance",
    };
  }

  const warmUp = WARM_UPS.find(
    (w) => before.toLowerCase().trimStart().startsWith(w) && !after.toLowerCase().trimStart().startsWith(w),
  );
  if (warmUp) {
    return {
      text: "Delete the warm-up phrase at the start of a sentence.",
      kind: "sentence_habit",
    };
  }

  if (countOf(before, "!") > countOf(after, "!")) {
    return { text: "No exclamation marks, openers included.", kind: "sentence_habit" };
  }

  if (countOf(before, ";") > countOf(after, ";")) {
    return {
      text: "Split it into two sentences rather than reaching for a semicolon.",
      kind: "sentence_habit",
    };
  }

  if (countOf(before, "—") > countOf(after, "—")) {
    return {
      text: "Use a comma or a full stop where the draft reaches for an em dash.",
      kind: "sentence_habit",
    };
  }

  if (before.includes("?") && !after.includes("?")) {
    return {
      text: "Answer the question. Never open by asking one back.",
      kind: "structure",
    };
  }

  if (!/\d/.test(before) && /\d/.test(after)) {
    return {
      text: 'Use the real number instead of "several", "a few" or "many".',
      kind: "structure",
    };
  }

  const beforeWords = wordCount(before);
  const afterWords = wordCount(after);

  if (afterWords > 0 && afterWords <= beforeWords * 0.7) {
    return {
      text: `Say it in ${afterWords} words where this draft used ${beforeWords}.`,
      kind: "length",
    };
  }

  if (sentenceCount(after) > sentenceCount(before) && beforeWords >= 22) {
    return {
      text: `Break sentences over ${beforeWords} words into two.`,
      kind: "structure",
    };
  }

  const { from, to } = diffPhrase(before, after);
  return {
    text: `Prefer "${clipPhrase(to, 7)}" over "${clipPhrase(from, 7)}".`,
    kind: "sentence_habit",
  };
}

/**
 * Build the proposed rule for one captured edit pair. Deterministic: the same
 * rewrite always produces the same rule, the same replay numbers and the same
 * sampled complaints.
 */
export function synthesizeRule(pair: EditPair, ruleId: string): Rule {
  const detected = detect(pair.before, pair.after);
  const seed = hash(`${detected.text}::${pair.before}`);

  // Unsigned shifts throughout: `seed` can exceed 2^31 and a signed shift
  // would hand back a negative modulo and push health out of its band.
  const complaints = 8 + (seed % 11);
  const ratio = 0.6 + ((seed >>> 5) % 22) / 100;
  const fixed = Math.max(3, Math.min(complaints - 1, Math.round(complaints * ratio)));
  const health = Number((0.55 + ((seed >>> 9) % 27) / 100).toFixed(2));

  const pool = COMPLAINTS[detected.kind];
  const offset = seed % pool.length;
  const sampled = [0, 1, 2].map((i) => pool[(offset + i) % pool.length]);

  return {
    id: ruleId,
    text: detected.text,
    kind: detected.kind,
    status: "proposed",
    createdAt: pair.capturedAt,
    applied: 0,
    kept: 0,
    reverted: 0,
    health,
    pinned: false,
    evidence: { complaints, fixed, sampled },
    sourceEdits: [pair],
  };
}
