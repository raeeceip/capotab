# CapoTab

Guitar chord shape visualizer with capo transposition. Search any song, see the shapes, hear the chords.

**Live:** [capotab.pages.dev](https://capotab.pages.dev)

## What it does

- **Transpose any chord** — enter chords + capo position, see the exact fretboard shapes to play
- **CAGED shape generation** — algorithmically generates barre chord diagrams for all 72 chord types (12 notes x 6 qualities), not just a handful of hardcoded shapes
- **Song search** — live search powered by MusicBrainz (millions of recordings). Popular songs have chords cached locally for instant results
- **AI chord lookup** — click any song from search, Claude fetches the chords automatically (optional, needs API key)
- **Key detection** — identifies the key, maps each chord to its roman numeral function (I, IV, V, vi...), names the progression pattern
- **Progression analysis** — matches against known patterns (Pop I-V-vi-IV, Blues I-IV-V, etc.), finds similar songs from the database
- **Playback** — plays back chord progressions with selectable strum patterns, BPM control, and algorithmically computed voicings from shape geometry
- **Learn tab** — explains capo theory, shows shape-vs-chord relationships, filterable chord library

## Stack

- React + TypeScript + Vite
- Tone.js for audio synthesis
- Cloudflare Pages (hosting + functions)
- MusicBrainz API (song search, proxied via Pages Function)
- Claude API (optional, for AI analysis + chord lookup)

## Project structure

```
src/
  lib/
    cagedShapes.ts    — CAGED barre chord templates + shape generator
    chordShapes.ts    — static open chord shape definitions
    transpose.ts      — transposition engine + key detection
    chordAudio.ts     — shape geometry to playable notes
    localAnalysis.ts  — in-browser progression analysis
    musicSearch.ts    — MusicBrainz search client + AI chord fetcher
    songDatabase.ts   — local chord cache (39 popular songs)
    drawFretboard.ts  — canvas fretboard renderer
    ai.ts             — Claude API integration
  components/         — UI components (ChordCard, FretboardCanvas, etc.)
  tabs/               — SearchTab, LearnTab, PlaybackTab
  types/              — TypeScript interfaces
functions/
  api/search.ts       — Cloudflare Pages Function (MusicBrainz proxy)
```

## Run locally

```bash
npm install
npm run dev
```

The Vite dev server proxies `/api/search` to MusicBrainz directly so song search works without Cloudflare.

For AI features, create a `.env` file:

```
VITE_ANTHROPIC_API_KEY=your_key_here
```

## Build

```bash
npm run build
```

## Deploy

Deployed on Cloudflare Pages. Push to `main` or deploy manually:

```bash
npx wrangler pages deploy dist --project-name capotab
```

The `functions/` directory is automatically detected and bundled as a Pages Function.
