import './Legend.css';

export default function Legend() {
  return (
    <div className="legend">
      <div className="legend-item">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <circle cx="5" cy="5" r="5" fill="var(--dot)" />
        </svg>
        <span className="legend-label">Finger</span>
      </div>
      <div className="legend-item">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <circle cx="5" cy="5" r="4" fill="none" stroke="var(--open)" strokeWidth="1.5" />
        </svg>
        <span className="legend-label">Open</span>
      </div>
      <div className="legend-item">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <line x1="2" y1="2" x2="8" y2="8" stroke="var(--muted-note)" strokeWidth="1.5" />
          <line x1="8" y1="2" x2="2" y2="8" stroke="var(--muted-note)" strokeWidth="1.5" />
        </svg>
        <span className="legend-label">Muted</span>
      </div>
      <div className="legend-item">
        <svg width="24" height="10" viewBox="0 0 24 10">
          <rect x="1" y="1" width="22" height="8" rx="4" fill="rgba(232,255,90,0.18)" stroke="var(--dot)" strokeWidth="1" />
        </svg>
        <span className="legend-label">Barre</span>
      </div>
    </div>
  );
}
