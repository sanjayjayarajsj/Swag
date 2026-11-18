import { Component, signal } from '@angular/core';
import { RevealDirective } from '../shared/reveal.directive';

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [RevealDirective],
  template: `
    <section id="faq" class="section-y border-t border-white/[0.06] bg-ink">
      <div class="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div appReveal class="lg:col-span-4">
          <div class="lg:sticky lg:top-28">
            <span class="eyebrow mb-3 block">FAQ</span>
            <h2 class="h-section">Answers &amp; <span class="font-normal text-neutral-400">specifications.</span></h2>
          </div>
        </div>

        <div class="lg:col-span-8">
          @for (item of faqs; track item.question; let i = $index) {
            <div appReveal class="border-b border-white/[0.08] first:border-t">
              <h3>
                <button
                  type="button"
                  (click)="toggle(i)"
                  class="flex w-full items-center justify-between gap-6 py-5 text-left sm:py-6"
                  [attr.aria-expanded]="open() === i"
                  [attr.aria-controls]="'faq-' + i"
                >
                  <span class="text-base font-medium text-white sm:text-lg">{{ item.question }}</span>
                  <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-white transition-transform duration-300" [class]="open() === i ? 'rotate-45' : ''" aria-hidden="true">
                    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  </span>
                </button>
              </h3>
              <!-- grid-rows trick animates to the content's real height -->
              <div
                [id]="'faq-' + i"
                role="region"
                class="grid transition-[grid-template-rows] duration-300 ease-out"
                [class]="open() === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
              >
                <div class="overflow-hidden">
                  <p class="max-w-2xl pb-6 text-sm leading-relaxed text-neutral-400">{{ item.answer }}</p>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class FaqComponent {
  readonly open = signal<number | null>(0);

  readonly faqs: FaqItem[] = [
    {
      question: 'How does micro-bubble nitro carbonation differ from standard canned soda?',
      answer:
        'Commercial sodas force coarse CO2 gas into sugary water at room temperature, resulting in sharp, bloating acidity. We infuse sub-zero nitrogen under pressure. The bubbles are far smaller, creating a rich draught foam that gently lifts citrus oils onto the palate without gas heaviness.'
    },
    {
      question: 'Do you use any monk fruit, stevia, or chemical sweeteners?',
      answer:
        'Zero. We believe artificial sugar alternatives destroy beverage finishes with persistent synthetic bitterness. We capture natural fruit sugars through cryogenic vacuum distillation, balanced by less than 2g of raw organic agave per can.'
    },
    {
      question: 'What is the recommended temperature & pour ritual?',
      answer:
        'Hard-chill between 3°C and 5°C. For maximum sensory effect, gently invert the can once to circulate the nitrogen, crack the tab with authority, and pour vertically into a stemless glass to watch the draught foam cascade.'
    },
    {
      question: 'How does carbon-neutral cold shipping work?',
      answer:
        'All orders over $45 ship free in our custom biodegradable molded insulation mailers. We offset 100% of freight carbon emissions through certified forest restoration programs.'
    }
  ];

  toggle(i: number): void {
    this.open.update(cur => (cur === i ? null : i));
  }
}
