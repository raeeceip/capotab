import './Chip.css';

interface ChipProps {
  label: string;
  active?: boolean;
  onClick: () => void;
}

export default function Chip({ label, active = false, onClick }: ChipProps) {
  return (
    <button
      className={`chip${active ? ' active' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
