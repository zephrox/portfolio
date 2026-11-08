# Design spec

## Concept

The site is a short film about how Anjir learned to make machines notice people. It is not a resume. Each chapter is one scene: a single idea, one illustration made of particles, a short block of text, and a piece of real evidence. Scrolling plays the next scene.

Personality to express: sincere, caring, honest, funny and friendly. Energetic but never loud. Confident, never boastful. Jokes are light and true, never invented.

## Audience

- Employers hiring AI engineers: want shipped work, real systems, code.
- Professors with funded master's places: want research, papers, a clear direction.
Both get the same story. The final chapter splits them with two doors: "Hiring? See shipped work" and "Supervising? See research".

## Colour

Pure black stage (`#000000`). Five energetic colours, defined only in `src/theme/tokens.ts`:

| Name | Hex | Feel |
|---|---|---|
| red | `#FF2E3D` | warm, human |
| yellow | `#FFD60A` | curious, bright |
| blue | `#2F6BFF` | engineering, precise |
| lime | `#C8FF2E` | alive, new |
| orange | `#FF5F1F` | electric, mechanical (the intro machine) |
| white | `#F5F1EA` | warm white for text and machine details |

Rules:
- **One colour per section.** All of a section's particles, its accent word, its primary button and its scan line use that colour. Never mix two section colours inside one section.
- The **intro machine** follows the same rule: every part is orange, with warm-white lens and iris details. Depth comes from brightness (back layer dimmer), never from a second hue.
- Text is warm white (`--s-text`) and body grey (`--s-body`) on black. Colour is for accents, never for paragraphs.
- No gradients, glows, blurs or shadows anywhere.

Current mapping (in `scenes.tsx`): intro orange (machine and hook), hero red, science fair yellow, robots blue, faces red, language lime, shipping blue, next yellow.

## Type

- Archivo 800 for headings, 400 to 600 for body and UI.
- JetBrains Mono 500 only for hints and evidence placeholders.
- Anek Bangla 700 only inside particle shapes for Bangla words.
- Sizes are set once in `global.css`: hook, display (h1), section (h2), body lg, md and sm, hint.
- Body text 17 to 24 px, line height 1.5 to 1.65, max 52 characters per line.
- Each heading has at most one accented word, wrapped in `<Accent>`.

## Layout

Full-screen stage, no page scroll, no visible scrollbar. Brand top-left, three nav links top-right, a thin scroll cue on the right edge that fills as a gesture builds. No bottom navigation, no chapter numbers on screen.

Layout variants (`.scene--<name>`):
- `intro`: illustration fills the screen, text centred in the lower third.
- `left`: text left, illustration right.
- `right`: mirrored.
- `bottom-left`: illustration large, text small in the bottom-left corner.
- `top-split`: heading column and paragraph column side by side across the top, illustration across the bottom.
- `center-panel`: illustration fills the screen behind a black text panel in the middle.
- `center-bottom`: illustration above, text centred below.

Vary layouts between neighbouring sections so no two in a row feel the same.

On phones (under 900 px) every layout becomes: illustration in the top 40%, text at the bottom, scrollable if long.

## Scenes

| # | Section | Colour | Layout | Illustration | Arrives by |
|---|---|---|---|---|---|
| 0 | Intro: "Teaching machines to notice." | orange | intro | Machine | (start) |
| 1 | Hero: "Hi, I'm Anjir." | red | left | Stippled portrait inside a faint lens ring | zoom through the iris |
| 2 | It started at a science fair | yellow | bottom-left | Three electron orbits | orbit |
| 3 | Then I wanted things to move | blue | top-split | Seismic traces across the bottom | shock |
| 4 | Robots kept misreading faces | red | right | 468-point face mesh | scan |
| 5 | Then I turned to my own language | lime | center-panel | সহজ filling the screen | ink |
| 6 | Research only matters once it ships | blue | bottom-left | Stacked browser windows | grid |
| 7 | What comes next | yellow | center-bottom | "Anjir / আনজির" | collapse |

## Motion

Every transition has three beats: the old scene breaks apart, particles travel, the new scene assembles. Then the text arrives.

- Duration 2.6 to 3.6 s. Never faster than 2.4 s.
- Particles leave and arrive in a staggered wave, never all at once.
- Text arrives last: heading at about 62% of the transition, then each following element 150 ms apart. Heading particles land on the real heading's letters, then fade to a faint texture as the crisp text appears.
- Easing: ease-in-out cubic for paths, expo-out for text. No bounce, no overshoot, no elastic.
- Input is ignored until a transition is 80% done.
- A small scroll does nothing. One deliberate gesture (about one firm wheel notch or a decisive swipe) moves one chapter. The scroll cue shows the gesture building.
- Forward transitions are specific to the chapter (table above). Going back always uses a soft drift.
- Load: particles start scattered and each flies in after a random 0.2 to 1 s delay.
- Reduced motion: no flights, sections swap instantly, particles sit still.

Transition meanings:
- **zoom**: the machine's iris opens, the camera dives through the lens, dots grow as they pass the viewer.
- **orbit**: particles swirl around the new illustration's centre like electrons.
- **shock**: particles drop off the bottom and surge back up, bottom rows first.
- **scan**: a horizontal line in the section colour sweeps down, placing particles as it passes.
- **ink**: particles arrive left to right like a pen writing.
- **grid**: mechanical moves on a 14 px grid, across first, then down.
- **collapse**: everything pulls into the centre, then blooms outward.
- **drift**: soft scatter and re-gather (used for going back).

## The machine (intro)

About 11,000 particles. Unit space roughly 2.0 by 1.44, mapped to the intro region. Every part is orange unless noted:
- Back layer (dimmer): twelve circuit traces with warm-white pulses travelling outward, pads at their ends, and a second planetary set: a fixed toothed annulus around the ring gear with three small planets that roll between it and the ring gear's outer teeth (one lap takes about four minutes), passing behind gears B and D.
- Ring gear with outer and inner teeth.
- Planetary set: sun gear and three orbiting planets.
- Central lens (warm white) with a six-blade iris (warm white) that slowly breathes, and a still pupil at its centre.
- Gear B with a crank driving two pistons in cylinders (warm white, dim).
- Gear C with a chain of three small gears.
- Gear D with a pulley and belt to a second pulley, and a gear driving a flywheel.
- Rack and pinion across the top: the pinion rocks and slides the rack.
- Geneva drive (top right): a pinion off the small gear chain turns a crank with a pin and a locking crescent. The four-slot wheel rests for about six seconds, then indexes a quarter turn over about two.
- Cam and follower (bottom left): two small pinions step down from the flywheel to an egg-shaped cam that slowly lifts a roller follower in a fixed guide (warm white, dim).

Nothing on the machine reacts to the mouse, the pupil included. Cursor repulsion is off for this scene. Gears mesh at plausible speed ratios. Nothing moves faster than a calm, steady rhythm.

## Copy voice

First person, plain words, short sentences. Specific numbers only when they are real (85.1%, 468, 90%). No marketing words (supercharge, world-class, cutting-edge, passionate). No em dashes. No "Not X. Y." slogans. Humour only when it is true to Anjir.

## Evidence

Each chapter from 2 to 6 has one `<Evidence>` slot: a real photo, short muted clip or screenshot. Until Anjir supplies it, the slot shows a dashed placeholder with a label. Never use stock imagery or generated images.
