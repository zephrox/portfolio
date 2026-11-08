# Prompt list

Copy these into Claude Code in order. **[PLAN]** means switch to plan mode first, read the plan, then approve. **[DIRECT]** means normal mode is fine.

When to use plan mode:
- Anything that touches more than two files, the engine, or the folder structure.
- New features, new pages, refactors, performance work.
- Whenever you are not sure what the change will touch.

When normal mode is fine:
- Copy edits, colour changes, tuning a number in `config.ts` or `transitions.ts`.
- Bug fixes where you already know the cause.
- Adding a photo to an existing Evidence slot.

---

## Phase 0: get it running

1. **[PLAN]**
   > Read CLAUDE.md, DESIGN.md, RULES.md and everything in src/. Explain the architecture back to me in plain words: how a section gets on screen, how a transition plays, and where colours come from. List anything that looks fragile or unclear. Do not change code.

2. **[DIRECT]**
   > Run npm install and npm run dev. Fix any errors you see. Then tell me what I should see at each scroll step.

3. **[DIRECT]**
   > Initialise git (a .gitignore is already there) and make the first commit.

## Phase 1: feel

4. **[DIRECT]** (repeat with screenshots or a screen recording)
   > Here's what feels off: [describe, e.g. "the hero heading appears before the face settles", "the orbit transition is too fast"]. Restate the problem, propose which numbers in config.ts or transitions.ts to change, then change them.

5. **[PLAN]**
   > Make the intro machine more complex without making it busier. Ideas: a second planetary set behind the lens on the back layer, a Geneva drive that ticks intermittently, a cam and follower. Keep each part one colour from tokens.ts, keep it still under the mouse except the pupil. Show me the part list and where each sits before coding.

6. **[DIRECT]**
   > The scroll threshold: [too sensitive / not sensitive enough]. Adjust INPUT in config.ts and tell me the new values.

## Phase 2: content and proof

7. **[DIRECT]** (once per photo)
   > I've added public/evidence/rover.webp. Use it in the Robots section's Evidence slot with alt text "[describe the photo]".

8. **[DIRECT]**
   > Fill in real links in src/content/site.ts: [paste URLs for papers, GitHub repos, demos].

9. **[DIRECT]**
   > Review all copy in src/sections against RULES.md (anti-slop copy) and DESIGN.md (voice). List problems first, then fix them. Don't invent facts.

## Phase 3: the other pages

10. **[PLAN]**
    > Add three pages: /work, /research and /cv. Use a tiny router (ask me before adding a dependency). Same black background, same tokens, no particles or a very light static particle header. /work lists shipped projects with stack and links. /research lists publications with venue, year and links, plus a short research interests paragraph. /cv embeds a PDF and offers a download. Build them from reusable components so a new project or paper is one data entry in a content file.

11. **[DIRECT]**
    > Point the nav links and the two doors in the final section at the new pages.

## Phase 4: quality

12. **[PLAN]**
    > Phone pass. Test the story at 390 by 844 and 768 by 1024. Fix layout, text overflow, touch gestures and particle density. List the issues first.

13. **[DIRECT]**
    > Accessibility audit against RULES.md: contrast of every accent colour on black, focus order, keyboard chapter controls, reduced motion. Fix what fails.

14. **[PLAN]**
    > Performance pass. Measure frame time during each transition in Chrome's performance panel. If any transition drops below 55 fps, propose moving the flight path maths into the vertex shader. Plan first.

15. **[DIRECT]**
    > Add SEO and sharing: title, description, Open Graph image (a still of the hero portrait in particles), favicon.

## Phase 5: ship

16. **[PLAN]**
    > Prepare for deployment on Vercel: build settings, a 404 page, and correct caching for portrait.json and evidence media. Then walk me through connecting the repo.

---

## Reusable prompts

**Add a section**
> **[PLAN]** Add a new section after [section id] about [topic]. Colour: [red/yellow/blue/lime]. Layout: [pick from DESIGN.md or propose one]. Illustration: [describe]. Transition into it: [pick or propose]. Copy: [paste or ask me]. Follow "Add a section" in CLAUDE.md.

**Recolour**
> **[DIRECT]** Change the palette to [hex values] in tokens.ts, or change section [id] to [colour name]. Nothing else should need editing; if it does, fix the hard-coded value.

**Slop check**
> **[DIRECT]** Review the last change against RULES.md, item by item. Report anything that breaks a rule, then fix it.

**Something looks wrong**
> **[DIRECT]** [Screenshot]. Describe what you see, what you think should be there per DESIGN.md, and the likely cause before you change anything.
