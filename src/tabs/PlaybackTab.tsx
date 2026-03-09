import { useState, useRef, useEffect } from 'react';
import type { ChordResult } from '../types';
import { getShapeForCapo } from '../lib/transpose';
import { shapeToNotes } from '../lib/chordAudio';
import ChordCard from '../components/ChordCard';
import Chip from '../components/Chip';
import './PlaybackTab.css';

interface PlaybackTabProps {
  results: ChordResult[];
  capo: number;
}

const PATTERNS: Record<string, string[]> = {
  'Down only':  ['D', 'D', 'D', 'D'],
  'Down-Up':    ['D', 'U', 'D', 'U', 'D', 'U', 'D', 'U'],
  'Folk (3/4)': ['D', 'D', 'U', 'D', 'U'],
  'Pop ballad': ['D', '_', 'DU', '_', 'DU', '_'],
};

const PATTERN_NAMES = Object.keys(PATTERNS);

function chordToNotes(chord: ChordResult): string[] {
  if (chord.shape) {
    return shapeToNotes(chord.shape, chord.capo);
  }
  // Fallback for shapes that couldn't be generated
  return ['C3', 'E3', 'G3'];
}

function parseManualChords(raw: string, capo: number): ChordResult[] {
  const names = raw.split(/\s+/).filter(Boolean);
  return names.map((ch) => getShapeForCapo(ch, capo));
}

export default function PlaybackTab({ results, capo }: PlaybackTabProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(80);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState('Down only');
  const [manualInput, setManualInput] = useState('');
  const [chords, setChords] = useState<ChordResult[]>([]);

  const synthRef = useRef<ReturnType<typeof Object> | null>(null);
  const seqRef = useRef<ReturnType<typeof Object> | null>(null);

  useEffect(() => {
    if (results.length > 0) {
      setChords(results);
    }
  }, [results]);

  useEffect(() => {
    if (isPlaying) {
      import('tone').then((Tone) => {
        Tone.getTransport().bpm.value = bpm;
      });
    }
  }, [bpm, isPlaying]);

  useEffect(() => {
    return () => {
      import('tone').then((Tone) => {
        Tone.getTransport().stop();
        if (seqRef.current && typeof (seqRef.current as { dispose?: () => void }).dispose === 'function') {
          (seqRef.current as { dispose: () => void }).dispose();
        }
      });
    };
  }, []);

  async function startPlayback() {
    if (chords.length === 0) return;

    const Tone = await import('tone');
    await Tone.start();

    if (!synthRef.current) {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' as const },
        envelope: { attack: 0.005, decay: 0.3, sustain: 0.1, release: 0.8 },
      }).toDestination();
      synth.volume.value = -8;
      synthRef.current = synth;
    }

    Tone.getTransport().bpm.value = bpm;

    let stepIndex = 0;
    let chordIdx = 0;
    const pattern = PATTERNS[selectedPattern];

    const loop = new Tone.Loop((time: number) => {
      const step = pattern[stepIndex % pattern.length];
      const chord = chords[chordIdx];
      if (chord) {
        const notes = chordToNotes(chord);
        const synth = synthRef.current as {
          triggerAttackRelease: (notes: string[], duration: string | number, time: number) => void;
        };
        if (step === 'D' || step === 'DU') {
          synth.triggerAttackRelease(notes, '8n', time);
        } else if (step === 'U') {
          synth.triggerAttackRelease(notes.slice(0, 3), '16n', time);
        }
        setCurrentChordIndex(chordIdx);
      }

      stepIndex++;
      if (stepIndex % pattern.length === 0) {
        chordIdx = (chordIdx + 1) % chords.length;
      }
    }, '8n').start(0);

    seqRef.current = loop;
    Tone.getTransport().start();
    setIsPlaying(true);
  }

  function stopPlayback() {
    import('tone').then((Tone) => {
      Tone.getTransport().stop();
      if (seqRef.current && typeof (seqRef.current as { dispose?: () => void }).dispose === 'function') {
        (seqRef.current as { dispose: () => void }).dispose();
      }
      seqRef.current = null;
      setIsPlaying(false);
      setCurrentChordIndex(0);
    });
  }

  function loadManualChords() {
    if (!manualInput.trim()) return;
    const parsed = parseManualChords(manualInput, capo);
    setChords(parsed);
  }

  return (
    <div className="playback-tab">
      {chords.length === 0 ? (
        <div className="playback-manual">
          <p className="playback-empty-msg">
            No chords loaded. Enter chords manually or analyze a progression in the Search tab.
          </p>
          <div className="playback-manual-row">
            <input
              type="text"
              className="playback-manual-input"
              placeholder="e.g. G D Em C"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') loadManualChords(); }}
            />
            <button className="btn-primary" onClick={loadManualChords}>
              Load chords
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="playback-chord-bar">
            {chords.map((c, i) => (
              <span
                key={c.soundingChord + i}
                className={`playback-chord-chip ${i === currentChordIndex && isPlaying ? 'playback-chord-chip--active' : ''}`}
              >
                {c.soundingChord}
              </span>
            ))}
          </div>

          <div className="playback-patterns">
            {PATTERN_NAMES.map((p) => (
              <Chip
                key={p}
                label={p}
                active={selectedPattern === p}
                onClick={() => setSelectedPattern(p)}
              />
            ))}
          </div>

          <div className="playback-bpm">
            <label className="playback-bpm-label">BPM: {bpm}</label>
            <input
              type="range"
              min={40}
              max={200}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
            />
          </div>

          <button
            className="btn-primary playback-play-btn"
            onClick={isPlaying ? stopPlayback : () => void startPlayback()}
          >
            {isPlaying ? 'Stop' : 'Play'}
          </button>

          {isPlaying && chords[currentChordIndex] && (
            <div className="playback-active-chord" style={{ animation: 'fadeSlide 0.3s ease both' }}>
              <ChordCard
                result={chords[currentChordIndex]}
                active={true}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
