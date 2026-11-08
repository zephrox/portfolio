import { hexToRgb, palette, type ColorName, type RGB } from '../../theme/tokens';
import type { BodyShape, Point, ShapeBuildContext } from '../types';

/**
 * The intro machine. Everything is defined in "unit" coordinates (about -1..1 wide, -0.7..0.7 tall)
 * and mapped into the section's region. Each part has a kind that decides how it moves.
 *
 * To add a part: push a Part in buildParts(), add its outline with add(), and if it is a new
 * kind, handle it in partState() and the per-particle switch in update().
 */

type Pt = [number, number];

interface Base {
  color: ColorName;
  /** 1 = front layer, 0.5 = back layer (dimmer, zooms slower). */
  depth: number;
  alpha?: number;
}

type Part = Base &
  (
    | { kind: 'rot'; cx: number; cy: number; w: number; ph: number }
    | { kind: 'osc'; cx: number; cy: number; amp: number; freq: number }
    | { kind: 'rack'; r: number; amp: number; freq: number }
    | { kind: 'planet'; k: number }
    | { kind: 'static' }
    | { kind: 'circuit'; speed: number; phase: number }
    | { kind: 'belt'; speed: number }
    | { kind: 'iris'; j: number }
    | { kind: 'pupil' }
    | { kind: 'rod'; k: number }
    | { kind: 'piston'; k: number }
  );

interface Poly {
  part: number;
  pts: Pt[];
  weight: number;
}

const UNIT_W = 2.0;
const UNIT_H = 1.44;

function gear(r: number, n: number, inward = false): Pt[] {
  const tip = inward ? r * 0.9 : r * 1.12;
  const root = inward ? r : r * 0.92;
  const span = (Math.PI * 2) / n;
  const out: Pt[] = [];
  for (let k = 0; k < n; k++) {
    const a = k * span;
    const prof: Pt[] = [[root, a], [root, a + 0.2 * span], [tip, a + 0.3 * span], [tip, a + 0.7 * span], [root, a + 0.8 * span]];
    for (const [rr, aa] of prof) out.push([Math.cos(aa) * rr, Math.sin(aa) * rr]);
  }
  out.push(out[0]);
  return out;
}

function circ(r: number, cx = 0, cy = 0, seg = 48): Pt[] {
  const o: Pt[] = [];
  for (let k = 0; k <= seg; k++) {
    const a = (k / seg) * Math.PI * 2;
    o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return o;
}

export function buildMachine(ctx: ShapeBuildContext): BodyShape {
  const parts: Part[] = [];
  const polys: Poly[] = [];
  const part = (p: Part) => (parts.push(p), parts.length - 1);
  const add = (p: number, pts: Pt[], weight = 1) => polys.push({ part: p, pts, weight });
  const spokes = (p: number, r0: number, r1: number, n: number) => {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      add(p, [[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * r1, Math.sin(a) * r1]]);
    }
  };
  const meshWith = (c: Pt, rParent: number, rChild: number, angle: number): Pt => [
    c[0] + Math.cos(angle) * (rParent + rChild),
    c[1] + Math.sin(angle) * (rParent + rChild),
  ];

  // Back layer: dotted orbit ring and circuit traces with travelling pulses.
  let p = part({ kind: 'rot', cx: 0, cy: 0, w: 0.02, ph: 0, color: 'orange', depth: 0.5, alpha: 0.4 });
  add(p, circ(0.54, 0, 0, 120), 0.45);
  const traces: [number, 'h' | 'v'][] = [
    [-2.7, 'h'], [-2.25, 'v'], [-1.35, 'v'], [-0.55, 'h'], [0.45, 'h'], [1.25, 'v'],
    [1.9, 'v'], [2.55, 'h'], [3.05, 'h'], [-1.0, 'v'], [0.95, 'v'], [-2.95, 'h'],
  ];
  for (const [a, m] of traces) {
    const c = Math.cos(a);
    const s = Math.sin(a);
    const st: Pt = [c * 0.56, s * 0.56];
    const md: Pt = [c * 0.66, s * 0.66];
    const en: Pt = m === 'h' ? [Math.sign(c) * 0.98, md[1]] : [md[0], Math.sign(s) * 0.66];
    p = part({ kind: 'circuit', color: 'orange', depth: 0.5, speed: 0.22 + Math.random() * 0.25, phase: Math.random() });
    add(p, [st, md, en], 0.6);
    p = part({ kind: 'static', color: 'orange', depth: 0.5 });
    add(p, circ(0.014, en[0], en[1], 12), 0.6);
  }

  // Ring gear with outer and inner teeth.
  const wRing = 0.06;
  p = part({ kind: 'rot', cx: 0, cy: 0, w: wRing, ph: 0, color: 'orange', depth: 1 });
  add(p, gear(0.4, 40));
  add(p, gear(0.31, 30, true));
  add(p, circ(0.355, 0, 0, 72), 0.5);

  // Planetary set: sun + three planets around the lens.
  p = part({ kind: 'rot', cx: 0, cy: 0, w: -0.24, ph: 0, color: 'orange', depth: 1 });
  add(p, gear(0.15, 14));
  for (let k = 0; k < 3; k++) {
    p = part({ kind: 'planet', k, color: 'orange', depth: 1 });
    add(p, gear(0.075, 8));
    add(p, circ(0.025, 0, 0, 16));
    spokes(p, 0.025, 0.06, 3);
  }

  // Lens, iris blades and pupil (the pupil follows the cursor).
  p = part({ kind: 'static', color: 'white', depth: 1 });
  add(p, circ(0.115));
  add(p, circ(0.1));
  for (let j = 0; j < 6; j++) {
    p = part({ kind: 'iris', j, color: 'white', depth: 1 });
    add(p, [[0, 0], [0.11, 0]]);
  }
  p = part({ kind: 'pupil', color: 'orange', depth: 1 });
  add(p, circ(0.022, 0, 0, 24));
  add(p, circ(0.01, 0, 0, 12));

  // Gear B (right) with a crank that drives two pistons.
  const B: Pt = [0.57 * Math.cos(-0.15), 0.57 * Math.sin(-0.15)];
  const wB = (-wRing * 0.4) / 0.17;
  p = part({ kind: 'rot', cx: B[0], cy: B[1], w: wB, ph: 0.1, color: 'orange', depth: 1 });
  add(p, gear(0.17, 17));
  add(p, circ(0.11));
  add(p, circ(0.03, 0, 0, 16));
  spokes(p, 0.03, 0.11, 5);
  p = part({ kind: 'rot', cx: B[0], cy: B[1], w: wB, ph: 0.1, color: 'orange', depth: 1 });
  add(p, [[-0.06, 0], [0.06, 0]]);
  add(p, circ(0.013, -0.06, 0, 12));
  add(p, circ(0.013, 0.06, 0, 12));

  // Gear C (top right) and a small chain of three gears.
  const C = meshWith(B, 0.17, 0.09, -1.75);
  const wC = (-wB * 0.17) / 0.09;
  p = part({ kind: 'rot', cx: C[0], cy: C[1], w: wC, ph: 0, color: 'orange', depth: 1 });
  add(p, gear(0.09, 9));
  add(p, circ(0.025, 0, 0, 16));
  spokes(p, 0.025, 0.07, 3);
  const G1 = meshWith(C, 0.09, 0.05, -0.2);
  const w1 = (-wC * 0.09) / 0.05;
  p = part({ kind: 'rot', cx: G1[0], cy: G1[1], w: w1, ph: 0.2, color: 'orange', depth: 1 });
  add(p, gear(0.05, 6));
  add(p, circ(0.015, 0, 0, 12));
  const G2 = meshWith(G1, 0.05, 0.04, -1.2);
  const w2 = (-w1 * 0.05) / 0.04;
  p = part({ kind: 'rot', cx: G2[0], cy: G2[1], w: w2, ph: 0.4, color: 'orange', depth: 1 });
  add(p, gear(0.04, 5));
  const G3 = meshWith(G2, 0.04, 0.05, 0.1);
  const w3 = (-w2 * 0.04) / 0.05;
  p = part({ kind: 'rot', cx: G3[0], cy: G3[1], w: w3, ph: 0.1, color: 'orange', depth: 1 });
  add(p, gear(0.05, 6));
  add(p, circ(0.015, 0, 0, 12));

  // Gear D (left) with a pulley, a belt to pulley E, and a gear train down to a flywheel.
  const D: Pt = [0.6 * Math.cos(2.95), 0.6 * Math.sin(2.95)];
  const wD = (-wRing * 0.4) / 0.2;
  p = part({ kind: 'rot', cx: D[0], cy: D[1], w: wD, ph: 0, color: 'orange', depth: 1 });
  add(p, gear(0.2, 20));
  add(p, circ(0.13));
  spokes(p, 0.06, 0.13, 5);
  p = part({ kind: 'rot', cx: D[0], cy: D[1], w: wD, ph: 0, color: 'orange', depth: 1 });
  add(p, circ(0.06, 0, 0, 32));
  const E: Pt = [-0.72, -0.42];
  p = part({ kind: 'rot', cx: E[0], cy: E[1], w: wD, ph: 0, color: 'orange', depth: 0.8 });
  add(p, circ(0.06, 0, 0, 32));
  add(p, circ(0.02, 0, 0, 12));
  spokes(p, 0.02, 0.06, 3);
  const beltRes = beltPath(D, E, 0.06);
  p = part({ kind: 'belt', color: 'orange', depth: 0.8, speed: 0.05 });
  add(p, beltRes.outline);
  const F = meshWith(D, 0.2, 0.07, 1.9);
  const wF = (-wD * 0.2) / 0.07;
  p = part({ kind: 'rot', cx: F[0], cy: F[1], w: wF, ph: 0, color: 'orange', depth: 1 });
  add(p, gear(0.07, 8));
  add(p, circ(0.02, 0, 0, 12));
  const FW = meshWith(F, 0.07, 0.12, 0.6);
  const wFW = (-wF * 0.07) / 0.12;
  p = part({ kind: 'rot', cx: FW[0], cy: FW[1], w: wFW, ph: 0, color: 'orange', depth: 1 });
  add(p, gear(0.12, 14));
  add(p, circ(0.09));
  add(p, circ(0.025, 0, 0, 16));
  spokes(p, 0.025, 0.09, 8);

  // Pistons in cylinders, driven by the crank on gear B.
  const crank = { B, wB, ph: 0.1, rc: 0.06, L: 0.32 };
  const pistX = [B[0] - 0.075, B[0] + 0.075];
  for (let k = 0; k < 2; k++) {
    p = part({ kind: 'rod', k, color: 'orange', depth: 1 });
    add(p, [[0, 0], [0.32, 0]]);
    p = part({ kind: 'piston', k, color: 'orange', depth: 1 });
    add(p, [[-0.035, -0.025], [0.035, -0.025], [0.035, 0.025], [-0.035, 0.025], [-0.035, -0.025]]);
    p = part({ kind: 'static', color: 'white', depth: 1, alpha: 0.35 });
    const px = pistX[k];
    const y0 = B[1] + 0.21;
    const y1 = B[1] + 0.43;
    add(p, [[px - 0.045, y0], [px - 0.045, y1], [px + 0.045, y1], [px + 0.045, y0]], 0.8);
  }

  // Rack and pinion across the top: the pinion rocks back and forth and slides the rack.
  const pin: Pt = [0.05, -0.56];
  const pinR = 0.06;
  const pinAmp = 0.9;
  const pinFreq = 0.5;
  p = part({ kind: 'osc', cx: pin[0], cy: pin[1], amp: pinAmp, freq: pinFreq, color: 'orange', depth: 1 });
  add(p, gear(pinR, 8));
  add(p, circ(0.018, 0, 0, 12));
  p = part({ kind: 'rack', r: pinR, amp: pinAmp, freq: pinFreq, color: 'orange', depth: 1 });
  const rack: Pt[] = [];
  const rackY = pin[1] - pinR - 0.008;
  for (let x = -0.28; x <= 0.38; x += 0.03) {
    rack.push([x, rackY - 0.004], [x + 0.008, rackY + 0.012], [x + 0.018, rackY + 0.012], [x + 0.026, rackY - 0.004]);
  }
  add(p, rack);
  add(p, [[-0.28, rackY - 0.05], [0.4, rackY - 0.05]]);

  return finalize(ctx, parts, polys, { crank, pistX, beltRes });
}

function beltPath(D: Pt, E: Pt, r: number) {
  const dx = E[0] - D[0];
  const dy = E[1] - D[1];
  const L = Math.hypot(dx, dy);
  const nx = -dy / L;
  const ny = dx / L;
  const a0 = Math.atan2(ny, nx);
  const pts: Pt[] = [[D[0] + nx * r, D[1] + ny * r], [E[0] + nx * r, E[1] + ny * r]];
  for (let k = 1; k <= 16; k++) {
    const a = a0 - (k / 16) * Math.PI;
    pts.push([E[0] + Math.cos(a) * r, E[1] + Math.sin(a) * r]);
  }
  pts.push([D[0] - nx * r, D[1] - ny * r]);
  for (let k = 1; k <= 16; k++) {
    const a = a0 + Math.PI - (k / 16) * Math.PI;
    pts.push([D[0] + Math.cos(a) * r, D[1] + Math.sin(a) * r]);
  }
  const cum = [0];
  for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
  const tot = cum[cum.length - 1];
  const res = new Float32Array(800);
  let seg = 1;
  for (let q = 0; q < 400; q++) {
    const d = (q / 400) * tot;
    while (seg < cum.length - 1 && cum[seg] < d) seg++;
    const f = (d - cum[seg - 1]) / (cum[seg] - cum[seg - 1] || 1);
    res[q * 2] = pts[seg - 1][0] + (pts[seg][0] - pts[seg - 1][0]) * f;
    res[q * 2 + 1] = pts[seg - 1][1] + (pts[seg][1] - pts[seg - 1][1]) * f;
  }
  return { outline: pts, samples: res };
}

interface Extras {
  crank: { B: Pt; wB: number; ph: number; rc: number; L: number };
  pistX: number[];
  beltRes: { samples: Float32Array };
}

function finalize(ctx: ShapeBuildContext, parts: Part[], polys: Poly[], ex: Extras): BodyShape {
  const n = ctx.count;
  const partOf = new Uint16Array(n);
  const la = new Float32Array(n);
  const lb = new Float32Array(n);
  const lf = new Float32Array(n);
  for (const pl of polys) {
    const cum = [0];
    for (let k = 1; k < pl.pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pl.pts[k][0] - pl.pts[k - 1][0], pl.pts[k][1] - pl.pts[k - 1][1]));
    (pl as Poly & { cum: number[]; len: number }).cum = cum;
    (pl as Poly & { cum: number[]; len: number }).len = cum[cum.length - 1];
  }
  const P = polys as (Poly & { cum: number[]; len: number })[];
  const totW = P.reduce((a, pl) => a + pl.len * pl.weight, 0);
  let idx = 0;
  P.forEach((pl, pi) => {
    let cnt = Math.round(((pl.len * pl.weight) / totW) * n);
    if (pi === P.length - 1) cnt = n - idx;
    let seg = 1;
    for (let q = 0; q < cnt && idx < n; q++) {
      const d = ((q + 0.5) / cnt) * pl.len;
      while (seg < pl.cum.length - 1 && pl.cum[seg] < d) seg++;
      const f = (d - pl.cum[seg - 1]) / (pl.cum[seg] - pl.cum[seg - 1] || 1);
      partOf[idx] = pl.part;
      la[idx] = pl.pts[seg - 1][0] + (pl.pts[seg][0] - pl.pts[seg - 1][0]) * f;
      lb[idx] = pl.pts[seg - 1][1] + (pl.pts[seg][1] - pl.pts[seg - 1][1]) * f;
      lf[idx] = d / (pl.len || 1);
      idx++;
    }
  });
  while (idx < n) {
    const j = Math.floor(Math.random() * Math.max(1, idx));
    partOf[idx] = partOf[j];
    la[idx] = la[j];
    lb[idx] = lb[j];
    lf[idx] = lf[j];
    idx++;
  }

  const R = ctx.region;
  const ms = Math.min(R.w / UNIT_W, R.h / UNIT_H);
  const ox = R.x0 + R.w / 2;
  const oy = R.y0 + R.h / 2;
  const rgb: RGB[] = parts.map((q) => hexToRgb(palette[q.color]));
  const pulse = hexToRgb(palette.white);

  const pos = new Float32Array(n * 2);
  const alpha = new Float32Array(n);
  const color = new Float32Array(n * 3);
  const depth = new Float32Array(n);
  for (let j = 0; j < n; j++) depth[j] = parts[partOf[j]].depth;

  type State = { cx: number; cy: number; c: number; s: number; ax: number; ay: number; bx: number; by: number; v: number };
  const states: State[] = parts.map(() => ({ cx: 0, cy: 0, c: 1, s: 0, ax: 0, ay: 0, bx: 0, by: 0, v: 0 }));

  // The machine never reacts to the cursor, so the pointer argument is ignored.
  const update = (time: number, _pointer: Point | null, open: number) => {
    parts.forEach((q, i) => {
      const s = states[i];
      switch (q.kind) {
        case 'rot': {
          const a = q.w * time + q.ph;
          s.cx = q.cx; s.cy = q.cy; s.c = Math.cos(a); s.s = Math.sin(a);
          break;
        }
        case 'osc': {
          const a = q.amp * Math.sin(q.freq * time);
          s.cx = q.cx; s.cy = q.cy; s.c = Math.cos(a); s.s = Math.sin(a);
          break;
        }
        case 'rack':
          s.v = q.r * q.amp * Math.sin(q.freq * time);
          break;
        case 'planet': {
          const ca = 0.12 * time + (q.k * Math.PI * 2) / 3;
          const a = 0.6 * time;
          s.cx = Math.cos(ca) * 0.225; s.cy = Math.sin(ca) * 0.225; s.c = Math.cos(a); s.s = Math.sin(a);
          break;
        }
        case 'iris': {
          const ao = (q.j * Math.PI) / 3 + 0.04 * time;
          const ri = 0.012 + 0.08 * open;
          const ai = ao + 1.1 - 0.5 * open;
          s.ax = Math.cos(ao) * 0.105; s.ay = Math.sin(ao) * 0.105; s.bx = Math.cos(ai) * ri; s.by = Math.sin(ai) * ri;
          break;
        }
        case 'rod':
        case 'piston': {
          const cr = ex.crank;
          const a = cr.wB * time + cr.ph + q.k * Math.PI;
          const pinx = cr.B[0] + Math.cos(a) * cr.rc;
          const piny = cr.B[1] + Math.sin(a) * cr.rc;
          const px = ex.pistX[q.k];
          const dx = px - pinx;
          s.ax = pinx; s.ay = piny; s.bx = px; s.by = piny + Math.sqrt(Math.max(0, cr.L * cr.L - dx * dx));
          break;
        }
        case 'circuit':
          s.v = ((time * q.speed + q.phase) % 1.4) - 0.2;
          break;
        case 'belt':
          s.v = (time * q.speed) % 1;
          break;
        default:
          break;
      }
    });
    for (let j = 0; j < n; j++) {
      const qi = partOf[j];
      const q = parts[qi];
      const s = states[qi];
      const a = la[j];
      const b = lb[j];
      let ux = a;
      let uy = b;
      let al = q.alpha ?? (q.depth < 1 ? 0.5 : 0.92);
      let cr = rgb[qi][0];
      let cg = rgb[qi][1];
      let cb = rgb[qi][2];
      switch (q.kind) {
        case 'rot':
        case 'osc':
        case 'planet':
          ux = s.cx + a * s.c - b * s.s;
          uy = s.cy + a * s.s + b * s.c;
          break;
        case 'rack':
          ux = a + s.v;
          break;
        case 'iris':
        case 'rod': {
          const f = lf[j];
          ux = s.ax + (s.bx - s.ax) * f;
          uy = s.ay + (s.by - s.ay) * f;
          break;
        }
        case 'piston':
          ux = s.bx + a;
          uy = s.by + 0.02 + b;
          break;
        case 'belt': {
          const f = (lf[j] + s.v) % 1;
          const k = Math.floor(f * 400) % 400;
          ux = ex.beltRes.samples[k * 2];
          uy = ex.beltRes.samples[k * 2 + 1];
          break;
        }
        case 'circuit': {
          const d = lf[j] - s.v;
          const g = Math.exp(-(d * d) / 0.004);
          al = 0.32 + 0.68 * g;
          cr += (pulse[0] - cr) * g;
          cg += (pulse[1] - cg) * g;
          cb += (pulse[2] - cb) * g;
          break;
        }
        default:
          break;
      }
      pos[j * 2] = ox + ux * ms;
      pos[j * 2 + 1] = oy + uy * ms;
      color[j * 3] = cr;
      color[j * 3 + 1] = cg;
      color[j * 3 + 2] = cb;
      alpha[j] = al;
    }
  };

  update(0, null, 0.25);
  return { pos, alpha, color, depth, anchor: { x: ox, y: oy }, update };
}
