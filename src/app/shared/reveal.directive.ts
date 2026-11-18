import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

let sharedObserver: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  sharedObserver ??= new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          sharedObserver?.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
  );
  return sharedObserver;
}

/**
 * Fades + lifts an element in the first time it scrolls into view.
 * Pure CSS transition driven by one shared IntersectionObserver, so it costs
 * nothing per frame. Usage: `<div appReveal>` or `<div [appReveal]="i * 70">` (delay in ms).
 */
@Directive({
  selector: '[appReveal]',
  standalone: true,
  host: { class: 'reveal' }
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  @Input({ alias: 'appReveal', transform: (v: unknown) => Number(v) || 0 }) delay = 0;

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    if (typeof IntersectionObserver === 'undefined') {
      this.el.classList.add('is-visible');
      return;
    }
    if (this.delay) this.el.style.transitionDelay = `${this.delay}ms`;
    getObserver().observe(this.el);
  }

  ngOnDestroy(): void {
    if (this.isBrowser) sharedObserver?.unobserve(this.el);
  }
}
