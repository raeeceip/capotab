import type { ChordResult } from '../types';
import { CHORD_SHAPES } from './chordShapes';
import { parseChordName, generateBarreShape } from './cagedShapes';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const ENHARMONIC: Record<string, string> = {
  'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B',
  'E#': 'F', 'B#': 'C'
};

export function normalizeNote(note: string): string {
  if (ENHARMONIC[note]) return ENHARMONIC[note];
  return note;
}

export function getNoteIndex(note: string): number {
  const normalized = normalizeNote(note);
  const idx = NOTE_NAMES.indexOf(normalized);
  return idx >= 0 ? idx : -1;
}

export function transposeNote(note: string, semitones: number): string {
  const idx = getNoteIndex(note);
  if (idx < 0) return note;
  return NOTE_NAMES[((idx + semitones) % 12 + 12) % 12];
}

export function transposeChord(chord: string, semitones: number): string {
  // Extract root note (1 or 2 chars) and quality suffix
  const match = chord.match(/^([A-G][#b]?)(.*)/);
  if (!match) return chord;
  const [, root, quality] = match;
  const transposed = transposeNote(root, semitones);
  return transposed + quality;
}

export function getShapeForCapo(chord: string, capo: number): ChordResult {
  // To find what shape to play: transpose DOWN by capo amount
  const shapeName = transposeChord(chord, -capo);
  let shape = CHORD_SHAPES[shapeName] || null;

  // Fall back to CAGED barre shape generation
  if (!shape) {
    const parsed = parseChordName(shapeName);
    if (parsed) {
      shape = generateBarreShape(parsed.root, parsed.quality);
    }
  }

  return {
    soundingChord: chord,
    shapeName,
    shape,
    capo
  };
}

export function getCapoKey(openKey: string, capo: number): string {
  return transposeChord(openKey, capo);
}

export function guessKey(chords: string[]): string {
  // Simple heuristic: check which major key contains the most chords
  const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
  const DIATONIC_QUALITIES = ['', 'm', 'm', '', '', 'm', 'dim'];

  let bestKey = chords[0] || 'C';
  let bestScore = 0;

  for (const key of NOTE_NAMES) {
    const keyIdx = getNoteIndex(key);
    const diatonicChords: string[] = [];
    for (let i = 0; i < 7; i++) {
      const noteIdx = (keyIdx + MAJOR_SCALE_INTERVALS[i]) % 12;
      diatonicChords.push(NOTE_NAMES[noteIdx] + DIATONIC_QUALITIES[i]);
    }

    let score = 0;
    for (const chord of chords) {
      const normalized = normalizeNote(chord.match(/^[A-G][#b]?/)?.[0] || '') + (chord.match(/^[A-G][#b]?(.*)/)?.[1] || '');
      if (diatonicChords.includes(normalized)) score++;
    }

    if (score > bestScore) {
      bestScore = score;
      bestKey = key;
    }
  }

  return bestKey;
}

export function getDiatonicChords(key: string): string[] {
  const keyIdx = getNoteIndex(key);
  if (keyIdx < 0) return [];
  const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
  const DIATONIC_QUALITIES = ['', 'm', 'm', '', '', 'm', 'dim'];
  return MAJOR_SCALE_INTERVALS.map((interval, i) => {
    const noteIdx = (keyIdx + interval) % 12;
    return NOTE_NAMES[noteIdx] + DIATONIC_QUALITIES[i];
  });
}
