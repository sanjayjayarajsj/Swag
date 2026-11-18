import { Component, inject } from '@angular/core';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div
      class="pointer-events-none fixed inset-x-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-[70] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end"
      aria-live="polite"
      role="status"
    >
      @for (toast of cart.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex animate-pop-in items-center gap-2.5 rounded-full border border-white/10 bg-card/95 px-4 py-2.5 text-xs font-medium tracking-wide text-white shadow-xl backdrop-blur-md"
        >
          <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"></span>
          <span>{{ toast.text }}</span>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  readonly cart = inject(CartService);
}
