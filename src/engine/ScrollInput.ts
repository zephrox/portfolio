import { INPUT } from './config';

export interface ScrollInputOptions {
  target: HTMLElement;
  isLocked(): boolean;
  onCommit(dir: 1 | -1): void;
  /** 0..1 while a gesture builds toward the threshold. Drives the scroll cue. */
  onProgress(p: number): void;
}

/**
 * Turns wheel, touch and keyboard input into deliberate "next / previous chapter" commands.
 * A tiny scroll does nothing: input accumulates and drains away if the user stops.
 * One gesture moves at most one chapter: after a commit, the rest of that gesture (including
 * trackpad momentum) is ignored until the wheel goes quiet or the finger lifts.
 */
export class ScrollInput {
  private acc = 0;
  private lastInput = 0;
  private touchY: number | null = null;
  private touchTarget: EventTarget | null = null;
  /** Decided on a touch gesture's first move: true when that gesture belongs to native page scrolling. */
  private skipTouch: boolean | null = null;
  /** Set on commit; cleared by a pause in wheel input or a new touch. */
  private waitQuiet = false;

  constructor(private o: ScrollInputOptions) {}

  attach(): void {
    this.o.target.addEventListener('wheel', this.onWheel, { passive: true });
    this.o.target.addEventListener('touchstart', this.onTouchStart, { passive: true });
    this.o.target.addEventListener('touchmove', this.onTouchMove, { passive: true });
    this.o.target.addEventListener('touchend', this.onTouchEnd);
    window.addEventListener('keydown', this.onKey);
  }

  detach(): void {
    this.o.target.removeEventListener('wheel', this.onWheel);
    this.o.target.removeEventListener('touchstart', this.onTouchStart);
    this.o.target.removeEventListener('touchmove', this.onTouchMove);
    this.o.target.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('keydown', this.onKey);
  }

  /** Called every frame to drain unfinished gestures. */
  tick(now: number): void {
    if (this.touchY !== null || this.acc === 0) return;
    if (now - this.lastInput > INPUT.idleDecayMs) {
      this.acc *= INPUT.decayPerFrame;
      if (Math.abs(this.acc) < 1) this.acc = 0;
      this.emit(INPUT.wheelThreshold);
    }
  }

  private emit(threshold: number) {
    this.o.onProgress(Math.min(1, Math.abs(this.acc) / threshold));
  }

  private push(delta: number, threshold: number) {
    const now = performance.now();
    if (this.waitQuiet) {
      const quiet = now - this.lastInput >= INPUT.cooldownMs;
      this.lastInput = now;
      if (!quiet) return;
      this.waitQuiet = false;
    }
    if (this.o.isLocked()) {
      this.acc = 0;
      this.lastInput = now;
      this.emit(threshold);
      return;
    }
    if (Math.sign(delta) !== Math.sign(this.acc)) this.acc = 0;
    this.acc += delta;
    this.lastInput = now;
    if (Math.abs(this.acc) >= threshold) {
      const dir = this.acc > 0 ? 1 : -1;
      this.acc = 0;
      this.waitQuiet = true;
      this.emit(threshold);
      this.o.onCommit(dir);
    } else this.emit(threshold);
  }

  /**
   * On phones a chapter ([data-scene]) scrolls like a page. Native scrolling wins until the page is
   * already at its end in the gesture's direction; only then does the gesture count toward a chapter.
   */
  private nativeScrollFirst(t: EventTarget | null, delta: number): boolean {
    let el = t as HTMLElement | null;
    while (el && el !== this.o.target) {
      if (el.hasAttribute?.('data-scene')) {
        const room = el.scrollHeight - el.clientHeight;
        if (room <= 2) return false;
        return delta > 0 ? el.scrollTop < room - 2 : el.scrollTop > 2;
      }
      el = el.parentElement;
    }
    return false;
  }

  private onWheel = (e: WheelEvent) => {
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
    const delta = e.deltaY * unit;
    if (this.nativeScrollFirst(e.target, delta)) {
      // The page scrolled. Its momentum must not run on into a chapter change once it hits the end.
      this.acc = 0;
      this.waitQuiet = true;
      this.lastInput = performance.now();
      this.emit(INPUT.wheelThreshold);
      return;
    }
    this.push(delta, INPUT.wheelThreshold);
  };

  private onTouchStart = (e: TouchEvent) => {
    this.touchTarget = e.target;
    this.skipTouch = null;
    this.touchY = e.touches[0]?.clientY ?? null;
    this.acc = 0;
    this.waitQuiet = false;
  };

  private onTouchMove = (e: TouchEvent) => {
    if (this.touchY === null) return;
    const y = e.touches[0]?.clientY;
    if (y === undefined) return;
    const delta = this.touchY - y;
    if (this.skipTouch === null && delta !== 0) this.skipTouch = this.nativeScrollFirst(this.touchTarget, delta);
    if (this.skipTouch) return;
    this.push(delta, INPUT.touchThreshold);
    this.touchY = y;
  };

  private onTouchEnd = () => {
    this.touchY = null;
    this.lastInput = performance.now();
  };

  private onKey = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.metaKey || e.ctrlKey || e.altKey) return;
    let dir: 1 | -1 | 0 = 0;
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && tag !== 'BUTTON' && tag !== 'A')) dir = 1;
    if (e.key === 'ArrowUp' || e.key === 'PageUp') dir = -1;
    if (!dir) return;
    e.preventDefault();
    if (!this.o.isLocked()) this.o.onCommit(dir);
  };
}
