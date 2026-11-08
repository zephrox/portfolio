import type { ComponentType } from 'react';
import type { TransitionName } from '../engine/transitions';
import type { RegionFrac, ShapeSpec } from '../engine/types';
import type { ColorName } from '../theme/tokens';

/**
 * Where the text block sits. Each variant is a CSS class in src/styles/global.css (.scene--<name>).
 * On phones every layout collapses to "illustration on top, text at the bottom".
 */
export type LayoutVariant =
  | 'intro' /* text centred at the bottom, illustration fills the screen */
  | 'left' /* text left, illustration right */
  | 'right' /* text right, illustration left */
  | 'bottom-left' /* text in the bottom-left corner */
  | 'top-split' /* heading and paragraphs side by side across the top */
  | 'center-panel' /* text on a black panel in the middle, illustration behind */
  | 'center-bottom'; /* text centred at the bottom */

export interface SceneConfig {
  /** Stable id, also used as the React key and section aria-label fallback. */
  id: string;
  /** Short name for screen readers. */
  label: string;
  /** The section's ONE colour: particles, accent word, scan line. */
  color: ColorName;
  layout: LayoutVariant;
  /** The illustration the particles form. */
  shape: ShapeSpec;
  /** Where the illustration sits on desktop (fractions of the viewport). */
  region?: RegionFrac;
  /** Where it sits on phones. */
  regionMobile?: RegionFrac;
  /** Illustration opacity (0..1). Lower it when text sits on top. */
  bodyAlpha?: number;
  /**
   * A solid block of the section colour behind the illustration (fractions of the viewport). When set,
   * the illustration is drawn on it in black cubes. Phones default to the top 46% at full width.
   */
  block?: RegionFrac;
  blockMobile?: RegionFrac;
  /** True when the heading itself sits on the block (drawn in black), as the intro hook does. */
  headOnBlock?: boolean;
  /** Transition used to arrive at this section when scrolling forward. */
  enter: TransitionName;
  /** The copy. Each top-level element becomes one staggered reveal step. */
  Content: ComponentType;
}
