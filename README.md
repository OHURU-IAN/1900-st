# PROJECT 1900 ST

A static storefront for a fictional clothing label that sells in timed drops.
Utility-brutalist: flat ground, one monospace, one alarm red, no chrome. Garments are
drawn as SVG at runtime rather than photographed.

No build step, no dependencies, no bundler.

```bash
python -m http.server 8000
# → http://localhost:8000
```

Live at <https://ohuru-ian.github.io/1900-st/>. Every asset URL in `index.html` carries a
`?v=N` tag; bump it on each deploy that changes CSS or JS so browsers drop cached copies.

## Scripts

All plain scripts sharing a `window.P1900` namespace, loaded with `defer` in this order:
`products` → `dom` → `garments` → `shop` → `cart` → `product` → `panels` → `theme` →
`countdown` → `motion` → `main` (which boots them).

| Module | Drives |
|---|---|
| `products.js` | The release record — twelve garments, plus derived helpers. |
| `dom.js` | The shared element helper. Text always goes in as `textContent`. |
| `panels.js` | The cart panel, the rail as a drawer below 60rem, their scrims, and the shared scroll lock. |
| `motion.js` | Scroll reveals on `[data-reveal]`; honours `prefers-reduced-motion`. |
| `main.js` | Boot order, reveal targets, and the `#signupForm` newsletter form. |
| `garments.js` | Draws a garment as SVG from a product's `cut`, `print` and `palette`. Styled via `.product-figure svg`; also fills `#markEmblem`. |
| `shop.js` | Builds `.product-card`s into `#productGrid`. Rail filters (`[data-filter]`), `#searchInput`, `#collectionName`, `#resultCount`, `#clearSearch`, `#emptyState`, `[data-reset]`. Marks sold-out cards `data-state="soldout"`. |
| `cart.js` | `#cartPanel` — `#cartItems`, `#cartCount`, `#cartTotal`, `#cartEmpty`, `#cartFoot`, `#clearCart`, `#cartCheckout`. Persistence is a choice, not a given. |
| `product.js` | The `<dialog id="productDialog">` — `#productFigure`, `#productTitle`, `#productPrice`, `#productCopy`, `#productSpec`, `#sizeSet`, `#sizeNote`, `#productAdd`, and `#productPrev`/`#productNext`. |
| `theme.js` | `#themeToggle` → `data-theme="dark"` on `:root`. The dark palette is already defined in `tokens.css`. |
| `countdown.js` | `#clockDays`/`#clockHours`/`#clockMins`/`#clockSecs`, plus `#clockText` for the screen-reader status. |

The cart persists in `localStorage` (and works for the visit if storage is blocked). The
countdown is theatre: the drop "closes" every Friday at 18:00 local time and rolls over.

### Breakpoints

| Width | Layout |
|---|---|
| > 60rem | Fixed rail, three-column grid, two-column product dialog. |
| ≤ 60rem | Rail becomes a drawer under the top bar (Menu button); dialog stacks. |
| ≤ 48rem | Two-column grid; quick-add always visible (also on any touch device). |
| ≤ 40rem | Search collapses to an icon that opens a field; dialog becomes a full-screen sheet. |
| ≤ 30rem | One-column grid; top-bar Checkout link hidden (checkout is in the cart). |

Touch devices get 44px targets on the cart's quantity and remove controls.

## The record

`js/products.js` is the single source of truth. Each garment carries `cut`, `print` and a
four-stop `palette` (shell, rib, trim, print) that `garments.js` draws from, plus a
`sizes` map of size → units held. Stock, sold-out state, the size list and the collection
counts are all derived from that map, so there is no second place to update when something
sells through.

Add a garment by adding a record. Nothing else should need touching.

## Styles

Complete, and loaded in cascade order. `tokens.css` holds every colour, type size,
measure, duration and z-index for both themes; nothing downstream hardcodes a value. The
rest map to regions: `base`, `rail`, `topbar`, `shop`, `pages`, `panels`, `drop`,
`motion`.

## The rest of the directory

| Path | |
|---|---|
| `_catalogue/` | A **separate, finished** project — an art catalogue raisonné. Self-contained and working; it has its own README. |
| `_wireframe/` | The catalogue's original wireframe. |
| `output/playwright/` | Screenshots of the catalogue, taken before the shop existed. None show this storefront. |

`_catalogue/` is not a dependency of the shop and the shop is not a dependency of it. They
share a `window.P1900` namespace and a house style, nothing more.

## Notes

Every product, price, policy and date here is invented. There is no backend: no payment is
taken and no address is collected. The countdown is theatre.
