import type { BodyShape, ShapeBuildContext } from '../types';

/** Outer lens ring radius relative to the inner ring, and the leftmost x (fraction of width) it may use. */
const OUTER_RING = 1.35;
const OUTER_RING_MIN_X = 0.47;

/**
 * Anjir's portrait as stippled dots (public/portrait.json, made by scripts/stipple.py).
 * Bottom-anchored on the right on desktop, top-centred on mobile.
 * Leftover particles form a faint lens ring behind the head.
 */
export function buildPortrait(ctx: ShapeBuildContext): BodyShape {
  const { layout, count, assets } = ctx;
  const { width: W, height: H, wide } = layout;
  const pos = new Float32Array(count * 2);
  const alpha = new Float32Array(count);
  const portrait = assets.portrait;
  const A = portrait?.aspect ?? 0.78;
  let fh: number;
  let fw: number;
  let fx0: number;
  let fy0: number;
  if (wide) {
    fh = H * 0.92;
    fw = fh * A;
    if (fw > W * 0.44) {
      fw = W * 0.44;
      fh = fw / A;
    }
    fx0 = W * 0.73 - fw / 2;
    fy0 = H - fh;
  } else {
    fh = H * 0.42;
    fw = fh * A;
    if (fw > W * 0.9) {
      fw = W * 0.9;
      fh = fw / A;
    }
    fx0 = (W - fw) / 2;
    fy0 = H * 0.06;
  }
  const n = portrait?.n ?? 0;
  const hcx = fx0 + fw * 0.5;
  const hcy = fy0 + fh * 0.4;
  const hr = fh * 0.5;
  for (let i = 0; i < count; i++) {
    if (portrait && i < n * 2) {
      const k = i % n;
      const j = i >= n ? 1.6 : 0;
      pos[i * 2] = fx0 + portrait.points[k * 3] * fw + (Math.random() - 0.5) * j;
      pos[i * 2 + 1] = fy0 + portrait.points[k * 3 + 1] * fh + (Math.random() - 0.5) * j;
      alpha[i] = (0.38 + 0.62 * portrait.points[k * 3 + 2]) * (i >= n ? 0.55 : 1);
    } else {
      const a = Math.random() * Math.PI * 2;
      const pick = Math.random();
      // On desktop a quarter of the ring dots form a wider, fainter ring that runs off the right
      // edge; dots that would fall in the text column (left of OUTER_RING_MIN_X) stay on the lens ring.
      const outerX = hcx + Math.cos(a) * hr * OUTER_RING;
      const outer = wide && portrait && pick > 0.75 && outerX > W * OUTER_RING_MIN_X;
      const scale = outer ? OUTER_RING : pick < 0.45 ? 1 : 1.08;
      const rr = hr * scale + (Math.random() - 0.5) * 4;
      pos[i * 2] = hcx + Math.cos(a) * rr;
      pos[i * 2 + 1] = hcy + Math.sin(a) * rr;
      alpha[i] = portrait ? (outer ? 0.1 : 0.16) : 0.5;
    }
  }
  return { pos, alpha, anchor: { x: hcx, y: hcy } };
}
