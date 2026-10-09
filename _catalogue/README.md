# Project 1900 ST — Art Catalogue, Issue 01

A static online viewing room for twelve fictional contemporary works, built as an
**archival index**: warm paper, hairline ink rules, oversized display serif, and each
work presented as a numbered plate in a printed catalogue raisonné.

No build step, no dependencies, no bundler. Open `index.html`.

```bash
# works from the filesystem, but a local server is nicer for caching and fonts
python -m http.server 8000
# → http://localhost:8000
```

## What's here

| Path | |
|---|---|
| `index.html` | Every section of the page. Content lives in markup; plates are injected. |
| `styles/` | One stylesheet per concern, loaded in cascade order. |
| `js/` | Classic scripts on a `window.P1900` namespace — no modules, so `file://` works. |
| `_wireframe/` | The original wireframe this was built from, kept for reference. |
| `output/playwright/` | Screenshots from the browser checks. |

### Stylesheets

`tokens.css` holds every colour, type size, space step, duration and z-index. Nothing
downstream hardcodes a value. `base.css` is the reset plus shared controls; the rest map
to regions of the page (`masthead`, `hero`, `catalogue`, `sections`, `panels`, `motion`).

### Scripts

Loaded with `defer` in dependency order; `main.js` boots everything.

| Module | Responsibility |
|---|---|
| `works.js` | The catalogue record — the single source of truth for all twelve plates. |
| `plates.js` | Draws each work as an SVG (see below). |
| `catalogue.js` | Builds the grid; filter, search and sort. |
| `shortlist.js` | Shortlist state, `localStorage`, and the `shortlist:change` event. |
| `entry.js` | The full catalogue entry in a native `<dialog>`. |
| `panels.js` | Side drawers, scrim, and the shared scroll lock. |
| `motion.js` | Scroll reveals, switched off under `prefers-reduced-motion`. |
| `main.js` | Boot order, sticky geometry, enquiry form. |

## The plates

There is no photography for a catalogue that does not exist, so every work is **drawn at
runtime**. `plates.js` seeds a small PRNG from the plate number and runs one of four
recipes — painting (overlapping pigment fields and a horizon), print (flat shapes,
deliberately out of register), sculpture (an object on a plinth line with its cast
shadow), photograph (tonal wash under a halftone screen). The same plate number always
produces the same image, in the grid and in the dialog alike.

To add a work, add a record to `works.js`. Nothing else needs touching: counts, filters,
sorting, the shortlist and the plate image all derive from it.

## Behaviour

- Filter by medium, free-text search across title/artist/materials/edition/year, and four
  sort orders. Counts beside each filter reflect the current search.
- Click any plate for the full entry; arrow keys move between plates, Escape closes.
- Shortlist survives a reload, totals prices (handling "on request" and sold works), and
  attaches itself to the enquiry form.
- Selecting an artist searches the catalogue for that name, so the state stays visible in
  the search field instead of hiding in a filter.

## Verified

Checked in Chromium at 390 / 820 / 1440 px: no console errors, no horizontal overflow,
`prefers-reduced-motion` reveals everything immediately, closed panels are `inert`, the
skip link is the first tab stop, and text contrast is 5.3:1 or better throughout.

The enquiry form validates and reports, but sends nothing — there is no backend, and every
work, artist, price and provenance line here is invented.
