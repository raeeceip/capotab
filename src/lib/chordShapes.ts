import type { ChordShape } from '../types';

export const CHORD_SHAPES: Record<string, ChordShape> = {
  'C': {
    fingers: [{ string: 2, fret: 1 }, { string: 4, fret: 2 }, { string: 5, fret: 3 }],
    open: [1, 3],
    muted: [6],
    label: 'C'
  },
  'D': {
    fingers: [{ string: 1, fret: 2 }, { string: 2, fret: 3 }, { string: 3, fret: 2 }],
    open: [4],
    muted: [5, 6],
    label: 'D'
  },
  'Dm': {
    fingers: [{ string: 1, fret: 1 }, { string: 2, fret: 3 }, { string: 3, fret: 2 }],
    open: [4],
    muted: [5, 6],
    label: 'Dm'
  },
  'E': {
    fingers: [{ string: 3, fret: 1 }, { string: 4, fret: 2 }, { string: 5, fret: 2 }],
    open: [1, 2, 6],
    muted: [],
    label: 'E'
  },
  'Em': {
    fingers: [{ string: 4, fret: 2 }, { string: 5, fret: 2 }],
    open: [1, 2, 3, 6],
    muted: [],
    label: 'Em'
  },
  'F': {
    fingers: [{ string: 3, fret: 2 }, { string: 4, fret: 3 }, { string: 5, fret: 3 }],
    open: [],
    muted: [6],
    barre: { fret: 1, from: 1, to: 2 },
    label: 'F'
  },
  'G': {
    fingers: [{ string: 1, fret: 3 }, { string: 5, fret: 2 }, { string: 6, fret: 3 }],
    open: [2, 3, 4],
    muted: [],
    label: 'G'
  },
  'A': {
    fingers: [{ string: 2, fret: 2 }, { string: 3, fret: 2 }, { string: 4, fret: 2 }],
    open: [1, 5],
    muted: [6],
    label: 'A'
  },
  'Am': {
    fingers: [{ string: 2, fret: 1 }, { string: 3, fret: 2 }, { string: 4, fret: 2 }],
    open: [1, 5],
    muted: [6],
    label: 'Am'
  },
  'B': {
    fingers: [{ string: 1, fret: 2 }, { string: 2, fret: 4 }, { string: 3, fret: 4 }, { string: 4, fret: 4 }],
    open: [],
    muted: [6],
    barre: { fret: 2, from: 1, to: 5 },
    label: 'B (barre)'
  },
  'Bm': {
    fingers: [{ string: 2, fret: 3 }, { string: 3, fret: 4 }, { string: 4, fret: 4 }],
    open: [],
    muted: [6],
    barre: { fret: 2, from: 1, to: 5 },
    label: 'Bm (barre)'
  },
  // Extended chords
  'Cadd9': {
    fingers: [{ string: 2, fret: 3 }, { string: 4, fret: 2 }, { string: 5, fret: 3 }],
    open: [1, 3],
    muted: [6],
    label: 'Cadd9'
  },
  'Gsus2': {
    fingers: [{ string: 1, fret: 3 }, { string: 5, fret: 2 }, { string: 6, fret: 3 }],
    open: [2, 3, 4],
    muted: [],
    label: 'Gsus2'
  },
  'Dsus2': {
    fingers: [{ string: 1, fret: 0 }, { string: 2, fret: 3 }, { string: 3, fret: 2 }],
    open: [1, 4],
    muted: [5, 6],
    label: 'Dsus2'
  },
  'Dsus4': {
    fingers: [{ string: 1, fret: 3 }, { string: 2, fret: 3 }, { string: 3, fret: 2 }],
    open: [4],
    muted: [5, 6],
    label: 'Dsus4'
  },
  'Asus2': {
    fingers: [{ string: 3, fret: 2 }, { string: 4, fret: 2 }],
    open: [1, 2, 5],
    muted: [6],
    label: 'Asus2'
  },
  'Asus4': {
    fingers: [{ string: 2, fret: 3 }, { string: 3, fret: 2 }, { string: 4, fret: 2 }],
    open: [1, 5],
    muted: [6],
    label: 'Asus4'
  },
  // 7th chords
  'E7': {
    fingers: [{ string: 3, fret: 1 }, { string: 5, fret: 2 }],
    open: [1, 2, 4, 6],
    muted: [],
    label: 'E7'
  },
  'A7': {
    fingers: [{ string: 3, fret: 2 }, { string: 4, fret: 2 }],
    open: [1, 2, 5],
    muted: [6],
    label: 'A7'
  },
  'G7': {
    fingers: [{ string: 1, fret: 1 }, { string: 5, fret: 2 }, { string: 6, fret: 3 }],
    open: [2, 3, 4],
    muted: [],
    label: 'G7'
  },
  'D7': {
    fingers: [{ string: 1, fret: 2 }, { string: 2, fret: 1 }, { string: 3, fret: 2 }],
    open: [4],
    muted: [5, 6],
    label: 'D7'
  },
  'B7': {
    fingers: [{ string: 1, fret: 2 }, { string: 3, fret: 2 }, { string: 4, fret: 1 }, { string: 5, fret: 2 }],
    open: [2],
    muted: [6],
    label: 'B7'
  },
  // Maj7 chords
  'Cmaj7': {
    fingers: [{ string: 4, fret: 2 }, { string: 5, fret: 3 }],
    open: [1, 2, 3],
    muted: [6],
    label: 'Cmaj7'
  },
  'Dmaj7': {
    fingers: [{ string: 1, fret: 2 }, { string: 2, fret: 2 }, { string: 3, fret: 2 }],
    open: [4],
    muted: [5, 6],
    label: 'Dmaj7'
  },
  'Fmaj7': {
    fingers: [{ string: 2, fret: 1 }, { string: 3, fret: 2 }, { string: 4, fret: 3 }, { string: 5, fret: 3 }],
    open: [1],
    muted: [6],
    label: 'Fmaj7'
  },
  'Gmaj7': {
    fingers: [{ string: 1, fret: 2 }, { string: 5, fret: 2 }, { string: 6, fret: 3 }],
    open: [2, 3, 4],
    muted: [],
    label: 'Gmaj7'
  },
  'Amaj7': {
    fingers: [{ string: 2, fret: 2 }, { string: 3, fret: 1 }, { string: 4, fret: 2 }],
    open: [1, 5],
    muted: [6],
    label: 'Amaj7'
  },
  // Minor 7th
  'Dm7': {
    fingers: [{ string: 1, fret: 1 }, { string: 2, fret: 1 }, { string: 3, fret: 2 }],
    open: [4],
    muted: [5, 6],
    label: 'Dm7'
  },
  'Em7': {
    fingers: [{ string: 5, fret: 2 }],
    open: [1, 2, 3, 4, 6],
    muted: [],
    label: 'Em7'
  },
  'Am7': {
    fingers: [{ string: 2, fret: 1 }, { string: 4, fret: 2 }],
    open: [1, 3, 5],
    muted: [6],
    label: 'Am7'
  },
  // Power chords
  'E5': {
    fingers: [{ string: 5, fret: 2 }],
    open: [6],
    muted: [1, 2, 3, 4],
    label: 'E5'
  },
  'A5': {
    fingers: [{ string: 4, fret: 2 }],
    open: [5],
    muted: [1, 2, 3, 6],
    label: 'A5'
  },
  'D5': {
    fingers: [{ string: 3, fret: 2 }],
    open: [4],
    muted: [1, 2, 5, 6],
    label: 'D5'
  },
  'G5': {
    fingers: [{ string: 4, fret: 5 }, { string: 5, fret: 5 }],
    open: [],
    muted: [1, 2, 3],
    barre: undefined,
    label: 'G5'
  }
};
