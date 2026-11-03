# Prepon — design direction

Reference: https://www.tryclean.ai (YC-backed B2B AI company, warm-dark editorial).
Captured 2026-11-02. We match its **register and structure**, not its content, brand or assets.

## Register

Warm near-black, high-contrast serif display headings, small warm-grey sans body, pill buttons,
generous vertical rhythm, and simulated product UI woven through the page instead of stock
illustration. Reads as a funded company, not a side project.

Dark is the primary theme. Light is secondary (or omitted) — do not design light-first.

## Colour tokens

| Token | Value | Use |
|---|---|---|
| `--surface-page` | `#161413` | page background, warm near-black |
| `--surface-raised` | `#1E1C1B` | sections lifted off the page |
| `--surface-card` | `#262424` | cards, secondary buttons |
| `--text-primary` | `#E8E2D9` | headings, bone white |
| `--text-secondary` | `#C3BDB6` | body copy |
| `--text-faint` | `#988F86` | labels, metadata, eyebrows |
| `--hairline` | `rgba(255,255,255,0.12)` | 1px borders, dividers |
| `--accent` | `#4C8DF6` | links, the active-step progress line. Sparingly. |

Rule-state colours layer on top of this and stay semantic:
live / proposed / expiring / retired. Never decorative.

## Type

- **Display / headings:** a transitional serif. `Newsreader` via next/font (Clean uses Libertinus
  Serif). h1 ~45px, h2 ~34px, tight leading, normal weight — not bold.
- **Body / UI:** `Geist` via next/font. Body 13–15px. Small, dense, warm grey.
- The serif/sans split is the whole look: serif says *editorial*, the small sans says *software*.

## Shape

- Border radius 12px on cards and panels.
- Buttons are **full pills** (`rounded-full`).
  - Primary: white background, near-black text, no shadow.
  - Secondary: `--surface-card`, bone text, 1px hairline.
- Nav is a **centred floating pill** with a blurred backdrop, fixed to the top.

## Page structure (landing)

1. Eyebrow — positioning line in `--text-faint` ("Personalization layer for AI products").
   NOT a credential line. Prepon is applying to YC, not backed — no badge, no investor logos.
2. Hero — serif h1, two-line sans subhead, primary + secondary pill CTAs.
3. **Product plate** — a framed, chrome-less mock of the real product sitting on a photographic
   background panel, radius 12px.
4. **The loop** — pushback → rule → replay gate → live → decay, as the actual mechanism.
   This occupies the slot where the reference puts a logo wall.
5. **Feature accordion** — sticky left column of 4 steps that auto-advance with a thin accent
   progress line under the active one, paired with a right panel that swaps simulated product
   cards over a photographic plate. This is the signature section.
6. Rules earn promotion by replay / rules expire — the two defensible mechanisms, each its own
   passage with real numbers (60-rule cap, replay against past complaints).
7. A full simulated app screen, captioned.
8. The kill line, stated plainly: if the loop isn't beating a style guide the writer wrote
   themselves after 100 edits, it adds nothing and we say so.
9. FAQ accordion.
10. Closing CTA, fat footer.

**Omitted on purpose:** customer story, testimonials, logo wall, metrics, investor row, "trusted
by". There are no customers. Do not design these sections and do not leave placeholder slots for
them — the page is shorter instead.

## Simulated product frames

The page shows the product working, as real DOM built from the real components and fixtures — not
screenshots, not video. Cards float over photographic plates with the app's own dark chrome.

Honest caption where a frame is scripted: "Scripted walkthrough of the rule loop."

## Hard nos

Purple/blue gradients, glassmorphism, sparkle icons, "AI-powered" badges, confetti, emoji
iconography, meaningless progress bars, gamified rule health, invented customer logos,
fabricated metrics or testimonials.
