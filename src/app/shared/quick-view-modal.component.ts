import { Component, ElementRef, HostListener, ViewChild, effect, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../services/cart.service';
import { ScrollService } from '../services/scroll.service';
import { Product } from '../services/product.service';
import { trapTab } from './a11y';

@Component({
  selector: 'app-quick-view-modal',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    @if (cart.quickViewProduct(); as p) {
      <div class="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" (keydown)="onKeydown($event)">
        <div class="absolute inset-0 animate-fade-in bg-black/70" (click)="close()"></div>

        <div
          #panel
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="p.name + ' quick view'"
          tabindex="-1"
          data-lenis-prevent
          class="relative z-10 grid max-h-[92svh] w-full max-w-3xl animate-pop-in grid-cols-1 overflow-y-auto overscroll-contain rounded-t-3xl border border-white/[0.08] bg-surface shadow-2xl sm:rounded-2xl md:grid-cols-2"
        >
          <button type="button" (click)="close()" class="icon-btn absolute right-3 top-3 z-20 !h-9 !w-9 !border-transparent bg-black/50 backdrop-blur" aria-label="Close quick view">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Image -->
          <div class="relative aspect-[4/3] bg-card md:aspect-auto md:min-h-[26rem]">
            <img [src]="p.image" [alt]="p.name" class="absolute inset-0 h-full w-full object-cover" />
            @if (p.badge) {
              <span class="chip absolute left-4 top-4 bg-black/50 backdrop-blur">{{ p.badge }}</span>
            }
          </div>

          <!-- Details -->
          <div class="flex flex-col p-6 sm:p-8">
            <span class="eyebrow">{{ p.category }}</span>
            <h2 class="mt-1 text-2xl font-semibold tracking-tight text-white">{{ p.name }}</h2>
            <p class="mt-1 text-xs text-neutral-400">{{ p.subtitle }}</p>
            <p class="mt-4 text-sm leading-relaxed text-neutral-400">{{ p.description }}</p>

            <div class="mt-5 flex flex-wrap gap-2">
              @for (note of p.notes; track note) {
                <span class="chip">{{ note }}</span>
              }
            </div>

            <!-- Pack size -->
            <div class="mt-6" role="radiogroup" aria-label="Pack size">
              <span class="mb-2 block text-xs font-medium text-neutral-400">Pack size</span>
              <div class="space-y-2">
                @for (pack of p.packs; track pack.name; let i = $index) {
                  <button
                    type="button"
                    role="radio"
                    (click)="packIndex.set(i)"
                    [attr.aria-checked]="packIndex() === i"
                    class="flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left transition-colors"
                    [class]="packIndex() === i ? 'border-white/60 bg-white/[0.06]' : 'border-white/10 hover:border-white/25'"
                  >
                    <span class="text-xs font-medium text-white">{{ pack.name }}</span>
                    <span class="text-right">
                      <span class="block text-xs font-semibold text-white">{{ pack.price | currency }}</span>
                      <span class="block text-[10px] text-neutral-500">{{ pack.perCan }}</span>
                    </span>
                  </button>
                }
              </div>
            </div>

            <div class="mt-auto flex items-center justify-between gap-4 pt-6">
              <div>
                <span class="block text-xs text-neutral-400">Total</span>
                <span class="text-lg font-semibold text-white">{{ p.packs[packIndex()].price | currency }}</span>
              </div>
              <button type="button" (click)="addToBag(p)" class="btn-primary">Add to Bag</button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class QuickViewModalComponent {
  readonly cart = inject(CartService);
  private readonly scroll = inject(ScrollService);

  readonly packIndex = signal(0);

  private panelEl: HTMLElement | null = null;
  private locked = false;
  private returnFocus: HTMLElement | null = null;

  @ViewChild('panel') set panel(ref: ElementRef<HTMLElement> | undefined) {
    this.panelEl = ref?.nativeElement ?? null;
    if (this.panelEl) setTimeout(() => this.panelEl?.focus(), 30);
  }

  constructor() {
    effect(() => {
      const isOpen = !!this.cart.quickViewProduct();
      if (isOpen === this.locked) return;
      this.locked = isOpen;
      if (isOpen) {
        this.scroll.lock();
        if (this.scroll.isBrowser) this.returnFocus = document.activeElement as HTMLElement | null;
      } else {
        this.scroll.unlock();
        this.returnFocus?.focus?.();
        this.returnFocus = null;
      }
    });
  }

  close(): void {
    this.packIndex.set(0);
    this.cart.closeQuickView();
  }

  addToBag(product: Product): void {
    this.cart.addItem(product, product.packs[this.packIndex()]);
    this.close();
  }

  onKeydown(event: KeyboardEvent): void {
    trapTab(event, this.panelEl);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.cart.quickViewProduct()) this.close();
  }
}
