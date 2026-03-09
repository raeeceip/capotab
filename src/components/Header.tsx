import './Header.css';

interface HeaderProps {
  capo: number;
}

export default function Header({ capo }: HeaderProps) {
  return (
    <header className="header">
      <div>
        <div className="header-logo">CapoTab</div>
        <div className="header-tagline">guitar chord shapes, transposed</div>
      </div>
      {capo > 0 && (
        <span className="header-capo-badge">capo {capo}</span>
      )}
    </header>
  );
}
