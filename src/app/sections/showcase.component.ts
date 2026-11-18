import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ProductService, Product } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { RevealDirective } from '../shared/reveal.directive';

interface Meter {
  label: string;
  text: string;
  score: number | null;
}

/** Interactive taste profile: compare editions side by side. */
@Component({
  selector: 'app-showcase',
  standalone: true,
  imports: [CurrencyPipe, RevealDirective],
  template: `
    <section id="profile" class="section-y border-t border-white/[0.06] bg-surface">
      <div class="container-x">
        <div appReveal class="mb-10 flex flex-col justify-between gap-5 md:mb-12 md:flex-row md:items-end">
          <div>
            <span class="eyebrow mb-3 block">Taste Profile</span>
            <h2 class="h-section">Find your edition.</h2>
          </div>
          <p class="lead max-w-sm">Switch between editions to compare sweetness, carbonation and body.</p>
        </div>

        <!-- Edition tabs -->
        <div appReveal class="-mx-5 mb-6 overflow-x-auto px-5 no-scrollbar sm:mx-0 sm:px-0" role="tablist" aria-label="Editions">
          <div class="flex w-max gap-2 sm:w-auto sm:flex-wrap">
            @for (p of products(); track p.id) {
              <button
                type="button"
                role="tab"
                (click)="select(p.id)"
                [attr.aria-selected]="activeId() === p.id"
                class="rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors"
                [class]="activeId() === p.id ? 'border-white bg-white text-ink' : 'border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'"
              >
                {{ short(p.name) }}
              </button>
            }
          </div>
        </div>

        <!-- Stage (re-created per edition so it fades in) -->
        @for (p of [active()]; track p.id) {
          <div class="grid animate-fade-in overflow-hidden rounded-3xl border border-white/[0.06] bg-card lg:grid-cols-12" role="tabpanel">
            <div class="relative aspect-[4/3] bg-surface sm:aspect-[16/9] lg:col-span-5 lg:aspect-auto lg:min-h-[28rem]">
              <img [src]="p.image" [alt]="p.name + ' can'" width="1376" height="768" loading="lazy" decoding="async" class="absolute inset-0 h-full w-full object-cover" />
              @if (p.badge) {
                <span class="chip absolute left-4 top-4 bg-black/50 backdrop-blur">{{ p.badge }}</span>
              }
            </div>

            <div class="flex flex-col p-6 sm:p-8 lg:col-span-7 lg:p-10">
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
                <span class="font-medium uppercase tracking-widest">{{ p.category }}</span>
                <span class="text-neutral-600">&bull;</span>
                <span>355ml recyclable aluminium</span>
                @if (p.rating) {
                  <span class="text-neutral-600">&bull;</span>
                  <span>&#9733; {{ p.rating }} ({{ p.reviewsCount }})</span>
                }
              </div>
              <h3 class="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{{ p.name }}</h3>
              <p class="mt-1 text-sm text-neutral-400">{{ p.subtitle }}</p>
              <p class="mt-4 max-w-xl text-sm leading-relaxed text-neutral-400">{{ p.description }}</p>

              <!-- Meters -->
              <dl class="mt-7 grid gap-x-8 gap-y-5 border-t border-white/[0.06] pt-7 sm:grid-cols-2">
                @for (m of meters(p); track m.label) {
                  <div>
                    <dt class="flex items-baseline justify-between gap-3">
                      <span class="text-xs font-medium text-neutral-400">{{ m.label }}</span>
                      <span class="text-xs text-white">{{ m.text }}</span>
                    </dt>
                    <dd class="mt-2 flex h-1 gap-1" aria-hidden="true">
                      @if (m.score !== null) {
                        @for (n of steps; track n) {
                          <span class="flex-1 rounded-full" [class]="n <= m.score ? 'bg-white' : 'bg-white/10'"></span>
                        }
                      } @else {
                        <span class="flex-1 rounded-full bg-white/30"></span>
                      }
                    </dd>
                  </div>
                }
              </dl>

              <!-- Pack + actions -->
              <div class="mt-8 flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-6">
                <div class="flex rounded-full border border-white/10 p-1" role="radiogroup" aria-label="Pack size">
                  @for (pack of p.packs; track pack.name; let i = $index) {
                    <button
                      type="button"
                      role="radio"
                      (click)="packIndex.set(i)"
                      [attr.aria-checked]="packIndex() === i"
                      class="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors"
                      [class]="packIndex() === i ? 'bg-white text-ink' : 'text-neutral-400 hover:text-white'"
                    >
                      {{ packLabel(pack.name) }}
                    </button>
                  }
                </div>
                <div class="ml-auto text-right">
                  <span class="block text-lg font-semibold text-white">{{ p.packs[packIndex()].price | currency }}</span>
                  <span class="block text-[11px] text-neutral-500">{{ p.packs[packIndex()].perCan }}</span>
                </div>
              </div>
              <div class="mt-5 flex flex-wrap gap-3">
                <button type="button" (click)="addActive()" class="btn-primary flex-1 sm:flex-none">Add to Bag</button>
                <button type="button" (click)="cart.openQuickView(p)" class="btn-ghost flex-1 sm:flex-none">Details</button>
              </div>
            </div>
          </div>
        }
      </div>
    </section>
  `
})
export class ShowcaseComponent {
  readonly cart = inject(CartService);
  readonly products = inject(ProductService).products;

  readonly steps = [1, 2, 3, 4, 5];
  readonly activeId = signal(this.products()[0].id);
  readonly packIndex = signal(0);
  readonly active = computed<Product>(() => this.products().find(p => p.id === this.activeId()) ?? this.products()[0]);

  select(id: string): void {
    this.activeId.set(id);
    this.packIndex.set(0);
  }

  short(name: string): string {
    return name.replace(/^STAG\s+/, '');
  }

  packLabel(name: string): string {
    return name.split(/[\s(]/)[0]; // "4-Pack", "12-Pack", "24-Pack"
  }

  /** Turns "Crisp Wild Berry (2/5)" into a label plus a 0-5 score for the bar. */
  meters(p: Product): Meter[] {
    const parse = (label: string, raw: string): Meter => {
      const m = /\((\d)\/5\)/.exec(raw);
      return { label, text: raw.replace(/\s*\(\d\/5\)/, ''), score: m ? Number(m[1]) : null };
    };
    return [
      parse('Sweetness', p.profile.sweetness),
      parse('Carbonation', p.profile.carbonation),
      parse('Aromatics & Bitterness', p.profile.bitterness),
      parse('Body', p.profile.body)
    ];
  }

  addActive(): void {
    const p = this.active();
    this.cart.addItem(p, p.packs[this.packIndex()]);
  }
}
