/**
 * Transition registry. Each section names the transition used to ARRIVE at it (scenes.tsx -> enter).
 * Going backwards always uses 'drift' (or 'zoomBack' into the intro).
 *
 * Every particle flies from where it is (S) to its target (B) through a middle point (M),
 * starting at its own stagger offset. `plan` decides the stagger and M for one particle.
 *
 * To add a transition: add a name to TransitionName and an entry to `transitions`.
 */
export type TransitionName = 'zoom' | 'zoomBack' | 'orbit' | 'shock' | 'scan' | 'ink' | 'grid' | 'collapse' | 'drift';

export type PathKind = 'bezier' | 'orbit' | 'grid';

export interface PlanInput {
  sx: number;
  sy: number;
  bx: number;
  by: number;
  width: number;
  height: number;
  /** Focal point of the scene being left (e.g. the machine's lens). */
  anchor: { x: number; y: number };
  /** Centre of the illustration being arrived at. */
  focus: { x: number; y: number };
  depth: number;
  rand: number;
}

export interface PlanOutput {
  stagger: number;
  mx: number;
  my: number;
}

export interface TransitionDef {
  /** Seconds, start to finish. */
  duration: number;
  /** Fraction of duration spent before particles leave (used for the iris opening). */
  preRoll: number;
  /** How spread out departures are (0 = all at once, 0.6 = long wave). */
  stagger: number;
  path: PathKind;
  /** Extra dot size at mid-flight (3 = four times bigger, as if passing the camera). */
  sizeBoost: number;
  /** How much dots dim at mid-flight. */
  alphaDip: number;
  irisOpen?: boolean;
  scanline?: boolean;
  plan(p: PlanInput): PlanOutput;
}

const rnd = Math.random;

export const transitions: Record<TransitionName, TransitionDef> = {
  zoom: {
    duration: 3.6, preRoll: 0.24, stagger: 0.45, path: 'bezier', sizeBoost: 3, alphaDip: 0.35, irisOpen: true,
    plan: ({ sx, sy, anchor, depth, rand }) => {
      const z = 4 + 6 * depth;
      return { stagger: rand, mx: anchor.x + (sx - anchor.x) * z, my: anchor.y + (sy - anchor.y) * z };
    },
  },
  zoomBack: {
    duration: 3.0, preRoll: 0, stagger: 0.4, path: 'bezier', sizeBoost: 3, alphaDip: 0.2,
    plan: ({ bx, by, anchor, rand }) => ({ stagger: rand, mx: anchor.x + (bx - anchor.x) * 8, my: anchor.y + (by - anchor.y) * 8 }),
  },
  orbit: {
    duration: 2.8, preRoll: 0, stagger: 0.4, path: 'orbit', sizeBoost: 0.3, alphaDip: 0,
    plan: ({ rand }) => ({ stagger: rand, mx: 0, my: 0 }),
  },
  shock: {
    duration: 2.8, preRoll: 0, stagger: 0.55, path: 'bezier', sizeBoost: 0.3, alphaDip: 0,
    plan: ({ sx, bx, by, height, rand }) => ({ stagger: 1 - by / height, mx: (sx + bx) / 2 + (rand - 0.5) * 80, my: height * 1.12 }),
  },
  scan: {
    duration: 3.0, preRoll: 0, stagger: 0.62, path: 'bezier', sizeBoost: 0.3, alphaDip: 0, scanline: true,
    plan: ({ sx, bx, by, height, rand }) => ({ stagger: by / height, mx: bx + (sx - bx) * 0.25, my: by - 60 - rand * 40 }),
  },
  ink: {
    duration: 3.0, preRoll: 0, stagger: 0.6, path: 'bezier', sizeBoost: 0.3, alphaDip: 0,
    plan: ({ bx, by, width, rand }) => ({ stagger: bx / width, mx: bx - 80 - rand * 60, my: by + (rand - 0.5) * 40 }),
  },
  grid: {
    duration: 2.8, preRoll: 0, stagger: 0.5, path: 'grid', sizeBoost: 0, alphaDip: 0,
    plan: ({ rand }) => ({ stagger: rand, mx: 0, my: 0 }),
  },
  collapse: {
    duration: 3.2, preRoll: 0, stagger: 0.3, path: 'bezier', sizeBoost: -0.4, alphaDip: 0,
    plan: ({ sx, sy, width, height, rand }) => {
      const d = Math.hypot(sx - width / 2, sy - height / 2) / Math.hypot(width, height);
      return { stagger: rand * 0.5 + Math.min(1, d * 2) * 0.5, mx: width / 2 + (rand - 0.5) * 14, my: height / 2 + (rnd() - 0.5) * 14 };
    },
  },
  drift: {
    duration: 2.6, preRoll: 0, stagger: 0.4, path: 'bezier', sizeBoost: 0.3, alphaDip: 0,
    plan: ({ width, height, rand }) => ({ stagger: rand, mx: rnd() * width, my: rnd() * height }),
  },
};
