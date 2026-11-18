import { Injectable, afterNextRender, computed, effect, signal } from '@angular/core';
import { PackOption, Product } from './product.service';

export interface CartItem {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  image: string;
  quantity: number;
  pack: string;
}

export interface ToastMessage {
  id: number;
  text: string;
}

const MAX_QTY = 99;
const MAX_TOASTS = 3;

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly STORAGE_KEY = 'stag_cart_v2';
  private hydrated = false;
  private toastId = 0;

  // Starts empty on server AND client so hydration always matches; real data loads right after.
  readonly items = signal<CartItem[]>([]);
  readonly isDrawerOpen = signal(false);
  readonly toasts = signal<ToastMessage[]>([]);
  readonly quickViewProduct = signal<Product | null>(null);

  readonly totalItemsCount = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));
  readonly subtotal = computed(() => this.items().reduce((sum, i) => sum + i.price * i.quantity, 0));

  readonly freeShippingThreshold = 45;
  readonly shippingRemaining = computed(() => Math.max(0, this.freeShippingThreshold - this.subtotal()));
  readonly shippingProgress = computed(() =>
    Math.min((this.subtotal() / this.freeShippingThreshold) * 100, 100)
  );

  constructor() {
    afterNextRender(() => {
      this.items.set(this.read());
      this.hydrated = true;
    });

    effect(() => {
      const list = this.items();
      if (this.hydrated) this.write(list);
    });
  }

  private read(): CartItem[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      const parsed: unknown = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
    } catch {
      return [];
    }
  }

  private write(list: CartItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    } catch {
      /* storage unavailable (private mode / quota): the bag still works for this visit */
    }
  }

  openDrawer(): void {
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  addItem(product: Product, pack: PackOption = product.packs[0], qty = 1): void {
    this.items.update(list => {
      const idx = list.findIndex(i => i.id === product.id && i.pack === pack.name);
      if (idx > -1) {
        const next = [...list];
        next[idx] = { ...next[idx], quantity: Math.min(MAX_QTY, next[idx].quantity + qty) };
        return next;
      }
      return [
        ...list,
        {
          id: product.id,
          name: product.name,
          subtitle: product.subtitle,
          price: pack.price,
          image: product.image,
          quantity: qty,
          pack: pack.name
        }
      ];
    });
    // The drawer opening is the confirmation, so no extra toast is needed
    this.openDrawer();
  }

  updateQuantity(id: string, pack: string, delta: number): void {
    this.items.update(list =>
      list
        .map(item =>
          item.id === id && item.pack === pack
            ? { ...item, quantity: Math.min(MAX_QTY, item.quantity + delta) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  }

  removeItem(id: string, pack: string): void {
    this.items.update(list => list.filter(i => !(i.id === id && i.pack === pack)));
  }

  clearCart(): void {
    this.items.set([]);
  }

  showToast(text: string): void {
    const id = ++this.toastId;
    this.toasts.update(t => [...t, { id, text }].slice(-MAX_TOASTS));
    setTimeout(() => this.toasts.update(t => t.filter(item => item.id !== id)), 3200);
  }

  openQuickView(product: Product): void {
    this.quickViewProduct.set(product);
  }

  closeQuickView(): void {
    this.quickViewProduct.set(null);
  }
}
