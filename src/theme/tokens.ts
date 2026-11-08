/**
 * Single source of truth for colour.
 * Change a hex here and the particles, accents and CSS all follow.
 * Sections pick ONE of these by name in src/content/scenes.tsx.
 */
export const palette = {
  red: '#FF2E3D',
  yellow: '#FFD60A',
  blue: '#2F6BFF',
  lime: '#C8FF2E',
  orange: '#FF5F1F',
  white: '#F5F1EA',
} as const;

export type ColorName = keyof typeof palette;

/** Neutral surfaces and text. Not used for section identity. */
export const surface = {
  bg: '#000000',
  text: '#F5F1EA',
  body: '#CFC9C0',
  muted: '#A8A29A',
  faint: '#8E8E8E',
  line: '#4A4A4A',
} as const;

export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function rgbOf(name: ColorName): RGB {
  return hexToRgb(palette[name]);
}

/** Mirrors the tokens into CSS custom properties (--c-red, --s-bg, ...). */
export function applyThemeVars(el: HTMLElement): void {
  for (const [k, v] of Object.entries(palette)) el.style.setProperty(`--c-${k}`, v);
  for (const [k, v] of Object.entries(surface)) el.style.setProperty(`--s-${k}`, v);
}
