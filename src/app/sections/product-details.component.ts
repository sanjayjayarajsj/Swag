import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, PLATFORM_ID, ViewChild, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { CartService } from '../services/cart.service';
import { ProductService, Product } from '../services/product.service';
import { ScrollService } from '../services/scroll.service';
import { RevealDirective } from '../shared/reveal.directive';

interface DetailExtras {
  number: string;
  glow: string;
  cutout: { src: string; w: number; h: number };
  backdrop: string;
  description: string;
  specs: { label: string; value: string }[];
  notes: string[];
}

interface DetailItem extends DetailExtras {
  product: Product;
}

// Editing copy or art for a slide happens here; name, price and packs come from ProductService.
const EXTRAS: Record<string, DetailExtras> = {
  'stag-original': {
    number: '01',
    glow: '#6366f1',
    cutout: { src: '/assets/details/original-can.webp', w: 348, h: 619 },
    backdrop: '/assets/details/original-bg.webp',
    description:
      'Sourced from subterranean volcanic basalt aquifers. Natural mineral clarity meets cold needle-point effervescence for an ultra-pure, weightless refreshment with zero lingering sweetness.',
    specs: [
      { label: 'Source', value: 'Basalt Aquifer' },
      { label: 'Carbonation', value: '4.5 Bar Micro-Fizz' },
      { label: 'Calories', value: '0 kcal' },
      { label: 'Sugar', value: '0g Added' }
    ],
    notes: ['Basalt Mineral Spring', 'Needle Micro-CO2', 'Natural Electrolytes', 'Crystalline Finish']
  },
  'stag-black-coffee': {
    number: '02',
    glow: '#d97706',
    cutout: { src: '/assets/details/black-coffee-can.webp', w: 586, h: 618 },
    backdrop: '/assets/details/black-coffee-bg.webp',
    description:
      'Single-origin high-altitude Arabica cold-distilled over 24 hours. Intricate dark cacao aroma and roasted vanilla notes elevated with champagne-grade fine effervescence.',
    specs: [
      { label: 'Extraction', value: '24hr Cryo-Distilled' },
      { label: 'Carbonation', value: 'Champagne CO2' },
      { label: 'Calories', value: '5 kcal' },
      { label: 'Roast', value: 'Dark Cacao Blend' }
    ],
    notes: ['Single-Origin Arabica', 'Cold-Steeped Agave', 'Madagascar Vanilla', 'Velvet Crema Bubbles']
  },
  'stag-lime': {
    number: '03',
    glow: '#10b981',
    cutout: { src: '/assets/details/lime-can.webp', w: 692, h: 624 },
    backdrop: '/assets/details/lime-bg.webp',
    description:
      'Hand-harvested Tahitian lime zest paired with aromatic Japanese yuzu over ultra-fine micro-bubbles. Finished with a trace of flake sea salt for unadulterated sensory revival.',
    specs: [
      { label: 'Harvest', value: 'Cold-Pressed Citrus' },
      { label: 'Carbonation', value: 'Sharp Needle-Point' },
      { label: 'Calories', value: '10 kcal' },
      { label: 'Mineral Finish', value: 'Maldon Sea Salt' }
    ],
    notes: ['Tahitian Lime Zest', 'Japanese Yuzu', 'Maldon Flake Salt', 'Electric Effervescence']
  }
};

const AUTOPLAY_MS = 7000;

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CurrencyPipe, RevealDirective],
  template: `
    <section
      #section
      id="details"
      class="relative w-full overflow-hidden border-t border-white/[0.06] bg-ink py-20 sm:py-24 lg:py-28"
      role="region"
      aria-roledescription="carousel"
      aria-label="Product details"
      tabindex="0"
      (keydown.arrowleft)="manual(-1)"
      (keydown.arrowright)="manual(1)"
    >
      <!-- Header + tabs -->
      <div appReveal class="container-x mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <span class="eyebrow mb-3 block">Sensory Profiles &bull; Cold Distilled</span>
          <h2 class="h-section">Product details</h2>
        </div>
        <div class="-mx-5 overflow-x-auto px-5 no-scrollbar sm:mx-0 sm:px-0" role="tablist" aria-label="Choose edition">
          <div class="flex w-max gap-1.5 rounded-full border border-white/10 bg-card/80 p-1.5">
            @for (item of items(); track item.product.id; let i = $index) {
              <button
                type="button"
                role="tab"
                (click)="manual(0, i)"
                [attr.aria-selected]="active() === i"
                class="rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors duration-300"
                [class]="active() === i ? 'bg-white text-ink' : 'text-neutral-400 hover:text-white'"
              >
                {{ item.number }} &mdash; {{ short(item.product.name) }}
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Slider -->
      <div #viewport class="relative w-full touch-pan-y overflow-hidden">
        <div
          class="flex w-full will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          [style.transform]="'translate3d(-' + active() * 100 + '%, 0, 0)'"
        >
          @for (item of items(); track item.product.id; let i = $index) {
            <div
              class="relative flex w-full shrink-0 items-center overflow-hidden bg-surface"
              role="group"
              aria-roledescription="slide"
              [attr.aria-label]="i + 1 + ' of ' + items().length"
              [attr.aria-hidden]="active() === i ? null : 'true'"
              [attr.inert]="active() === i ? null : ''"
            >
              <img [src]="item.backdrop" alt="" width="1920" height="1072" loading="lazy" decoding="async" class="pointer-events-none absolute inset-0 h-full w-full object-cover" />
              <div class="pointer-events-none absolute inset-0 bg-black/55 lg:bg-gradient-to-r lg:from-black/70 lg:via-black/25 lg:to-black/70"></div>
              <div class="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink to-transparent"></div>
              <div class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent"></div>

              <div class="container-x relative z-10 grid items-center gap-8 py-14 sm:py-16 lg:grid-cols-12 lg:gap-14 lg:py-20">
                <!-- Can -->
                <div class="relative flex items-center justify-center lg:col-span-6">
                  <div
                    class="pointer-events-none absolute h-72 w-72 opacity-60 lg:h-[28rem] lg:w-[28rem]"
                    [style.background]="'radial-gradient(closest-side, ' + item.glow + '66, transparent)'"
                  ></div>
                  <img
                    [src]="item.cutout.src"
                    [alt]="item.product.name + ' can'"
                    [attr.width]="item.cutout.w"
                    [attr.height]="item.cutout.h"
                    loading="lazy"
                    decoding="async"
                    [style.aspect-ratio]="item.cutout.w + ' / ' + item.cutout.h"
                    class="relative h-[40svh] w-auto max-w-full object-contain motion-safe:animate-float lg:h-[62vh]"
                  />
                </div>

                <!-- Content -->
                <div class="flex flex-col gap-5 lg:col-span-6">
                  <div class="flex items-center gap-3">
                    <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1 text-[10px] font-medium uppercase tracking-widest text-neutral-300">
                      <span class="h-1.5 w-1.5 rounded-full" [style.background]="item.glow"></span>
                      Edition {{ item.number }} / 0{{ items().length }}
                    </span>
                    <span class="eyebrow">{{ item.product.category }}</span>
                  </div>

                  <div>
                    <h3 class="text-3xl font-semibold uppercase leading-none tracking-tight text-white sm:text-5xl lg:text-6xl">{{ item.product.name }}</h3>
                    <p class="mt-3 text-xs font-medium uppercase tracking-widest text-neutral-400 sm:text-sm">{{ item.product.subtitle }}</p>
                  </div>

                  <p class="max-w-xl text-sm leading-relaxed text-neutral-300">{{ item.description }}</p>

                  <div class="grid max-w-xl grid-cols-2 gap-2.5 sm:grid-cols-4">
                    @for (spec of item.specs; track spec.label) {
                      <div class="rounded-xl border border-white/[0.08] bg-black/40 p-3.5 backdrop-blur-md">
                        <span class="block text-[10px] font-medium uppercase tracking-widest text-neutral-400">{{ spec.label }}</span>
                        <span class="mt-0.5 block text-xs font-medium text-white">{{ spec.value }}</span>
                      </div>
                    }
                  </div>

                  <div class="flex flex-wrap gap-2">
                    @for (note of item.notes; track note) {
                      <span class="chip">{{ note }}</span>
                    }
                  </div>

                  <div class="flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-white/[0.08] pt-5">
                    <div>
                      <span class="block text-[11px] uppercase tracking-wider text-neutral-400">4-Pack &bull; 355ml</span>
                      <span class="text-2xl font-semibold text-white">{{ item.product.price | currency }}</span>
                    </div>
                    <div class="flex flex-wrap items-center gap-3">
                      <button type="button" (click)="cart.addItem(item.product)" class="btn-primary">Add to Bag</button>
                      <button type="button" (click)="cart.openQuickView(item.product)" class="btn-ghost bg-white/[0.04]">Quick View</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Controls -->
      <div class="container-x mt-8 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <span class="text-xs tabular-nums text-neutral-400">0{{ active() + 1 }} / 0{{ items().length }}</span>
          <div class="h-[2px] w-24 overflow-hidden rounded-full bg-neutral-800 sm:w-32" aria-hidden="true">
            <div class="h-full origin-left rounded-full bg-white transition-transform duration-500" [style.transform]="'scaleX(' + progress() + ')'"></div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button type="button" (click)="manual(-1)" class="icon-btn" aria-label="Previous edition">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          </button>
          <button type="button" (click)="manual(1)" class="icon-btn" aria-label="Next edition">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>
    </section>
  `
})
export class ProductDetailsComponent implements AfterViewInit, OnDestroy {
  readonly cart = inject(CartService);
  private readonly products = inject(ProductService);
  private readonly scroll = inject(ScrollService);
  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @ViewChild('section', { static: true }) section!: ElementRef<HTMLElement>;
  @ViewChild('viewport', { static: true }) viewport!: ElementRef<HTMLElement>;

  readonly items = computed<DetailItem[]>(() =>
    Object.keys(EXTRAS)
      .map(id => ({ id, product: this.products.byId(id) }))
      .filter((x): x is { id: string; product: Product } => !!x.product)
      .map(x => ({ product: x.product, ...EXTRAS[x.id] }))
  );
  readonly active = signal(0);
  readonly progress = computed(() => (this.active() + 1) / this.items().length);

  private timer: ReturnType<typeof setInterval> | null = null;
  private inView = false;
  private hovering = false;
  private stopped = false; // set once the visitor takes control
  private observer: IntersectionObserver | null = null;
  private cleanups: (() => void)[] = [];

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    const reduced = this.scroll.isReducedMotion();

    this.scroll.outside(() => {
      const sec = this.section.nativeElement;
      const vp = this.viewport.nativeElement;
      const on = (el: EventTarget, type: string, fn: (e: any) => void, opts?: AddEventListenerOptions) => {
        el.addEventListener(type, fn, opts);
        this.cleanups.push(() => el.removeEventListener(type, fn));
      };

      // Autoplay only while visible, never while hovered/focused, and never for reduced motion
      this.observer = new IntersectionObserver(([e]) => {
        this.inView = e.isIntersecting;
        this.syncAutoplay();
      }, { threshold: 0.35 });
      this.observer.observe(sec);

      on(sec, 'mouseenter', () => { this.hovering = true; this.syncAutoplay(); });
      on(sec, 'mouseleave', () => { this.hovering = false; this.syncAutoplay(); });
      on(sec, 'focusin', () => { this.hovering = true; this.syncAutoplay(); });
      on(sec, 'focusout', () => { this.hovering = false; this.syncAutoplay(); });

      // Swipe: only counts when the gesture is clearly horizontal, so vertical scrolling never flips slides
      let sx = 0, sy = 0;
      on(vp, 'touchstart', (e: TouchEvent) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
      on(vp, 'touchend', (e: TouchEvent) => {
        const dx = sx - e.changedTouches[0].clientX;
        const dy = sy - e.changedTouches[0].clientY;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) this.zone.run(() => this.manual(dx > 0 ? 1 : -1));
      }, { passive: true });

      // Trackpad horizontal swipe
      let cooling = false;
      on(vp, 'wheel', (e: WheelEvent) => {
        if (cooling || Math.abs(e.deltaX) < 30 || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
        cooling = true;
        this.zone.run(() => this.manual(e.deltaX > 0 ? 1 : -1));
        setTimeout(() => (cooling = false), 700);
      }, { passive: true });

      if (reduced) this.stopped = true;
    });
  }

  private syncAutoplay(): void {
    const shouldRun = this.inView && !this.hovering && !this.stopped;
    if (shouldRun && !this.timer) {
      this.timer = setInterval(() => this.zone.run(() => this.step(1)), AUTOPLAY_MS);
    } else if (!shouldRun && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private step(dir: number): void {
    const n = this.items().length;
    this.active.update(i => (i + dir + n) % n);
  }

  /** Any user-driven change permanently stops autoplay so the page never moves on its own again. */
  manual(dir: number, index?: number): void {
    this.stopped = true;
    this.syncAutoplay();
    if (index !== undefined) this.active.set(index);
    else this.step(dir);
  }

  short(name: string): string {
    return name.replace(/^STAG\s+/, '');
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    this.observer?.disconnect();
    this.cleanups.forEach(fn => fn());
  }
}
