# What changed

## Performance and scroll
- Animation loop, Lenis and ScrollTrigger now run outside Angular's zone (previously Angular ran change detection on every animation frame and scroll event).
- Navbar scroll state, details-slider wheel/touch handling and autoplay no longer trigger change detection.
- Hero frames stream in progressively (first frame is a real `<img>` for instant paint) instead of blocking the page behind a 190-image loader. Phones load every 2nd frame.
- Removed CSS `transition-all` that fought GSAP on the hero text, and fixed hero text phases stacking vertically (they now overlay).
- Hero images converted to WebP: frames 21 MB -> 11.6 MB, details art 1.8 MB -> 0.3 MB (cans tightly cropped so they render large).
- Hero pin distance scales with viewport height; canvas capped at 1.5x DPR; `100svh` for stable mobile height.
- Gzip/Brotli compression + sensible cache headers in `server.ts` (needs `npm install` for the new `compression` dependency).
- Scroll-reveal uses one shared IntersectionObserver (pure CSS transitions).

## Layout and UI
- All 9 sections are now on the page (Benefits, Taste Profile, Reviews, FAQ, Newsletter were built but never rendered). They were restyled from the old wine/serif/mono look into the same minimal system.
- One set of tokens: `ink` / `surface` / `card` backgrounds alternate by section; shared `.btn-*`, `.eyebrow`, `.h-section`, `.container-x`.
- Collection is a responsive grid (2-up on phones, 2 large + 3 small on desktop) with badges.
- Footer simplified (newsletter moved to its own section).
- Fully responsive down to 360px; no horizontal overflow.

## Features added or fixed
- Mobile menu (there was no navigation on phones), active-section highlight, page progress line.
- Cart: starts empty, discount recalculates with quantity, free-shipping progress bar, focus trap, Esc to close, scroll lock, empty-bag state, hydration-safe persistence.
- Quick view: pack-size selector, Esc to close, bottom-sheet on phones.
- Taste Profile: sweetness/carbonation/bitterness meters, pack selector.
- Editions slider: autoplay only while visible and stops once the visitor interacts; swipe ignores vertical scrolling; hidden slides are not focusable; keyboard arrows.
- Reviews and FAQ: accessible, smooth cross-fade / height animation.
- Newsletter: email validation with inline error.
- Skip-to-content link, `prefers-reduced-motion` support, meta description / theme colour / social tags.

## Content fixes (please review)
- Product names/images now match the can artwork (Strawberry, Lime, Blueberry, Black Coffee, Original). Before, "STAG NITRO" showed the coffee can, etc.
- Prices unified between Collection and Details (Lime $20, Original $18, Black Coffee $22). Edit in `product.service.ts`.
- Removed invented claims: "99/100 score", press logos ("Awwwards", "Vogue"), "±0.01% accuracy", "190 frames - 60 FPS".
- Reviews are placeholders. Replace with real quotes before launch.

## Files removed
- `button.component.ts` (unused and would not compile) and the old image folders (replaced by WebP versions in `src/app/assests/{scroll,products,details}`).
- Cart storage key is now `stag_cart_v2`, so old saved carts are ignored.
