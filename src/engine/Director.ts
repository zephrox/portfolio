import { loadPortrait, waitForFonts } from './assets';
import { ENGINE, LAYOUT } from './config';
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
  def: TransitionDef;
  t0: number;
  started: boolean;
  revealed: boolean;
  ctx: FlightContext | null;
}

/**
 * Runs the story: builds particle targets for every section, listens for chapter changes,
 * plays transitions, and shows/hides each section's text at the right moment.
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
      isLocked: () => this.isLocked(),
      onCommit: (dir) => this.go(dir),
      onProgress: (p) => root.style.setProperty('--scroll-progress', p.toFixed(3)),
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

  /** Move one chapter forward (1) or back (-1). Safe to call from buttons. */
  go(dir: 1 | -1): void {
    if (!this.sections.length) return;
    if (this.trans) {
      if (this.isLocked()) return;
      this.finish();
    }
    const to = this.cur + dir;
    if (to < 0 || to >= this.sections.length) return;
    const name = dir > 0 ? this.o.scenes[to].enter : to === 0 ? 'zoomBack' : 'drift';
    this.setSceneState(this.cur, 'out');
    if (this.reduced || !this.ready) {
      this.cur = to;
      this.setSceneState(to, 'in');
      this.headInAt = performance.now();
      return;
    }
    this.trans = { from: this.cur, to, def: transitions[name], t0: performance.now(), started: false, revealed: false, ctx: null };
  }

  private isLocked(): boolean {
    const tr = this.trans;
    if (!tr) return false;
    return (performance.now() - tr.t0) / (tr.def.duration * 1000) < ENGINE.lockUntil;
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
    if (!tr.revealed) {
      this.setSceneState(tr.to, 'in');
      this.headInAt = performance.now();
    }
    this.trans = null;
    if (this.scanEl) this.scanEl.style.opacity = '0';
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

  private frame(now: number): void {
    const sys = this.sys;
    if (!sys || !this.renderer) return;
    const dt = Math.min(0.05, (now - this.last) / 1000 || 0.016);
    this.last = now;
    this.time += dt;
    this.input?.tick(now);

    const tr = this.trans;
    let open = 0.25 + 0.1 * Math.sin(this.time * 0.6);
    let u = 0;
    if (tr) {
      u = (now - tr.t0) / (tr.def.duration * 1000);
      if (tr.def.irisOpen) open = u < tr.def.preRoll ? open + (1 - open) * ease(u / tr.def.preRoll) : 1;
    }

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
    if (tr && u >= tr.def.preRoll) {
      if (!tr.started) {
        tr.ctx = this.flightContext(tr);
        sys.beginFlight(this.targets[tr.to], tr.def, tr.ctx, this.targets[tr.from]);
        tr.started = true;
      }
      const uu = Math.min(1, (u - tr.def.preRoll) / (1 - tr.def.preRoll));
      if (!tr.revealed && uu >= ENGINE.revealAt) {
        tr.revealed = true;
        this.setSceneState(tr.to, 'in');
        this.headInAt = now;
      }
      sys.flight(this.targets[tr.to], tr.def, uu, tr.revealed ? headFade : 0, tr.ctx!, this.targets[tr.from]);
      this.updateScanline(tr, uu);
      if (u >= 1) this.finish();
    } else {
      const s = tr ? tr.from : this.cur;
      const repel = this.o.scenes[s].shape.kind !== 'machine';
      sys.hold(this.targets[s], dt, this.time, this.pointer, headFade, repel);
    }
    this.renderer.render(this.time);
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
