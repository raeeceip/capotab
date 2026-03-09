import { useState } from 'react';
import type { TabName, ChordResult, AIAnalysis } from './types';
import Header from './components/Header';
import TabNav from './components/TabNav';
import SearchTab from './tabs/SearchTab';
import LearnTab from './tabs/LearnTab';
import PlaybackTab from './tabs/PlaybackTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('search');
  const [lastResults, setLastResults] = useState<ChordResult[]>([]);
  const [lastAnalysis, setLastAnalysis] = useState<AIAnalysis | null>(null);
  const [lastCapo, setLastCapo] = useState(0);

  const handleResults = (results: ChordResult[], analysis: AIAnalysis | null, capo: number) => {
    setLastResults(results);
    setLastAnalysis(analysis);
    setLastCapo(capo);
  };

  return (
    <>
      <Header capo={lastCapo} />
      <TabNav active={activeTab} onChange={setActiveTab} />
      <main style={{ paddingTop: '1.5rem' }}>
        {activeTab === 'search' && <SearchTab onResults={handleResults} />}
        {activeTab === 'learn' && <LearnTab results={lastResults} analysis={lastAnalysis} capo={lastCapo} />}
        {activeTab === 'playback' && <PlaybackTab results={lastResults} capo={lastCapo} />}
      </main>
    </>
  );
}
