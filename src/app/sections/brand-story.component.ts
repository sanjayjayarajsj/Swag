import { Component } from '@angular/core';
import { RevealDirective } from '../shared/reveal.directive';

@Component({
  selector: 'app-brand-story',
  standalone: true,
  imports: [RevealDirective],
  template: `
    <section id="philosophy" class="section-y relative border-t border-white/[0.06] bg-surface">
      <div class="container-x">
        <div appReveal class="mb-14 max-w-2xl sm:mb-20">
          <span class="eyebrow mb-3 block">Our Philosophy</span>
          <h2 class="h-section">
            Refined refreshment.<br />
            <span class="font-normal text-neutral-400">Crafted with intention.</span>
          </h2>
          <p class="lead mt-6">
            We set out to create canned drinks with the craft precision of fine tea and vintage champagne. No artificial
            flavorings, no cloying sweetness &mdash; simply real botanical clarity.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-10 border-t border-white/[0.06] pt-10 md:grid-cols-3 md:gap-12">
          <div appReveal class="space-y-3">
            <span class="text-xs tracking-wider text-neutral-500">01</span>
            <h3 class="text-lg font-medium tracking-tight text-white">Real Whole Fruits</h3>
            <p class="text-sm leading-relaxed text-neutral-400">
              Cold-pressed organic fruits and herbs harvested at peak flavor for true aromatic complexity and balanced acidity.
            </p>
          </div>
          <div [appReveal]="100" class="space-y-3">
            <span class="text-xs tracking-wider text-neutral-500">02</span>
            <h3 class="text-lg font-medium tracking-tight text-white">Micro-Effervescence</h3>
            <p class="text-sm leading-relaxed text-neutral-400">
              Ultra-fine needle carbonation creates a velvety draught texture that lifts aroma without harsh carbonation bite.
            </p>
          </div>
          <div [appReveal]="200" class="space-y-3">
            <span class="text-xs tracking-wider text-neutral-500">03</span>
            <h3 class="text-lg font-medium tracking-tight text-white">Basalt Spring Source</h3>
            <p class="text-sm leading-relaxed text-neutral-400">
              Filtered through volcanic stone over millennia, naturally enriched with minerals for a crisp, weightless finish.
            </p>
          </div>
        </div>
      </div>
    </section>
  `
})
export class BrandStoryComponent {}
