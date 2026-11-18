import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { CartService } from '../services/cart.service';
import { ScrollService } from '../services/scroll.service';

interface NavLink {
  id: string;
  label: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: `
    <header
      class="fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300"
      [class]="solid() ? 'border-white/[0.06] bg-ink/80 backdrop-blur-xl' : 'border-transparent bg-transparent'"
    >
      <div class="container-x flex h-16 items-center justify-between sm:h-[72px]">
        <a
          href="#hero"
          (click)="go($event, 0)"
          class="text-base font-semibold uppercase tracking-widest text-white transition-colors hover:text-neutral-300"
          aria-label="STAG, back to top"
        >
          STAG
        </a>

        <nav class="hidden items-center gap-8 md:flex" aria-label="Primary">
          @for (link of links; track link.id) {
            <a
              [href]="'#' + link.id"
              (click)="go($event, '#' + link.id)"
              class="relative py-2 text-xs font-medium uppercase tracking-widest transition-colors"
              [class]="active() === link.id ? 'text-white' : 'text-neutral-400 hover:text-white'"
              [attr.aria-current]="active() === link.id ? 'true' : null"
            >
              {{ link.label }}
              <span
                class="absolute inset-x-0 bottom-0 h-px origin-left bg-white transition-transform duration-300"
                [class]="active() === link.id ? 'scale-x-100' : 'scale-x-0'"
              ></span>
            </a>
          }
        </nav>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="cart.openDrawer()"
            class="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 text-xs font-medium tracking-wide text-white transition hover:border-white/30 active:scale-95"
            [attr.aria-label]="'Open bag, ' + cart.totalItemsCount() + ' items'"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M6 7h12l1 13H5L6 7Z" />
              <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
            <span>Bag</span>
            @if (cart.totalItemsCount() > 0) {
              <span class="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-ink">
                {{ cart.totalItemsCount() }}
              </span>
            }
          </button>

          <button
            type="button"
            (click)="toggleMenu()"
            class="icon-btn md:hidden"
            [attr.aria-expanded]="menuOpen()"
            aria-controls="mobile-menu"
            [attr.aria-label]="menuOpen() ? 'Close menu' : 'Open menu'"
          >
            <span class="relative block h-3 w-4" aria-hidden="true">
              <span
                class="absolute left-0 h-px w-4 bg-current transition-all duration-300"
                [class]="menuOpen() ? 'top-1.5 rotate-45' : 'top-0'"
              ></span>
              <span
                class="absolute left-0 h-px w-4 bg-current transition-all duration-300"
                [class]="menuOpen() ? 'top-1.5 -rotate-45' : 'top-3'"
              ></span>
            </span>
          </button>
        </div>
      </div>

      <!-- Page progress hairline (driven directly, no change detection) -->
      <div #bar class="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-white/60 will-change-transform"></div>

      <!-- Mobile menu -->
      <div
        id="mobile-menu"
        class="overflow-hidden bg-ink/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 md:hidden"
        [class]="menuOpen() ? 'max-h-[80svh] border-b border-white/[0.06] opacity-100' : 'max-h-0 opacity-0'"
        [attr.inert]="menuOpen() ? null : ''"
      >
        <nav class="container-x flex flex-col py-2" aria-label="Mobile">
          @for (link of links; track link.id) {
            <a
              [href]="'#' + link.id"
              (click)="go($event, '#' + link.id)"
              class="flex items-center justify-between border-b border-white/[0.06] py-4 text-sm font-medium text-neutral-200 last:border-0"
            >
              {{ link.label }}
              <svg class="h-4 w-4 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          }
        </nav>
      </div>
    </header>
  `
})
export class NavbarComponent implements AfterViewInit, OnDestroy {
  readonly cart = inject(CartService);
  private readonly scroll = inject(ScrollService);
  private readonly zone = inject(NgZone);

  @ViewChild('bar', { static: true }) bar!: ElementRef<HTMLElement>;

  readonly links: NavLink[] = [
    { id: 'collection', label: 'Collection' },
    { id: 'philosophy', label: 'Philosophy' },
    { id: 'details', label: 'Editions' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'faq', label: 'FAQ' }
  ];

  readonly scrolled = signal(false);
  readonly menuOpen = signal(false);
  readonly active = signal('');
  readonly solid = () => this.scrolled() || this.menuOpen();

  private offScroll: (() => void) | null = null;
  private observer: IntersectionObserver | null = null;
  private mql: MediaQueryList | null = null;
  private mqlHandler = (e: MediaQueryListEvent) => {
    if (e.matches) this.zone.run(() => this.closeMenu());
  };
  private rafId = 0;
  private isScrolled = false;
  private menuLocked = false;

  ngAfterViewInit(): void {
    if (!this.scroll.isBrowser) return;

    this.scroll.outside(() => {
      this.offScroll = this.scroll.onScroll(y => {
        const next = y > 24;
        if (next !== this.isScrolled) {
          this.isScrolled = next;
          this.zone.run(() => this.scrolled.set(next));
        }
        if (!this.rafId) {
          this.rafId = requestAnimationFrame(() => {
            this.rafId = 0;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
            this.bar.nativeElement.style.transform = `scaleX(${p})`;
          });
        }
      });

      this.mql = window.matchMedia('(min-width: 768px)');
      this.mql.addEventListener('change', this.mqlHandler);

      // Highlight the section currently crossing the middle of the screen
      setTimeout(() => {
        this.observer = new IntersectionObserver(
          entries => {
            for (const e of entries) {
              if (e.isIntersecting) {
                const id = this.links.some(l => l.id === e.target.id) ? e.target.id : '';
                this.zone.run(() => this.active.set(id));
              }
            }
          },
          { rootMargin: '-45% 0px -50% 0px' }
        );
        ['hero', 'profile', ...this.links.map(l => l.id)].forEach(id => {
          const el = document.getElementById(id);
          if (el) this.observer?.observe(el);
        });
      }, 0);
    });
  }

  go(event: Event, target: string | number): void {
    event.preventDefault();
    this.closeMenu();
    this.scroll.scrollTo(target);
  }

  toggleMenu(): void {
    this.menuOpen() ? this.closeMenu() : this.openMenu();
  }

  private openMenu(): void {
    this.menuOpen.set(true);
    if (!this.menuLocked) {
      this.menuLocked = true;
      this.scroll.lock();
    }
  }

  private closeMenu(): void {
    this.menuOpen.set(false);
    if (this.menuLocked) {
      this.menuLocked = false;
      this.scroll.unlock();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuOpen()) this.closeMenu();
  }

  ngOnDestroy(): void {
    this.offScroll?.();
    this.observer?.disconnect();
    this.mql?.removeEventListener('change', this.mqlHandler);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.menuLocked) this.scroll.unlock();
  }
}
