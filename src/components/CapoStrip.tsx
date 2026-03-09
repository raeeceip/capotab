import './CapoStrip.css';

interface CapoStripProps {
  capo: number;
  originalChords?: string;
}

export default function CapoStrip({ capo }: CapoStripProps) {
  if (capo <= 0) return null;

  return (
    <div className="capo-strip">
      <span className="capo-strip-label">Capo {capo}</span>
      <span className="capo-strip-info">
        shapes transposed down {capo} semitone{capo !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
