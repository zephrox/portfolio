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
| orange | `#FF5F1F` | electric, mechanical (the intro's accent) |
| white | `#F5F1EA` | warm white for text and machine details |

Rules:
- **One colour per section.** All of a section's particles, its accent word, its primary button and its scan line use that colour. Never mix two section colours inside one section.
- The **intro machine** is the one exception: it is drawn entirely in warm white, like an instrument, and orange is the intro's accent (the hook text and its particles). Depth comes from brightness (back layer dimmer), never from a second hue.
- Text is warm white (`--s-text`) and body grey (`--s-body`) on black. Colour is for accents, never for paragraphs.
- **Colour blocks.** Each chapter has one solid block of its colour on the black stage, and its illustration is drawn on that block in black cubes ("ink"). Black cubes keep their three faces through opacity: the lit face lets more colour show through. Text never sits on a block, except the intro hook, which is set in black on its orange band.
- No gradients, glows or blurs. Shadows exist only as hard offsets with no blur, as part of the brutalist frames below.

Current mapping (in `scenes.tsx`): intro orange (hook; the machine itself is white), hero red, science fair yellow, robots blue, faces red, language lime, shipping blue, next yellow.

## Brutalist frames

The site is neo-brutalist on a black stage: thick rules, hard offset shadows, flat colour, sharp corners.
- **Text panel**: the one framed container per chapter. Black fill, 3 px warm-white border, square corners, and a hard shadow offset 10 px down-right (8 px on phones) in the section colour. The intro hook has no panel.
- **Accent word**: set on a solid bar of the section colour with black text, like a marker stroke.
- **Buttons**: 3 px warm-white border with a 5 px hard warm-white shadow. Pressing pushes the button into its shadow. Primary is section-colour fill with black text; secondary is black with white text.
- **Links**: a 3 px underline in the section colour.
- **Evidence**: 3 px border with a 5 px hard shadow in the section colour; the empty placeholder keeps a thick dashed border and no shadow.
- **Header**: a black bar with a 3 px warm-white rule under it.
- Border width and offsets are the `--bw`, `--offset` and `--offset-sm` variables in `global.css`.

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

Colour blocks (fractions of the viewport, set in `scenes.tsx` as `block` and `blockMobile`):

| Chapter | Desktop block | On it |
|---|---|---|
| Intro | orange band across the bottom third | the hook, in black (the white machine stays on black above) |
| Hero | red right half | portrait |
| Science fair | yellow right 60% | atom |
| Robots | blue band across the bottom half | seismic traces |
| Faces | red left half | face mesh |
| Language | lime, full screen | সহজ behind the black text panel |
| Shipping | blue top right | browser windows |
| Next | yellow band across the top half | "Anjir / আনজির" |

On phones every block fills the top 46% at full width (the intro's sits at the bottom, behind the hook). Each chapter is then a page that scrolls: the drawing on top, the framed text panel below it scrolling up over it. A swipe scrolls the page first and only moves to the next chapter once the page is at its end. New chapters open at the top.

On desktop an illustration may extend a faint back layer across the stage (about 15% of its dots at about a third of its opacity): circuit traces running to the screen edges, a wider lens ring, a large outer orbit, extra seismic rows, a fourth window half off-screen. Back layers are part of the picture, never a pattern, and they stay clear of the text column. Phones show the figure only.

On phones (under 900 px) every layout becomes: illustration in the top 40%, text at the bottom, scrollable if long.

## Scenes

| # | Section | Colour | Layout | Illustration | Arrives by |
|---|---|---|---|---|---|
| 0 | Intro: "Teaching machines to notice." | white machine, orange hook | intro | Machine | (start) |
| 1 | Hero: "Hi, I'm Anjir." | red | left | Stippled portrait inside a faint lens ring | zoom through the iris |
| 2 | It started at a science fair | yellow | bottom-left | Three electron orbits | orbit |
| 3 | Then I wanted things to move | blue | top-split | Seismic traces across the bottom | shock |
| 4 | Robots kept misreading faces | red | right | 468-point face mesh | scan |
| 5 | Then I turned to my own language | lime | center-panel | সহজ filling the screen | ink |
| 6 | Research only matters once it ships | blue | bottom-left | Stacked browser windows | grid |
| 7 | What comes next | yellow | center-bottom | "Anjir / আনজির" | collapse |

## Motion

Every particle is a micro cube (edge about 3 px) with its own orientation. Each cube shows up to three faces in flat tones of its colour, lit from the top left: no gradients, no glow. Cubes tumble very slowly at rest and turn a quarter to three quarters of a revolution during each flight. Reduced motion: no tumbling.

Every transition has three beats: the old scene breaks apart, particles travel, the new scene assembles. Then the text arrives.

- Duration 2.6 to 3.6 s. Never faster than 2.4 s.
- Particles leave and arrive in a staggered wave, never all at once.
- The old colour block wipes away as a transition starts; the new one wipes in (left to right, expo-out, 0.7 s) once 30% of the flight has passed, so the cubes land on colour.
- Text arrives last: heading at about 62% of the transition, then each following element 150 ms apart. Heading particles land on the real heading's letters, then fade to a faint texture as the crisp text appears.
- Easing: ease-in-out cubic for paths, expo-out for text. No bounce, no overshoot, no elastic.
- Input is ignored until a transition is 80% done.
- A small scroll does nothing. One deliberate gesture (about one firm wheel notch or a decisive swipe) moves one chapter, and the transition always plays through. The scroll cue shows the gesture building.
- One gesture moves at most one chapter: after a chapter change, the rest of that gesture (including trackpad momentum) is ignored until the wheel pauses for 300 ms or the finger lifts.
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

About 11,000 particles, all warm white (the back layer dimmer). Unit space roughly 2.0 by 1.44, mapped to the intro region. Power flows like a real machine:
- A motor (finned housing, coupling flange) turns a line shaft along the bottom, carried by three pillow-block bearings.
- A worm on the line shaft drives the main gear (34 teeth, six spokes). The lens sits at its hub: a still lens ring, a six-blade iris that slowly breathes, and a still pupil.
- Right train: G2, G3 and G4 step up to a small pinion with a crank, pin and locking crescent. The four-slot Geneva wheel (top centre) rests for about six seconds, then indexes a quarter turn over about two.
- Lower right: G10 cranks a piston in a vertical cylinder through a long connecting rod.
- A 1:1 bevel pair at the end of the line shaft turns a vertical spindle up to a flyball governor; its two balls orbit the spindle about once every nine seconds.
- Left train: G5 (spoked, like a flywheel) drives G6 and G7. G7 cranks a crosshead sliding in horizontal guides. G5 also drives G8 and G9, and an egg-shaped cam on G9 pushes a roller follower in and out.
- Back layer: a faint base rail at the machine's foot that runs to both screen edges, with feet up to the motor, bearings and bevel.

Thirteen gears in all (G1 to G10, the Geneva pinion and the two bevels), plus the worm, two shafts, the Geneva wheel, cam, governor, piston and crank-slider. The top-left corner is left empty on purpose.

Nothing on the machine reacts to the mouse. Gears mesh at plausible speed ratios. Nothing moves faster than a calm, steady rhythm.

## Copy voice

First person, plain words, short sentences. Specific numbers only when they are real (85.1%, 468, 90%). No marketing words (supercharge, world-class, cutting-edge, passionate). No em dashes. No "Not X. Y." slogans. Humour only when it is true to Anjir.

## Evidence

Each chapter from 2 to 6 has one `<Evidence>` slot: a real photo, short muted clip or screenshot. Until Anjir supplies it, the slot shows a dashed placeholder with a label. Never use stock imagery or generated images.
