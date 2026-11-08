/** Tuning knobs for the particle engine. Change feel here, not inside the engine code. */
export const ENGINE = {
  particles: 22000,
  headParticles: 4000,
  maxDpr: 2,
  /** Spring used while a scene is resting. */
  holdStiffness: 0.14,
  holdDamping: 0.72,
  /** Softer spring used while particles assemble on first load. */
  assembleStiffness: 0.035,
  assembleDamping: 0.86,
  assembleSeconds: 0.9,
  /** Each particle waits a random time in this range (seconds) before flying in on load. */
  introDelay: [0.2, 1.0] as const,
  repelRadius: 75,
  repelForce: 3,
  /** Fraction of a flight after which the next section's colour block wipes in, so particles land on colour. */
  blockInAt: 0.3,
  /** Fraction of a transition after which the next section's text starts to appear. */
  revealAt: 0.62,
  /** How long the heading particles take to fade once the real heading is visible. */
  headFadeMs: 900,
  /** Input is ignored until a transition is this far through. */
  lockUntil: 0.8,
  /** Dot diameter in CSS px. Tiny dots need more of them for the drawings to stay legible. */
  dotSize: { head: 1.4, body: 1.6 },
  /** Phones (narrower than LAYOUT.mobileBreakpoint at load) get a budget scaled to their smaller area. */
  mobile: {
    particles: 8000,
    headParticles: 1600,
    dotSize: { head: 1.2, body: 1.4 },
  },
  drift: 0.8,
} as const;

/** Scroll gesture thresholds. Raise them if chapters change too easily. */
export const INPUT = {
  /** Accumulated wheel deltaY (px) needed to move one chapter. About one firm wheel notch or a decisive trackpad swipe. */
  wheelThreshold: 150,
  /** Finger travel (px) needed on touch screens. */
  touchThreshold: 110,
  /** After this long without input, the accumulated scroll starts to drain away. */
  idleDecayMs: 180,
  decayPerFrame: 0.86,
  /** After a chapter change, the rest of that gesture is ignored until wheel input pauses this long (ms). Stops trackpad momentum skipping chapters. */
  cooldownMs: 300,
} as const;

export const LAYOUT = {
  mobileBreakpoint: 900,
  /** Where an illustration sits when a scene does not set its own region (fractions of the viewport). */
  desktopRegion: { x: 0.54, y: 0.14, w: 0.4, h: 0.74 },
  mobileRegion: { x: 0.06, y: 0.07, w: 0.88, h: 0.34 },
  mobileBodyAlpha: 1,
  /** Share of an illustration's dots spent on its faint back layer (desktop only), and that layer's opacity relative to the figure. */
  backShare: 0.15,
  backAlpha: 0.32,
} as const;
