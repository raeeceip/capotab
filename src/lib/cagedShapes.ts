import type { ChordShape } from '../types';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const ENHARMONIC: Record<string, string> = {
  'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B',
  'E#': 'F', 'B#': 'C'
};

function normalizeNote(note: string): string {
  return ENHARMONIC[note] ?? note;
}

function noteIndex(note: string): number {
  return NOTE_NAMES.indexOf(normalizeNote(note));
}

// Movable barre chord templates
// E-shape: root on 6th string (string 6). Open root = E (index 4)
// A-shape: root on 5th string (string 5). Open root = A (index 9)

interface BarreTemplate {
  rootString: 6 | 5;
  openRootIndex: number; // semitone index of the open shape root
  build: (fret: number) => ChordShape;
}

const TEMPLATES: Record<string, BarreTemplate[]> = {
  '': [ // major
    {
      rootString: 6, openRootIndex: 4, // E-shape major
      build: (fret) => ({
        fingers: [
          { string: 3, fret: fret + 1 },
          { string: 4, fret: fret + 2 },
          { string: 5, fret: fret + 2 },
        ],
        open: [],
        muted: [],
        barre: { fret, from: 1, to: 6 },
        label: `barre ${fret}fr (E shape)`,
      }),
    },
    {
      rootString: 5, openRootIndex: 9, // A-shape major
      build: (fret) => ({
        fingers: [
          { string: 2, fret: fret + 2 },
          { string: 3, fret: fret + 2 },
          { string: 4, fret: fret + 2 },
        ],
        open: [],
        muted: [6],
        barre: { fret, from: 1, to: 5 },
        label: `barre ${fret}fr (A shape)`,
      }),
    },
  ],
  'm': [ // minor
    {
      rootString: 6, openRootIndex: 4, // Em-shape
      build: (fret) => ({
        fingers: [
          { string: 4, fret: fret + 2 },
          { string: 5, fret: fret + 2 },
        ],
        open: [],
        muted: [],
        barre: { fret, from: 1, to: 6 },
        label: `barre ${fret}fr (Em shape)`,
      }),
    },
    {
      rootString: 5, openRootIndex: 9, // Am-shape
      build: (fret) => ({
        fingers: [
          { string: 2, fret: fret + 1 },
          { string: 3, fret: fret + 2 },
          { string: 4, fret: fret + 2 },
        ],
        open: [],
        muted: [6],
        barre: { fret, from: 1, to: 5 },
        label: `barre ${fret}fr (Am shape)`,
      }),
    },
  ],
  '7': [ // dominant 7
    {
      rootString: 6, openRootIndex: 4, // E7-shape
      build: (fret) => ({
        fingers: [
          { string: 3, fret: fret + 1 },
          { string: 5, fret: fret + 2 },
        ],
        open: [],
        muted: [],
        barre: { fret, from: 1, to: 6 },
        label: `barre ${fret}fr (E7 shape)`,
      }),
    },
    {
      rootString: 5, openRootIndex: 9, // A7-shape
      build: (fret) => ({
        fingers: [
          { string: 3, fret: fret + 2 },
          { string: 4, fret: fret + 2 },
        ],
        open: [],
        muted: [6],
        barre: { fret, from: 1, to: 5 },
        label: `barre ${fret}fr (A7 shape)`,
      }),
    },
  ],
  'm7': [ // minor 7
    {
      rootString: 6, openRootIndex: 4, // Em7-shape
      build: (fret) => ({
        fingers: [
          { string: 5, fret: fret + 2 },
        ],
        open: [],
        muted: [],
        barre: { fret, from: 1, to: 6 },
        label: `barre ${fret}fr (Em7 shape)`,
      }),
    },
    {
      rootString: 5, openRootIndex: 9, // Am7-shape
      build: (fret) => ({
        fingers: [
          { string: 2, fret: fret + 1 },
          { string: 4, fret: fret + 2 },
        ],
        open: [],
        muted: [6],
        barre: { fret, from: 1, to: 5 },
        label: `barre ${fret}fr (Am7 shape)`,
      }),
    },
  ],
  'maj7': [ // major 7
    {
      rootString: 6, openRootIndex: 4, // Emaj7-shape (rare but valid)
      build: (fret) => ({
        fingers: [
          { string: 3, fret: fret + 1 },
          { string: 4, fret: fret + 2 },
          { string: 5, fret: fret + 2 },
          { string: 2, fret: fret },
        ],
        open: [],
        muted: [],
        barre: { fret, from: 1, to: 6 },
        label: `barre ${fret}fr (Emaj7 shape)`,
      }),
    },
    {
      rootString: 5, openRootIndex: 9, // Amaj7-shape
      build: (fret) => ({
        fingers: [
          { string: 2, fret: fret + 2 },
          { string: 3, fret: fret + 1 },
          { string: 4, fret: fret + 2 },
        ],
        open: [],
        muted: [6],
        barre: { fret, from: 1, to: 5 },
        label: `barre ${fret}fr (Amaj7 shape)`,
      }),
    },
  ],
  '5': [ // power chord
    {
      rootString: 6, openRootIndex: 4, // E5-shape
      build: (fret) => ({
        fingers: [
          { string: 5, fret: fret + 2 },
          { string: 6, fret: fret },
        ],
        open: [],
        muted: [1, 2, 3, 4],
        label: `power ${fret}fr (E5 shape)`,
      }),
    },
    {
      rootString: 5, openRootIndex: 9, // A5-shape
      build: (fret) => ({
        fingers: [
          { string: 4, fret: fret + 2 },
          { string: 5, fret: fret },
        ],
        open: [],
        muted: [1, 2, 3, 6],
        label: `power ${fret}fr (A5 shape)`,
      }),
    },
  ],
};

/** Parse a chord name into root note + quality suffix */
export function parseChordName(chord: string): { root: string; quality: string } | null {
  const match = chord.match(/^([A-G][#b]?)(.*)/);
  if (!match) return null;
  return { root: match[1], quality: match[2] };
}

/** Generate a barre chord shape for any root + quality */
export function generateBarreShape(root: string, quality: string): ChordShape | null {
  const templates = TEMPLATES[quality];
  if (!templates) return null;

  const targetIdx = noteIndex(root);
  if (targetIdx < 0) return null;

  let bestShape: ChordShape | null = null;
  let bestFret = Infinity;

  for (const tmpl of templates) {
    const offset = ((targetIdx - tmpl.openRootIndex) % 12 + 12) % 12;
    const fret = offset === 0 ? 12 : offset; // avoid fret 0 (that's the open shape)
    if (fret < bestFret) {
      bestFret = fret;
      bestShape = tmpl.build(fret);
    }
  }

  return bestShape;
}
