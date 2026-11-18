import { Component } from '@angular/core';
import { RevealDirective } from '../shared/reveal.directive';

interface Benefit {
  title: string;
  subtitle: string;
  description: string;
}

/** The craft in detail: a clean numbered spec list. */
@Component({
  selector: 'app-benefits',
  standalone: true,
  imports: [RevealDirective],
  template: `
    <section id="craft" class="section-y border-t border-white/[0.06] bg-ink">
      <div class="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div appReveal class="lg:col-span-5">
          <div class="lg:sticky lg:top-28">
            <span class="eyebrow mb-3 block">The Craft</span>
            <h2 class="h-section">
              Why it feels<br />
              <span class="font-normal text-neutral-400">different.</span>
            </h2>
            <p class="lead mt-6 max-w-md">
              Every step of our formulation is calibrated to deliver an uncompromised sensory response, from first pour to clean finish.
            </p>
          </div>
        </div>

        <ol class="lg:col-span-7">
          @for (b of benefits; track b.title; let i = $index) {
            <li appReveal class="group grid grid-cols-[2.5rem_1fr] gap-4 border-t border-white/[0.06] py-7 first:border-t-0 first:pt-0 sm:grid-cols-[3.5rem_1fr] sm:py-9 sm:first:pt-0">
              <span class="pt-1 text-xs tracking-wider text-neutral-500">0{{ i + 1 }}</span>
              <div>
                <h3 class="text-lg font-semibold tracking-tight text-white sm:text-xl">{{ b.title }}</h3>
                <p class="mt-0.5 text-xs font-medium uppercase tracking-widest text-neutral-500">{{ b.subtitle }}</p>
                <p class="mt-3 text-sm leading-relaxed text-neutral-400">{{ b.description }}</p>
              </div>
            </li>
          }
        </ol>
      </div>
    </section>
  `
})
export class BenefitsComponent {
  readonly benefits: Benefit[] = [
    {
      title: 'Cryogenic Extraction',
      subtitle: 'Sub-zero essential oils',
      description:
        'Whole ripe berries and Tahitian limes are flash-frozen at -40°C to lock in volatile terpenes and essential citrus oils without heat pasteurization.'
    },
    {
      title: 'Micro-Nitro Infusion',
      subtitle: 'Velvet bubbles',
      description:
        'Microscopic nitrogen bubbles, far finer than standard soda CO2, deliver a luxurious draught mouthfeel without bloating or stomach burn.'
    },
    {
      title: 'Basalt Purification',
      subtitle: 'Alpine mineral richness',
      description:
        'Underground aquifer water filtered through 4,000 years of basalt strata, naturally enriched with silica, magnesium, and potassium ions.'
    },
    {
      title: 'Zero Artificial Cloak',
      subtitle: 'Pure botanical palate',
      description:
        'Zero monk fruit, zero stevia, zero sucralose. Sweetened exclusively by a whisper of raw organic agave for a clean finish.'
    }
  ];
}
