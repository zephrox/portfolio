import type { Layout, Region, RegionFrac } from './types';

export type DrawFn = (c: CanvasRenderingContext2D, w: number, h: number) => void;

export const SHAPE_FONT = '"Anek Bangla", "Archivo", sans-serif';

export function regionFromFrac(f: RegionFrac, layout: Layout): Region {
  return { x0: layout.width * f.x, y0: layout.height * f.y, w: layout.width * f.w, h: layout.height * f.h };
}

/** Draws into an offscreen canvas and returns the filled pixels as viewport points [x0, y0, x1, y1, ...]. */
export function samplePixels(region: Region, draw: DrawFn, step = 2): number[] {
  const w = Math.max(1, Math.round(region.w));
  const h = Math.max(1, Math.round(region.h));
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const c = off.getContext('2d');
  if (!c) return [];
  c.fillStyle = '#000';
  c.strokeStyle = '#000';
  c.lineCap = 'round';
  c.lineJoin = 'round';
  draw(c, w, h);
  const data = c.getImageData(0, 0, w, h).data;
  const pts: number[] = [];
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (data[(y * w + x) * 4 + 3] > 110) {
        pts.push(region.x0 + x + (Math.random() - 0.5) * step, region.y0 + y + (Math.random() - 0.5) * step);
      }
    }
  }
  return pts;
}

/** Spreads `count` particles over the sampled points, reusing points with a little jitter if there are too few. */
export function fillTargets(out: Float32Array, pts: number[], from: number, count: number, jitter: number): void {
  const n = pts.length / 2;
  if (!n) return;
  const order = new Uint32Array(n);
  for (let i = 0; i < n; i++) order[i] = i;
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = order[i];
    order[i] = order[j];
    order[j] = t;
  }
  for (let i = 0; i < count; i++) {
    const k = order[i % n];
    const j = i >= n ? jitter : 0;
    out[(from + i) * 2] = pts[k * 2] + (Math.random() - 0.5) * j;
    out[(from + i) * 2 + 1] = pts[k * 2 + 1] + (Math.random() - 0.5) * j;
  }
}

/** Fills the box with centred lines of large text. */
export function fitText(c: CanvasRenderingContext2D, w: number, h: number, lines: string[]): void {
  let fs = (h / lines.length) * 0.72;
  c.font = `700 ${fs}px ${SHAPE_FONT}`;
  const mw = Math.max(...lines.map((l) => c.measureText(l).width));
  if (mw > w * 0.94) {
    fs *= (w * 0.94) / mw;
    c.font = `700 ${fs}px ${SHAPE_FONT}`;
  }
  c.textAlign = 'center';
  c.textBaseline = 'alphabetic';
  const lh = fs * 1.12;
  const total = lh * lines.length;
  lines.forEach((l, i) => {
    const m = c.measureText(l);
    const asc = m.actualBoundingBoxAscent || fs * 0.7;
    const desc = m.actualBoundingBoxDescent || fs * 0.2;
    const cy = h / 2 - total / 2 + lh * (i + 0.5);
    c.fillText(l, w / 2, cy + (asc - desc) / 2);
  });
}

interface PlacedWord {
  text: string;
  x: number;
  top: number;
  font: string;
  letterSpacing: string;
}

/**
 * Where the browser actually put each word of `el`, relative to `el`'s top-left corner.
 * Reading real line boxes means the particles follow the browser's own line breaks
 * (including `text-wrap: pretty`) instead of guessing them.
 */
function placedWords(el: HTMLElement): PlacedWord[] {
  const box = el.getBoundingClientRect();
  const out: PlacedWord[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? '';
    const parent = node.parentElement ?? el;
    const cs = getComputedStyle(parent);
    const font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const re = /\S+/g;
    for (let m = re.exec(text); m; m = re.exec(text)) {
      range.setStart(node, m.index);
      range.setEnd(node, m.index + m[0].length);
      const r = range.getClientRects()[0];
      if (!r) continue;
      out.push({ text: m[0], x: r.left - box.left, top: r.top - box.top, font, letterSpacing: cs.letterSpacing });
    }
  }
  range.detach();
  return out;
}

/**
 * Samples a real DOM heading so particles can land exactly on its letters.
 * The region origin uses offsets (not getBoundingClientRect) so CSS reveal transforms don't shift it.
 * Word positions are measured relative to the heading itself, which transforms move together.
 */
export function headingPoints(el: HTMLElement | null, root: HTMLElement): number[] {
  if (!el) return [];
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  const region: Region = { x0: x, y0: y, w: el.offsetWidth, h: el.offsetHeight + 12 };
  const fs = parseFloat(getComputedStyle(el).fontSize) || 48;
  const words = placedWords(el);
  return samplePixels(
    region,
    (c) => {
      c.textBaseline = 'alphabetic';
      for (const w of words) {
        c.font = w.font;
        c.letterSpacing = w.letterSpacing === 'normal' ? '0px' : w.letterSpacing;
        // A text range's client rect spans the font's ascent + descent, so the baseline sits one ascent down.
        const asc = c.measureText('Hg').fontBoundingBoxAscent || fs * 0.9;
        c.fillText(w.text, w.x, w.top + asc);
      }
    },
    fs > 70 ? 3 : 2,
  );
}
