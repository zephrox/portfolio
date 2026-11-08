import { hexToRgb, palette, type ColorName, type RGB } from '../../theme/tokens';
import type { BodyShape, Point, ShapeBuildContext } from '../types';

/**
 * The intro machine, drawn in white. Everything is defined in "unit" coordinates (about -1..1 wide,
 * -0.72..0.72 tall, y down) and mapped into the section's region. Each part has a kind that decides
 * how it moves.
 *
 * Power flows like a real machine: a motor turns the line shaft along the bottom; a worm on that
 * shaft drives the main gear (with the lens at its hub); gear trains off the main gear drive a
 * Geneva wheel, a crank-slider, a cam and a piston; a bevel pair at the shaft's end turns a vertical
 * spindle up to a flyball governor.
 *
 * To add a part: push a Part in buildMachine(), add its outline with add(), and if it is a new
 * kind, handle it in update()'s two switches.
 */

type Pt = [number, number];

interface Base {
  color: ColorName;
  /** 1 = front layer, 0.5 = back layer (dimmer, zooms slower). */
  depth: number;
  alpha?: number;
}

/** A crank on an axle driving a slider along a straight line through a connecting rod. */
interface Link {
  cx: number;
  cy: number;
  w: number;
  ph: number;
  /** Crank pin radius. */
  rc: number;
  /** A point on the slider's line and the unit direction it slides along (away from the crank). */
  sx: number;
  sy: number;
  ux: number;
  uy: number;
  /** Connecting rod length. */
  L: number;
}

/**
 * A four-slot Geneva drive: a crank pin on an axle at (px, py) turning at `w` indexes the wheel a
 * quarter turn once per revolution, and holds it still the rest of the time.
 */
interface Geneva {
  px: number;
  py: number;
  /** Crank pin radius and centre distance (a = d·sin 45° for four slots). */
  a: number;
  d: number;
  w: number;
  ph: number;
  /** Direction from the drive axle to the wheel centre. */
  toWheel: number;
}

interface CamSpec {
  cx: number;
  cy: number;
  w: number;
  ph: number;
  base: number;
  lift: number;
}

/** Flyball governor: two balls on arms hung from a pivot on a vertical spindle, orbiting it. */
interface Governor {
  cx: number;
  /** Pivot height, arm length, arm angle from the spindle, sleeve height. */
  py: number;
  L: number;
  phi: number;
  sleeveY: number;
  w: number;
  ph: number;
}

type Part = Base &
  (
    | { kind: 'rot'; cx: number; cy: number; w: number; ph: number }
    | { kind: 'static' }
    | { kind: 'iris'; j: number }
    | { kind: 'geneva'; cx: number; cy: number; drive: Geneva }
    | { kind: 'cam'; cx: number; cy: number; w: number; ph: number }
    | { kind: 'follower'; cam: CamSpec; dx: number; dy: number }
    /** Moving texture (worm threads, bevel teeth): one coordinate scrolls and wraps within [a0, a1]. */
    | { kind: 'scroll'; axis: 0 | 1; v: number; a0: number; a1: number }
    /** Slider body, drawn around the slider point at s = 0 and moved along the link's line. */
    | { kind: 'slider'; link: Link }
    | { kind: 'conrod'; link: Link }
    | { kind: 'gov'; gov: Governor; role: 'ball' | 'arm' | 'link'; k: number }
  );

interface Poly {
  part: number;
  pts: Pt[];
  weight: number;
}

const UNIT_W = 2.0;
/** On phones a narrower slice of the machine fills the width, so it reads larger; the outer parts bleed off. */
const UNIT_W_PHONE = 1.6;
const unitW = (ctx: ShapeBuildContext): number => (ctx.layout.wide ? UNIT_W : UNIT_W_PHONE);
const UNIT_H = 1.44;
/** Vertical offset (unit space) that centres the machine's drawing in its region. */
const Y_SHIFT = 0.12;

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

function arc(r: number, a0: number, a1: number, seg = 24, cx = 0, cy = 0): Pt[] {
  const o: Pt[] = [];
  for (let k = 0; k <= seg; k++) {
    const a = a0 + ((a1 - a0) * k) / seg;
    o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return o;
}

function rect(x0: number, y0: number, x1: number, y1: number): Pt[] {
  return [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]];
}

const wrap = (x: number): number => Math.atan2(Math.sin(x), Math.cos(x));

/**
 * Four-slot Geneva wheel (Maltese cross) centred at 0, slots along the axes. Between slots the rim
 * is scalloped where the drive's locking disc rides, so the wheel stays locked while the pin is away.
 */
function genevaOutline(a: number, d: number, scallopR: number): Pt[] {
  const b = d * Math.SQRT1_2;
  const hw = 0.011;
  const rIn = d - a - 0.005;
  const rimAt = (t: number): number => {
    const m = Math.round((t - Math.PI / 4) / (Math.PI / 2)) * (Math.PI / 2) + Math.PI / 4;
    const proj = d * Math.cos(t - m);
    const disc = proj * proj - d * d + scallopR * scallopR;
    return disc > 0 ? Math.min(b, proj - Math.sqrt(disc)) : b;
  };
  const out: Pt[] = [];
  const edge = Math.sqrt(b * b - hw * hw);
  const half = Math.asin(hw / b);
  for (let k = 0; k < 4; k++) {
    const t0 = (k * Math.PI) / 2;
    const c = Math.cos(t0);
    const s = Math.sin(t0);
    const loc = (x: number, y: number): Pt => [x * c - y * s, x * s + y * c];
    out.push(loc(edge, -hw), loc(rIn, -hw), loc(rIn, hw), loc(edge, hw));
    const ta = t0 + half;
    const tb = t0 + Math.PI / 2 - half;
    for (let q = 1; q < 24; q++) {
      const t = ta + ((tb - ta) * q) / 24;
      const r = rimAt(t);
      out.push([Math.cos(t) * r, Math.sin(t) * r]);
    }
  }
  out.push(out[0]);
  return out;
}

/** Radius of the egg-shaped cam at local angle t (nose at t = 0). */
function camRadius(cam: CamSpec, t: number): number {
  const k = (1 + Math.cos(t)) / 2;
  return cam.base + cam.lift * k * k;
}

function camOutline(cam: CamSpec, seg = 64): Pt[] {
  const o: Pt[] = [];
  for (let k = 0; k <= seg; k++) {
    const t = (k / seg) * Math.PI * 2;
    const r = camRadius(cam, t);
    o.push([Math.cos(t) * r, Math.sin(t) * r]);
  }
  return o;
}

/**
 * World rotation of the Geneva wheel at `time`. While the crank pin is within 45° of the line of
 * centres it drives a slot (the classic atan2 relation); otherwise the wheel holds its last index.
 * Assumes the drive turns with positive `w`.
 */
function genevaAngle(g: Geneva, time: number): number {
  const wx = g.px + Math.cos(g.toWheel) * g.d;
  const wy = g.py + Math.sin(g.toWheel) * g.d;
  const psi = g.toWheel + Math.PI;
  const slotDir = (alpha: number): number => {
    const x = g.px + Math.cos(g.toWheel + alpha) * g.a - wx;
    const y = g.py + Math.sin(g.toWheel + alpha) * g.a - wy;
    return wrap(Math.atan2(y, x) - psi);
  };
  const lim = Math.PI / 4;
  const r0 = slotDir(-lim);
  const step = wrap(slotDir(lim) - r0);
  const u = g.w * time + g.ph - g.toWheel;
  const n = Math.floor((u + Math.PI) / (Math.PI * 2));
  const alpha = u - n * Math.PI * 2;
  let f = 0;
  if (alpha >= lim) f = step;
  else if (alpha > -lim) f = wrap(slotDir(alpha) - r0);
  return psi + r0 + n * step + f;
}

/** Crank pin position and how far the slider has travelled along its line at `time`. */
function linkState(k: Link, time: number): { px: number; py: number; s: number } {
  const a = k.w * time + k.ph;
  const px = k.cx + Math.cos(a) * k.rc;
  const py = k.cy + Math.sin(a) * k.rc;
  const dx = k.sx - px;
  const dy = k.sy - py;
  const du = dx * k.ux + dy * k.uy;
  const disc = du * du - (dx * dx + dy * dy) + k.L * k.L;
  return { px, py, s: -du + Math.sqrt(Math.max(0, disc)) };
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
  /** A gear on its own axle: toothed rim, hub, optional spokes. */
  const gearPart = (c: Pt, r: number, teeth: number, w: number, nSpokes = 0, ph = 0) => {
    const p = part({ kind: 'rot', cx: c[0], cy: c[1], w, ph, color: 'white', depth: 1 });
    add(p, gear(r, teeth));
    add(p, circ(Math.max(0.012, r * 0.18), 0, 0, 16));
    if (nSpokes) {
      add(p, circ(r * 0.78, 0, 0, 48), 0.6);
      spokes(p, r * 0.18, r * 0.78, nSpokes);
    }
    return p;
  };
  const front = (alpha?: number) => part({ kind: 'static', color: 'white', depth: 1, alpha });

  // Screen edges in unit space, so the base rail can run off both sides.
  const R0 = ctx.region;
  const ms0 = Math.min(R0.w / unitW(ctx), R0.h / UNIT_H);
  const ox0 = R0.x0 + R0.w / 2;
  const edgeL = Math.min(-1, -ox0 / ms0);
  const edgeR = Math.max(1, (ctx.layout.width - ox0) / ms0);

  // ---- Line shaft (bottom), motor, worm ----
  const shaftY = 0.3;
  const wShaft = 0.68;
  const wormStarts = 4;
  const g1Teeth = 34;
  const r1 = 0.27;
  const w1 = (wShaft * wormStarts) / g1Teeth;

  let p = front(0.7);
  add(p, [[-0.76, shaftY - 0.012], [-0.1, shaftY - 0.012]], 0.6);
  add(p, [[-0.76, shaftY + 0.012], [-0.1, shaftY + 0.012]], 0.6);
  add(p, [[0.1, shaftY - 0.012], [0.76, shaftY - 0.012]], 0.6);
  add(p, [[0.1, shaftY + 0.012], [0.76, shaftY + 0.012]], 0.6);

  // Motor: finned housing, end cap and coupling flange.
  p = front(0.8);
  add(p, rect(-0.98, 0.23, -0.79, 0.37));
  add(p, rect(-0.79, 0.25, -0.77, 0.35), 0.6);
  for (let x = -0.955; x < -0.8; x += 0.03) add(p, [[x, 0.245], [x, 0.355]], 0.5);
  add(p, [[-0.755, shaftY - 0.035], [-0.755, shaftY + 0.035]], 0.7);
  add(p, [[-0.745, shaftY - 0.035], [-0.745, shaftY + 0.035]], 0.7);

  // Pillow-block bearings carrying the shaft.
  p = front(0.6);
  for (const bx of [-0.45, 0.3, 0.62]) {
    add(p, arc(0.03, Math.PI, Math.PI * 2, 16, bx, shaftY), 0.8);
    add(p, [[bx - 0.03, shaftY], [bx - 0.03, 0.34], [bx - 0.055, 0.34], [bx - 0.055, 0.355], [bx + 0.055, 0.355], [bx + 0.055, 0.34], [bx + 0.03, 0.34], [bx + 0.03, shaftY]], 0.8);
  }

  // Worm under the main gear: body plus threads that scroll with the main gear's rim.
  p = front();
  add(p, rect(-0.09, shaftY - 0.03, 0.09, shaftY + 0.03), 0.8);
  const toothPitch = (Math.PI * 2 * r1) / g1Teeth;
  p = part({ kind: 'scroll', axis: 0, v: -w1 * r1, a0: -0.09, a1: 0.09, color: 'white', depth: 1 });
  for (let x = -0.09; x < 0.09; x += toothPitch) add(p, [[x, shaftY - 0.03], [x + 0.02, shaftY + 0.03]], 0.7);

  // ---- Main gear G1 with the lens at its hub ----
  gearPart([0, 0], r1, g1Teeth, w1);
  p = part({ kind: 'rot', cx: 0, cy: 0, w: w1, ph: 0, color: 'white', depth: 1 });
  add(p, circ(0.235, 0, 0, 72), 0.5);
  spokes(p, 0.13, 0.235, 6);
  p = front();
  add(p, circ(0.115));
  add(p, circ(0.1));
  for (let j = 0; j < 6; j++) {
    p = part({ kind: 'iris', j, color: 'white', depth: 1 });
    add(p, [[0, 0], [0.11, 0]]);
  }
  p = front();
  add(p, circ(0.022, 0, 0, 24));
  add(p, circ(0.01, 0, 0, 12));

  // ---- Right train: G2 -> G3 -> G4 -> Geneva pinion ----
  const G1: Pt = [0, 0];
  const r2 = 0.12;
  const G2 = meshWith(G1, r1, r2, -0.6);
  const w2 = (-w1 * r1) / r2;
  gearPart(G2, r2, 15, w2, 5);
  const r3 = 0.07;
  const G3 = meshWith(G2, r2, r3, -1.4);
  const w3 = (-w2 * r2) / r3;
  gearPart(G3, r3, 9, w3);
  const r4 = 0.1;
  const G4 = meshWith(G3, r3, r4, -0.3);
  const w4 = (-w3 * r3) / r4;
  gearPart(G4, r4, 12, w4, 4);

  // Geneva drive (top centre): pinion off G4, crank with pin and locking crescent, four-slot wheel.
  const rP = 0.03;
  const P = meshWith(G4, r4, rP, -2.0);
  const wP = (-w4 * r4) / rP;
  gearPart(P, rP, 5, wP);
  const genD = 0.12;
  const genA = genD * Math.SQRT1_2;
  const toWheel = -2.7;
  const genPh = toWheel - Math.PI / 4 - wP * 2;
  const geneva: Geneva = { px: P[0], py: P[1], a: genA, d: genD, w: wP, ph: genPh, toWheel };
  p = part({ kind: 'rot', cx: P[0], cy: P[1], w: wP, ph: genPh, color: 'white', depth: 1 });
  add(p, [[0, 0], [genA, 0]]);
  add(p, circ(0.01, genA, 0, 12));
  add(p, arc(0.055, Math.PI / 3, (5 * Math.PI) / 3), 0.6);
  const GW: Pt = [P[0] + Math.cos(toWheel) * genD, P[1] + Math.sin(toWheel) * genD];
  p = part({ kind: 'geneva', cx: GW[0], cy: GW[1], drive: geneva, color: 'white', depth: 1 });
  add(p, genevaOutline(genA, genD, 0.06));
  add(p, circ(0.012, 0, 0, 12));

  // ---- Lower right: G10 cranks a piston in a vertical cylinder ----
  const r10 = 0.09;
  const G10 = meshWith(G1, r1, r10, 0.3);
  const w10 = (-w1 * r1) / r10;
  gearPart(G10, r10, 11, w10, 3);
  const pistonX = 0.62;
  const piston: Link = { cx: G10[0], cy: G10[1], w: w10, ph: 0, rc: 0.05, sx: pistonX, sy: G10[1], ux: 0, uy: -1, L: 0.36 };
  p = part({ kind: 'rot', cx: G10[0], cy: G10[1], w: w10, ph: 0, color: 'white', depth: 1 });
  add(p, circ(0.012, piston.rc, 0, 10));
  p = part({ kind: 'conrod', link: piston, color: 'white', depth: 1 });
  add(p, [[0, 0], [1, 0]]);
  p = part({ kind: 'slider', link: piston, color: 'white', depth: 1 });
  add(p, rect(-0.03, -0.03, 0.03, 0.02));
  add(p, circ(0.008, 0, 0, 8), 0.6);
  p = front(0.4);
  add(p, [[pistonX - 0.04, -0.3], [pistonX - 0.04, 0.03]], 0.8);
  add(p, [[pistonX + 0.04, -0.3], [pistonX + 0.04, 0.03]], 0.8);
  add(p, [[pistonX - 0.04, -0.3], [pistonX + 0.04, -0.3]], 0.8);

  // ---- Bevel pair (1:1) at the shaft's end turns the vertical spindle ----
  const apexX = 0.86;
  p = front(0.85);
  add(p, [[0.76, 0.24], [0.8, 0.264], [0.8, 0.336], [0.76, 0.36], [0.76, 0.24]]);
  add(p, [[0.8, 0.2], [0.824, 0.24], [0.896, 0.24], [0.92, 0.2], [0.8, 0.2]]);
  const rBevel = 0.06;
  p = part({ kind: 'scroll', axis: 1, v: wShaft * rBevel, a0: 0.25, a1: 0.35, color: 'white', depth: 1 });
  for (let y = 0.25; y < 0.35; y += 0.016) add(p, [[0.765, y], [0.795, y]], 0.5);
  p = part({ kind: 'scroll', axis: 0, v: wShaft * rBevel, a0: 0.81, a1: 0.91, color: 'white', depth: 1 });
  for (let x = 0.81; x < 0.91; x += 0.016) add(p, [[x, 0.205], [x, 0.235]], 0.5);

  // ---- Vertical spindle and flyball governor (top right) ----
  const pivotY = -0.55;
  p = front(0.75);
  add(p, [[apexX - 0.008, 0.2], [apexX - 0.008, pivotY]], 0.6);
  add(p, [[apexX + 0.008, 0.2], [apexX + 0.008, pivotY]], 0.6);
  add(p, rect(apexX - 0.06, -0.06, apexX + 0.06, -0.04), 0.6);
  add(p, circ(0.016, apexX, pivotY, 12));
  const gov: Governor = { cx: apexX, py: pivotY, L: 0.14, phi: (35 * Math.PI) / 180, sleeveY: -0.38, w: wShaft, ph: 0 };
  p = front();
  add(p, rect(apexX - 0.018, gov.sleeveY - 0.012, apexX + 0.018, gov.sleeveY + 0.012), 0.8);
  for (let k = 0; k < 2; k++) {
    p = part({ kind: 'gov', gov, role: 'arm', k, color: 'white', depth: 1 });
    add(p, [[0, 0], [1, 0]]);
    p = part({ kind: 'gov', gov, role: 'link', k, color: 'white', depth: 1 });
    add(p, [[0, 0], [1, 0]], 0.7);
    p = part({ kind: 'gov', gov, role: 'ball', k, color: 'white', depth: 1 });
    add(p, circ(0.03, 0, 0, 20));
  }

  // ---- Left train: G5 (flywheel) -> G6 -> G7 crank-slider; G5 -> G8 -> G9 cam ----
  const r5 = 0.16;
  const G5 = meshWith(G1, r1, r5, 3.4);
  const w5 = (-w1 * r1) / r5;
  gearPart(G5, r5, 20, w5, 8);
  const r6 = 0.07;
  const G6 = meshWith(G5, r5, r6, -2.2);
  const w6 = (-w5 * r5) / r6;
  gearPart(G6, r6, 9, w6);
  const r7 = 0.08;
  const G7 = meshWith(G6, r6, r7, -1.7);
  const w7 = (-w6 * r6) / r7;
  gearPart(G7, r7, 10, w7, 3);

  // Crank-slider: crosshead running in horizontal guides to the left of G7.
  const slider: Link = { cx: G7[0], cy: G7[1], w: w7, ph: 0, rc: 0.055, sx: G7[0], sy: G7[1], ux: -1, uy: 0, L: 0.24 };
  p = part({ kind: 'rot', cx: G7[0], cy: G7[1], w: w7, ph: 0, color: 'white', depth: 1 });
  add(p, circ(0.012, slider.rc, 0, 10));
  p = part({ kind: 'conrod', link: slider, color: 'white', depth: 1 });
  add(p, [[0, 0], [1, 0]]);
  p = part({ kind: 'slider', link: slider, color: 'white', depth: 1 });
  add(p, rect(-0.03, -0.024, 0.03, 0.024));
  add(p, [[-0.03, 0], [-0.2, 0]], 0.7);
  p = front(0.4);
  add(p, [[-0.98, G7[1] - 0.034], [-0.7, G7[1] - 0.034]], 0.8);
  add(p, [[-0.98, G7[1] + 0.034], [-0.7, G7[1] + 0.034]], 0.8);

  const r8 = 0.09;
  const G8 = meshWith(G5, r5, r8, 2.3);
  const w8 = (-w5 * r5) / r8;
  gearPart(G8, r8, 11, w8, 4);
  const r9 = 0.05;
  const G9 = meshWith(G8, r8, r9, 2.9);
  const w9 = (-w8 * r8) / r9;
  gearPart(G9, r9, 7, w9);
  const cam: CamSpec = { cx: G9[0], cy: G9[1], w: w9, ph: 0, base: 0.06, lift: 0.03 };
  p = part({ kind: 'cam', cx: cam.cx, cy: cam.cy, w: cam.w, ph: cam.ph, color: 'white', depth: 1 });
  add(p, camOutline(cam));
  // Follower to the left of the cam, drawn at its lowest-lift position; update() pushes it out.
  const rollerR = 0.012;
  const rollerX = cam.cx - cam.base - rollerR;
  p = part({ kind: 'follower', cam, dx: -1, dy: 0, color: 'white', depth: 1 });
  add(p, circ(rollerR, rollerX, cam.cy, 12));
  add(p, [[rollerX - rollerR, cam.cy], [-0.99, cam.cy]], 0.8);
  p = front(0.4);
  add(p, [[-0.95, cam.cy - 0.02], [-0.88, cam.cy - 0.02]], 0.8);
  add(p, [[-0.95, cam.cy + 0.02], [-0.88, cam.cy + 0.02]], 0.8);

  // ---- Back layer: base rail across the whole stage, with feet up to the machine ----
  const railY = 0.45;
  p = part({ kind: 'static', color: 'white', depth: 0.5, alpha: 0.3 });
  add(p, [[edgeL, railY], [edgeR, railY]], 0.15);
  p = part({ kind: 'static', color: 'white', depth: 0.5, alpha: 0.4 });
  for (const fx of [-0.95, -0.82, -0.45, 0.3, 0.62, 0.78]) add(p, [[fx, fx < -0.8 ? 0.37 : 0.355], [fx, railY]], 0.5);

  return finalize(ctx, parts, polys);
}

function finalize(ctx: ShapeBuildContext, parts: Part[], polys: Poly[]): BodyShape {
  const n = ctx.count;
  const partOf = new Uint16Array(n);
  const la = new Float32Array(n);
  const lb = new Float32Array(n);
  const lf = new Float32Array(n);
  const P = polys.map((pl) => {
    const cum = [0];
    for (let k = 1; k < pl.pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pl.pts[k][0] - pl.pts[k - 1][0], pl.pts[k][1] - pl.pts[k - 1][1]));
    return { ...pl, cum, len: cum[cum.length - 1] };
  });
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
  const ms = Math.min(R.w / unitW(ctx), R.h / UNIT_H);
  const ox = R.x0 + R.w / 2;
  // The machine's parts span about y -0.71..0.45 (rail lower), so shift down to centre it in the region.
  const oy = R.y0 + R.h / 2 + Y_SHIFT * ms;
  const rgb: RGB[] = parts.map((q) => hexToRgb(palette[q.color]));

  const pos = new Float32Array(n * 2);
  const alpha = new Float32Array(n);
  const color = new Float32Array(n * 3);
  const depth = new Float32Array(n);
  for (let j = 0; j < n; j++) depth[j] = parts[partOf[j]].depth;

  type State = { cx: number; cy: number; c: number; s: number; ax: number; ay: number; bx: number; by: number; v: number; al: number };
  const states: State[] = parts.map(() => ({ cx: 0, cy: 0, c: 1, s: 0, ax: 0, ay: 0, bx: 0, by: 0, v: 0, al: 1 }));

  // The machine never reacts to the cursor, so the pointer argument is ignored.
  const update = (time: number, _pointer: Point | null, open: number) => {
    parts.forEach((q, i) => {
      const s = states[i];
      switch (q.kind) {
        case 'rot':
        case 'cam': {
          const a = q.w * time + q.ph;
          s.cx = q.cx; s.cy = q.cy; s.c = Math.cos(a); s.s = Math.sin(a);
          break;
        }
        case 'geneva': {
          const a = genevaAngle(q.drive, time);
          s.cx = q.cx; s.cy = q.cy; s.c = Math.cos(a); s.s = Math.sin(a);
          break;
        }
        case 'iris': {
          const ao = (q.j * Math.PI) / 3 + 0.04 * time;
          const ri = 0.012 + 0.08 * open;
          const ai = ao + 1.1 - 0.5 * open;
          s.ax = Math.cos(ao) * 0.105; s.ay = Math.sin(ao) * 0.105; s.bx = Math.cos(ai) * ri; s.by = Math.sin(ai) * ri;
          break;
        }
        case 'follower': {
          // Contact faces the follower; find which part of the cam profile is there.
          const cam = q.cam;
          s.v = camRadius(cam, Math.atan2(q.dy, q.dx) - (cam.w * time + cam.ph)) - cam.base;
          break;
        }
        case 'scroll':
          s.v = q.v * time;
          break;
        case 'slider':
        case 'conrod': {
          const k = q.link;
          const ls = linkState(k, time);
          s.ax = ls.px; s.ay = ls.py;
          s.bx = k.sx + k.ux * ls.s; s.by = k.sy + k.uy * ls.s;
          break;
        }
        case 'gov': {
          const g = q.gov;
          const th = g.w * time + g.ph + q.k * Math.PI;
          const R2 = g.L * Math.sin(g.phi);
          const bx = g.cx + Math.cos(th) * R2;
          const by = g.py + g.L * Math.cos(g.phi);
          // Balls nearer the viewer read brighter.
          s.al = 0.7 + 0.3 * Math.sin(th);
          if (q.role === 'ball') { s.cx = bx; s.cy = by; }
          else if (q.role === 'arm') { s.ax = g.cx; s.ay = g.py; s.bx = bx; s.by = by; }
          else { s.ax = g.cx; s.ay = g.sleeveY; s.bx = (g.cx + bx) / 2; s.by = (g.py + by) / 2; }
          break;
        }
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
      let al = q.alpha ?? (q.depth < 1 ? 0.4 : 0.92);
      switch (q.kind) {
        case 'rot':
        case 'cam':
        case 'geneva':
          ux = s.cx + a * s.c - b * s.s;
          uy = s.cy + a * s.s + b * s.c;
          break;
        case 'iris':
        case 'conrod': {
          const f = lf[j];
          ux = s.ax + (s.bx - s.ax) * f;
          uy = s.ay + (s.by - s.ay) * f;
          break;
        }
        case 'slider':
          ux = s.bx + a;
          uy = s.by + b;
          break;
        case 'follower':
          ux = a + q.dx * s.v;
          uy = b + q.dy * s.v;
          break;
        case 'scroll': {
          const span = q.a1 - q.a0;
          const c = q.axis === 0 ? a : b;
          const m = q.a0 + ((((c - q.a0 + s.v) % span) + span) % span);
          if (q.axis === 0) ux = m + (a - c);
          else uy = m;
          break;
        }
        case 'gov':
          al *= s.al;
          if (q.role === 'ball') {
            ux = s.cx + a;
            uy = s.cy + b;
          } else {
            const f = lf[j];
            ux = s.ax + (s.bx - s.ax) * f;
            uy = s.ay + (s.by - s.ay) * f;
          }
          break;
        default:
          break;
      }
      pos[j * 2] = ox + ux * ms;
      pos[j * 2 + 1] = oy + uy * ms;
      color[j * 3] = rgb[qi][0];
      color[j * 3 + 1] = rgb[qi][1];
      color[j * 3 + 2] = rgb[qi][2];
      alpha[j] = al;
    }
  };

  update(0, null, 0.25);
  return { pos, alpha, color, depth, anchor: { x: ox, y: oy }, update };
}
