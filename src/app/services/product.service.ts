import { Injectable, signal } from '@angular/core';

export interface PackOption {
  name: string;
  price: number;
  perCan: string;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  price: number; // 4-pack price
  image: string;
  badge?: string;
  rating?: number;
  reviewsCount?: number;
  notes: string[];
  description: string;
  profile: {
    sweetness: string;
    carbonation: string;
    bitterness: string;
    body: string;
  };
  packs: PackOption[];
}

const PACK_SIZES: { name: string; cans: number }[] = [
  { name: '4-Pack (355ml)', cans: 4 },
  { name: '12-Pack Case', cans: 12 },
  { name: '24-Pack Fridge Master', cans: 24 }
];

/** Builds the three pack options from their prices. */
function packs(p4: number, p12: number, p24: number): PackOption[] {
  return [p4, p12, p24].map((price, i) => ({
    name: PACK_SIZES[i].name,
    price,
    perCan: '$' + (price / PACK_SIZES[i].cans).toFixed(2) + ' / can'
  }));
}

/**
 * Single source of truth for every product on the page
 * (collection grid, taste profile, details slider, quick view and bag).
 * Names and images match the actual can artwork.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  readonly products = signal<Product[]>([
    {
      id: 'stag-strawberry',
      name: 'STAG STRAWBERRY',
      subtitle: 'Cold-Pressed Alpine Strawberry & Micro-Nitro Foam',
      category: 'Fruit',
      price: 20,
      rating: 4.99,
      reviewsCount: 312,
      image: '/assets/products/strawberry.webp',
      badge: 'Hero Pour',
      notes: ['Mountain Strawberry', 'Micro-Nitro Foam', 'Cold-Steeped Agave', 'Basalt Spring Water'],
      description:
        'The formulation featured in our live pour sequence. Sourced from ripe high-altitude strawberries, cold-distilled and infused with micro-nitro for a velvet draught foam.',
      profile: {
        sweetness: 'Crisp Wild Berry (2/5)',
        carbonation: 'Micro-Nitro Velvet (5/5)',
        bitterness: 'Botanical Zest (1/5)',
        body: 'Creamy Effervescent'
      },
      packs: packs(20, 54, 96)
    },
    {
      id: 'stag-lime',
      name: 'STAG LIME',
      subtitle: 'Cold-Pressed Tahitian Lime & Japanese Yuzu',
      category: 'Citrus',
      price: 20,
      rating: 4.96,
      reviewsCount: 184,
      image: '/assets/products/lime.webp',
      badge: 'Bestseller',
      notes: ['Tahitian Lime', 'Japanese Yuzu', 'Maldon Flake Sea Salt', 'Pure Basalt Water'],
      description:
        'Zesty, electric, and razor-sharp. Hand-harvested Tahitian lime zest paired with Japanese yuzu over ultra-fine micro-bubbles. Engineered for sensory revival with 0g synthetic sweeteners.',
      profile: {
        sweetness: 'Bone Dry & Crisp (1/5)',
        carbonation: 'High / Sharp (5/5)',
        bitterness: 'Aromatic Peel (2/5)',
        body: 'Hyper-Crisp & Weightless'
      },
      packs: packs(20, 54, 96)
    },
    {
      id: 'stag-blueberry',
      name: 'STAG BLUEBERRY',
      subtitle: 'Wild Bilberry & Hand-Rubbed Lavender',
      category: 'Botanical',
      price: 18,
      rating: 4.94,
      reviewsCount: 142,
      image: '/assets/products/blueberry.webp',
      badge: 'Limited Run',
      notes: ['Wild Bilberry', 'French Mountain Lavender', 'Juniper Berry', 'Raw Organic Nectar'],
      description:
        'Deep indigo richness steeped with wild bilberries and hand-rubbed organic lavender blossoms. An intoxicating floral bouquet followed by a crisp, cleansing mineral spine.',
      profile: {
        sweetness: 'Delicate Floral Berry (2/5)',
        carbonation: 'Medium Champagne (3/5)',
        bitterness: 'Herbaceous (2/5)',
        body: 'Silky Smooth'
      },
      packs: packs(18, 48, 86)
    },
    {
      id: 'stag-black-coffee',
      name: 'STAG BLACK COFFEE',
      subtitle: 'Cold-Steeped Arabica Micro-Sparkler',
      category: 'Coffee',
      price: 22,
      image: '/assets/products/black-coffee.webp',
      badge: 'Cold Brew',
      notes: ['Single-Origin Arabica', 'Cold-Steeped Agave', 'Madagascar Vanilla', 'Velvet Crema Bubbles'],
      description:
        'Single-origin high-altitude Arabica cold-distilled over 24 hours. Dark cacao aroma and roasted vanilla notes, lifted with champagne-grade fine effervescence.',
      profile: {
        sweetness: 'Dark Cacao, Low (1/5)',
        carbonation: 'Champagne Fine (3/5)',
        bitterness: 'Roasted Arabica (3/5)',
        body: 'Velvet Crema'
      },
      packs: packs(22, 58, 104)
    },
    {
      id: 'stag-original',
      name: 'STAG ORIGINAL',
      subtitle: 'Volcanic Basalt Spring Sparkler',
      category: 'Original',
      price: 18,
      rating: 4.91,
      reviewsCount: 220,
      image: '/assets/products/original.webp',
      badge: 'Pure Mineral',
      notes: ['Cascade Mountain Melt', 'Natural Magnesium', 'Potassium Ions', 'Needle-Point CO2'],
      description:
        'Filtered through volcanic basalt strata over 4,000 years. Untouched alpine water naturally rich in electrolytes and charged with needle-point carbonation. Zero sugar.',
      profile: {
        sweetness: 'Zero Sugar (0/5)',
        carbonation: 'Needle Point (5/5)',
        bitterness: 'Clean Mineral (0/5)',
        body: 'Pristine & Ultra-Light'
      },
      packs: packs(18, 48, 86)
    }
  ]);

  byId(id: string): Product | undefined {
    return this.products().find(p => p.id === id);
  }
}
