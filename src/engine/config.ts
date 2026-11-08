/** Tuning knobs for the particle engine. Change feel here, not inside the engine code. */
export const ENGINE = {
  particles: 14000,
  headParticles: 3000,
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
  /** Fraction of a transition after which the next section's text starts to appear. */
  revealAt: 0.62,
  /** How long the heading particles take to fade once the real heading is visible. */
  headFadeMs: 900,
  /** Keyboard and buttons are ignored until an auto-played transition is this far through. */
  lockUntil: 0.8,
  dotSize: { head: 2.0, body: 2.3 },
  drift: 0.8,
} as const;

/**
 * Scroll scrubbing. Wheel and touch drive the transition directly: scrolling this many
 * viewport heights plays one whole transition. Raise the fractions if chapters change too easily.
 */
export const INPUT = {
  /** Wheel scroll, in viewport heights, for one full transition. */
  pageFraction: 1,
  /** Finger travel, in viewport heights, for one full transition. */
  touchPageFraction: 0.7,
  /** A pause this long (ms) counts as letting go: the transition settles. */
  settleIdleMs: 140,
  /** On letting go, at or past this progress the transition completes; below it, it springs back. */
  settleAt: 0.5,
  /** After a transition completes, wheel input stays ignored until it has been quiet this long (ms). Swallows trackpad momentum. */
  cooldownMs: 300,
} as const;

export const LAYOUT = {
  mobileBreakpoint: 900,
  /** Where an illustration sits when a scene does not set its own region (fractions of the viewport). */
  desktopRegion: { x: 0.54, y: 0.14, w: 0.4, h: 0.74 },
  mobileRegion: { x: 0.06, y: 0.07, w: 0.88, h: 0.34 },
  mobileBodyAlpha: 0.62,
} as const;
