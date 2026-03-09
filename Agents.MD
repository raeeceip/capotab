# AGENTS.md — CapoTab Vite Application

> Agent instructions for building out the full CapoTab app.
> Preserve the existing design system exactly. Do not deviate from colors, fonts, or layout patterns.

---

## Project Overview

**CapoTab** is a guitar chord analyzer that shows players the actual fingering shapes used when a capo is present — not just the theoretical chord name. Built with Vite + React + TypeScript.

Three tabs: **Search**, **Learn**, **Playback**

---

## Design System (FROZEN — do not change)

All agents must preserve these exactly. No substitutions.

### Fonts
```css
/* Google Fonts — already imported */
font-family: 'Syne', sans-serif;       /* headings, UI labels, buttons */
font-family: 'DM Mono', monospace;     /* code, labels, metadata, chord names */
```

### Color Tokens
```css
:root {
  --bg: #0d0d0f;
  --surface: #141416;
  --surface2: #1c1c20;
  --border: #2a2a30;
  --accent: #e8ff5a;       /* yellow-green — primary highlight, chord names */
  --accent2: #5affd8;      /* teal — secondary highlight, open strings, capo */
  --text: #f0f0f0;
  --muted: #6b6b7a;
  --dot: #e8ff5a;
  --open: #5affd8;
  --muted-note: #ff5a7a;   /* red-pink — muted strings, errors */
}
```

### Component Patterns
- Cards: `background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem;`
- Inputs/selects: `background: var(--surface2); border: 1px solid var(--border); border-radius: 8px;`
- Focus state: `border-color: var(--accent)`
- Primary button: `background: var(--accent); color: #0d0d0f; font-family: Syne; font-weight: 700;`
- Chips: `background: var(--surface2); border: 1px solid var(--border); border-radius: 6px;`
- Hover on chips: `border-color: var(--accent); color: var(--accent);`
- Section labels: `font-family: DM Mono; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--muted);` with a `::after` line rule
- Animation: `fadeSlide` — `from { opacity:0; transform: translateY(12px) }` with staggered `animation-delay` per card
- Grain overlay: fixed `::before` pseudo with SVG fractalNoise, `opacity: 0.4`, `pointer-events: none`

### Fretboard Canvas Style
- Background: `#141416`
- Nut: `#f0f0f0` — 5px tall rect at top when startFret === 1
- Fret lines: `#2a2a32`
- Strings: `#3a3a42`, thickness scales with string index
- Finger dot: filled `#e8ff5a` circle
- Open string: stroked `#5affd8` circle above nut
- Muted string: `#ff5a7a` X mark above nut
- Barre: `rgba(232,255,90,0.18)` fill + `#e8ff5a` stroke pill shape using `roundRect`
- Capo label: `#5affd8` text top-left of canvas when capo > 0
- Canvas size: `width=180 height=250` (logical px)

---

## Project Structure

```
capotab/
├── AGENTS.md
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── src/
│   ├── main.tsx
│   ├── App.tsx                  # Tab router — Search / Learn / Playback
│   ├── index.css                # Global styles, CSS vars, grain overlay, fonts
│   ├── components/
│   │   ├── Header.tsx           # Logo + tagline + tab nav
│   │   ├── TabNav.tsx           # Search | Learn | Playback tab switcher
│   │   ├── ChordCard.tsx        # Single chord card with canvas diagram
│   │   ├── FretboardCanvas.tsx  # Canvas drawing logic (extracted from HTML prototype)
│   │   ├── CapoStrip.tsx        # "Capo N — transposition info" banner
│   │   ├── SectionLabel.tsx     # Uppercase mono label with ::after line
│   │   ├── Legend.tsx           # Dot/open/muted/barre legend row
│   │   └── Chip.tsx             # Clickable preset chip
│   ├── tabs/
│   │   ├── SearchTab.tsx        # Main chord input + results grid
│   │   ├── LearnTab.tsx         # Shape explanations, theory, AI breakdowns
│   │   └── PlaybackTab.tsx      # Audio playback + strum pattern
│   ├── lib/
│   │   ├── chordShapes.ts       # Full chord shape database
│   │   ├── transpose.ts         # Note/chord transposition logic
│   │   ├── drawFretboard.ts     # Pure canvas drawing function
│   │   └── ai.ts                # Anthropic API wrapper
│   └── types/
│       └── index.ts             # ChordShape, AnalysisResult, Tab types
```

---

## Dependency Stack

```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "vite": "^5",
    "@vitejs/plugin-react": "^4",
    "typescript": "^5"
  }
}
```

No CSS framework. No component library. Styles are handwritten CSS matching the prototype.
Tone.js added only when implementing Playback tab (lazy import).

---

## Types (`src/types/index.ts`)

```ts
export type TabName = 'search' | 'learn' | 'playback';

export interface FingerPosition {
  string: number;   // 1 = high e, 6 = low E
  fret: number;
}

export interface BarrePosition {
  fret: number;
  from: number;     // lowest string number in barre
  to: number;       // highest string number
}

export interface ChordShape {
  fingers: FingerPosition[];
  open: number[];       // open string numbers
  muted: number[];      // muted string numbers
  barre?: BarrePosition;
  label: string;        // e.g. "G shape", "Bm (barre)"
}

export interface ChordResult {
  soundingChord: string;   // what the chord sounds like (e.g. "A")
  shapeName: string;       // the open-string shape used (e.g. "G" with capo 2)
  shape: ChordShape | null;
  capo: number;
}

export interface AIAnalysis {
  progression: string;
  key: string;
  capoRationale: string;     // why a guitarist would use this capo position
  chordExplanations: {
    chord: string;
    shape: string;
    why: string;             // why this shape is used / how it relates to the key
    theory: string;          // music theory note (e.g. "IV chord in G major")
  }[];
  playabilityNote: string;   // e.g. "All open shapes — beginner friendly"
  similarSongs: string[];
}
```

---

## Module: `src/lib/chordShapes.ts`

Port the `CHORD_SHAPES` object from the HTML prototype verbatim. Type it as `Record<string, ChordShape>`.

Extend with these additional shapes (implement them):
- `Cadd9`, `Gsus2`, `Dsus2`, `Dsus4`, `Asus2`, `Asus4`
- `E7`, `A7`, `G7`, `D7`, `B7`
- `Cmaj7`, `Dmaj7`, `Fmaj7`, `Gmaj7`, `Amaj7`
- `Dm7`, `Em7`, `Am7`
- Power chords: `E5`, `A5`, `D5`, `G5`

---

## Module: `src/lib/transpose.ts`

Port `NOTE_NAMES`, `ENHARMONIC`, `normalizeNote`, `getNoteIndex`, `transposeChord`, `getShapeForCapo` from prototype verbatim.

Add:
```ts
// Returns the key that results from playing open shapes with capo on fret N
export function getCapoKey(openKey: string, capo: number): string

// Given a sounding chord list, guess the most likely key
export function guessKey(chords: string[]): string

// Returns all chords in a given key (diatonic triads)
export function getDiatonicChords(key: string): string[]
```

---

## Module: `src/lib/drawFretboard.ts`

Extract `drawChord(canvas, shapeKey, capo, soundingChord)` from prototype exactly. Accept typed args:

```ts
export function drawFretboard(
  canvas: HTMLCanvasElement,
  shape: ChordShape | null,
  capo: number,
  shapeName: string
): void
```

Keep all canvas constants identical. Do not change colors or geometry.

---

## Module: `src/lib/ai.ts`

Uses the Anthropic API (`claude-sonnet-4-20250514`, `max_tokens: 1000`).

```ts
export async function analyzeProgression(
  chords: string[],
  capo: number
): Promise<AIAnalysis>
```

System prompt (use verbatim):
```
You are a guitar theory expert. You explain chord progressions and capo usage clearly and concisely, as if talking to an intermediate guitarist. Be direct — no filler. Respond ONLY with valid JSON matching the AIAnalysis schema provided. No markdown fences, no preamble.
```

User prompt template:
```
Analyze this guitar chord progression:
Chords: {chords}
Capo: {capo} (these are the SOUNDING chords; the player uses capo {capo} and plays shapes transposed down {capo} semitones)

Return JSON with this exact structure:
{
  "progression": "string — name or description of this progression",
  "key": "string — likely key",
  "capoRationale": "string — why a guitarist would use this capo position",
  "chordExplanations": [
    {
      "chord": "sounding chord name",
      "shape": "open-string shape name",
      "why": "why this shape is used",
      "theory": "role in the key (e.g. I, IV, V)"
    }
  ],
  "playabilityNote": "string — difficulty/beginner notes",
  "similarSongs": ["song 1", "song 2", "song 3"]
}
```

Error handling: if API fails, return a fallback `AIAnalysis` with `progression: "Analysis unavailable"` and empty arrays.

---

## Tab 1: Search (`src/tabs/SearchTab.tsx`)

Directly mirrors the HTML prototype layout. Components used:
- `CapoStrip` — shown when capo > 0
- `SectionLabel`
- `Legend`
- `ChordCard` grid (CSS grid, `repeat(auto-fill, minmax(180px, 1fr))`, gap 1.5rem)
- Preset chips row

State:
```ts
const [input, setInput] = useState('G D Em C');
const [capo, setCapo] = useState(2);
const [results, setResults] = useState<ChordResult[]>([]);
const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
const [loading, setLoading] = useState(false);
```

On analyze:
1. Parse chords, deduplicate
2. Build `ChordResult[]` using `getShapeForCapo`
3. Render chord cards immediately
4. Fire `analyzeProgression` async — show loading state in the AI panel below the grid
5. Render `AIPanel` component once analysis arrives (see below)

### AIPanel component (inside SearchTab or separate)
Appears below the chord grid after AI analysis completes. Dark card, teal accent.

Sections:
- **Progression** — name + key badge
- **Capo rationale** — why capo here
- **Similar songs** — chips row
- **Playability note** — DM Mono small text

Animate in with `fadeSlide`.

---

## Tab 2: Learn (`src/tabs/LearnTab.tsx`)

Purpose: interactive music theory education tied to the current chord set from SearchTab. Share state via lifted state in `App.tsx` or a simple context.

### Layout

```
[ Section: What is a capo? ]
[ Section: Shape vs. Chord — the key concept ]
[ Section: Your progression breakdown ]   ← populated from last Search
[ Section: Chord shape library ]          ← browseable
[ Section: Common capo positions ]
```

### "What is a capo?" section
Static explainer card. Two-column on desktop: left is text, right is a small decorative fretboard canvas showing the same open G shape before/after capo visual (just illustrative, drawn with `drawFretboard`).

Content:
> A capo clamps across all strings at a given fret, effectively raising the pitch of every open string. This lets guitarists use simple open-chord shapes to play in keys that would otherwise require difficult barre chords.

### "Shape vs. Chord" section
Side-by-side comparison: two `ChordCard`s.
- Left: "Without capo — G shape sounds like G"
- Right: "Capo 2 — G shape sounds like A"

Accent label between them: `→ same fingers, different sound`

### "Your progression breakdown" section
Only shown if a Search has been performed. For each chord in the last search result:
- Large chord name (accent color)
- Shape name (teal)
- AI `why` field as body text
- AI `theory` field as a small mono badge (e.g. `I`, `IV`, `V`, `vi`)
- The `ChordCard` diagram inline

Layout: vertical stacked cards, full-width, alternating left/right chord diagram placement on desktop.

### "Chord shape library" section
Browseable grid of ALL shapes in `chordShapes.ts`. Filter chips at top:
- `All` `Open` `Barre` `7th` `Suspended` `Power`

Each card: same `ChordCard` component, no capo offset (capo=0), shape label shown.

### "Common capo positions" section
Static table-style cards, one per common capo:

| Capo | Common keys | Why guitarists use it |
|------|-------------|----------------------|
| 2    | A, B        | Play G/D/Em shapes in A — bright, open sound |
| 3    | Bb, C       | Play G/A shapes in Bb — common in folk/pop |
| 4    | B, C#       | Play G/D shapes in B — common in singer-songwriter |
| 5    | C, D        | Play G/C shapes in C — eliminates barre F |

Render as horizontal scrollable row of info cards with accent border-left.

---

## Tab 3: Playback (`src/tabs/PlaybackTab.tsx`)

Purpose: strum chords in-browser to hear them, visualize the timing.

### Dependencies
```ts
import * as Tone from 'tone'; // lazy import only when tab is active
```

### Layout
```
[ Chord sequence bar ]     ← from last Search, or enter manually
[ Strumming pattern selector ]
[ BPM slider ]
[ Play / Stop button ]
[ Active chord highlighter ]
[ Fretboard of currently playing chord ]
```

### Chord sequence bar
Horizontal scrollable row of chord chips. Active chord highlighted with `--accent` background + `color: #0d0d0f`.

### Strumming patterns
```ts
const PATTERNS = {
  'Down only':      ['D','D','D','D'],
  'Down-Up':        ['D','U','D','U','D','U','D','U'],
  'Folk (3/4)':     ['D','D','U','D','U'],
  'Pop ballad':     ['D','_','DU','_','DU','_'],
};
```

Each pattern step fires a strum sound. Use Tone.js `PolySynth` with guitar-like envelope:
```ts
const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.005, decay: 0.3, sustain: 0.1, release: 0.8 }
}).toDestination();
```

### Chord-to-notes mapping
```ts
// Each chord maps to an array of note strings for Tone.js
// e.g. G → ['G2','B2','D3','G3','B3','G4']
// Factor in capo transposition when generating notes
export function chordToNotes(shapeName: string, capo: number): string[]
```

### Active chord display
While playing, show the large `ChordCard` of the currently strumming chord, centered, with a pulsing `--accent` border glow:
```css
@keyframes chordPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(232,255,90,0); }
  50%       { box-shadow: 0 0 20px 4px rgba(232,255,90,0.25); }
}
```

### BPM slider
Range 40–200, default 80. Styled:
```css
input[type=range] {
  accent-color: var(--accent);
  width: 100%;
}
```

---

## Component: `ChordCard.tsx`

Props:
```ts
interface ChordCardProps {
  result: ChordResult;
  animationDelay?: number;  // ms, for stagger
  active?: boolean;         // playback highlight
  showTheory?: boolean;     // show theory badge from AIAnalysis
  theoryRole?: string;      // e.g. "I", "IV"
}
```

Internal: renders a `<canvas>` via `FretboardCanvas` component and calls `drawFretboard` in a `useEffect` after mount and on prop change.

---

## Component: `FretboardCanvas.tsx`

```ts
interface FretboardCanvasProps {
  shape: ChordShape | null;
  capo: number;
  shapeName: string;
  width?: number;   // default 180
  height?: number;  // default 250
}
```

Uses `useRef<HTMLCanvasElement>` + `useEffect` calling `drawFretboard`.

---

## App.tsx — Tab Router

```tsx
export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('search');
  const [lastResults, setLastResults] = useState<ChordResult[]>([]);
  const [lastAnalysis, setLastAnalysis] = useState<AIAnalysis | null>(null);
  const [lastCapo, setLastCapo] = useState(0);

  return (
    <>
      <Header />
      <TabNav active={activeTab} onChange={setActiveTab} />
      <main>
        {activeTab === 'search'   && <SearchTab onResults={...} />}
        {activeTab === 'learn'    && <LearnTab results={lastResults} analysis={lastAnalysis} capo={lastCapo} />}
        {activeTab === 'playback' && <PlaybackTab results={lastResults} capo={lastCapo} />}
      </main>
    </>
  );
}
```

Pass `onResults` callback from `SearchTab` to lift state up so Learn and Playback tabs have access to last search.

---

## TabNav styling

```css
.tab-nav {
  display: flex;
  border-bottom: 1px solid var(--border);
  padding: 0 3rem;
  gap: 0;
}

.tab-btn {
  font-family: 'DM Mono', monospace;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  margin-bottom: -1px;
}

.tab-btn:hover { color: var(--text); }

.tab-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
```

---

## Header.tsx

Identical to prototype header. Logo + tagline left-aligned. Add a subtle right-side indicator showing current capo if set:

```tsx
{capo > 0 && (
  <div className="header-capo-badge">
    <span>capo {capo}</span>
  </div>
)}
```

Style: `background: var(--surface2); border: 1px solid var(--border); border-radius: 6px; padding: 0.2rem 0.6rem; font-family: DM Mono; font-size: 0.65rem; color: var(--accent2);`

---

## index.css

Global resets + CSS variable definitions + grain overlay + font import. Lifted from prototype exactly:

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@400;600;700;800&display=swap');

/* paste :root vars, * reset, body, body::before grain overlay from prototype */
```

---

## Environment

```
VITE_ANTHROPIC_API_KEY=your_key_here
```

Access in `ai.ts`:
```ts
const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
```

Add to `.gitignore`: `.env`

---

## Implementation Order

Work in this sequence — each step is independently shippable:

1. **Scaffold** — `npm create vite@latest capotab -- --template react-ts`, install deps, set up `index.css` with design tokens
2. **Port core lib** — `chordShapes.ts`, `transpose.ts`, `drawFretboard.ts` (direct port from prototype)
3. **FretboardCanvas + ChordCard** — get diagrams rendering in React
4. **SearchTab** — full feature parity with prototype, chord grid working
5. **TabNav + App router** — wire up the three tabs
6. **AI module** — `ai.ts`, AIPanel in SearchTab
7. **LearnTab** — static sections first, then wire `lastResults`/`lastAnalysis`
8. **PlaybackTab** — Tone.js synth, chord sequencer, BPM control
9. **Polish** — animations, mobile layout, error states, loading skeletons

---

## Testing Checklist (per tab)

### Search
- [ ] Chord input parses correctly (space-separated, deduplicates)
- [ ] Capo 0 shows correct open shapes
- [ ] Capo 2 on G → shows G shape labeled "sounds like A"
- [ ] Unknown chord shows error strip, doesn't break other cards
- [ ] AI analysis loads async without blocking chord cards
- [ ] Preset chips populate + trigger analysis

### Learn
- [ ] Renders without lastResults (shows generic content)
- [ ] "Your progression breakdown" hidden until Search performed
- [ ] Shape library filter chips work correctly
- [ ] All ChordCards render correctly at capo=0

### Playback
- [ ] Tone.js loads only when tab is first opened
- [ ] Play/Stop toggles correctly
- [ ] BPM slider affects tempo in real-time
- [ ] Active chord highlight tracks playback position
- [ ] Chord notes account for capo transposition

---

## Notes for Agents

- **Never change CSS variable values.** If a new color is needed, use opacity variants of existing tokens.
- **Never add a CSS framework.** All styling is handwritten in component `.css` files or `index.css`.
- **Canvas drawing is pure DOM.** No SVG, no third-party diagram library.
- **Keep the grain overlay.** It is part of the brand aesthetic.
- **Fonts are non-negotiable.** Syne for headings/UI, DM Mono for everything data/code/metadata.
- The `fadeSlide` animation with staggered delays on chord cards must be preserved on every card grid.
- AI responses must be parsed defensively — always have a fallback if JSON is malformed.
- Mobile breakpoint: `max-width: 600px` — single column grid, reduced padding, stacked input row.
