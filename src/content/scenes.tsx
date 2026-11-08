import { Faces } from '../sections/Faces';
import { Hero } from '../sections/Hero';
import { Intro } from '../sections/Intro';
import { Language } from '../sections/Language';
import { Next } from '../sections/Next';
import { Robots } from '../sections/Robots';
import { ScienceFair } from '../sections/ScienceFair';
import { Shipping } from '../sections/Shipping';
import type { SceneConfig } from '../types/scene';

/**
 * THE STORY, IN ORDER.
 * To add a section: write a component in src/sections, then add an entry here.
 * To recolour a section: change `color` (names live in src/theme/tokens.ts).
 */
export const scenes: SceneConfig[] = [
  {
    id: 'intro',
    label: 'Introduction',
    color: 'orange',
    layout: 'intro',
    shape: { kind: 'machine' },
    region: { x: 0.06, y: 0.04, w: 0.88, h: 0.66 },
    regionMobile: { x: 0, y: 0.08, w: 1, h: 0.42 },
    block: { x: 0, y: 0.68, w: 1, h: 0.32 },
    blockMobile: { x: 0, y: 0.6, w: 1, h: 0.4 },
    headOnBlock: true,
    enter: 'zoomBack',
    Content: Intro,
  },
  {
    id: 'hero',
    label: 'Hello',
    color: 'red',
    layout: 'left',
    shape: { kind: 'portrait' },
    block: { x: 0.5, y: 0, w: 0.5, h: 1 },
    enter: 'zoom',
    Content: Hero,
  },
  {
    id: 'science-fair',
    label: 'A science fair',
    color: 'yellow',
    layout: 'bottom-left',
    shape: { kind: 'orbits' },
    region: { x: 0.44, y: 0.1, w: 0.52, h: 0.8 },
    block: { x: 0.4, y: 0, w: 0.6, h: 1 },
    enter: 'orbit',
    Content: ScienceFair,
  },
  {
    id: 'robots',
    label: 'Things that move',
    color: 'blue',
    layout: 'top-split',
    shape: { kind: 'seismic', rows: 5 },
    region: { x: 0.03, y: 0.58, w: 0.94, h: 0.36 },
    block: { x: 0, y: 0.52, w: 1, h: 0.48 },
    enter: 'shock',
    Content: Robots,
  },
  {
    id: 'faces',
    label: 'Faces',
    color: 'red',
    layout: 'right',
    shape: { kind: 'mesh' },
    region: { x: 0.05, y: 0.08, w: 0.4, h: 0.84 },
    block: { x: 0, y: 0, w: 0.5, h: 1 },
    enter: 'scan',
    Content: Faces,
  },
  {
    id: 'language',
    label: 'My own language',
    color: 'lime',
    layout: 'center-panel',
    shape: { kind: 'text', lines: ['সহজ'] },
    region: { x: 0.04, y: 0.06, w: 0.92, h: 0.88 },
    block: { x: 0, y: 0, w: 1, h: 1 },
    bodyAlpha: 0.6,
    enter: 'ink',
    Content: Language,
  },
  {
    id: 'shipping',
    label: 'Shipping',
    color: 'blue',
    layout: 'bottom-left',
    shape: { kind: 'windows' },
    region: { x: 0.5, y: 0.1, w: 0.45, h: 0.7 },
    block: { x: 0.46, y: 0, w: 0.54, h: 0.86 },
    enter: 'grid',
    Content: Shipping,
  },
  {
    id: 'next',
    label: 'What comes next',
    color: 'yellow',
    layout: 'center-bottom',
    shape: { kind: 'text', lines: ['Anjir', 'আনজির'] },
    region: { x: 0.2, y: 0.1, w: 0.6, h: 0.36 },
    block: { x: 0, y: 0, w: 1, h: 0.5 },
    enter: 'collapse',
    Content: Next,
  },
];
