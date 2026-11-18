import { Component, ElementRef, HostListener, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../services/cart.service';
import { ScrollService } from '../services/scroll.service';
import { trapTab } from './a11y';

const PROMO_CODES = ['STAG', 'FLOW', 'DIALED'];
const SHIPPING_FEE = 4.95;

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <div class="fixed inset-0 z-50" [attr.inert]="open() ? null : ''">
      <!-- Backdrop -->
      <div
        (click)="close()"
        class="absolute inset-0 bg-black/60 transition-opacity duration-300"
        [class]="open() ? 'opacity-100' : 'opacity-0'"
      ></div>

      <!-- Panel -->
      <aside
        #panel
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        tabindex="-1"
        (keydown)="onKeydown($event)"
        class="absolute inset-y-0 right-0 flex h-full w-full max-w-md flex-col border-l border-white/[0.08] bg-surface shadow-2xl transition-transform duration-300 ease-out"
        [class]="open() ? 'translate-x-0' : 'translate-x-full'"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 sm:px-6">
          <div class="flex items-baseline gap-2">
            <h2 class="text-base font-semibold tracking-wide text-white">Your Bag</h2>
            <span class="text-xs text-neutral-400">
              {{ cart.totalItemsCount() }} {{ cart.totalItemsCount() === 1 ? 'item' : 'items' }}
            </span>
          </div>
          <button #closeBtn type="button" (click)="close()" class="icon-btn !h-9 !w-9 !border-transparent" aria-label="Close bag">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        @if (cart.items().length > 0) {
          <!-- Free shipping progress -->
          <div class="border-b border-white/[0.06] px-5 py-3 sm:px-6">
            <p class="text-xs text-neutral-400">
              @if (cart.shippingRemaining() === 0) {
                Free carbon-neutral shipping applied
              } @else {
                Add {{ cart.shippingRemaining() | currency }} more for complimentary shipping
              }
            </p>
            <div class="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                class="h-full origin-left rounded-full bg-white transition-transform duration-500"
                [style.transform]="'scaleX(' + cart.shippingProgress() / 100 + ')'"
              ></div>
            </div>
          </div>
        }

        <!-- Items -->
        <div class="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6" data-lenis-prevent>
          @if (cart.items().length === 0) {
            <div class="flex h-full flex-col items-center justify-center gap-5 py-16 text-center">
              <div class="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 text-neutral-500">
                <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M6 7h12l1 13H5L6 7Z" />
                  <path d="M9 7a3 3 0 0 1 6 0" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-white">Your bag is empty</p>
                <p class="mt-1 text-xs text-neutral-400">Pick an edition to get started.</p>
              </div>
              <button type="button" (click)="explore()" class="btn-primary">Explore editions</button>
            </div>
          } @else {
            <ul class="divide-y divide-white/[0.06]">
              @for (item of cart.items(); track item.id + item.pack) {
                <li class="flex gap-4 py-5">
                  <div class="h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-white/[0.06] bg-card">
                    <img [src]="item.image" [alt]="item.name" width="64" height="80" loading="lazy" decoding="async" class="h-full w-full object-cover" />
                  </div>
                  <div class="flex min-w-0 flex-1 flex-col justify-between">
                    <div class="flex items-start justify-between gap-2">
                      <div class="min-w-0">
                        <h3 class="truncate text-sm font-medium text-white">{{ item.name }}</h3>
                        <p class="mt-0.5 text-xs text-neutral-400">{{ item.pack }}</p>
                      </div>
                      <button
                        type="button"
                        (click)="cart.removeItem(item.id, item.pack)"
                        class="-mr-1.5 -mt-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:text-white"
                        [attr.aria-label]="'Remove ' + item.name"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div class="flex items-center justify-between pt-3">
                      <div class="flex items-center rounded-full border border-white/10">
                        <button type="button" (click)="cart.updateQuantity(item.id, item.pack, -1)" class="flex h-8 w-8 items-center justify-center text-neutral-300 transition-colors hover:text-white" [attr.aria-label]="'Decrease ' + item.name">
                          <svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" /></svg>
                        </button>
                        <span class="w-6 text-center text-xs font-medium text-white" aria-live="polite">{{ item.quantity }}</span>
                        <button type="button" (click)="cart.updateQuantity(item.id, item.pack, 1)" class="flex h-8 w-8 items-center justify-center text-neutral-300 transition-colors hover:text-white" [attr.aria-label]="'Increase ' + item.name">
                          <svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                        </button>
                      </div>
                      <span class="text-sm font-semibold text-white">{{ item.price * item.quantity | currency }}</span>
                    </div>
                  </div>
                </li>
              }
            </ul>
          }
        </div>

        <!-- Checkout -->
        @if (cart.items().length > 0) {
          <div class="space-y-4 border-t border-white/[0.06] bg-ink/60 px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">
            <form (submit)="applyPromo($event)" class="flex gap-2">
              <input
                type="text"
                name="promo"
                autocomplete="off"
                [value]="promoInput()"
                (input)="promoInput.set($any($event.target).value)"
                [disabled]="promoApplied()"
                placeholder="Promo code"
                aria-label="Promo code"
                class="h-10 min-w-0 flex-1 rounded-full border border-white/10 bg-white/[0.03] px-4 text-xs text-white placeholder:text-neutral-500 focus:border-white/30 focus:outline-none disabled:opacity-60"
              />
              <button type="submit" class="btn-ghost !h-10 !px-5 !py-0">{{ promoApplied() ? 'Remove' : 'Apply' }}</button>
            </form>

            <dl class="space-y-1.5 text-xs">
              <div class="flex justify-between text-neutral-400">
                <dt>Subtotal</dt>
                <dd class="text-white">{{ cart.subtotal() | currency }}</dd>
              </div>
              @if (discount() > 0) {
                <div class="flex justify-between text-emerald-400">
                  <dt>Discount (10%)</dt>
                  <dd>-{{ discount() | currency }}</dd>
                </div>
              }
              <div class="flex justify-between text-neutral-400">
                <dt>Shipping</dt>
                <dd class="text-white">{{ shipping() === 0 ? 'Free' : (shipping() | currency) }}</dd>
              </div>
              <div class="flex justify-between border-t border-white/[0.06] pt-3 text-base font-semibold text-white">
                <dt>Total</dt>
                <dd>{{ total() | currency }}</dd>
              </div>
            </dl>

            <button type="button" (click)="checkout()" [disabled]="isCheckingOut()" class="btn-primary w-full !py-3.5">
              {{ isCheckingOut() ? 'Processing…' : 'Checkout · ' + (total() | currency) }}
            </button>
          </div>
        }
      </aside>
    </div>
  `
})
export class CartDrawerComponent {
  readonly cart = inject(CartService);
  private readonly scroll = inject(ScrollService);

  @ViewChild('panel', { static: true }) panel!: ElementRef<HTMLElement>;
  @ViewChild('closeBtn', { static: true }) closeBtn!: ElementRef<HTMLElement>;

  readonly open = this.cart.isDrawerOpen;
  readonly promoInput = signal('');
  readonly promoApplied = signal(false);
  readonly isCheckingOut = signal(false);

  // Derived from live cart data, so quantity changes always update the discount
  readonly discount = computed(() => (this.promoApplied() ? Math.round(this.cart.subtotal() * 10) / 100 : 0));
  readonly shipping = computed(() =>
    this.cart.items().length === 0 || this.cart.shippingRemaining() === 0 ? 0 : SHIPPING_FEE
  );
  readonly total = computed(() => Math.max(0, this.cart.subtotal() - this.discount() + this.shipping()));

  private locked = false;
  private returnFocus: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const isOpen = this.open();
      this.setLocked(isOpen);
      if (!this.scroll.isBrowser) return;
      if (isOpen) {
        this.returnFocus = document.activeElement as HTMLElement | null;
        setTimeout(() => this.closeBtn?.nativeElement.focus(), 60);
      } else if (this.returnFocus) {
        this.returnFocus.focus?.();
        this.returnFocus = null;
      }
    });
  }

  private setLocked(value: boolean): void {
    if (value === this.locked) return;
    this.locked = value;
    value ? this.scroll.lock() : this.scroll.unlock();
  }

  close(): void {
    this.cart.closeDrawer();
  }

  explore(): void {
    this.cart.closeDrawer();
    this.setLocked(false); // release the scroll lock right now so the glide below can run
    this.scroll.scrollTo('#collection');
  }

  onKeydown(event: KeyboardEvent): void {
    trapTab(event, this.panel.nativeElement);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.close();
  }

  applyPromo(event: Event): void {
    event.preventDefault();
    if (this.promoApplied()) {
      this.promoApplied.set(false);
      this.promoInput.set('');
      return;
    }
    const code = this.promoInput().trim().toUpperCase();
    if (PROMO_CODES.includes(code)) {
      this.promoApplied.set(true);
      this.cart.showToast('10% discount applied');
    } else {
      this.cart.showToast('Invalid promo code');
    }
  }

  checkout(): void {
    this.isCheckingOut.set(true);
    setTimeout(() => {
      this.isCheckingOut.set(false);
      this.cart.clearCart();
      this.promoApplied.set(false);
      this.promoInput.set('');
      this.close();
      this.cart.showToast('Order confirmed. Thank you!');
    }, 1400);
  }
}
