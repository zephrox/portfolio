import { LAYOUT } from '../config';
import { fillTargets, fitText, samplePixels, type DrawFn } from '../sampling';
import type { BodyShape, Region, ShapeBuildContext } from '../types';

/** Draws a faint extension of an illustration on a full-viewport canvas (W x H), given the figure's region. */
export type BackDrawFn = (c: CanvasRenderingContext2D, W: number, H: number, region: Region) => void;

/**
 * Turns any 2D drawing into particle targets inside the section's region. An optional `back`
 * drawing extends the illustration across the stage at low opacity (desktop only): it gets
 * LAYOUT.backShare of the dots, so the figure itself keeps most of its density.
 */
export function fromDrawing(ctx: ShapeBuildContext, draw: DrawFn, step = 2, back?: BackDrawFn): BodyShape {
  const pos = new Float32Array(ctx.count * 2);
  const alpha = new Float32Array(ctx.count).fill(ctx.alpha);
  const L = ctx.layout;
  const backPts =
    back && L.wide && ctx.backLayer ? samplePixels({ x0: 0, y0: 0, w: L.width, h: L.height }, (c, w, h) => back(c, w, h, ctx.region), 3) : [];
  const nBack = backPts.length ? Math.round(ctx.count * LAYOUT.backShare) : 0;
  const nMain = ctx.count - nBack;
  const pts = samplePixels(ctx.region, draw, step);
  if (pts.length) fillTargets(pos, pts, 0, nMain, 2.5);
  if (nBack) {
    fillTargets(pos, backPts, nMain, nBack, 2.5);
    alpha.fill(ctx.alpha * LAYOUT.backAlpha, nMain);
  }
  return { pos, alpha, anchor: { x: ctx.region.x0 + ctx.region.w / 2, y: ctx.region.y0 + ctx.region.h / 2 } };
}

export function buildText(ctx: ShapeBuildContext, lines: string[]): BodyShape {
  return fromDrawing(ctx, (c, w, h) => fitText(c, w, h, lines));
}

const orbitRadius = (w: number, h: number): number => Math.min(w, h) * 0.46;

export function buildOrbits(ctx: ShapeBuildContext): BodyShape {
  // Back layer: one wide, faint orbit at a new tilt, kept to the right of the text column.
  const back: BackDrawFn = (c, W, H, R) => {
    const r = orbitRadius(R.w, R.h) * 1.9;
    c.save();
    c.beginPath();
    c.rect(R.x0 + R.w * 0.12, 0, W, H);
    c.clip();
    c.lineWidth = 2.4;
    c.translate(R.x0 + R.w / 2, R.y0 + R.h / 2);
    c.rotate(-0.45);
    c.beginPath();
    c.ellipse(0, 0, r, r * 0.3, 0, 0, Math.PI * 2);
    c.stroke();
    c.restore();
  };
  return fromDrawing(ctx, (c, w, h) => {
    const r = orbitRadius(w, h);
    const cx = w / 2;
    const cy = h / 2;
    c.lineWidth = 2.4;
    [0, Math.PI / 3, (2 * Math.PI) / 3].forEach((a, j) => {
      c.save();
      c.translate(cx, cy);
      c.rotate(a);
      c.beginPath();
      c.ellipse(0, 0, r, r * 0.34, 0, 0, Math.PI * 2);
      c.stroke();
      const t = j * 2.1;
      c.beginPath();
      c.arc(r * Math.cos(t), r * 0.34 * Math.sin(t), 8, 0, Math.PI * 2);
      c.fill();
      c.restore();
    });
    c.beginPath();
    c.arc(cx, cy, r * 0.09, 0, Math.PI * 2);
    c.fill();
  }, 2, back);
}

/** One seismograph trace across [x0, x0 + w] centred on y0, with a burst somewhere in the middle. */
function seismicTrace(c: CanvasRenderingContext2D, x0: number, w: number, y0: number, rowH: number, r: number): void {
  const bx = w * (0.15 + Math.random() * 0.7);
  const sd = w * 0.04;
  c.beginPath();
  for (let x = 0; x <= w; x += 3) {
    const burst = Math.exp(-((x - bx) * (x - bx)) / (2 * sd * sd));
    const amp = rowH * 0.45 * burst + 2;
    const y = y0 + Math.sin(x * 0.35 + r) * amp * Math.sin(x * 0.09 + r * 2);
    if (x === 0) c.moveTo(x0 + x, y);
    else c.lineTo(x0 + x, y);
  }
  c.stroke();
}

export function buildSeismic(ctx: ShapeBuildContext, rows: number): BodyShape {
  // Back layer: two faint extra traces above the main rows, as if more sensors were listening.
  const back: BackDrawFn = (c, W, _H, R) => {
    const rowH = R.h / rows;
    c.lineWidth = 2.2;
    for (let k = 1; k <= 2; k++) seismicTrace(c, 0, W, R.y0 + rowH * (0.5 - k), rowH, rows + k);
  };
  return fromDrawing(ctx, (c, w, h) => {
    c.lineWidth = 2.2;
    for (let r = 0; r < rows; r++) seismicTrace(c, 0, w, (h * (r + 0.5)) / rows, h / rows, r);
  }, 2, back);
}

/** A 468-point face mesh, like MediaPipe FaceMesh, seen at a slight angle. */
export function buildFaceMesh(ctx: ShapeBuildContext): BodyShape {
  const mesh = meshPoints();
  return fromDrawing(ctx, (c, w, h) => {
    const yaw = -0.32;
    const cy0 = Math.cos(yaw);
    const sy0 = Math.sin(yaw);
    const s = Math.min(w / 1.8, h / 2.3);
    const cx = w / 2;
    const cy = h / 2;
    const pr = mesh.map(([X, Y, Z]) => [cx + (X * cy0 + Z * sy0) * s, cy - Y * s]);
    c.lineWidth = 1.3;
    for (let i = 0; i < mesh.length; i++) {
      const best: [number, number][] = [];
      for (let j = 0; j < mesh.length; j++) {
        if (j === i) continue;
        const dx = mesh[i][0] - mesh[j][0];
        const dy = mesh[i][1] - mesh[j][1];
        const dz = mesh[i][2] - mesh[j][2];
        const d2 = dx * dx + dy * dy + dz * dz;
        if (best.length < 2 || d2 < best[best.length - 1][0]) {
          best.push([d2, j]);
          best.sort((a, b) => a[0] - b[0]);
          if (best.length > 2) best.pop();
        }
      }
      for (const [, j] of best) {
        c.beginPath();
        c.moveTo(pr[i][0], pr[i][1]);
        c.lineTo(pr[j][0], pr[j][1]);
        c.stroke();
      }
    }
    for (const [px, py] of pr) {
      c.beginPath();
      c.arc(px, py, 3, 0, Math.PI * 2);
      c.fill();
    }
  });
}

/** Rounded-rect path helper for the browser windows. */
function roundRect(c: CanvasRenderingContext2D, x: number, y: number, ww: number, hh: number, r: number): void {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + ww, y, x + ww, y + hh, r);
  c.arcTo(x + ww, y + hh, x, y + hh, r);
  c.arcTo(x, y + hh, x, y, r);
  c.arcTo(x, y, x + ww, y, r);
  c.closePath();
}

/** A browser window outline: frame, title bar and three dots. */
function windowFrame(c: CanvasRenderingContext2D, x: number, y: number, bw: number, bh: number): void {
  roundRect(c, x, y, bw, bh, 10);
  c.stroke();
  c.beginPath();
  c.moveTo(x, y + 30);
  c.lineTo(x + bw, y + 30);
  c.stroke();
  for (let k = 0; k < 3; k++) {
    c.beginPath();
    c.arc(x + 18 + k * 14, y + 15, 4, 0, Math.PI * 2);
    c.fill();
  }
}

export function buildWindows(ctx: ShapeBuildContext): BodyShape {
  // Back layer: a fourth window half off the bottom-right edge, clear of the stack and the text.
  const back: BackDrawFn = (c, _W, _H, R) => {
    c.lineWidth = 3;
    windowFrame(c, R.x0 + R.w * 0.55, R.y0 + R.h, R.w * 0.62, R.h * 0.52);
  };
  return fromDrawing(ctx, (c, w, h) => {
    const bw = w * 0.62;
    const bh = h * 0.52;
    const wins: [number, number][] = [[w * 0.04, h * 0.06], [w * 0.19, h * 0.24], [w * 0.34, h * 0.42]];
    c.lineWidth = 3;
    wins.forEach(([x, y], j) => {
      c.globalCompositeOperation = 'destination-out';
      roundRect(c, x, y, bw, bh, 10);
      c.fill();
      c.globalCompositeOperation = 'source-over';
      windowFrame(c, x, y, bw, bh);
      if (j === 2) {
        [0.7, 0.55, 0.82, 0.4, 0.64].forEach((f, r) => c.fillRect(x + 22, y + 54 + r * ((bh - 74) / 5), (bw - 44) * f, 7));
      }
    });
  }, 2, back);
}

function meshPoints(): [number, number, number][] {
  let pts: [number, number, number][] = [];
  let N = 800;
  const ga = Math.PI * (3 - Math.sqrt(5));
  while (pts.length < 468) {
    pts = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - (2 * (i + 0.5)) / N;
      const r = Math.sqrt(1 - y * y);
      const th = ga * i;
      const z = Math.sin(th) * r;
      if (z > -0.15) pts.push([Math.cos(th) * r, y, z]);
    }
    N += 4;
  }
  return pts.slice(0, 468).map(([x, y, z]) => {
    let X = x * 0.8;
    const Y = y * 1.08;
    let Z = z * 0.9;
    if (Y < -0.3) {
      const t = (-Y - 0.3) / 0.8;
      X *= 1 - 0.35 * t * t;
      Z *= 1 - 0.15 * t;
    }
    const f = Math.max(0, z);
    Z += 0.24 * Math.exp(-((X * X) / 0.01 + ((Y + 0.05) * (Y + 0.05)) / 0.05)) * f;
    const ex = (Math.abs(X) - 0.28) ** 2;
    const ey = (Y - 0.2) ** 2;
    Z -= 0.09 * Math.exp(-(ex / 0.012 + ey / 0.008)) * f;
    return [X, Y, Z];
  });
}
