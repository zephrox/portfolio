/** Tuning knobs for the particle engine. Change feel here, not inside the engine code. */
export const ENGINE = {
  particles: 18000,
  headParticles: 3500,
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
  /** Dot diameter in CSS px. Kept at 2 px or more so a dot always covers at least one full screen pixel. */
  dotSize: { head: 2.0, body: 2.4 },
  /** Phones (narrower than LAYOUT.mobileBreakpoint at load) get a budget scaled to their smaller area. */
  mobile: {
    particles: 4500,
    headParticles: 1000,
    dotSize: { head: 1.8, body: 2.0 },
  },
  /**
   * Wilder transitions: every flight is randomised within its transition's character, so the same
   * chapter change never looks identical twice.
   */
  wild: {
    /** Each path bends sideways by up to this fraction of its length, on a random side (curved paths only). */
    curve: 0.35,
    /** Each dot's departure moves by up to this much within its wave, so wave fronts look ragged. */
    staggerJitter: 0.12,
    /** Mid-flight swirl on the flow field: peak offset in px and the field's spatial scale. */
    wobble: 26,
    wobbleScale: 0.003,
    /** Each run's duration varies by up to this fraction (never below minDuration seconds). */
    durationJitter: 0.06,
    minDuration: 2.4,
  },
  /**
   * Living drift: at rest every dot wanders around its spot following a slow, divergence-free flow
   * field (the curl of a few random sine waves), so drawings breathe without clumping.
   */
  flow: {
    /** Offset in CSS px at full strength (desktop, phones). */
    amp: 3,
    ampPhone: 2,
    /** Spatial frequency (per px) and time scale of the field. */
    scale: 0.0055,
    speed: 0.35,
    /** Number of sine waves summed; more waves give curlier, less regular motion. */
    waves: 6,
  },
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
