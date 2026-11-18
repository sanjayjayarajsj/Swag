import { Component, inject, signal } from '@angular/core';
import { ScrollService } from '../services/scroll.service';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="border-t border-white/[0.08] bg-ink">
      <div class="container-x">

        <!-- Newsletter / Drop invitation (text from 2nd footer) -->
        <div class="grid grid-cols-1 items-center gap-8 border-b border-white/[0.08] py-14 lg:grid-cols-12">
          <div class="lg:col-span-6">
            <div class="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-neutral-400">
              <span class="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
              <span>Cellar Allocations &bull; Drop 01</span>
            </div>
            <h3 class="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Stay in the Craft with STAG.
            </h3>
            <p class="mt-2 max-w-md text-xs leading-relaxed text-neutral-400 sm:text-sm">
              Be the first to access limited small-batch botanical releases, private tastings, and harvest reserve drops.
            </p>
          </div>

          <div class="lg:col-span-6">
            <form (submit)="onSubscribe($event, emailInput)" class="flex max-w-md flex-col gap-3 sm:flex-row lg:ml-auto">
              <input
                #emailInput
                type="email"
                placeholder="Enter your email"
                required
                class="w-full flex-1 rounded-full border border-white/15 bg-white/[0.03] px-5 py-3.5 text-xs text-white placeholder:text-neutral-500 transition-all focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
              />
              <button
                type="submit"
                class="cursor-pointer whitespace-nowrap rounded-full bg-white px-7 py-3.5 text-xs font-medium uppercase tracking-wider text-[#09090b] shadow-md transition-all hover:bg-neutral-200 active:scale-95"
              >
                Join Club
              </button>
            </form>
            @if (subscribed()) {
              <div class="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                <span>&check;</span>
                <span>You're on the allocation list for upcoming drops.</span>
              </div>
            }
          </div>
        </div>

        <div class="grid grid-cols-2 gap-10 py-14 sm:py-16 md:grid-cols-5">
          <!-- Brand -->
          <div class="col-span-2">
            <div class="flex items-center gap-2">
              <a href="#hero" (click)="go($event, 0)" class="text-xl font-semibold uppercase tracking-widest text-white">STAG</a>
              <span class="rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[9px] uppercase tracking-widest text-neutral-400">
                Craft Soda
              </span>
            </div>
            <p class="mt-3 max-w-xs text-sm leading-relaxed text-neutral-400">
              Botanical craft refreshment poured to perfection. Organic mountain fruit extracts, micro-carbonated with pure alpine spring water.
            </p>

            <!-- Live status -->
            <div class="mt-6 inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1.5 text-[11px] text-neutral-400">
              <span class="relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>Distillery &amp; Bottling &bull; Active</span>
            </div>
          </div>

          <!-- Editions -->
          <nav aria-label="Editions" class="flex flex-col gap-3">
            <span class="text-[11px] font-semibold uppercase tracking-widest text-neutral-200">Editions</span>
            @for (p of products.products(); track p.id) {
              <a href="#collection" (click)="go($event, '#collection')" class="text-sm text-neutral-400 transition-colors hover:text-white">
                {{ shortName(p.name) }}
              </a>
            }
            <a href="#collection" (click)="go($event, '#collection')" class="text-sm font-medium text-rose-400 transition-colors hover:text-rose-300">
              Variety Discovery 12-Pack
            </a>
          </nav>

          <!-- The Craft -->
          <nav aria-label="The Craft" class="flex flex-col gap-3">
            <span class="text-[11px] font-semibold uppercase tracking-widest text-neutral-200">The Craft</span>
            <a href="#philosophy" (click)="go($event, '#philosophy')" class="text-sm text-neutral-400 transition-colors hover:text-white">Alpine Spring Source</a>
            <a href="#philosophy" (click)="go($event, '#philosophy')" class="text-sm text-neutral-400 transition-colors hover:text-white">Cold Micro-Carbonation</a>
            <a href="#philosophy" (click)="go($event, '#philosophy')" class="text-sm text-neutral-400 transition-colors hover:text-white">Organic Botanical Extracts</a>
            <a href="#philosophy" (click)="go($event, '#philosophy')" class="text-sm text-neutral-400 transition-colors hover:text-white">Zero Added Sugar</a>
            <span class="text-sm text-neutral-500">100% Infinitely Recyclable</span>
          </nav>

          <!-- Connect -->
          <nav aria-label="Connect" class="flex flex-col gap-3">
            <span class="text-[11px] font-semibold uppercase tracking-widest text-neutral-200">Connect</span>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="text-sm text-neutral-400 transition-colors hover:text-white">Instagram &#8599;</a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" class="text-sm text-neutral-400 transition-colors hover:text-white">TikTok &#8599;</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="text-sm text-neutral-400 transition-colors hover:text-white">X (Twitter) &#8599;</a>
            <a href="https://spotify.com" target="_blank" rel="noopener noreferrer" class="text-sm text-neutral-400 transition-colors hover:text-white">Spotify Curations &#8599;</a>
            <a href="mailto:press@stagcraft.co" class="text-sm text-neutral-400 transition-colors hover:text-white">Press &amp; Hospitality</a>
          </nav>
        </div>

        <!-- Trust row + back to top -->
        <div class="flex flex-col items-start justify-between gap-5 border-t border-white/[0.06] py-6 sm:flex-row sm:items-center">
          <ul class="flex flex-wrap gap-x-6 gap-y-2 text-xs text-neutral-400">
            <li class="flex items-center gap-2"><span class="h-1 w-1 rounded-full bg-neutral-600"></span>100% Certified Organic</li>
            <li class="flex items-center gap-2"><span class="h-1 w-1 rounded-full bg-neutral-600"></span>Low Calorie &bull; 15 kcal</li>
            <li class="flex items-center gap-2"><span class="h-1 w-1 rounded-full bg-neutral-600"></span>Carbon Negative Logistics</li>
            <li class="flex items-center gap-2"><span class="h-1 w-1 rounded-full bg-neutral-600"></span>Recyclable aluminium</li>
            <li class="flex items-center gap-2"><span class="h-1 w-1 rounded-full bg-neutral-600"></span>Free shipping over $45</li>
          </ul>
          <button type="button" (click)="scroll.scrollTo(0)" class="btn-ghost !px-4 !py-2 !normal-case !tracking-normal">
            Back to top
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
          </button>
        </div>

        <!-- Legal -->
        <div class="flex flex-col justify-between gap-3 border-t border-white/[0.06] py-6 text-xs text-neutral-500 md:flex-row md:items-center">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
            <span>&copy; {{ year }} STAG Refreshment Co. All rights reserved.</span>
            <span class="hidden text-neutral-700 sm:inline">&bull;</span>
            <span class="text-neutral-400">Bottled in the Alps &bull; Dispatched Globally</span>
          </div>
          <div class="flex flex-wrap gap-x-6 gap-y-2">
            <a href="#" (click)="$event.preventDefault()" class="transition-colors hover:text-neutral-300">Privacy Policy</a>
            <a href="#" (click)="$event.preventDefault()" class="transition-colors hover:text-neutral-300">Terms of Service</a>
            <a href="#" (click)="$event.preventDefault()" class="transition-colors hover:text-neutral-300">Cookie Preferences</a>
            <a href="#" (click)="$event.preventDefault()" class="transition-colors hover:text-neutral-300">Accessibility</a>
          </div>
        </div>
      </div>

      <!-- Large brand watermark -->
      <div class="pointer-events-none mt-4 flex w-full select-none justify-center overflow-hidden">
        <span class="block whitespace-nowrap text-[17vw] font-black leading-none tracking-tighter text-white/[0.02]">
          STAG
        </span>
      </div>
    </footer>
  `
})
export class FooterComponent {
  readonly scroll = inject(ScrollService);
  readonly products = inject(ProductService);
  readonly year = new Date().getFullYear();
  readonly subscribed = signal(false);

  shortName(name: string): string {
    return name.replace(/^STAG\s+/, '');
  }

  go(event: Event, target: string | number): void {
    event.preventDefault();
    this.scroll.scrollTo(target);
  }

  onSubscribe(event: Event, input: HTMLInputElement): void {
    event.preventDefault();
    if (!input.value.trim()) return;
    this.subscribed.set(true);
    input.value = '';
  }
}