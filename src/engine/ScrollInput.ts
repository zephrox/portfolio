import { INPUT } from './config';

export interface ScrollInputOptions {
  target: HTMLElement;
  /** Keyboard: one whole chapter forward (1) or back (-1). */
  onCommit(dir: 1 | -1): void;
  /** Wheel or touch movement as a fraction of one full transition. Positive is forward. */
  onScrub(delta: number): void;
  /** Wheel or touch input has stopped (a pause, or the finger lifted). */
  onIdle(): void;
}

/**
 * Turns wheel and touch into continuous scrub deltas (one viewport of scrolling = one whole
 * transition) and keyboard into whole-chapter commands. Wheel and touch inside a scrollable
 * `.copy` block scroll that text instead.
 */
export class ScrollInput {
  private lastInput = 0;
  private idleSent = true;
  private touchY: number | null = null;
  private skipTouch = false;

  constructor(private o: ScrollInputOptions) {}

  attach(): void {
    this.o.target.addEventListener('wheel', this.onWheel, { passive: true });
    this.o.target.addEventListener('touchstart', this.onTouchStart, { passive: true });
    this.o.target.addEventListener('touchmove', this.onTouchMove, { passive: true });
    this.o.target.addEventListener('touchend', this.onTouchEnd);
    this.o.target.addEventListener('touchcancel', this.onTouchEnd);
    window.addEventListener('keydown', this.onKey);
  }

  detach(): void {
    this.o.target.removeEventListener('wheel', this.onWheel);
    this.o.target.removeEventListener('touchstart', this.onTouchStart);
    this.o.target.removeEventListener('touchmove', this.onTouchMove);
    this.o.target.removeEventListener('touchend', this.onTouchEnd);
    this.o.target.removeEventListener('touchcancel', this.onTouchEnd);
    window.removeEventListener('keydown', this.onKey);
  }

  /** Called every frame: reports a pause once wheel input has been quiet for a moment. */
  tick(now: number): void {
    if (this.idleSent || this.touchY !== null) return;
    if (now - this.lastInput > INPUT.settleIdleMs) this.idle();
  }

  private idle() {
    this.idleSent = true;
    this.o.onIdle();
  }

  private scrub(px: number, fraction: number) {
    const page = Math.max(1, this.o.target.clientHeight) * fraction;
    this.lastInput = performance.now();
    this.idleSent = false;
    this.o.onScrub(px / page);
  }

  private inScrollableCopy(t: EventTarget | null): boolean {
    let el = t as HTMLElement | null;
    while (el && el !== this.o.target) {
      if (el.classList?.contains('copy') && el.scrollHeight > el.clientHeight + 2) return true;
      el = el.parentElement;
    }
    return false;
  }

  private onWheel = (e: WheelEvent) => {
    if (this.inScrollableCopy(e.target)) return;
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? this.o.target.clientHeight : 1;
    this.scrub(e.deltaY * unit, INPUT.pageFraction);
  };

  private onTouchStart = (e: TouchEvent) => {
    this.skipTouch = this.inScrollableCopy(e.target);
    this.touchY = e.touches[0]?.clientY ?? null;
  };

  private onTouchMove = (e: TouchEvent) => {
    if (this.skipTouch || this.touchY === null) return;
    const y = e.touches[0]?.clientY;
    if (y === undefined) return;
    this.scrub(this.touchY - y, INPUT.touchPageFraction);
    this.touchY = y;
  };

  private onTouchEnd = () => {
    const wasScrubbing = this.touchY !== null && !this.skipTouch;
    this.touchY = null;
    if (wasScrubbing && !this.idleSent) this.idle();
  };

  private onKey = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.metaKey || e.ctrlKey || e.altKey) return;
    let dir: 1 | -1 | 0 = 0;
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && tag !== 'BUTTON' && tag !== 'A')) dir = 1;
    if (e.key === 'ArrowUp' || e.key === 'PageUp') dir = -1;
    if (!dir) return;
    e.preventDefault();
    this.o.onCommit(dir);
  };
}
