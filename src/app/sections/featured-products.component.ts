import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ProductService, Product } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { RevealDirective } from '../shared/reveal.directive';

interface CardLayout {
  wrap: string;
  media: string;
}

// Full class names live here (not built dynamically) so Tailwind can see them.
// Mobile: hero card spans the row, the rest sit 2-up. md+: 2 large cards over 3 smaller ones.
const LAYOUTS: CardLayout[] = [
  { wrap: 'col-span-2 md:col-span-3', media: 'aspect-[16/10] md:aspect-[4/3]' },
  { wrap: 'md:col-span-3', media: 'aspect-[4/5] md:aspect-[4/3]' },
  { wrap: 'md:col-span-2', media: 'aspect-[4/5]' }
];

@Component({
  selector: 'app-featured-products',
  standalone: true,
  imports: [CurrencyPipe, RevealDirective],
  template: `
    <section id="collection" class="section-y relative border-t border-white/[0.06] bg-ink">
      <div class="container-x">
        <div appReveal class="mb-12 flex flex-col justify-between gap-5 md:mb-16 md:flex-row md:items-end">
          <div>
            <span class="eyebrow mb-3 block">The Collection</span>
            <h2 class="h-section">Five crafted editions.</h2>
          </div>
          <p class="lead max-w-sm">
            Cold-pressed whole fruits, micro-carbonation, and untouched volcanic spring water.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-6">
          @for (product of products(); track product.id; let i = $index) {
            <div [appReveal]="(i % 3) * 80" [class]="layout(i).wrap">
              <article
                class="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-card transition-colors duration-300 hover:border-white/20"
              >
                <button
                  type="button"
                  (click)="cart.openQuickView(product)"
                  class="relative block w-full overflow-hidden bg-surface"
                  [class]="layout(i).media"
                  [attr.aria-label]="'Quick view ' + product.name"
                >
                  <img
                    [src]="product.image"
                    [alt]="product.name + ' can'"
                    width="1376"
                    height="768"
                    loading="lazy"
                    decoding="async"
                    class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  @if (product.badge) {
                    <span class="chip absolute left-3 top-3 bg-black/50 backdrop-blur">{{ product.badge }}</span>
                  }
                </button>

                <div class="flex flex-1 flex-col p-4 sm:p-5">
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-medium uppercase tracking-wider text-neutral-400">{{ product.category }}</span>
                    <span class="text-[11px] text-neutral-500">355ml</span>
                  </div>
                  <h3 class="mt-1.5 text-sm font-semibold tracking-tight text-white sm:text-base">{{ product.name }}</h3>
                  <p class="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-400">{{ product.subtitle }}</p>

                  <div class="mt-auto flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
                    <div>
                      <span class="block text-[11px] text-neutral-500">4-Pack</span>
                      <span class="text-sm font-semibold text-white">{{ product.price | currency }}</span>
                    </div>
                    <button type="button" (click)="add(product)" class="btn-primary !px-4 !py-2" [attr.aria-label]="'Add ' + product.name + ' to bag'">
                      <svg class="h-3.5 w-3.5 sm:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                      <span class="hidden sm:inline">Add to Bag</span>
                      <span class="sm:hidden">Add</span>
                    </button>
                  </div>
                </div>
              </article>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class FeaturedProductsComponent {
  readonly cart = inject(CartService);
  readonly products = inject(ProductService).products;

  layout(i: number): CardLayout {
    return LAYOUTS[Math.min(i, 2)];
  }

  add(product: Product): void {
    this.cart.addItem(product);
  }
}
