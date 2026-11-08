# Rules

These are hard rules. If a request conflicts with one, say so and ask before breaking it.

## Anti-slop (visual)

Never add any of these. They are the patterns that make a site look AI-generated (catalogued at impeccable.style/slop):

- Gradients of any kind: backgrounds, text, buttons, borders.
- Glows, neon edges, blurred light blobs, radial halos, spotlight effects.
- Glassmorphism, frosted panels, backdrop blur.
- Decorative grid or dot backgrounds. (Particles are the illustration, not wallpaper.)
- A small badge, pill or label above a heading ("Introducing", "01 / About").
- Tiny numbered section labels.
- Hero metric layouts: one huge number with a small caption.
- Identical card grids, nested cards, cards with a thick coloured left border. The one exception is each chapter's single framed text panel (DESIGN.md, Brutalist frames).
- Soft or blurred shadows of any kind. The only shadows allowed are hard offsets with zero blur on the brutalist frames.
- Icon tiles stacked above headings.
- Oversized italic serif headlines, cream or beige backgrounds.
- Pulsing status dots, blinking cursors, auto-scrolling marquees.
- Bounce, elastic or overshoot easing.
- Emoji in UI or copy.
- Placeholder illustrations made of generic circles and blocks.
- Inter, Geist or other default fonts. Use only the fonts in DESIGN.md.

## Anti-slop (copy)

- No em dashes. Use a full stop, colon or comma.
- No "supercharge", "world-class", "cutting-edge", "next-generation", "passionate about", "leverage", "seamless", "unlock".
- No "Not X. It's Y." constructions. No calling things "theater".
- Every claim must be true and checkable from Anjir's CV, papers or code. Never invent numbers, quotes, employers or results. Use a clear `[PLACEHOLDER]` when a fact is missing.

## Code and modularity

- Colours exist only in `src/theme/tokens.ts`. CSS reads them through variables. No hex values anywhere else.
- Engine tuning values live in `src/engine/config.ts`. Transition timing lives in `src/engine/transitions.ts`.
- Section copy lives only in `src/sections/`. Site facts and links live only in `src/content/site.ts`.
- `src/engine/` must not import React or anything from `src/sections`, `src/components` or `src/content`.
- One component per file for components with state. Small presentational pieces may share `ui.tsx`.
- New sections must be added through `scenes.tsx` only. If adding a section needs edits anywhere else, improve the abstraction instead.
- TypeScript strict. No `any`. No `// @ts-ignore`.
- Ask before adding a dependency. Prefer a small hand-written function over a library.
- Keep the `data-scene`, `data-state`, `data-head` and `data-scan` attributes stable.

## Accessibility

- Text contrast at least 4.5:1 (3:1 for text 24 px and larger). Check accent colours on black.
- All interactive elements are real `<a>` or `<button>` with a visible focus ring and at least 44 by 44 px.
- Keyboard: arrow keys, Page Up and Page Down move chapters. The hidden skip buttons appear on focus.
- Hidden sections get `inert` and `aria-hidden`. Only the current section is reachable.
- The canvas is `aria-hidden`. All meaning must exist in the text.
- `prefers-reduced-motion`: no particle flights, instant section swaps.
- Body text never below 16 px. Hints never below 13 px.

## Performance

- 60 fps on a mid-range laptop at 1440 by 900. If it drops, lower `ENGINE.particles` first, then move path maths into the vertex shader.
- Device pixel ratio capped at 2.
- No layout reads inside the animation loop except the canvas size on resize.
- Images for evidence: WebP or AVIF, at most 200 KB each, lazy loaded. Clips: muted MP4 under 1.5 MB.
- First paint shows the hook text immediately; particles may arrive after fonts load.

## Before you say done

1. `npm run typecheck` passes.
2. Grep your diff for `#` followed by hex digits outside `tokens.ts`. Remove any.
3. Grep your diff for em dashes and the banned words above.
4. Each section still has exactly one `<Heading>` and at most one `<Accent>`.
5. Check the slop list against what you added.
6. Tell Anjir what to look at in the browser at 1440 px and at 390 px, and what should feel different.
