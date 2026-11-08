# Anjir Jaman portfolio

A full-screen, scroll-driven story site. Particles on a pure black stage form an animated machine, then Anjir's portrait, then one illustration per chapter. Each scroll gesture plays a cinematic transition into the next chapter. The audience is employers hiring AI engineers and professors offering funded master's places.

Before any task, read these and follow them. They override your defaults:
@DESIGN.md
@RULES.md

## Stack

- Vite 5, React 18, TypeScript (strict)
- Three.js for rendering the particles (positions are simulated on the CPU in `ParticleSystem`, drawn by a Three.js `Points` shader)
- Plain CSS with custom properties. No Tailwind, no CSS-in-JS, no UI libraries.
- No animation libraries are installed yet. Ask before adding any dependency.

## Commands

- `npm run dev`: dev server
- `npm run typecheck`: must pass before you say a task is done
- `npm run build`: type-check plus production build
- `npm run portrait`: regenerate `public/portrait.json` from `scripts/source/portrait.png` (Python 3 with numpy, scipy, Pillow)

## Folder map

```
src/
  theme/tokens.ts        ALL colours. Section colours by name + neutrals. Mirrored to CSS vars.
  content/scenes.tsx     The story in order. One entry per section: colour, layout, shape, transition, copy.
  content/site.ts        Name, email, nav, links.
  sections/*.tsx         Copy for each section, written with the components in components/ui.tsx.
  components/
    Stage.tsx            Full-screen host: canvas, scenes, header, scroll cue, keyboard skip buttons.
    Scene.tsx            One section wrapper. Sets --section colour and layout class.
    ui.tsx               Heading, Accent, Body, Hint, Stack, Row, LinkArrow, ButtonLink, Evidence.
    Header.tsx
  engine/                Framework-free. Never import React here.
    Director.ts          Orchestrates sections, transitions, text reveal, input.
    ParticleSystem.ts    Particle state, hold (spring) and flight (planned path) behaviour.
    ParticleRenderer.ts  Three.js renderer for the particle arrays.
    ScrollInput.ts       Wheel, touch and keyboard to deliberate next/previous commands (one gesture = one chapter).
    transitions.ts       Transition registry (zoom, orbit, shock, scan, ink, grid, collapse, drift).
    shapes/              Illustration builders (machine, portrait, orbits, seismic, mesh, text, windows).
    sampling.ts          Draw-to-points helpers, heading sampler.
    config.ts            Tuning knobs: particle counts, springs, timing, scroll thresholds, regions.
  styles/global.css      All styles. Layout variants are .scene--<name>.
public/portrait.json     Stippled portrait points.
reference/               The approved HTML prototype. Read it for behaviour, never import from it.
scripts/stipple.py       Portrait stippler (crop box is tuned to the current photo).
```

## Common tasks

**Add a section**
1. Create `src/sections/MySection.tsx` using components from `components/ui.tsx`. Exactly one `<Heading>` with at most one `<Accent>` word.
2. Add an entry in `src/content/scenes.tsx`: `id`, `label`, `color`, `layout`, `shape`, optional `region`, `enter`, `Content`.
3. If it needs a new illustration, add a `ShapeSpec` variant in `engine/types.ts`, a builder in `engine/shapes/`, and a case in `engine/shapes/index.ts`.
4. If it needs a new transition, add it to `engine/transitions.ts`.
5. If it needs a new layout, add a `LayoutVariant` in `types/scene.ts` and a `.scene--<name>` block in `global.css`, including the phone rule.

**Change colours**
Edit hex values in `src/theme/tokens.ts`, or change a section's `color` name in `scenes.tsx`. Nothing else should need editing. If it does, that is a bug: fix the hard-coded value.

**Tune feel**
Change `engine/config.ts` (springs, timing, scroll thresholds) or a transition's `duration` and `stagger` in `transitions.ts`.

## How to work in this repo

- Use plan mode for anything touching more than two files, the engine, or the architecture. Present the plan and wait for approval.
- Work in small steps. After each step run `npm run typecheck` and tell Anjir exactly what to look at in the browser.
- When Anjir sends a screenshot or describes a feel problem, restate what you think is wrong before changing code.
- Keep `engine/` free of React and of content. Keep content out of components.
- Do not rename or remove the `data-scene`, `data-state`, `data-head` or `data-scan` attributes. The engine depends on them.
- Commit after each working step with a short message describing the user-visible change.

## Definition of done

- `npm run typecheck` passes with no new warnings.
- The change follows RULES.md (run its checklist).
- No colour, size or timing value is hard-coded outside `tokens.ts`, `global.css` variables or `engine/config.ts`.
- You have told Anjir what to check visually, at desktop width and at 390 px wide.
