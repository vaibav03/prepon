import type { Rule } from "@/lib/types";

/**
 * 22 rules for one user: a ghostwriter who posts on LinkedIn, sends a Thursday
 * newsletter and writes a lot of client email. All values are static.
 *
 * health is 0..1. For live and expiring rules it reads as decay health
 * (kept vs reverted, weighted by recency of application). For a proposed rule
 * applied/kept/reverted are 0 and health reads as replay confidence: the
 * strength of the evidence that would promote it.
 */
export const rules: Rule[] = [
  {
    id: "r-verdict-first",
    text: "Give the verdict in the first sentence, then the reasoning.",
    kind: "structure",
    status: "live",
    createdAt: "2026-09-03T09:12:00.000Z",
    applied: 214,
    kept: 201,
    reverted: 13,
    health: 0.94,
    pinned: true,
    evidence: {
      complaints: 19,
      fixed: 17,
      sampled: [
        "I had to read four sentences to find out whether you thought it was a good idea.",
        "Lead with the answer. I can see the reasoning underneath it.",
        "Stop warming up. Start at the conclusion.",
      ],
    },
    sourceEdits: [
      {
        id: "e-verdict-1",
        before:
          "There are a few things worth weighing here. Hiring a fractional CMO is a decision with real tradeoffs, and the right answer depends on stage, budget and how much of the work is positioning versus execution. On balance, for a company your size, it is probably worth it.",
        after:
          "For a company your size it is worth it. The reason is that most of the work at this stage is positioning, and positioning is the part a fractional hire is actually good at.",
        context: "Client email: reply to a founder asking about fractional CMOs",
        capturedAt: "2026-09-03T09:12:00.000Z",
      },
      {
        id: "e-verdict-2",
        before:
          "I have been thinking about pricing a lot lately, and I keep coming back to the same observation about how founders talk about discounts.",
        after:
          "Discounting is the fastest way to teach a buyer that your price was never real. I keep watching founders learn this the expensive way.",
        context: "LinkedIn post draft: pricing",
        capturedAt: "2026-09-14T16:40:00.000Z",
      },
      {
        id: "e-verdict-3",
        before:
          "Whether you should rewrite the careers page is a question that depends on several factors we should probably discuss.",
        after:
          "Rewrite the careers page. Three of your last five candidates quoted it back to you wrong.",
        context: "Newsletter: hiring section",
        capturedAt: "2026-10-02T11:05:00.000Z",
      },
    ],
  },
  {
    id: "r-banned-words",
    text: "Cut 'delve', 'leverage', 'in today's fast-paced world' and 'it's not just X, it's Y'.",
    kind: "avoid_word",
    status: "live",
    createdAt: "2026-09-04T08:30:00.000Z",
    applied: 301,
    kept: 288,
    reverted: 13,
    health: 0.96,
    pinned: true,
    evidence: {
      complaints: 26,
      fixed: 24,
      sampled: [
        "Nobody has ever said 'delve' out loud.",
        "'It's not just a tool, it's a philosophy' — I would never write that sentence.",
        "Every one of these drafts opens in a fast-paced world. Delete it.",
      ],
    },
    sourceEdits: [
      {
        id: "e-banned-1",
        before:
          "In today's fast-paced world, it's not just about shipping features, it's about shipping the right ones.",
        after:
          "Shipping the wrong feature fast is still the wrong feature.",
        context: "LinkedIn post draft: product velocity",
        capturedAt: "2026-09-04T08:30:00.000Z",
      },
      {
        id: "e-banned-2",
        before:
          "Let's delve into the ways you can leverage your existing audience to drive newsletter growth.",
        after:
          "Here is how to use the audience you already have to grow the newsletter.",
        context: "Newsletter: growth section",
        capturedAt: "2026-09-21T13:22:00.000Z",
      },
      {
        id: "e-banned-3",
        before:
          "This is a great opportunity to leverage synergies across both teams.",
        after: "Both teams are solving the same problem twice. Put them in one room.",
        context: "Client email: reorganisation advice",
        capturedAt: "2026-10-11T10:02:00.000Z",
      },
    ],
  },
  {
    id: "r-no-rhetorical-open",
    text: "Never open a post with a rhetorical question.",
    kind: "sentence_habit",
    status: "live",
    createdAt: "2026-09-05T14:48:00.000Z",
    applied: 168,
    kept: 159,
    reverted: 9,
    health: 0.92,
    pinned: false,
    evidence: {
      complaints: 14,
      fixed: 13,
      sampled: [
        "'Ever wondered why...' — no. Nobody has. Start with the thing.",
        "I deleted the first line again. It was a question I already knew the answer to.",
      ],
    },
    sourceEdits: [
      {
        id: "e-rhetorical-1",
        before:
          "Ever wondered why most rebrands fail? It usually isn't the logo.",
        after: "Most rebrands fail for a reason that has nothing to do with the logo.",
        context: "LinkedIn post draft: rebrands",
        capturedAt: "2026-09-05T14:48:00.000Z",
      },
      {
        id: "e-rhetorical-2",
        before:
          "What if I told you your onboarding email is costing you customers?",
        after: "Your onboarding email is costing you customers.",
        context: "LinkedIn post draft: onboarding",
        capturedAt: "2026-09-28T09:17:00.000Z",
      },
    ],
  },
  {
    id: "r-plain-verbs",
    text: "Prefer 'use', 'start' and 'cut' over 'utilise', 'initiate' and 'streamline'.",
    kind: "avoid_word",
    status: "live",
    createdAt: "2026-09-07T11:20:00.000Z",
    applied: 207,
    kept: 192,
    reverted: 15,
    health: 0.9,
    pinned: false,
    evidence: {
      complaints: 16,
      fixed: 14,
      sampled: [
        "'Utilise' is 'use' wearing a blazer.",
        "You streamlined a paragraph that needed deleting.",
      ],
    },
    sourceEdits: [
      {
        id: "e-verbs-1",
        before:
          "We can utilise the existing survey data to streamline the research phase.",
        after: "We can use the survey data we already have and skip the research phase.",
        context: "Client email: research scoping",
        capturedAt: "2026-09-07T11:20:00.000Z",
      },
      {
        id: "e-verbs-2",
        before: "Initiate the conversation with a clear framing of the problem.",
        after: "Start by saying what the problem is.",
        context: "Newsletter: how to pitch internally",
        capturedAt: "2026-10-05T15:33:00.000Z",
      },
    ],
  },
  {
    id: "r-no-em-dash-stack",
    text: "At most one em dash per paragraph, and never two in the same sentence.",
    kind: "sentence_habit",
    status: "live",
    createdAt: "2026-09-09T17:04:00.000Z",
    applied: 188,
    kept: 170,
    reverted: 18,
    health: 0.84,
    pinned: false,
    evidence: {
      complaints: 12,
      fixed: 10,
      sampled: [
        "Three dashes in one paragraph. Pick one and use commas.",
        "The sentence has two asides and no spine.",
      ],
    },
    sourceEdits: [
      {
        id: "e-dash-1",
        before:
          "The hard part — and this is the bit founders underestimate — is that the story has to survive being retold badly — by someone who skimmed it.",
        after:
          "The hard part, and founders underestimate this, is that the story has to survive being retold badly by someone who skimmed it.",
        context: "LinkedIn post draft: narrative",
        capturedAt: "2026-09-09T17:04:00.000Z",
      },
      {
        id: "e-dash-2",
        before:
          "Pricing — like hiring — is a decision you make twice: once on paper and once in the room.",
        after:
          "Pricing, like hiring, is a decision you make twice: once on paper and once in the room.",
        context: "Newsletter: pricing section",
        capturedAt: "2026-10-16T08:51:00.000Z",
      },
    ],
  },
  {
    id: "r-no-permission",
    text: "Never hedge an instruction with 'you can' or 'if you want' — say it plainly.",
    kind: "sentence_habit",
    status: "live",
    createdAt: "2026-09-11T10:38:00.000Z",
    applied: 143,
    kept: 131,
    reverted: 12,
    health: 0.87,
    pinned: true,
    evidence: {
      complaints: 21,
      fixed: 18,
      sampled: [
        "'You can apply if you want' — I am not asking permission from my own draft.",
        "Stop offering me options. Tell me what to write.",
        "'You could consider' is three words of nothing.",
      ],
    },
    sourceEdits: [
      {
        id: "e-permission-1",
        before:
          "You can open with the client anecdote if you want, or you could consider starting with the number instead.",
        after: "Open with the number. The anecdote goes second.",
        context: "Draft feedback: case study post",
        capturedAt: "2026-09-11T10:38:00.000Z",
      },
      {
        id: "e-permission-2",
        before: "You might want to trim the second paragraph a little.",
        after: "Cut the second paragraph. It repeats the first.",
        context: "Draft feedback: newsletter intro",
        capturedAt: "2026-10-01T12:14:00.000Z",
      },
      {
        id: "e-permission-3",
        before:
          "If you'd like, you can also mention the hiring freeze, though it's optional.",
        after: "Mention the hiring freeze. It is the reason the rest of this matters.",
        context: "Client email: market update",
        capturedAt: "2026-10-23T09:40:00.000Z",
      },
    ],
  },
  {
    id: "r-no-closing-cta",
    text: "End a post on its last real sentence — no 'what do you think?' sign-off.",
    kind: "structure",
    status: "live",
    createdAt: "2026-09-12T15:55:00.000Z",
    applied: 131,
    kept: 122,
    reverted: 9,
    health: 0.91,
    pinned: false,
    evidence: {
      complaints: 11,
      fixed: 10,
      sampled: [
        "Every draft ends by begging for comments. Stop.",
        "'Curious what others think' is not a thought.",
      ],
    },
    sourceEdits: [
      {
        id: "e-cta-1",
        before:
          "That's the whole argument. Curious what others are seeing — drop a comment below.",
        after: "That's the whole argument.",
        context: "LinkedIn post draft: agency retainers",
        capturedAt: "2026-09-12T15:55:00.000Z",
      },
      {
        id: "e-cta-2",
        before:
          "Anyway, those are my thoughts. What do you think? Am I wrong about this?",
        after: "I have been wrong about this before, but not this year.",
        context: "LinkedIn post draft: remote work",
        capturedAt: "2026-10-09T17:28:00.000Z",
      },
    ],
  },
  {
    id: "r-concrete-number",
    text: "Use the real number or the real name, never 'significant' or 'a leading client'.",
    kind: "stance",
    status: "live",
    createdAt: "2026-09-15T08:22:00.000Z",
    applied: 112,
    kept: 104,
    reverted: 8,
    health: 0.9,
    pinned: false,
    evidence: {
      complaints: 13,
      fixed: 12,
      sampled: [
        "'A significant increase' — significant is 4% or 400%, and only one of those is a post.",
        "If I can't name the client, the story isn't ready.",
      ],
    },
    sourceEdits: [
      {
        id: "e-number-1",
        before:
          "We saw a significant lift in reply rates after rewriting the sequence for a leading B2B client.",
        after:
          "Reply rates went from 4% to 11% after we rewrote the sequence for Northbeam.",
        context: "LinkedIn post draft: cold email teardown",
        capturedAt: "2026-09-15T08:22:00.000Z",
      },
      {
        id: "e-number-2",
        before: "Most of their traffic came from a handful of key channels.",
        after: "Sixty-one percent of their traffic came from one newsletter swap.",
        context: "Newsletter: traffic audit",
        capturedAt: "2026-10-19T14:06:00.000Z",
      },
    ],
  },
  {
    id: "r-cost-before-gain",
    text: "Say what a thing costs or risks before saying what it gains.",
    kind: "stance",
    status: "live",
    createdAt: "2026-09-18T13:11:00.000Z",
    applied: 97,
    kept: 88,
    reverted: 9,
    health: 0.88,
    pinned: false,
    evidence: {
      complaints: 10,
      fixed: 9,
      sampled: [
        "This reads like a brochure. Where is the part where it goes wrong?",
        "Give me the bill before the benefit.",
      ],
    },
    sourceEdits: [
      {
        id: "e-cost-1",
        before:
          "Moving to a subscription model unlocks predictable revenue, deeper customer relationships and better forecasting. It does take some operational work.",
        after:
          "Moving to a subscription model will break your finance process for two quarters and annoy half your existing buyers. What you get for that is revenue you can actually forecast.",
        context: "Client email: pricing model memo",
        capturedAt: "2026-09-18T13:11:00.000Z",
      },
      {
        id: "e-cost-2",
        before: "Hiring a junior writer frees up your week almost immediately.",
        after:
          "A junior writer costs you about six weeks of editing before it frees up a single hour of your week.",
        context: "Newsletter: delegation section",
        capturedAt: "2026-10-26T10:44:00.000Z",
      },
    ],
  },
  {
    id: "r-post-length",
    text: "Keep a LinkedIn post under 180 words unless I say otherwise.",
    kind: "length",
    status: "live",
    createdAt: "2026-09-20T09:35:00.000Z",
    applied: 76,
    kept: 71,
    reverted: 5,
    health: 0.9,
    pinned: false,
    evidence: {
      complaints: 15,
      fixed: 13,
      sampled: [
        "Too long. This is three posts pretending to be one.",
        "I cut 40% of it and lost nothing.",
        "Nobody reads past the fold. Write to the fold.",
      ],
    },
    sourceEdits: [
      {
        id: "e-length-1",
        before:
          "There is a longer version of this argument that involves the history of agency pricing, the shift to in-house teams, and the way procurement departments changed after 2021, but the short version is this: retainers died because clients stopped buying time.",
        after: "Retainers died because clients stopped buying time.",
        context: "LinkedIn post draft: agency retainers",
        capturedAt: "2026-09-20T09:35:00.000Z",
      },
      {
        id: "e-length-2",
        before:
          "To summarise the four points above: positioning first, then proof, then price, and only then process.",
        after: "Positioning, proof, price, process. In that order.",
        context: "LinkedIn post draft: sales order of operations",
        capturedAt: "2026-10-14T16:19:00.000Z",
      },
    ],
  },
  {
    id: "r-email-one-person",
    text: "In emails, write to one person, not to an audience.",
    kind: "stance",
    status: "live",
    createdAt: "2026-09-24T11:41:00.000Z",
    applied: 58,
    kept: 54,
    reverted: 4,
    health: 0.89,
    pinned: false,
    evidence: {
      complaints: 8,
      fixed: 7,
      sampled: [
        "This email is addressed to a conference room.",
        "'Hope this finds you all well' — it is one person, and she has a name.",
      ],
    },
    sourceEdits: [
      {
        id: "e-email-1",
        before:
          "Hi team, hope this finds you all well. Wanted to share some thoughts on the positioning work ahead of next week.",
        after:
          "Hi Maren. Two thoughts on the positioning work before Tuesday, both about the second paragraph of the homepage.",
        context: "Client email: positioning follow-up",
        capturedAt: "2026-09-24T11:41:00.000Z",
      },
      {
        id: "e-email-2",
        before: "Please find attached the revised draft for everyone's review.",
        after: "Revised draft attached. The only change you need to look at is the headline.",
        context: "Client email: draft delivery",
        capturedAt: "2026-10-21T08:12:00.000Z",
      },
    ],
  },
  {
    id: "r-one-idea",
    text: "One idea per post; if a second shows up, cut it and keep it for Thursday.",
    kind: "structure",
    status: "live",
    createdAt: "2026-09-27T16:07:00.000Z",
    applied: 64,
    kept: 55,
    reverted: 9,
    health: 0.81,
    pinned: false,
    evidence: {
      complaints: 9,
      fixed: 7,
      sampled: [
        "There are two good posts in here and both of them lose.",
        "The pricing bit does not belong in the hiring post.",
      ],
    },
    sourceEdits: [
      {
        id: "e-oneidea-1",
        before:
          "Hiring senior people is a positioning problem. Also, while we're here, most of you are underpricing your retainers by about 30%.",
        after: "Hiring senior people is a positioning problem.",
        context: "LinkedIn post draft: senior hiring",
        capturedAt: "2026-09-27T16:07:00.000Z",
      },
      {
        id: "e-oneidea-2",
        before:
          "Three things I learned from the rebrand: the logo was never the problem, the sales team needed the story more than the market did, and by the way our newsletter doubled.",
        after:
          "The sales team needed the new story more than the market did. That was the whole lesson of the rebrand.",
        context: "LinkedIn post draft: rebrand retrospective",
        capturedAt: "2026-10-28T13:50:00.000Z",
      },
    ],
  },
  {
    id: "r-no-list-of-three",
    text: "Stop grouping everything into three — two or four is fine.",
    kind: "sentence_habit",
    status: "live",
    createdAt: "2026-10-01T10:26:00.000Z",
    applied: 89,
    kept: 77,
    reverted: 12,
    health: 0.78,
    pinned: false,
    evidence: {
      complaints: 7,
      fixed: 6,
      sampled: [
        "The third item is always filler. I can see you reaching for it.",
        "There were two reasons, not three.",
      ],
    },
    sourceEdits: [
      {
        id: "e-three-1",
        before:
          "It comes down to clarity, consistency and commitment.",
        after: "It comes down to saying the same true thing for longer than feels comfortable.",
        context: "LinkedIn post draft: brand consistency",
        capturedAt: "2026-10-01T10:26:00.000Z",
      },
      {
        id: "e-three-2",
        before:
          "You need a story, a proof point and a call to action.",
        after: "You need a story and one number that survives being checked.",
        context: "Newsletter: pitch structure",
        capturedAt: "2026-10-22T15:02:00.000Z",
      },
    ],
  },
  {
    id: "r-newsletter-subhead",
    text: "Give every newsletter section a flat descriptive subhead, not a clever one.",
    kind: "structure",
    status: "live",
    createdAt: "2026-10-06T09:03:00.000Z",
    applied: 44,
    kept: 38,
    reverted: 6,
    health: 0.79,
    pinned: false,
    evidence: {
      complaints: 6,
      fixed: 5,
      sampled: [
        "'The Trust Equation' tells me nothing. Say what the section is about.",
        "I skim my own newsletter. The subheads have to work for a skimmer.",
      ],
    },
    sourceEdits: [
      {
        id: "e-subhead-1",
        before: "The Quiet Part Out Loud",
        after: "Why clients stop replying in month four",
        context: "Newsletter: section heading",
        capturedAt: "2026-10-06T09:03:00.000Z",
      },
      {
        id: "e-subhead-2",
        before: "Signal, Not Noise",
        after: "What I changed in the onboarding doc this week",
        context: "Newsletter: section heading",
        capturedAt: "2026-10-29T08:36:00.000Z",
      },
    ],
  },
  {
    id: "r-no-counter-question",
    text: "Never answer a question with another question.",
    kind: "sentence_habit",
    status: "proposed",
    createdAt: "2026-10-27T10:15:00.000Z",
    applied: 0,
    kept: 0,
    reverted: 0,
    health: 0.72,
    pinned: false,
    evidence: {
      complaints: 14,
      fixed: 11,
      sampled: [
        "I asked whether to cut the intro and got asked what my goal was.",
        "Answer first. Ask after, if you still need to.",
        "Second time I have asked this. Still no answer.",
      ],
    },
    sourceEdits: [
      {
        id: "e-question-1",
        before:
          "Before we decide on the intro, what is the main outcome you want from this post?",
        after:
          "Cut the intro. If the post needs a different outcome than the one it has, tell me and I will redo it.",
        context: "Draft feedback: post intro",
        capturedAt: "2026-10-27T10:15:00.000Z",
      },
      {
        id: "e-question-2",
        before: "Are you writing this for founders or for operators?",
        after:
          "This reads as if it is for operators. If you meant founders, the second paragraph has to go.",
        context: "Draft feedback: audience",
        capturedAt: "2026-10-29T16:48:00.000Z",
      },
    ],
  },
  {
    id: "r-no-quote-open",
    text: "Never open with somebody else's quotation.",
    kind: "structure",
    status: "proposed",
    createdAt: "2026-10-29T09:44:00.000Z",
    applied: 0,
    kept: 0,
    reverted: 0,
    health: 0.64,
    pinned: false,
    evidence: {
      complaints: 8,
      fixed: 6,
      sampled: [
        "I do not open with Peter Drucker. Nobody should.",
        "Starting with a quote is borrowing a voice I already have.",
      ],
    },
    sourceEdits: [
      {
        id: "e-quote-1",
        before:
          "\"Culture eats strategy for breakfast.\" Drucker was right, and most leadership teams still haven't noticed.",
        after:
          "Most leadership teams treat culture as the thing they will fix after the strategy works. It is the other way round.",
        context: "LinkedIn post draft: culture",
        capturedAt: "2026-10-29T09:44:00.000Z",
      },
      {
        id: "e-quote-2",
        before:
          "As Seth Godin once wrote, people do not buy goods and services. They buy relations, stories and magic.",
        after:
          "People will pay more for a story they can repeat than for a product they have to explain.",
        context: "Newsletter: brand section",
        capturedAt: "2026-10-31T12:09:00.000Z",
      },
    ],
  },
  {
    id: "r-shorter-paras",
    text: "Keep paragraphs to three sentences in posts and five in the newsletter.",
    kind: "length",
    status: "proposed",
    createdAt: "2026-10-30T15:31:00.000Z",
    applied: 0,
    kept: 0,
    reverted: 0,
    health: 0.81,
    pinned: false,
    evidence: {
      complaints: 11,
      fixed: 9,
      sampled: [
        "This paragraph is seven sentences long and I lost the thread at four.",
        "Break it. It is a wall on a phone.",
        "Too long again.",
      ],
    },
    sourceEdits: [
      {
        id: "e-paras-1",
        before:
          "The reason most positioning work fails is that it is done by committee, and committees optimise for the least objectionable phrase rather than the most useful one, which means you end up with language that nobody disagrees with and nobody remembers, and six months later the sales team is still using the old deck because the old deck at least said something, even if what it said was wrong.",
        after:
          "Most positioning work fails because it is done by committee. Committees optimise for the least objectionable phrase, not the most useful one.\n\nSix months later the sales team is still using the old deck. At least the old deck said something.",
        context: "Newsletter: positioning section",
        capturedAt: "2026-10-30T15:31:00.000Z",
      },
      {
        id: "e-paras-2",
        before:
          "I spent Tuesday rewriting a careers page and the thing that struck me, again, is that every company describes itself as fast-moving and collaborative and mission-driven, and none of them describe what you would actually do on a Wednesday, which is the only thing a good candidate is trying to find out.",
        after:
          "I spent Tuesday rewriting a careers page. Every company on earth describes itself as fast-moving and mission-driven.\n\nNone of them describe what you would do on a Wednesday. That is the only thing a good candidate came to find out.",
        context: "LinkedIn post draft: careers pages",
        capturedAt: "2026-11-01T09:58:00.000Z",
      },
    ],
  },
  {
    id: "r-dates-plain",
    text: "Write dates as 'Sept 14', never 'the 14th of September'.",
    kind: "avoid_word",
    status: "proposed",
    createdAt: "2026-11-01T11:12:00.000Z",
    applied: 0,
    kept: 0,
    reverted: 0,
    health: 0.55,
    pinned: false,
    evidence: {
      complaints: 5,
      fixed: 3,
      sampled: [
        "'The 3rd of November' is how an invitation talks, not an email.",
        "Short dates. Always.",
      ],
    },
    sourceEdits: [
      {
        id: "e-dates-1",
        before: "The workshop runs on the 14th of September at half past nine.",
        after: "Workshop is Sept 14, 9:30.",
        context: "Client email: scheduling",
        capturedAt: "2026-11-01T11:12:00.000Z",
      },
      {
        id: "e-dates-2",
        before: "We shipped the rebrand on the 2nd of October, 2026.",
        after: "We shipped the rebrand on Oct 2.",
        context: "Newsletter: timeline",
        capturedAt: "2026-11-01T11:26:00.000Z",
      },
    ],
  },
  {
    id: "r-no-exclamation",
    text: "No exclamation marks anywhere, including in email sign-offs.",
    kind: "sentence_habit",
    status: "expiring",
    createdAt: "2026-09-08T12:02:00.000Z",
    applied: 23,
    kept: 14,
    reverted: 9,
    health: 0.34,
    pinned: false,
    evidence: {
      complaints: 6,
      fixed: 5,
      sampled: [
        "I do not shout at clients.",
        "'Thanks so much!!' is not my voice.",
      ],
    },
    sourceEdits: [
      {
        id: "e-exclaim-1",
        before: "Thanks so much, this is great! Looking forward to it!",
        after: "Thanks, this is good. See you Tuesday.",
        context: "Client email: sign-off",
        capturedAt: "2026-09-08T12:02:00.000Z",
      },
      {
        id: "e-exclaim-2",
        before: "Big news this week!",
        after: "One thing happened this week that is worth your time.",
        context: "Newsletter: opening line",
        capturedAt: "2026-09-26T09:14:00.000Z",
      },
    ],
  },
  {
    id: "r-story-open",
    text: "Open with the moment it happened, not the lesson it taught.",
    kind: "structure",
    status: "expiring",
    createdAt: "2026-09-16T10:49:00.000Z",
    applied: 31,
    kept: 19,
    reverted: 12,
    health: 0.41,
    pinned: false,
    evidence: {
      complaints: 7,
      fixed: 5,
      sampled: [
        "Do not tell me the moral in line one.",
        "Start in the room. I will work out the lesson.",
      ],
    },
    sourceEdits: [
      {
        id: "e-story-1",
        before:
          "The lesson I learned from losing a client in month three is that silence is always about expectations.",
        after:
          "In the third month, Maren stopped replying to my Friday notes. It took me two weeks to ask why.",
        context: "LinkedIn post draft: client churn",
        capturedAt: "2026-09-16T10:49:00.000Z",
      },
      {
        id: "e-story-2",
        before: "Here is what great onboarding taught me about trust.",
        after:
          "On the first call the new client asked me to explain what I had already sent her. Twice.",
        context: "Newsletter: onboarding section",
        capturedAt: "2026-10-12T14:31:00.000Z",
      },
    ],
  },
  {
    id: "r-first-person-singular",
    text: "Say 'I' in posts, never 'we', unless the company actually did the thing.",
    kind: "stance",
    status: "expiring",
    createdAt: "2026-09-22T13:28:00.000Z",
    applied: 17,
    kept: 9,
    reverted: 8,
    health: 0.28,
    pinned: false,
    evidence: {
      complaints: 5,
      fixed: 3,
      sampled: [
        "There is no 'we'. It is me and a contractor.",
        "'We believe' — who is we?",
      ],
    },
    sourceEdits: [
      {
        id: "e-person-1",
        before: "We believe positioning should come before performance marketing.",
        after: "I think positioning has to come before performance marketing.",
        context: "LinkedIn post draft: marketing order",
        capturedAt: "2026-09-22T13:28:00.000Z",
      },
      {
        id: "e-person-2",
        before: "We rewrote the homepage in a week.",
        after: "I rewrote the homepage in a week, and then Dani fixed the headline.",
        context: "LinkedIn post draft: homepage rewrite",
        capturedAt: "2026-10-18T10:57:00.000Z",
      },
    ],
  },
  {
    id: "r-no-semicolon",
    text: "Never use a semicolon.",
    kind: "avoid_word",
    status: "retired",
    createdAt: "2026-09-06T09:50:00.000Z",
    applied: 52,
    kept: 11,
    reverted: 41,
    health: 0.06,
    pinned: false,
    evidence: {
      complaints: 3,
      fixed: 2,
      sampled: [
        "Too many semicolons in that paragraph.",
        "This reads like a legal filing.",
      ],
    },
    sourceEdits: [
      {
        id: "e-semi-1",
        before:
          "The deck was fine; the story underneath it was not.",
        after: "The deck was fine. The story underneath it was not.",
        context: "Client email: deck review",
        capturedAt: "2026-09-06T09:50:00.000Z",
      },
      {
        id: "e-semi-2",
        before:
          "I put it back. The semicolon was doing work there; the full stop was too hard a stop.",
        after:
          "I put it back. The semicolon was doing work there; the full stop was too hard a stop.",
        context: "Reverted by hand, 41 times",
        capturedAt: "2026-10-24T16:22:00.000Z",
      },
    ],
  },
];

export function getRule(id: string): Rule | undefined {
  return rules.find((rule) => rule.id === id);
}

export default rules;
