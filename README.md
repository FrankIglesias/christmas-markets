# Europe's Best Christmas Markets

An interactive map of Christmas markets across Europe for the 2026/2027 season.

## Features

- **Map** — 96 markets plotted on a dark Leaflet/Esri canvas, with rank badges,
  tier colours and per-market popups.
- **Search** — matches market name, city, country, region, food and notes.
- **Filters** — All / To visit / Visited, with a progress bar for season tracking.
- **Sorting** — by rank, A–Z, or region.
- **Calendar** — November/December/January grids showing which markets are open
  on each day, with a per-day modal listing everything available.
- **Persistent state** — visited markets and filter preferences are saved to
  `localStorage`, so your list survives a reload.

## Getting started

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Scripts

| Command           | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start the dev server with hot reload          |
| `npm run build`   | Produce a production build in `dist/`         |
| `npm run preview` | Serve the production build locally            |
| `npm run check`   | Type-check with `svelte-check` and `tsc`      |

## Tech

Svelte 5 (runes) · Vite · TypeScript · Leaflet

Market data lives in `src/lib/data/`. The dataset is merged and de-duplicated
by coordinate in `src/lib/markets.ts`, which also derives tiers, assigns ranks
and parses the date ranges used by the calendar.

No API keys are required — the base map tiles are served by Esri.