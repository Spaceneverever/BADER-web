# BLACKSITE

A hacker-inspired personal portfolio. Vite, Three.js, GSAP, no backend.

## Run it

```bash
npm install
npm run dev       # local dev server
npm run build     # production build in dist/
npm run preview   # serve the build
```

## Make it yours

Everything personal lives in `src/data/content.js` (name, Arabic name, copy, links, projects):

- `identity.name` (hero, top bar), `identity.nameAr` (identity section, footer), `identity.label`, `identity.location`
- `identity.portrait`: put a photo in `public/` (e.g. `public/portrait.jpg`) and set this to `'./portrait.jpg'`. It is shown black and white.
- `profile`: summary, interests, creative direction
- `contact.email` and `contact.channels`: anything left `null` shows as PENDING, never as a dead link
- `projects`: the archive. Replace the two `PLACEHOLDER` slots with real work (status `PUBLISHED` plus a `link`).

Before deploying, add `og:url` and an absolute `og:image` in `index.html` (marked `DEPLOY STEP`).

## Structure

- `index.html`: semantic page shell and SEO metadata
- `src/main.js`: wiring, scroll motion, nav, clock, reduced motion
- `src/modules/boot.js`: start sequence (fictional, skippable with Esc/Enter or the button; skipped entirely with reduced motion)
- `src/modules/core.js`: the WebGL core (shader sphere, wire shell, particles), lazy-loaded, with an SVG fallback
- `src/modules/archive.js`, `visuals.js`: archive grid, filters, case-file dialog, procedural previews
- `src/modules/terminal.js`: simulated shell (fixed command table, executes nothing)
- `src/modules/field.js`: SIGNAL_FIELD canvas experiment
- `src/styles/`: tokens and base, layout chrome, sections
- `src/fonts/`: self-hosted Noto Kufi Arabic for the Arabic name (SIL Open Font License)
