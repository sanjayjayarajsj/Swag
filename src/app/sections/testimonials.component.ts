import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, PLATFORM_ID, ViewChild, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RevealDirective } from '../shared/reveal.directive';
import { ScrollService } from '../services/scroll.service';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [RevealDirective],
  template: `
    <section #section id="reviews" class="section-y border-t border-white/[0.06] bg-surface" aria-roledescription="carousel" aria-label="Reviews">
      <div class="container-x">
        <div appReveal class="mx-auto mb-12 max-w-xl text-center sm:mb-16">
          <span class="eyebrow mb-3 block">Reviews</span>
          <h2 class="h-section">What the palates say.</h2>
        </div>

        <div appReveal class="mx-auto max-w-4xl rounded-3xl border border-white/[0.06] bg-card p-7 sm:p-12">
          <div class="mb-6 flex gap-1 text-white" aria-label="5 out of 5 stars">
            @for (s of [1, 2, 3, 4, 5]; track s) {
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9L12 2.5Z" /></svg>
            }
          </div>

          <!-- All quotes share one grid cell: cross-fade with no height jump -->
          <div class="grid">
            @for (t of testimonials; track t.author; let i = $index) {
              <figure
                class="col-start-1 row-start-1 flex flex-col justify-between transition-opacity duration-500"
                [class]="index() === i ? 'opacity-100' : 'pointer-events-none opacity-0'"
                [attr.aria-hidden]="index() === i ? null : 'true'"
              >
                <blockquote class="text-xl font-medium leading-snug tracking-tight text-white sm:text-2xl md:text-3xl">
                  &ldquo;{{ t.quote }}&rdquo;
                </blockquote>
                <figcaption class="mt-8">
                  <span class="block text-base font-semibold text-white">{{ t.author }}</span>
                  <span class="block text-xs text-neutral-400">{{ t.role }}</span>
                </figcaption>
              </figure>
            }
          </div>

          <div class="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-6">
            <div class="flex items-center gap-2">
              @for (t of testimonials; track t.author; let i = $index) {
                <button
                  type="button"
                  (click)="go(i)"
                  class="h-1.5 rounded-full transition-all duration-300"
                  [class]="index() === i ? 'w-8 bg-white' : 'w-1.5 bg-white/25 hover:bg-white/50'"
                  [attr.aria-label]="'Show review ' + (i + 1)"
                  [attr.aria-current]="index() === i ? 'true' : null"
                ></button>
              }
            </div>
            <div class="flex gap-3">
              <button type="button" (click)="step(-1)" class="icon-btn" aria-label="Previous review">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
              </button>
              <button type="button" (click)="step(1)" class="icon-btn" aria-label="Next review">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class TestimonialsComponent implements AfterViewInit, OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly scroll = inject(ScrollService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @ViewChild('section', { static: true }) section!: ElementRef<HTMLElement>;

  // Placeholder reviews: replace with real customer quotes before launch.
  readonly testimonials = [
    {
      quote: 'The micro-nitro strawberry pour completely changes what ready-to-drink sparkling can be. The draught head retention is unheard of in a canned product.',
      author: 'Austin Heller',
      role: 'Lead Sommelier & Columnist, Culinary Quarterly'
    },
    {
      quote: 'STAG solves the biggest problem with functional drinks: no chemical sweetener masking. It drinks with the clarity of a boutique natural wine.',
      author: 'Elena Rostova',
      role: 'World Brewers Cup Sensory Judge'
    },
    {
      quote: 'Not merely a beverage, but a masterclass in packaging and sensory calibration. Sets an entirely new bar for modern CPG.',
      author: 'Marcus Chen',
      role: 'Design Director, Modern Material Architecture'
    }
  ];

  readonly index = signal(0);

  private timer: ReturnType<typeof setInterval> | null = null;
  private observer: IntersectionObserver | null = null;
  private stopped = false;

  ngAfterViewInit(): void {
    if (!this.isBrowser || this.scroll.isReducedMotion()) return;
    this.scroll.outside(() => {
      this.observer = new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !this.stopped && !this.timer) {
          this.timer = setInterval(() => this.zone.run(() => this.advance(1)), 7000);
        } else if (!e.isIntersecting && this.timer) {
          clearInterval(this.timer);
          this.timer = null;
        }
      }, { threshold: 0.4 });
      this.observer.observe(this.section.nativeElement);
    });
  }

  private advance(dir: number): void {
    const n = this.testimonials.length;
    this.index.update(i => (i + dir + n) % n);
  }

  private stop(): void {
    this.stopped = true;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  step(dir: number): void {
    this.stop();
    this.advance(dir);
  }

  go(i: number): void {
    this.stop();
    this.index.set(i);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    this.observer?.disconnect();
  }
}
