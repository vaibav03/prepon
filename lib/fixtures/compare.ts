import type { ComparePair } from "@/lib/types";

/**
 * Blind pairs for the compare screen. One side is written with this user's
 * live rules applied, the other is a plain draft. `prepon` says which.
 * The side marked `prepon` is never consistently a or b.
 */
export const comparePairs: ComparePair[] = [
  {
    id: "cmp-pricing",
    prompt: "A short post about why discounting trains buyers to distrust your price.",
    prepon: "b",
    a: [
      "Have you ever wondered why that 20% discount never seems to close the deal any faster? In today's competitive market, discounting has become an almost reflexive response to buyer hesitation, and it's worth taking a moment to delve into what it actually signals.",
      "When you drop your price without changing your scope, you are effectively telling the buyer that your original number was flexible. Over time, this erodes trust and creates a dynamic where every future negotiation starts from your discounted floor rather than your actual value.",
      "The alternative is to hold firm and focus on articulating value. What do you think — have you found discounting helpful or harmful in your own deals?",
    ],
    b: [
      "A discount is the fastest way to teach a buyer that your price was never real.",
      "The cost shows up later, not in the deal you discounted. It shows up in the next one, where your buyer opens at the number you came down to last time, because you taught them that number exists. I have watched three clients spend a year climbing back from one bad quarter of 20% off.",
      "What you get for holding the price is a slower first deal and a shorter second one.",
    ],
  },
  {
    id: "cmp-hiring",
    prompt: "Newsletter section: hiring a junior writer, for an audience of solo consultants.",
    prepon: "a",
    a: [
      "A junior writer costs you about six weeks of editing before it frees up a single hour of your week.",
      "The six weeks are not training in the way people mean it. They are the time it takes for someone to learn which of your opinions are real and which are moods. Nobody can read that off a style guide, and you cannot write it down, because half of it you only discover when you are annoyed at a draft.",
      "What you get on the other side is a Tuesday that is not entirely spoken for. For most people reading this, that is worth the six weeks. For anyone whose pipeline is thin right now, it is not, and the honest move is to wait a quarter.",
    ],
    b: [
      "Hiring a junior writer can be a transformative step for your consulting practice. It frees up your calendar almost immediately, allows you to take on more clients, and gives you the leverage you need to grow beyond the limits of your own hours.",
      "Of course, there is an onboarding period to consider. You'll want to invest time upfront in documentation, style guides, and feedback loops to set your new hire up for success. Many consultants find that this investment pays dividends within the first quarter.",
      "If you're thinking about making your first hire, you might consider starting with a part-time arrangement to test the fit before committing fully.",
    ],
  },
  {
    id: "cmp-churn",
    prompt: "A post about a client who went quiet in month four.",
    prepon: "b",
    a: [
      "\"The single biggest problem in communication is the illusion that it has taken place.\" George Bernard Shaw said that, and it's never been more relevant than in the world of client relationships.",
      "Client silence is one of the most challenging dynamics we face as service providers. It can stem from a variety of factors: shifting priorities, internal politics, budget pressures, or simply the natural ebb and flow of a long engagement. The key is not to take it personally.",
      "In my experience, the three keys to re-engagement are proactive communication, consistent value delivery, and clear expectation setting. Master these, and month four becomes just another month.",
    ],
    b: [
      "In the third month, Maren stopped replying to my Friday notes.",
      "I kept sending them. Four more, each one longer than the last, each one a small argument that I was still useful. None of them got an answer, and the longer they got the more obvious it was that I was writing them for myself.",
      "Silence in month four is almost never about the work. It is about a promise made in month one that quietly stopped being measured. In our case the promise was that she would spend less time on copy, and by March she was spending more, because every draft came back to her desk for a decision only she could make.",
    ],
  },
  {
    id: "cmp-rebrand",
    prompt: "Client email: should they rebrand before or after the Series A?",
    prepon: "a",
    a: [
      "Hi Dani. Rebrand after the raise, not before.",
      "Doing it now costs you about five weeks of your own attention at the exact point where investors want to talk to you and not your design partner. It also means pitching a story the market has not heard you tell yet, which is a harder room than the one you are already good in.",
      "After the round you will have a reason for the new story, a number to tell it with, and someone whose job it is to run the project. If the current site is actively losing you intro calls, tell me and I will change my answer.",
    ],
    b: [
      "Hi team, hope this finds you all well! Great question about rebrand timing — it's definitely something worth thinking through carefully.",
      "There are compelling arguments on both sides. Rebranding before the raise can help you present a more polished image to investors, while waiting until after gives you more resources and clarity. It really depends on your specific situation, your runway, and how much bandwidth your team has right now.",
      "You can always start with a lightweight refresh if you want to test the waters. Happy to jump on a call to delve into this further if that would be helpful!",
    ],
  },
];

export default comparePairs;
