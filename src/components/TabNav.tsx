import type { TabName } from '../types';
import './TabNav.css';

interface TabNavProps {
  active: TabName;
  onChange: (tab: TabName) => void;
}

const tabs: { id: TabName; label: string }[] = [
  { id: 'search', label: 'Search' },
  { id: 'learn', label: 'Learn' },
  { id: 'playback', label: 'Playback' },
];

export default function TabNav({ active, onChange }: TabNavProps) {
  return (
    <nav className="tab-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-btn${active === tab.id ? ' active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
