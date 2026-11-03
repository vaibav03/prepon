import type { Draft } from "@/lib/types";

/**
 * Three drafts at the length and grain of real posts. Each paragraph is an
 * array of spans. A span with a ruleId is text a live rule shaped; a span with
 * origin 'user' is the writer's own hand. Spans with origin 'ai' and no ruleId
 * are ordinary model output. Spans concatenate with no joining whitespace, so
 * leading and trailing spaces inside a span are deliberate.
 */
export const drafts: Draft[] = [
  {
    id: "d-retainers",
    title: "Retainers died because clients stopped buying time",
    prompt:
      "A LinkedIn post about why agency retainers collapsed this year. Use the Northbeam numbers.",
    createdAt: "2026-11-01T08:40:00.000Z",
    appliedRuleIds: [
      "r-verdict-first",
      "r-no-rhetorical-open",
      "r-concrete-number",
      "r-post-length",
      "r-no-closing-cta",
    ],
    paragraphs: [
      [
        {
          text: "Retainers died because clients stopped buying time.",
          ruleId: "r-verdict-first",
          origin: "ai",
        },
        {
          text: " Not because budgets shrank, and not because in-house teams got good.",
          origin: "ai",
        },
      ],
      [
        {
          text: "I watched it happen at Northbeam in March. They had paid us for eighteen months at a flat monthly number, and in the renewal call their new CFO asked a question nobody had asked before: ",
          origin: "ai",
        },
        {
          text: "what exactly expires at the end of the month?",
          origin: "user",
        },
        {
          text: " There was no good answer. The retainer was a subscription to our availability, and availability had stopped being scarce.",
          origin: "ai",
        },
      ],
      [
        {
          text: "We rewrote the agreement in a week. Same team, same hours, priced against four named deliverables instead of a calendar. Revenue went from $14k a month to $19k, and the renewal conversation got shorter every quarter after that.",
          ruleId: "r-concrete-number",
          origin: "ai",
        },
      ],
      [
        {
          text: "The uncomfortable part is what it says about the eighteen months before. We had been charging for the risk that they might need us, and they had been paying it out of politeness.",
          ruleId: "r-cost-before-gain",
          origin: "ai",
        },
      ],
      [
        {
          text: "If your renewal call is a negotiation about hours, you have already lost the argument about value.",
          ruleId: "r-no-closing-cta",
          origin: "ai",
        },
      ],
    ],
  },
  {
    id: "d-careers-page",
    title: "What you would actually do on a Wednesday",
    prompt:
      "Post about careers pages. The Tuesday rewrite, the Wednesday line. Keep it short.",
    createdAt: "2026-11-01T14:05:00.000Z",
    appliedRuleIds: [
      "r-no-rhetorical-open",
      "r-banned-words",
      "r-shorter-paras",
      "r-post-length",
      "r-first-person-singular",
    ],
    paragraphs: [
      [
        {
          text: "I spent Tuesday rewriting a careers page for a forty-person company.",
          ruleId: "r-first-person-singular",
          origin: "ai",
        },
        {
          text: " The old one said fast-moving, collaborative and mission-driven, which is what every careers page on earth says.",
          ruleId: "r-banned-words",
          origin: "ai",
        },
      ],
      [
        {
          text: "None of them describe what you would do on a Wednesday.",
          ruleId: "r-shorter-paras",
          origin: "ai",
        },
        {
          text: " That is the only thing a good candidate came to find out.",
          origin: "ai",
        },
      ],
      [
        {
          text: "So we wrote the Wednesday. Standup at 9:40 that runs eleven minutes. One customer call you will be on but not leading, for the first two months. An afternoon you own, with nobody in it. ",
          origin: "ai",
        },
        {
          text: "A Slack channel where the CEO argues with the head of sales in public, which you will find alarming for about three weeks.",
          origin: "user",
        },
      ],
      [
        {
          text: "Applications went down by a third. The shortlist got better, and the two people they hired had both quoted the Wednesday paragraph back in their first interview.",
          ruleId: "r-concrete-number",
          origin: "ai",
        },
      ],
    ],
  },
  {
    id: "d-newsletter-silence",
    title: "Thursday note: why clients stop replying in month four",
    prompt:
      "Thursday newsletter, lead section. The Maren story. Flat subheads, three or four paragraphs.",
    createdAt: "2026-10-30T07:20:00.000Z",
    appliedRuleIds: [
      "r-verdict-first",
      "r-story-open",
      "r-newsletter-subhead",
      "r-email-one-person",
      "r-no-em-dash-stack",
    ],
    paragraphs: [
      [
        {
          text: "Why clients stop replying in month four",
          ruleId: "r-newsletter-subhead",
          origin: "ai",
        },
      ],
      [
        {
          text: "In the third month, Maren stopped replying to my Friday notes.",
          ruleId: "r-story-open",
          origin: "ai",
        },
        {
          text: " I kept sending them. Four of them, each one longer than the last, each one a small argument that I was still being useful.",
          origin: "ai",
        },
      ],
      [
        {
          text: "Silence in month four is almost never about the work. It is about a promise made in month one that quietly stopped being measured.",
          ruleId: "r-verdict-first",
          origin: "ai",
        },
        {
          text: " In our case the promise was that she would spend less time on copy. By March she was spending more, because every draft I sent came back to her desk for a decision only she could make.",
          ruleId: "r-no-em-dash-stack",
          origin: "ai",
        },
      ],
      [
        {
          text: "I asked her about it on a call in April. ",
          origin: "ai",
        },
        {
          text: "She said the work was good and the week was worse. Both of those were true at the same time, and only one of them was on my invoice.",
          origin: "user",
        },
      ],
      [
        {
          text: "The fix cost me two hours a month: a one-page note at the start of every engagement that says what the client will stop doing, with a date on it. Since June, no month-four silence. Three clients have asked to renew early, which never used to happen.",
          ruleId: "r-cost-before-gain",
          origin: "ai",
        },
      ],
    ],
  },
];

export default drafts;
