# PROJECT 1900 ST

A static storefront for a fictional clothing label that sells in timed drops.
Utility-brutalist: flat ground, one monospace, one alarm red, no chrome. Garments are
drawn as SVG at runtime rather than photographed.

No build step, no dependencies, no bundler.

```bash
python -m http.server 8000
# → http://localhost:8000
```

## Status — the storefront does not run yet

The markup and the stylesheets are finished. The behaviour is not. As it stands,
`index.html` loads ten scripts and **six of them do not exist**, and two of the four that
do are left over from a different project.

Open the console and you get six 404s, then a `TypeError` from `main.js` before anything
boots. The page still renders — the stylesheets are fine — but it is frozen: the grid
stays empty, and the cart, dialog, theme toggle and countdown are all inert.

| `js/` | |
|---|---|
| `products.js` | **Done.** The release record — twelve garments. |
| `motion.js` | **Reusable.** Generic: observes `[data-reveal]`, honours `prefers-reduced-motion`. |
| `main.js` | **Stale.** Catalogue-era. Boots `shortlist`/`entry`/`catalogue`, measures `.masthead`, wires `#enquiryForm` — none of which exist here. |
| `panels.js` | **Stale.** Catalogue-era. Registers `#drawer`/`#menuButton`/`#shortlistPanel`; only `#scrim` still exists. |
| `garments.js` | Missing. |
| `shop.js` | Missing. |
| `cart.js` | Missing. |
| `product.js` | Missing. |
| `theme.js` | Missing. |
| `countdown.js` | Missing. |

This is a clean mid-migration state, not damage. The catalogue that used to live at the
root was moved into `_catalogue/` intact, the shop was rebuilt over it markup-first, and
work stopped after the data module. `main.js` and `panels.js` simply predate the move.

### What the markup expects

Each missing module has its DOM already in place, so the contract is fixed. Every ID below
exists in `index.html` today.

| Module | Drives |
|---|---|
| `garments.js` | Draws a garment as SVG from a product's `cut`, `print` and `palette`. Styled via `.product-figure svg`; also fills `#markEmblem`. |
| `shop.js` | Builds `.product-card`s into `#productGrid`. Rail filters (`[data-filter]`), `#searchInput`, `#collectionName`, `#resultCount`, `#clearSearch`, `#emptyState`, `[data-reset]`. Marks sold-out cards `data-state="soldout"`. |
| `cart.js` | `#cartPanel` — `#cartItems`, `#cartCount`, `#cartTotal`, `#cartEmpty`, `#cartFoot`, `#clearCart`, `#cartCheckout`. Persistence is a choice, not a given. |
| `product.js` | The `<dialog id="productDialog">` — `#productFigure`, `#productTitle`, `#productPrice`, `#productCopy`, `#productSpec`, `#sizeSet`, `#sizeNote`, `#productAdd`, and `#productPrev`/`#productNext`. |
| `theme.js` | `#themeToggle` → `data-theme="dark"` on `:root`. The dark palette is already defined in `tokens.css`. |
| `countdown.js` | `#clockDays`/`#clockHours`/`#clockMins`/`#clockSecs`, plus `#clockText` for the screen-reader status. |

`main.js` and `panels.js` need rewriting against the shop's DOM: the panel register is now
the cart alone (`#cartPanel` / `#cartButton` / `#closeCartButton`), the rail gets a
`#railToggle` and `#railScrim` on narrow screens, and the form to wire is `#signupForm`,
not an enquiry form. `motion.js` can be left alone.

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
