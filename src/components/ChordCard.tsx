import type { ChordResult } from '../types';
import FretboardCanvas from './FretboardCanvas';
import './ChordCard.css';

interface ChordCardProps {
  result: ChordResult;
  animationDelay?: number;
  active?: boolean;
  showTheory?: boolean;
  theoryRole?: string;
}

export default function ChordCard({ result, animationDelay = 0, active = false, showTheory = false, theoryRole }: ChordCardProps) {
  const cardClass = `card chord-card${active ? ' chord-card--active' : ''}`;

  return (
    <div className={cardClass} style={{ animationDelay: `${animationDelay}s` }}>
      <div className="chord-name">{result.soundingChord}</div>
      <div className="shape-name">{result.shapeName} shape</div>
      {result.shape ? (
        <FretboardCanvas
          shape={result.shape}
          capo={result.capo}
          shapeName={result.shapeName}
        />
      ) : (
        <div className="not-found">Shape not found</div>
      )}
      {showTheory && theoryRole && (
        <div className="theory-badge">{theoryRole}</div>
      )}
    </div>
  );
}
