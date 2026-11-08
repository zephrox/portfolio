# Anjir Jaman, portfolio

A scroll-driven particle story. See DESIGN.md for the concept and CLAUDE.md for how the code is organised.

## Run it

```
npm install
npm run dev
```

Open the printed local address. Scroll, swipe or use the arrow keys to move between chapters.

## Where things live

- Colours: `src/theme/tokens.ts`
- The story order and each section's colour, layout, illustration and transition: `src/content/scenes.tsx`
- Section copy: `src/sections/`
- Feel and timing: `src/engine/config.ts` and `src/engine/transitions.ts`

## Working with Claude Code

Open this folder in Claude Code. It reads CLAUDE.md automatically, which pulls in DESIGN.md and RULES.md. Follow PROMPTS.md phase by phase.
