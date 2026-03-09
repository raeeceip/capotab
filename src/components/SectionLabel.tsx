import './SectionLabel.css';

interface SectionLabelProps {
  text: string;
}

export default function SectionLabel({ text }: SectionLabelProps) {
  return (
    <div className="section-label">{text}</div>
  );
}
