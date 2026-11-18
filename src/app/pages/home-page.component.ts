import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar.component';
import { FooterComponent } from '../shared/footer.component';
import { CartDrawerComponent } from '../shared/cart-drawer.component';
import { QuickViewModalComponent } from '../shared/quick-view-modal.component';
import { ToastComponent } from '../shared/toast.component';
import { HeroComponent } from '../sections/hero.component';
import { FeaturedProductsComponent } from '../sections/featured-products.component';
import { BrandStoryComponent } from '../sections/brand-story.component';
import { BenefitsComponent } from '../sections/benefits.component';
import { ProductDetailsComponent } from '../sections/product-details.component';
import { ShowcaseComponent } from '../sections/showcase.component';
import { TestimonialsComponent } from '../sections/testimonials.component';
import { FaqComponent } from '../sections/faq.component';
import { NewsletterComponent } from '../sections/newsletter.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    CartDrawerComponent,
    QuickViewModalComponent,
    ToastComponent,
    HeroComponent,
    FeaturedProductsComponent,
    BrandStoryComponent,
    BenefitsComponent,
    ProductDetailsComponent,
    ShowcaseComponent,
    TestimonialsComponent,
    FaqComponent,
    NewsletterComponent
  ],
  template: `
    <div class="relative min-h-screen bg-ink text-neutral-50">
      <a
        href="#collection"
        class="fixed left-4 top-4 z-[80] -translate-y-20 rounded-full bg-white px-4 py-2 text-xs font-medium text-ink transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      <app-navbar></app-navbar>

      <main id="main" class="w-full overflow-x-clip">
        <app-hero></app-hero>
        <app-featured-products></app-featured-products>
        <app-brand-story></app-brand-story>
        <app-benefits></app-benefits>
        <app-product-details></app-product-details>
        <app-showcase></app-showcase>
        <app-testimonials></app-testimonials>
        <app-faq></app-faq>
        <app-newsletter></app-newsletter>
      </main>

      <app-footer></app-footer>

      <app-cart-drawer></app-cart-drawer>
      <app-quick-view-modal></app-quick-view-modal>
      <app-toast></app-toast>
    </div>
  `
})
export class HomePageComponent {}
