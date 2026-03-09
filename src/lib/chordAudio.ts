import type { ChordShape } from '../types';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Standard tuning: string 1 (high E) to string 6 (low E)
// Note index and octave for each open string
const STANDARD_TUNING: { noteIndex: number; octave: number }[] = [
  { noteIndex: 4, octave: 4 },  // string 1: E4
  { noteIndex: 11, octave: 3 }, // string 2: B3
  { noteIndex: 7, octave: 3 },  // string 3: G3
  { noteIndex: 2, octave: 3 },  // string 4: D3
  { noteIndex: 9, octave: 2 },  // string 5: A2
  { noteIndex: 4, octave: 2 },  // string 6: E2
];

/**
 * Compute the actual sounding notes from a ChordShape + capo position.
 * Returns an array of note strings like ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'].
 */
export function shapeToNotes(shape: ChordShape, capo: number): string[] {
  const notes: string[] = [];

  for (let s = 1; s <= 6; s++) {
    // Skip muted strings
    if (shape.muted.includes(s)) continue;

    let fret = 0;

    // Check if this string is open
    if (shape.open.includes(s)) {
      fret = 0;
    } else if (shape.barre && s >= shape.barre.from && s <= shape.barre.to) {
      // Barre covers this string — use barre fret as baseline
      fret = shape.barre.fret;
      // Check if a finger overrides the barre on this string
      const finger = shape.fingers.find((f) => f.string === s);
      if (finger && finger.fret > fret) {
        fret = finger.fret;
      }
    } else {
      // Must have a finger on this string
      const finger = shape.fingers.find((f) => f.string === s);
      if (!finger) continue; // string not played
      fret = finger.fret;
    }

    const totalFret = fret + capo;
    const tuning = STANDARD_TUNING[s - 1];
    let noteIdx = (tuning.noteIndex + totalFret) % 12;
    let octave = tuning.octave + Math.floor((tuning.noteIndex + totalFret) / 12);

    notes.push(NOTE_NAMES[noteIdx] + octave);
  }

  return notes;
}
