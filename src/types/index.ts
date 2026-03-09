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
  capoRationale: string;
  chordExplanations: {
    chord: string;
    shape: string;
    why: string;
    theory: string;
  }[];
  playabilityNote: string;
  similarSongs: string[];
}
