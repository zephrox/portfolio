import { loadPortrait, waitForFonts } from './assets';
import { ENGINE, INPUT, LAYOUT } from './config';
import { ParticleRenderer } from './ParticleRenderer';
import { ParticleSystem, ease, type FlightContext } from './ParticleSystem';
import { fillTargets, headingPoints, regionFromFrac } from './sampling';
import { ScrollInput } from './ScrollInput';
import { buildShape } from './shapes';
import { transitions, type TransitionDef } from './transitions';
import type { Assets, BodyShape, EngineScene, Layout, Point, Target } from './types';

export interface DirectorOptions {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  scenes: EngineScene[];
  portraitUrl?: string;
  onNoWebGL?: () => void;
}

interface Transition {
  from: number;
  to: number;
  dir: 1 | -1;
  def: TransitionDef;
  /** Progress through the whole transition, pre-roll included (0..1). */
  p: number;
  /** 'auto' plays on its own (keyboard, buttons). 'scrub' follows wheel and touch. */
  mode: 'auto' | 'scrub';
  /** Where p is heading on its own: 1 completes, 0 springs back, null means input is driving it. */
  settleTo: 0 | 1 | null;
  started: boolean;
  revealed: boolean;
  fromHidden: boolean;
  ctx: FlightContext | null;
}

/** Fraction of progress before the old text fades when scrubbing, and the hysteresis around it. */
const FROM_TEXT_OUT = 0.05;
const TEXT_HYSTERESIS = 0.05;

/**
 * Runs the story: builds particle targets for every section, turns input into chapter changes,
 * plays or scrubs transitions, and shows/hides each section's text at the right moment.
 *
 * Sections are plain DOM: <section data-scene="i" data-state="in|out"> with one [data-head]
 * heading inside. The Director never renders UI; it only flips those attributes.
 */
export class Director {
  private sys: ParticleSystem | null = null;
  private renderer: ParticleRenderer | null = null;
  private input: ScrollInput | null = null;
  private targets: Target[] = [];
  private shapes: BodyShape[] = [];
  private sections: HTMLElement[] = [];
  private heads: (HTMLElement | null)[] = [];
  private scanEl: HTMLElement | null = null;
  private layout: Layout = { width: 1, height: 1, wide: true };
  private assets: Assets = { portrait: null };
  private cur = 0;
  private trans: Transition | null = null;
  private time = 0;
  private last = 0;
  private raf = 0;
  private dead = false;
  private ready = false;
  private pointer: Point | null = null;
  private headInAt = -1e9;
  private reduced = false;
  private ro: ResizeObserver | null = null;
  private resizeTimer = 0;
  /** After a transition completes, scrub input is ignored until it pauses (momentum guard). */
  private scrubBlocked = false;
  private lastScrubAt = 0;
  /** Reduced motion has no flights: scroll accumulates to one page, then the section swaps. */
  private reducedAcc = 0;
  private cue = -1;

  constructor(private o: DirectorOptions) {}

  async start(): Promise<void> {
    const { root, canvas } = this.o;
    this.sections = Array.from(root.querySelectorAll<HTMLElement>('[data-scene]'));
    this.heads = this.sections.map((s) => s.querySelector<HTMLElement>('[data-head]'));
    this.scanEl = root.querySelector<HTMLElement>('[data-scan]');
    this.sections.forEach((_, i) => this.setSceneState(i, i === 0 ? 'in' : 'out'));
    this.reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    this.sys = new ParticleSystem(ENGINE.particles, ENGINE.headParticles, this.reduced);
    try {
      this.renderer = new ParticleRenderer(canvas, this.sys);
    } catch {
      this.o.onNoWebGL?.();
      return;
    }

    await waitForFonts();
    this.assets.portrait = await loadPortrait(this.o.portraitUrl ?? '/portrait.json');
    if (this.dead) return;

    this.measure();
    this.build();
    this.sys.scatter(this.layout.width, this.layout.height, this.targets[0]);
    this.ready = true;

    this.input = new ScrollInput({
      target: root,
      onCommit: (dir) => this.go(dir),
      onScrub: (delta) => this.scrub(delta),
      onIdle: () => this.release(),
    });
    this.input.attach();
    root.addEventListener('pointermove', this.onPointer);
    root.addEventListener('pointerleave', this.onPointerLeave);
    this.ro = new ResizeObserver(() => {
      window.clearTimeout(this.resizeTimer);
      this.resizeTimer = window.setTimeout(() => {
        this.measure();
        this.build();
      }, 160);
    });
    this.ro.observe(canvas);

    this.last = performance.now();
    const loop = (now: number) => {
      if (this.dead) return;
      this.frame(now);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  destroy(): void {
    this.dead = true;
    cancelAnimationFrame(this.raf);
    window.clearTimeout(this.resizeTimer);
    this.input?.detach();
    this.ro?.disconnect();
    this.o.root.removeEventListener('pointermove', this.onPointer);
    this.o.root.removeEventListener('pointerleave', this.onPointerLeave);
    this.renderer?.dispose();
  }

  /** Move one whole chapter forward (1) or back (-1), auto-played. Used by keys and buttons. */
  go(dir: 1 | -1): void {
    if (!this.sections.length) return;
    const tr = this.trans;
    if (tr) {
      if (tr.mode === 'scrub') {
        // A key during a scrub finishes it (same direction) or sends it back (opposite).
        tr.mode = 'auto';
        tr.settleTo = dir === tr.dir ? 1 : 0;
        return;
      }
      if (tr.p < ENGINE.lockUntil) return;
      this.finish();
    }
    this.begin(dir, 'auto');
  }

  /** Wheel or touch moved by `delta` (fraction of a full transition, positive = forward). */
  private scrub(delta: number): void {
    if (!this.sections.length || delta === 0) return;
    const now = performance.now();
    if (this.scrubBlocked) {
      const quiet = now - this.lastScrubAt >= INPUT.cooldownMs;
      this.lastScrubAt = now;
      if (!quiet) return;
      this.scrubBlocked = false;
    }
    this.lastScrubAt = now;

    if (this.reduced || !this.ready) {
      if (Math.sign(delta) !== Math.sign(this.reducedAcc)) this.reducedAcc = 0;
      this.reducedAcc += delta;
      if (Math.abs(this.reducedAcc) >= 1) {
        const dir = this.reducedAcc > 0 ? 1 : -1;
        this.reducedAcc = 0;
        this.scrubBlocked = true;
        this.begin(dir, 'auto');
      }
      this.setCue(Math.abs(this.reducedAcc));
      return;
    }

    let tr = this.trans;
    if (!tr) {
      if (!this.begin(delta > 0 ? 1 : -1, 'scrub')) return;
      tr = this.trans;
      if (!tr) return;
    }
    if (tr.mode === 'auto') return;
    tr.settleTo = null;
    tr.p = Math.min(1, tr.p + delta * tr.dir);
    if (tr.p <= 0) this.cancel();
  }

  /** Input paused or the finger lifted: let the transition finish or spring back. */
  private release(): void {
    this.reducedAcc = 0;
    if (this.reduced) this.setCue(0);
    const tr = this.trans;
    if (tr && tr.mode === 'scrub' && tr.settleTo === null) tr.settleTo = tr.p >= INPUT.settleAt ? 1 : 0;
  }

  /** Starts a transition toward the neighbouring chapter. Returns false at either end of the story. */
  private begin(dir: 1 | -1, mode: Transition['mode']): boolean {
    const to = this.cur + dir;
    if (to < 0 || to >= this.sections.length) return false;
    if (this.reduced || !this.ready) {
      this.setSceneState(this.cur, 'out');
      this.cur = to;
      this.setSceneState(to, 'in');
      this.headInAt = performance.now();
      return false;
    }
    const name = dir > 0 ? this.o.scenes[to].enter : to === 0 ? 'zoomBack' : 'drift';
    this.trans = {
      from: this.cur, to, dir, def: transitions[name], p: 0, mode,
      settleTo: mode === 'auto' ? 1 : null, started: false, revealed: false, fromHidden: false, ctx: null,
    };
    if (mode === 'auto') this.hideFrom(this.trans);
    return true;
  }

  private hideFrom(tr: Transition): void {
    if (tr.fromHidden) return;
    tr.fromHidden = true;
    this.setSceneState(tr.from, 'out');
  }

  private setSceneState(i: number, state: 'in' | 'out'): void {
    const el = this.sections[i];
    if (!el) return;
    el.dataset.state = state;
    el.setAttribute('aria-hidden', state === 'in' ? 'false' : 'true');
    if (state === 'in') el.removeAttribute('inert');
    else el.setAttribute('inert', '');
  }

  private finish(): void {
    const tr = this.trans;
    if (!tr) return;
    this.cur = tr.to;
    this.hideFrom(tr);
    if (!tr.revealed) {
      this.setSceneState(tr.to, 'in');
      this.headInAt = performance.now();
    }
    this.trans = null;
    this.scrubBlocked = true;
    if (this.scanEl) this.scanEl.style.opacity = '0';
  }

  /** Abandons a transition at p = 0: every particle is back at its start, so hold() resumes cleanly. */
  private cancel(): void {
    const tr = this.trans;
    if (!tr) return;
    if (tr.revealed) this.setSceneState(tr.to, 'out');
    if (tr.fromHidden) this.setSceneState(tr.from, 'in');
    this.trans = null;
    if (this.scanEl) this.scanEl.style.opacity = '0';
  }

  private setCue(p: number): void {
    const v = Math.round(p * 1000) / 1000;
    if (v === this.cue) return;
    this.cue = v;
    this.o.root.style.setProperty('--scroll-progress', v.toFixed(3));
  }

  private measure(): void {
    const c = this.o.canvas;
    const width = Math.max(1, c.clientWidth);
    const height = Math.max(1, c.clientHeight);
    this.layout = { width, height, wide: width >= LAYOUT.mobileBreakpoint };
    const dpr = Math.min(window.devicePixelRatio || 1, ENGINE.maxDpr);
    this.renderer?.setSize(width, height, dpr);
  }

  private regionFor(i: number) {
    const s = this.o.scenes[i];
    const frac = this.layout.wide ? s.region ?? LAYOUT.desktopRegion : s.regionMobile ?? LAYOUT.mobileRegion;
    return regionFromFrac(frac, this.layout);
  }

  /** Builds heading + illustration targets for every section. Re-run on resize. */
  private build(): void {
    const N = ENGINE.particles;
    const H = ENGINE.headParticles;
    const body = N - H;
    const L = this.layout;
    this.targets = [];
    this.shapes = [];
    this.o.scenes.forEach((scene, s) => {
      const pos = new Float32Array(N * 2);
      const alpha = new Float32Array(N);
      const color = new Float32Array(N * 3);
      const hp = headingPoints(this.heads[s], this.o.root);
      if (hp.length) fillTargets(pos, hp, 0, H, 2);
      else for (let i = 0; i < H; i++) { pos[i * 2] = Math.random() * L.width; pos[i * 2 + 1] = Math.random() * L.height; }
      const bodyAlpha = (scene.bodyAlpha ?? 0.92) * (L.wide ? 1 : LAYOUT.mobileBodyAlpha);
      const shape = buildShape(scene.shape, { layout: L, region: this.regionFor(s), count: body, alpha: bodyAlpha, assets: this.assets });
      for (let i = 0; i < N; i++) {
        color[i * 3] = scene.color[0];
        color[i * 3 + 1] = scene.color[1];
        color[i * 3 + 2] = scene.color[2];
        if (i < H) alpha[i] = 0.95;
      }
      const target = { pos, alpha, color };
      this.copyShape(shape, target);
      this.targets.push(target);
      this.shapes.push(shape);
    });
  }

  private copyShape(shape: BodyShape, t: Target): void {
    const H = ENGINE.headParticles;
    t.pos.set(shape.pos, H * 2);
    t.alpha.set(shape.alpha, H);
    if (shape.color) t.color.set(shape.color, H * 3);
  }

  private flightContext(tr: Transition): FlightContext {
    const L = this.layout;
    const H = ENGINE.headParticles;
    const from = this.shapes[tr.from];
    const to = this.shapes[tr.to];
    const anchor = from.anchor ?? to.anchor ?? { x: L.width / 2, y: L.height / 2 };
    const focus = to.anchor ?? { x: L.width / 2, y: L.height / 2 };
    const depth = from.depth;
    return {
      width: L.width,
      height: L.height,
      anchor: tr.to === 0 && to.anchor ? to.anchor : anchor,
      focus,
      depthAt: (i) => (i >= H && depth ? depth[i - H] : 1),
    };
  }

  /** Moves p on its own when auto-playing or settling, at the transition's normal pace. */
  private advance(tr: Transition, seconds: number): void {
    if (tr.settleTo === null) return;
    const step = seconds / tr.def.duration;
    tr.p = tr.settleTo > tr.p ? Math.min(1, tr.p + step) : Math.max(0, tr.p - step);
  }

  /** Text follows progress both ways: old text leaves early, new text arrives at revealAt. */
  private updateText(tr: Transition, uu: number, now: number): void {
    const leaving = tr.settleTo === 1 || (tr.settleTo === null && tr.p > FROM_TEXT_OUT);
    if (leaving) this.hideFrom(tr);
    else if (tr.fromHidden && tr.p < FROM_TEXT_OUT - TEXT_HYSTERESIS / 2) {
      tr.fromHidden = false;
      this.setSceneState(tr.from, 'in');
    }
    if (!tr.revealed && uu >= ENGINE.revealAt) {
      tr.revealed = true;
      this.setSceneState(tr.to, 'in');
      this.headInAt = now;
    } else if (tr.revealed && uu < ENGINE.revealAt - TEXT_HYSTERESIS) {
      tr.revealed = false;
      this.setSceneState(tr.to, 'out');
    }
  }

  private frame(now: number): void {
    const sys = this.sys;
    if (!sys || !this.renderer) return;
    const raw = Math.max(0, (now - this.last) / 1000);
    const dt = Math.min(0.05, raw || 0.016);
    this.last = now;
    this.time += dt;
    this.input?.tick(now);

    const tr = this.trans;
    let open = 0.25 + 0.1 * Math.sin(this.time * 0.6);
    if (tr) {
      this.advance(tr, Math.min(0.25, raw));
      if (tr.def.irisOpen) open = tr.p < tr.def.preRoll ? open + (1 - open) * ease(tr.p / tr.def.preRoll) : 1;
    }
    if (!this.reduced) this.setCue(tr && tr.mode === 'scrub' ? tr.p : 0);

    const active = new Set<number>([this.cur]);
    if (tr) { active.add(tr.from); active.add(tr.to); }
    active.forEach((s) => {
      const shape = this.shapes[s];
      if (shape?.update) {
        shape.update(this.time, this.pointer, open);
        this.copyShape(shape, this.targets[s]);
      }
    });

    const headFade = Math.min(1, (now - this.headInAt) / ENGINE.headFadeMs);
    if (tr && (tr.started || tr.p >= tr.def.preRoll)) {
      if (!tr.started) {
        tr.ctx = this.flightContext(tr);
        sys.beginFlight(this.targets[tr.to], tr.def, tr.ctx, this.targets[tr.from]);
        tr.started = true;
      }
      const uu = Math.max(0, Math.min(1, (tr.p - tr.def.preRoll) / (1 - tr.def.preRoll)));
      this.updateText(tr, uu, now);
      sys.flight(this.targets[tr.to], tr.def, uu, tr.revealed ? headFade : 0, tr.ctx!, this.targets[tr.from]);
      this.updateScanline(tr, uu);
    } else {
      const s = tr ? tr.from : this.cur;
      const repel = this.o.scenes[s].shape.kind !== 'machine';
      sys.hold(this.targets[s], dt, this.time, this.pointer, headFade, repel);
      if (tr) this.updateText(tr, 0, now);
    }
    if (tr && tr.p >= 1) this.finish();
    else if (tr && tr.p <= 0 && tr.settleTo === 0) this.cancel();
    this.renderer.render();
  }

  private updateScanline(tr: Transition, uu: number): void {
    const el = this.scanEl;
    if (!el) return;
    const sig = tr.def.stagger;
    if (tr.def.scanline && uu >= 1 - sig && uu < 1) {
      const R = this.regionFor(tr.to);
      const y = (this.layout.height * (uu - (1 - sig))) / sig;
      el.style.left = `${R.x0}px`;
      el.style.width = `${R.w}px`;
      el.style.transform = `translateY(${y.toFixed(1)}px)`;
      const [r, g, b] = this.o.scenes[tr.to].color;
      el.style.background = `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`;
      el.style.opacity = '0.9';
    } else el.style.opacity = '0';
  }

  private onPointer = (e: PointerEvent) => {
    const r = this.o.canvas.getBoundingClientRect();
    if (!r.width) return;
    const k = this.o.canvas.clientWidth / r.width;
    this.pointer = { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k };
  };

  private onPointerLeave = () => {
    this.pointer = null;
  };
}
