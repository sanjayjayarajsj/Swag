import { Injectable, NgZone, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

export interface ScrollToOptions {
  offset?: number;
  duration?: number;
  immediate?: boolean;
}

/**
 * Owns smooth scrolling (Lenis) and the GSAP ticker.
 *
 * Everything animation-related is created OUTSIDE Angular's zone. Otherwise zone.js
 * triggers a full change-detection pass on every animation frame and every scroll
 * event, which is the main cause of jank on long, animation-heavy pages.
 */
@Injectable({ providedIn: 'root' })
export class ScrollService implements OnDestroy {
  private readonly zone = inject(NgZone);
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  lenis: Lenis | null = null;

  private triggers: ScrollTrigger[] = [];
  private lockCount = 0;
  private tick: ((time: number) => void) | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (!this.isBrowser) return;

    this.zone.runOutsideAngular(() => {
      gsap.registerPlugin(ScrollTrigger);
      // Mobile browser toolbars resize the viewport while scrolling; don't re-layout for that
      ScrollTrigger.config({ ignoreMobileResize: true });

      // Predictable start position with a pinned hero
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

      if (!this.isReducedMotion()) this.initLenis();

      // Web-font swap can nudge layout; re-measure once it settles
      document.fonts?.ready.then(() => this.refresh());
    });
  }

  private initLenis(): void {
    this.lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      autoRaf: false // driven by the GSAP ticker so scroll and animation share one loop
    });

    this.lenis.on('scroll', ScrollTrigger.update);

    this.tick = (time: number) => this.lenis?.raf(time * 1000);
    gsap.ticker.add(this.tick);
    gsap.ticker.lagSmoothing(0);
  }

  isReducedMotion(): boolean {
    if (!this.isBrowser) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Run a callback without triggering Angular change detection. */
  outside<T>(fn: () => T): T {
    return this.zone.runOutsideAngular(fn);
  }

  /** Passive, zone-free scroll listener. Returns an unsubscribe function. */
  onScroll(cb: (scrollY: number) => void): () => void {
    if (!this.isBrowser) return () => undefined;
    const handler = () => cb(window.scrollY);
    this.zone.runOutsideAngular(() => window.addEventListener('scroll', handler, { passive: true }));
    return () => window.removeEventListener('scroll', handler);
  }

  /** Freeze page scrolling (cart drawer, modal, mobile menu). Calls can be nested. */
  lock(): void {
    if (!this.isBrowser) return;
    this.lockCount++;
    if (this.lockCount === 1) {
      this.lenis?.stop();
      document.documentElement.classList.add('is-locked');
    }
  }

  unlock(): void {
    if (!this.isBrowser) return;
    this.lockCount = Math.max(0, this.lockCount - 1);
    if (this.lockCount === 0) {
      this.lenis?.start();
      document.documentElement.classList.remove('is-locked');
    }
  }

  addTrigger(trigger: ScrollTrigger): void {
    this.triggers.push(trigger);
  }

  scrollTo(target: string | HTMLElement | number, options: ScrollToOptions = {}): void {
    if (!this.isBrowser) return;
    const { offset = 0, immediate = false } = options;

    const el =
      typeof target === 'string'
        ? document.querySelector<HTMLElement>(target)
        : target instanceof HTMLElement
          ? target
          : null;
    if (typeof target !== 'number' && !el) return;

    const y = el ? el.getBoundingClientRect().top + window.scrollY + offset : (target as number) + offset;
    // Longer trips get a slightly longer glide so they never feel like a jump-cut
    const distance = Math.abs(y - window.scrollY);
    const duration = options.duration ?? Math.min(2.2, Math.max(0.9, distance / 3200));

    if (this.lenis) {
      this.lenis.scrollTo(y, { duration, immediate });
    } else {
      window.scrollTo({ top: y, behavior: this.isReducedMotion() || immediate ? 'auto' : 'smooth' });
    }
  }

  /** Debounced ScrollTrigger refresh. */
  refresh(): void {
    if (!this.isBrowser) return;
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 120);
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    if (this.tick) gsap.ticker.remove(this.tick);
    this.lenis?.destroy();
    this.triggers.forEach(t => t.kill());
    this.triggers = [];
  }
}
