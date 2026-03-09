import { useState } from 'react';
import type { ChordResult, AIAnalysis } from '../types';
import { CHORD_SHAPES } from '../lib/chordShapes';
import SectionLabel from '../components/SectionLabel';
import ChordCard from '../components/ChordCard';
import FretboardCanvas from '../components/FretboardCanvas';
import Chip from '../components/Chip';
import './LearnTab.css';

interface LearnTabProps {
  results: ChordResult[];
  analysis: AIAnalysis | null;
  capo: number;
}

const CAPO_POSITIONS = [
  { capo: 2, keys: 'A, B', shapes: 'Play G/D/Em shapes in A', desc: 'bright, open sound' },
  { capo: 3, keys: 'Bb, C', shapes: 'Play G/A shapes in Bb', desc: 'common in folk/pop' },
  { capo: 4, keys: 'B, C#', shapes: 'Play G/D shapes in B', desc: 'common in singer-songwriter' },
  { capo: 5, keys: 'C, D', shapes: 'Play G/C shapes in C', desc: 'eliminates barre F' },
];

const FILTER_OPTIONS = ['All', 'Open', 'Barre', '7th', 'Suspended', 'Power'] as const;

function filterShapes(filter: string): [string, typeof CHORD_SHAPES[string]][] {
  const all = Object.entries(CHORD_SHAPES);
  switch (filter) {
    case 'Open':
      return all.filter(([, s]) => s.barre === undefined && s.muted.length < 6);
    case 'Barre':
      return all.filter(([, s]) => s.barre !== undefined);
    case '7th':
      return all.filter(([k]) => k.includes('7'));
    case 'Suspended':
      return all.filter(([k]) => k.includes('sus'));
    case 'Power':
      return all.filter(([k]) => k.includes('5'));
    default:
      return all;
  }
}

const G_SHAPE_RESULT: ChordResult = {
  soundingChord: 'G',
  shapeName: 'G',
  shape: CHORD_SHAPES['G'],
  capo: 0,
};

const G_AS_A_RESULT: ChordResult = {
  soundingChord: 'A',
  shapeName: 'G',
  shape: CHORD_SHAPES['G'],
  capo: 2,
};

export default function LearnTab({ results, analysis, capo }: LearnTabProps) {
  const [filter, setFilter] = useState('All');
  const filteredShapes = filterShapes(filter);

  return (
    <div className="learn-tab">
      {/* Section 1: What is a capo? */}
      <SectionLabel text="What is a capo?" />
      <div className="learn-explainer card">
        <div className="learn-explainer-text">
          <p>
            A capo clamps across all strings at a given fret, effectively raising
            the pitch of every open string. This lets guitarists use simple
            open-chord shapes to play in keys that would otherwise require
            difficult barre chords.
          </p>
        </div>
        <div className="learn-explainer-visual">
          <FretboardCanvas
            shape={CHORD_SHAPES['G']}
            capo={0}
            shapeName="G"
          />
        </div>
      </div>

      {/* Section 2: Shape vs. Chord */}
      <SectionLabel text="Shape vs. Chord" />
      <div className="learn-shape-vs">
        <ChordCard result={G_SHAPE_RESULT} />
        <div className="learn-shape-vs-label">same fingers, different sound</div>
        <ChordCard result={G_AS_A_RESULT} />
      </div>

      {/* Section 3: Your progression breakdown */}
      {results.length > 0 && (
        <>
          <SectionLabel text="Your progression breakdown" />
          <div className="learn-breakdown">
            {results.map((r, i) => {
              const explanation = analysis?.chordExplanations.find(
                (ce) => ce.chord === r.soundingChord
              );
              const isEven = i % 2 === 0;
              return (
                <div
                  className={`learn-breakdown-card card ${isEven ? '' : 'learn-breakdown-card--reverse'}`}
                  key={r.soundingChord + i}
                  style={{ animation: 'fadeSlide 0.35s ease both', animationDelay: `${i * 0.08}s` }}
                >
                  <div className="learn-breakdown-info">
                    <span className="learn-breakdown-chord">{r.soundingChord}</span>
                    <span className="learn-breakdown-shape">{r.shapeName} shape</span>
                    {explanation && (
                      <>
                        <p className="learn-breakdown-why">{explanation.why}</p>
                        <span className="learn-breakdown-theory">{explanation.theory}</span>
                      </>
                    )}
                  </div>
                  <div className="learn-breakdown-diagram">
                    <ChordCard result={r} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Section 4: Chord shape library */}
      <SectionLabel text="Chord shape library" />
      <div className="learn-filter-chips">
        {FILTER_OPTIONS.map((f) => (
          <Chip
            key={f}
            label={f}
            active={filter === f}
            onClick={() => setFilter(f)}
          />
        ))}
      </div>
      <div className="learn-library-grid">
        {filteredShapes.map(([name, shape]) => (
          <ChordCard
            key={name}
            result={{
              soundingChord: name,
              shapeName: name,
              shape,
              capo: 0,
            }}
          />
        ))}
      </div>

      {/* Section 5: Common capo positions */}
      <SectionLabel text="Common capo positions" />
      <div className="learn-capo-scroll">
        {CAPO_POSITIONS.map((cp) => (
          <div className={`learn-capo-card${cp.capo === capo ? ' learn-capo-card--active' : ''}`} key={cp.capo}>
            <span className="learn-capo-num">Capo {cp.capo}</span>
            <span className="learn-capo-keys">Common keys: {cp.keys}</span>
            <span className="learn-capo-desc">{cp.shapes} &mdash; {cp.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
