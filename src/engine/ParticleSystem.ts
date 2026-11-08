import { ENGINE } from './config';
import type { TransitionDef } from './transitions';
import type { Point, Target } from './types';

export const ease = (x: number): number => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export interface FlightContext {
  width: number;
  height: number;
  anchor: Point;
  focus: Point;
  depthAt(i: number): number;
}

/**
 * Owns every particle's state and moves it either by a spring toward a resting target (hold)
 * or along a planned path during a transition (flight). Framework-free and renderer-free.
 * Particles [0, head) form section headings; [head, n) form the illustration.
 */
export class ParticleSystem {
  readonly n: number;
  readonly head: number;
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly alpha: Float32Array;
  readonly size: Float32Array;
  /** rgb triples, used directly as the colour attribute. */
  readonly color: Float32Array;

  private vx: Float32Array;
  private vy: Float32Array;
  private sx: Float32Array;
  private sy: Float32Array;
  private sAlpha: Float32Array;
  private sColor: Float32Array;
  private mx: Float32Array;
  private my: Float32Array;
  private stg: Float32Array;
  private nz1: Float32Array;
  private nz2: Float32Array;
  private phase: Float32Array;
  private delay: Float32Array;

  constructor(n: number, head: number, private reduced: boolean) {
    this.n = n;
    this.head = head;
    const F = () => new Float32Array(n);
    this.x = F();
    this.y = F();
    this.alpha = F();
    this.size = F().fill(ENGINE.dotSize.body);
    this.color = new Float32Array(n * 3);
    this.vx = F();
    this.vy = F();
    this.sx = F();
    this.sy = F();
    this.sAlpha = F();
    this.sColor = new Float32Array(n * 3);
    this.mx = F();
    this.my = F();
    this.stg = F();
    this.nz1 = F();
    this.nz2 = F();
    this.phase = F();
    this.delay = F();
    for (let i = 0; i < n; i++) {
      this.nz1[i] = Math.random() * 2 - 1;
      this.nz2[i] = Math.random() * 2 - 1;
      this.phase[i] = Math.random() * Math.PI * 2;
    }
  }

  /** Random start positions and staggered start times for the load-in. */
  scatter(width: number, height: number, start: Target): void {
    const [d0, d1] = ENGINE.introDelay;
    for (let i = 0; i < this.n; i++) {
      this.x[i] = Math.random() * width;
      this.y[i] = Math.random() * height;
      this.alpha[i] = 0;
      this.delay[i] = this.reduced ? 0 : d0 + Math.random() * (d1 - d0);
      this.color[i * 3] = start.color[i * 3];
      this.color[i * 3 + 1] = start.color[i * 3 + 1];
      this.color[i * 3 + 2] = start.color[i * 3 + 2];
    }
  }

  /** Resting behaviour: spring toward the target, gentle drift, push away from the cursor. */
  hold(t: Target, dt: number, time: number, pointer: Point | null, headFade: number, repel: boolean): void {
    const k = this.reduced ? 1 : 1 - Math.pow(1 - ENGINE.holdStiffness, dt * 60);
    const damp = Math.pow(ENGINE.holdDamping, dt * 60);
    const R = ENGINE.repelRadius;
    const R2 = R * R;
    for (let i = 0; i < this.n; i++) {
      let tx: number;
      let ty: number;
      if (time < this.delay[i]) {
        tx = this.x[i];
        ty = this.y[i];
      } else {
        tx = t.pos[i * 2] + Math.sin(time * 0.8 + this.phase[i]) * ENGINE.drift;
        ty = t.pos[i * 2 + 1] + Math.cos(time * 0.7 + this.phase[i]) * ENGINE.drift;
      }
      if (this.reduced) {
        this.x[i] = tx;
        this.y[i] = ty;
      } else {
        let ax = (tx - this.x[i]) * k;
        let ay = (ty - this.y[i]) * k;
        if (repel && pointer && i >= this.head) {
          const dx = this.x[i] - pointer.x;
          const dy = this.y[i] - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            const dd = Math.sqrt(d2) || 1;
            const f = (1 - dd / R) * ENGINE.repelForce;
            ax += (dx / dd) * f;
            ay += (dy / dd) * f;
          }
        }
        if (time < this.delay[i] + ENGINE.assembleSeconds) {
          this.vx[i] = (this.vx[i] + (tx - this.x[i]) * ENGINE.assembleStiffness) * ENGINE.assembleDamping;
          this.vy[i] = (this.vy[i] + (ty - this.y[i]) * ENGINE.assembleStiffness) * ENGINE.assembleDamping;
        } else {
          this.vx[i] = (this.vx[i] + ax) * damp;
          this.vy[i] = (this.vy[i] + ay) * damp;
        }
        this.x[i] += this.vx[i];
        this.y[i] += this.vy[i];
      }
      let at = time < this.delay[i] ? 0.25 : t.alpha[i];
      if (i < this.head) at = 0.95 - 0.85 * headFade;
      const lerp = this.reduced ? 1 : 0.08;
      this.alpha[i] += (at - this.alpha[i]) * lerp;
      for (let c = 0; c < 3; c++) this.color[i * 3 + c] += (t.color[i * 3 + c] - this.color[i * 3 + c]) * (this.reduced ? 1 : 0.1);
      const base = i < this.head ? ENGINE.dotSize.head : ENGINE.dotSize.body;
      this.size[i] += (base - this.size[i]) * 0.1;
    }
  }

  /**
   * Snapshot where every particle is and plan its path to the new target. The start is stored as
   * an offset from the scene being left (`from`), so particles that have not departed yet keep
   * following that scene if it animates (the machine keeps turning while a scroll is held).
   */
  beginFlight(t: Target, def: TransitionDef, ctx: FlightContext, from: Target): void {
    for (let i = 0; i < this.n; i++) {
      const sx = this.x[i];
      const sy = this.y[i];
      this.sx[i] = sx - from.pos[i * 2];
      this.sy[i] = sy - from.pos[i * 2 + 1];
      this.sAlpha[i] = this.alpha[i];
      this.sColor[i * 3] = this.color[i * 3];
      this.sColor[i * 3 + 1] = this.color[i * 3 + 1];
      this.sColor[i * 3 + 2] = this.color[i * 3 + 2];
      const plan = def.plan({
        sx, sy, bx: t.pos[i * 2], by: t.pos[i * 2 + 1],
        width: ctx.width, height: ctx.height, anchor: ctx.anchor, focus: ctx.focus,
        depth: ctx.depthAt(i), rand: Math.random(),
      });
      this.stg[i] = Math.max(0, Math.min(1, plan.stagger));
      this.mx[i] = plan.mx;
      this.my[i] = plan.my;
      this.vx[i] = 0;
      this.vy[i] = 0;
    }
  }

  /**
   * Position every particle at progress `uu` (0..1) along its planned path. A pure function of
   * `uu`, so scrubbing backwards rewinds exactly; at `uu = 0` every particle sits at its start.
   */
  flight(t: Target, def: TransitionDef, uu: number, headFade: number, ctx: FlightContext, from: Target): void {
    const sig = def.stagger;
    const focus = ctx.focus;
    for (let i = 0; i < this.n; i++) {
      const v = Math.max(0, Math.min(1, (uu - this.stg[i] * sig) / (1 - sig)));
      const e = ease(v);
      const sv = Math.sin(Math.PI * v);
      const sx = from.pos[i * 2] + this.sx[i];
      const sy = from.pos[i * 2 + 1] + this.sy[i];
      const bx = t.pos[i * 2];
      const by = t.pos[i * 2 + 1];
      let x: number;
      let y: number;
      if (def.path === 'orbit') {
        const lx = sx + (bx - sx) * e - focus.x;
        const ly = sy + (by - sy) * e - focus.y;
        const th = 2.4 * sv * (i % 2 ? 1 : 0.6);
        const sc = 1 + 0.3 * sv;
        const c = Math.cos(th);
        const s = Math.sin(th);
        x = focus.x + (lx * c - ly * s) * sc;
        y = focus.y + (lx * s + ly * c) * sc;
      } else if (def.path === 'grid') {
        if (v < 0.55) {
          x = sx + (bx - sx) * ease(v / 0.55);
          y = sy;
        } else {
          x = bx;
          y = sy + (by - sy) * ease((v - 0.55) / 0.45);
        }
        if (v > 0 && v < 0.98) {
          x = Math.round(x / 14) * 14;
          y = Math.round(y / 14) * 14;
        }
      } else {
        const a = (1 - e) * (1 - e);
        const b = 2 * (1 - e) * e;
        const c = e * e;
        x = a * sx + b * this.mx[i] + c * bx;
        y = a * sy + b * this.my[i] + c * by;
      }
      if (def.path !== 'grid') {
        x += sv * this.nz1[i] * 14;
        y += sv * this.nz2[i] * 14;
      }
      this.x[i] = x;
      this.y[i] = y;
      const target = i < this.head ? 0.95 : t.alpha[i];
      let a = this.sAlpha[i] + (target - this.sAlpha[i]) * e;
      if (i < this.head) a = Math.min(1, a + 0.4 * sv) * (1 - 0.85 * headFade);
      a *= 1 - def.alphaDip * sv;
      this.alpha[i] = a;
      for (let c = 0; c < 3; c++) this.color[i * 3 + c] = this.sColor[i * 3 + c] + (t.color[i * 3 + c] - this.sColor[i * 3 + c]) * e;
      const base = i < this.head ? ENGINE.dotSize.head : ENGINE.dotSize.body;
      this.size[i] = base * Math.max(0.2, 1 + def.sizeBoost * sv);
    }
  }
}
