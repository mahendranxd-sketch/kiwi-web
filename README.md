# Kiwi — landing page

A narrative landing page for **Kiwi**: a calm, visual workspace that turns scattered thoughts into a clear plan.
React 19 + TypeScript + Vite, with GSAP (ScrollTrigger + Flip) for motion.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
```

## The story (one section per beat)

| # | Section | File | The one interaction that carries it |
|---|---------|------|--------------------------------------|
| 01 | First impression | `sections/Hero.tsx` | A live capture bar types a thought, reads `#project` / day / `!`, and files it into the list. "chaos" is out of line until you hover it. |
| 02 | The problem | `sections/Problem.tsx` | One sentence inks in as you scroll; each place in it opens the fragment that lives there. |
| 03 | The shift | `sections/Shift.tsx` | The same 7 fragments sort themselves into projects (Framer Motion layout) once in view; Before / With Kiwi toggles it. |
| 04 | How it works | `sections/HowItWorks.tsx`, `sections/how/Scenes.tsx` | Sticky panel synced to three steps — Capture, Shape (accept suggestions), Focus (plan my day). Inline on mobile. |
| 05 | Product showcase | `sections/Showcase.tsx` | Working workspace: check-off with seed burst + progress ring, expandable tasks, priority cycling, project filters, Board/Week views, real 25-min focus timer. |
| 06 | Proof | `sections/Proof.tsx` | Honest "will / won't" — renders logos and testimonials only when you add real ones to `PROOF` in `lib/config.ts`. |
| 07 | Bigger picture | `sections/BiggerPicture.tsx` | The same day's work, scrubbed from 14 scattered slivers into 3 focus blocks. |
| 08 | Final CTA | `sections/FinalCta.tsx`, `components/KiwiSlice.tsx` | The Kiwi slice assembles (skin draws, flesh grows, seeds pop), leans toward the cursor and bounces when you capture a thought; the button's kiwi rolls away as the arrow rolls in; "chaos" finally lines up. |

## Placeholders to replace

All in `src/lib/config.ts` — nothing on the page is invented proof.

- `SIGNUP_URL` — while `null`, every "Get started" shows a clearly-labelled placeholder notice.
- `PROOF.testimonials` / `PROOF.logos` — empty until verified.
- `LEGAL_LINKS`, `SOCIAL_LINKS` — `href: null` renders "soon" instead of a dead link.

The sample workspace (projects, tasks) lives in `src/lib/data.ts`.

## Motion system

Two libraries, each doing what it's best at:

- **GSAP + ScrollTrigger** — anything tied to scroll or a timeline: hero entrance, the Problem ink-in, the How-it-works step sync, the day-timeline scrub, the CTA callback. `useGsap(scope, fn)` in `src/lib/motion.ts` scopes and fully reverts it on unmount.
- **Framer Motion** — layout changes driven by React state: cards moving between groups (Shift, Shape, Focus, Board), lists re-sorting (Today, hero list), enter/exit. Uses `layout` / `layoutId` with the shared `layoutSpring` and `fadeUp` presets, so items stay in flow, animate with transforms only, and retarget smoothly when clicked mid-animation.

Timing tokens live in `timing` (`src/lib/motion.ts`) and as CSS variables in `styles/tokens.css`. CSS handles hover/focus. Reduced motion is respected everywhere: GSAP code checks `prefers-reduced-motion`, and `<MotionConfig reducedMotion="user">` covers Framer Motion.

## Framer Code Components

`src/components/portable/` contains self-contained components (no global CSS; theme via props or `--kw-*` variables):

| Component | What it does |
|-----------|-------------|
| `MagneticButton` | CTA with cursor magnetism and a swapping arrow chip |
| `CaptureBar` | Natural-language capture with live parsing (needs `lib/parse.ts`) |
| `Reveal` | The site's one entrance pattern, ScrollTrigger-driven |
| `FocusDay` | Scroll-scrubbed "fragmented → focused" day timeline |

`framer/*.framer.tsx` wrap each one with `addPropertyControls`. To use in Framer: create a code file per component, paste the portable component and its `.framer.tsx` wrapper (fix the relative import paths), and for `CaptureBar` also paste `parse.ts`. `gsap` resolves as an npm import in Framer.
