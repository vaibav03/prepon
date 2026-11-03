# Prepon

Prepon makes AI learn how one person wants to be written for.

It watches the moments a writer pushes back — a rewritten sentence, "too long", the
same question asked twice — and turns each one into a short rule in plain English
("Give the verdict in the first sentence, then the reasoning."). Those rules are
injected before the next answer.

Two things keep it from being a prompt wrapper, and the UI has to show both:

- **Replay gate.** A rule stays *proposed* until it has been replayed against that
  writer's past complaints and shown to fix them. The evidence is inspectable:
  "replayed against 14 past complaints, would have fixed 11".
- **Decay.** Rules expire. Each one tracks how often it applied, how often the
  writer left it alone and how often they reverted it. Reverted drops fast, unused
  decays, and the live set is capped at 60, so a new rule displaces an old one.

Rules are the writer's property: plain English, editable and deletable by hand.
Editing a rule is itself a signal. Prepon changes how the AI says things, never
what it concludes.

## Running it

```bash
pnpm install
pnpm dev      # http://localhost:3000
```

Next.js 16 (App Router, typed routes), React 19, TypeScript, Tailwind CSS v4,
Motion 14. Tailwind v4 is CSS-first: there is no `tailwind.config.js`, and every
theme token lives in `@theme inline` inside `app/globals.css`.

## Routes

| Route              | Screen                                                        |
| ------------------ | ------------------------------------------------------------- |
| `/`                | Landing page                                                   |
| `/app`             | Redirects to `/app/rules`                                      |
| `/app/rules`       | The rule set: live, proposed, expiring, retired                |
| `/app/draft`       | A draft with the rules that shaped each span                   |
| `/app/compare`     | Blind pairs: Prepon-shaped draft against a plain one           |
| `/app/progress`    | Win rate against edits, and the health of the live set         |
| `/app/onboarding`  | Sources Prepon read before proposing its first rule            |

Product screens live under `app/(product)/app/<name>/page.tsx` and share the shell
in `app/(product)/layout.tsx`. The landing page keeps its own chrome.

## Data

Fixtures only — no database, no API routes, no network calls, no model calls.

- `lib/types.ts` — the shared data contract (`Rule`, `Draft`, `ComparePair`, …).
- `lib/fixtures/` — `rules`, `drafts`, `winRate`, `comparePairs`, `corpus`, and
  `getRule(id)`, all re-exported from `lib/fixtures/index.ts`. Every value is
  static; nothing calls `Date.now()` or `Math.random()`.

Import through the `@/` alias: `import { rules, getRule } from "@/lib/fixtures"`.

## Design

Typography is the product. Prose is Newsreader at a ~65ch measure; UI chrome is
Inter at small sizes. Colour is a warm near-paper light theme and a true dark
theme, both driven by the custom properties in `app/globals.css` — no hex belongs
anywhere else. Accent carries meaning (live / proposed / expiring / retired),
never decoration. Rule health is an instrument, not a score.
