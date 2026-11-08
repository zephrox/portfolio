import type { RGB } from '../theme/tokens';

export interface Region {
  x0: number;
  y0: number;
  w: number;
  h: number;
}

/** A region as fractions of the viewport (0..1). */
export interface RegionFrac {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Layout {
  width: number;
  height: number;
  wide: boolean;
}

export interface Portrait {
  aspect: number;
  n: number;
  /** x, y in 0..1 and tone in 0..1, packed as triples. */
  points: Float32Array;
}

export interface Assets {
  portrait: Portrait | null;
}

/**
 * Every illustration a section can show. To add one:
 * 1. add a variant here, 2. write a builder in src/engine/shapes, 3. add a case in shapes/index.ts.
 */
export type ShapeSpec =
  | { kind: 'machine' }
  | { kind: 'portrait' }
  | { kind: 'orbits' }
  | { kind: 'seismic'; rows?: number }
  | { kind: 'mesh' }
  | { kind: 'text'; lines: string[] }
  | { kind: 'windows' };

export interface ShapeBuildContext {
  layout: Layout;
  region: Region;
  /** Number of body particles to place. */
  count: number;
  /** Base opacity for this section's body particles. */
  alpha: number;
  /** Whether the faint back layer may be drawn (off when a colour block already fills the stage). */
  backLayer: boolean;
  assets: Assets;
}

/** What a shape builder returns: targets for the body particles of one section. */
export interface BodyShape {
  pos: Float32Array;
  alpha: Float32Array;
  /** Optional per-particle colour (rgb triples). If absent, the section colour is used. */
  color?: Float32Array;
  /** Optional per-particle depth 0..1, used by the zoom transition. */
  depth?: Float32Array;
  /** Focal point in viewport px, used by zoom transitions. */
  anchor?: Point;
  /** Animated shapes rewrite pos/alpha/color every frame. */
  update?(time: number, pointer: Point | null, irisOpen: number): void;
}

/** Full particle targets for one section (heading particles + body particles). */
export interface Target {
  pos: Float32Array;
  alpha: Float32Array;
  color: Float32Array;
}

export interface EngineScene {
  shape: ShapeSpec;
  /** The section colour (transition accents such as the scan line). */
  color: RGB;
  /** Colour of the illustration particles (black ink when drawn on a colour block). */
  bodyColor: RGB;
  /** Colour of the heading particles. */
  headColor: RGB;
  /** True when the scene has a colour block. */
  block: boolean;
  /** Living-drift strength (1 = normal, 0 = still). The machine uses less so it stays precise. */
  drift: number;
  enter: import('./transitions').TransitionName;
  region?: RegionFrac;
  regionMobile?: RegionFrac;
  bodyAlpha?: number;
}
