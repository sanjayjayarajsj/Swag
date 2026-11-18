import { Component, inject, signal } from '@angular/core';
import { CartService } from '../services/cart.service';
import { RevealDirective } from '../shared/reveal.directive';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [RevealDirective],
  template: `
    <section id="newsletter" class="section-y border-t border-white/[0.06] bg-surface">
      <div appReveal class="container-x">
        <div class="mx-auto max-w-xl text-center">
          <span class="eyebrow mb-3 block">Cellar Allocations &bull; Drop 01</span>
          <h2 class="h-section">Stay in the craft.</h2>
          <p class="lead mt-4">
            Be the first to access limited small-batch releases, private tastings and harvest reserve drops. Members get notice 48 hours early.
          </p>

          @if (!done()) {
            <form (submit)="submit($event)" novalidate class="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                name="email"
                autocomplete="email"
                inputmode="email"
                placeholder="Enter your email"
                aria-label="Email address"
                [value]="email()"
                (input)="email.set($any($event.target).value); error.set('')"
                [attr.aria-invalid]="error() ? 'true' : null"
                class="h-12 w-full min-w-0 rounded-full sm:flex-1 border bg-white/[0.03] px-5 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
                [class]="error() ? 'border-rose-400/60' : 'border-white/15 focus:border-white/40'"
              />
              <button type="submit" class="btn-primary !h-12">Join Club</button>
            </form>
            <p class="mt-3 min-h-[1.25rem] text-xs text-rose-400" role="alert">{{ error() }}</p>
          } @else {
            <div class="mx-auto mt-8 max-w-md animate-pop-in rounded-2xl border border-white/10 bg-card p-6">
              <p class="text-sm font-medium text-white">You're on the list.</p>
              <p class="mt-1 text-xs text-neutral-400">We'll email you before the next release goes live.</p>
            </div>
          }
          <p class="mt-4 text-[11px] text-neutral-500">No spam. Only harvest reports and micro-batch drops.</p>
        </div>
      </div>
    </section>
  `
})
export class NewsletterComponent {
  private readonly cart = inject(CartService);

  readonly email = signal('');
  readonly error = signal('');
  readonly done = signal(false);

  submit(event: Event): void {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(this.email().trim())) {
      this.error.set('Please enter a valid email address.');
      return;
    }
    this.done.set(true);
    this.cart.showToast('Welcome to the STAG Club');
  }
}
