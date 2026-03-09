import type { AIAnalysis } from '../types';
import { guessKey, getNoteIndex, normalizeNote, getDiatonicChords, transposeChord } from './transpose';
import { SONG_DATABASE } from './songDatabase';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const ROMAN_MAJOR = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii\u00B0'];

/** Map a chord to its roman numeral function in the given key */
function chordToRomanNumeral(chord: string, key: string): string {
  const keyIdx = getNoteIndex(key);
  if (keyIdx < 0) return '?';

  const match = chord.match(/^([A-G][#b]?)(.*)/);
  if (!match) return '?';
  const [, root, quality] = match;
  const rootIdx = getNoteIndex(root);
  if (rootIdx < 0) return '?';

  const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

  const interval = ((rootIdx - keyIdx) % 12 + 12) % 12;
  const degreeIdx = MAJOR_SCALE_INTERVALS.indexOf(interval);

  if (degreeIdx >= 0) {
    let numeral = ROMAN_MAJOR[degreeIdx];
    // Adjust if quality doesn't match expected diatonic quality
    if (quality === 'm' && degreeIdx === 0) numeral = 'i';
    if (quality === '' && (degreeIdx === 1 || degreeIdx === 2 || degreeIdx === 5)) {
      numeral = numeral.toUpperCase(); // borrowed chord
    }
    return numeral;
  }

  // Chromatic — check common borrowed chords
  if (interval === 10 && quality === '') return 'bVII';
  if (interval === 8 && quality === '') return 'bVI';
  if (interval === 3 && quality === '') return 'bIII';
  if (interval === 1 && quality === '') return 'bII';

  return normalizeNote(root) + quality;
}

/** Match roman numeral pattern against known progressions */
function matchProgression(numerals: string[]): string {
  const pattern = numerals.join('-');

  const KNOWN: Record<string, string> = {
    'I-V-vi-IV': 'Pop progression (I-V-vi-IV)',
    'I-IV-V-I': 'Classic three-chord (I-IV-V)',
    'I-IV-V': 'Classic three-chord (I-IV-V)',
    'vi-IV-I-V': 'Pop progression variant (vi-IV-I-V)',
    'I-vi-IV-V': '50s progression (I-vi-IV-V)',
    'ii-V-I': 'Jazz ii-V-I turnaround',
    'I-IV-vi-V': 'Axis progression',
    'vi-V-IV-I': 'Andalusian cadence variant',
    'I-V-vi-iii-IV': 'Canon progression',
    'I-bVII-IV-I': 'Mixolydian vamp',
    'i-bVI-bIII-bVII': 'Minor plagal',
    'i-iv-v': 'Minor blues',
    'I-I-IV-I-V-IV-I-V': '12-bar blues',
  };

  // Exact match
  if (KNOWN[pattern]) return KNOWN[pattern];

  // Partial match — check if our numerals are a rotation or subset
  for (const [prog, name] of Object.entries(KNOWN)) {
    const progParts = prog.split('-');
    if (numerals.length === progParts.length) {
      // Check rotations
      for (let rot = 0; rot < progParts.length; rot++) {
        const rotated = [...progParts.slice(rot), ...progParts.slice(0, rot)];
        if (rotated.join('-') === pattern) return name + ' (rotated)';
      }
    }
  }

  return numerals.join(' - ');
}

/** Find similar songs from database based on chord function similarity */
function findSimilarSongs(numerals: string[], chords: string[], key: string): string[] {
  const inputPattern = numerals.join('-');
  const matches: { song: string; score: number }[] = [];

  for (const song of SONG_DATABASE) {
    const songKey = guessKey(song.chords);
    const songNumerals = song.chords.map((c) => chordToRomanNumeral(c, songKey));
    const songPattern = songNumerals.join('-');

    let score = 0;
    if (songPattern === inputPattern) {
      score = 10;
    } else {
      // Count overlapping numerals
      const inputSet = new Set(numerals);
      const songSet = new Set(songNumerals);
      for (const n of inputSet) {
        if (songSet.has(n)) score += 2;
      }
      // Bonus for same number of chords
      if (song.chords.length === chords.length) score += 1;
    }

    if (score >= 3) {
      matches.push({ song: `${song.title} — ${song.artist}`, score });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 5).map((m) => m.song);
}

/** Generate capo rationale */
function capoRationale(capo: number, chords: string[], key: string): string {
  if (capo === 0) return 'No capo — playing in open position.';

  const shapesUsed = chords.map((ch) => transposeChord(ch, -capo));
  const openChords = ['C', 'D', 'E', 'G', 'A', 'Am', 'Em', 'Dm'];
  const openCount = shapesUsed.filter((s) => openChords.includes(s)).length;

  if (openCount === shapesUsed.length) {
    return `Capo ${capo} lets you play all open shapes (${shapesUsed.join(', ')}) while sounding in ${key}.`;
  }
  if (openCount > 0) {
    return `Capo ${capo} gives you ${openCount} open shape(s) (${shapesUsed.filter(s => openChords.includes(s)).join(', ')}), making the progression easier to play in ${key}.`;
  }
  return `Capo ${capo} shifts the key to sound in ${key}. Some barre shapes still needed.`;
}

/** Assess playability */
function playabilityNote(chords: string[], capo: number): string {
  const shapes = chords.map((ch) => transposeChord(ch, -capo));
  const openChords = ['C', 'D', 'E', 'G', 'A', 'Am', 'Em', 'Dm', 'A7', 'E7', 'D7', 'G7'];
  const openCount = shapes.filter((s) => openChords.includes(s)).length;
  const barreCount = shapes.length - openCount;

  if (barreCount === 0) return 'All open chords — great for beginners!';
  if (barreCount === 1) return `Mostly open chords with 1 barre shape. Intermediate friendly.`;
  if (barreCount <= shapes.length / 2) return `${openCount} open shapes, ${barreCount} barre shapes. Intermediate level.`;
  return `${barreCount} barre shapes out of ${shapes.length} chords. More advanced.`;
}

/** Fully local progression analysis that returns the same AIAnalysis shape */
export function analyzeProgressionLocal(chords: string[], capo: number): AIAnalysis {
  const key = guessKey(chords);
  const numerals = chords.map((ch) => chordToRomanNumeral(ch, key));
  const progression = matchProgression(numerals);
  const similar = findSimilarSongs(numerals, chords, key);
  const diatonic = getDiatonicChords(key);

  const chordExplanations = chords.map((ch, i) => {
    const shapeName = transposeChord(ch, -capo);
    const numeral = numerals[i];
    const isDiatonic = diatonic.some((d) => {
      const dRoot = normalizeNote(d.match(/^[A-G][#b]?/)?.[0] || '');
      const chRoot = normalizeNote(ch.match(/^[A-G][#b]?/)?.[0] || '');
      return dRoot === chRoot && d === normalizeNote(ch.match(/^[A-G][#b]?/)?.[0] || '') + (ch.match(/^[A-G][#b]?(.*)/)?.[1] || '');
    });

    return {
      chord: ch,
      shape: shapeName,
      why: capo > 0 ? `Play ${shapeName} shape with capo ${capo}` : `Play ${shapeName} shape open`,
      theory: `${numeral} in ${key}${!isDiatonic ? '' : ''}`
    };
  });

  return {
    progression,
    key: `Key of ${key}`,
    capoRationale: capoRationale(capo, chords, key),
    chordExplanations,
    playabilityNote: playabilityNote(chords, capo),
    similarSongs: similar
  };
}
