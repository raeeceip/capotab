import { useState, useRef, useEffect, useCallback } from 'react';
import type { ChordResult, AIAnalysis } from '../types';
import { getShapeForCapo } from '../lib/transpose';
import { analyzeProgression } from '../lib/ai';
import { analyzeProgressionLocal } from '../lib/localAnalysis';
import { searchLocalCache, findInCache } from '../lib/songDatabase';
import { searchMusicBrainz, fetchChordsFromAI, type MusicSearchResult } from '../lib/musicSearch';
import CapoStrip from '../components/CapoStrip';
import SectionLabel from '../components/SectionLabel';
import Legend from '../components/Legend';
import ChordCard from '../components/ChordCard';
import Chip from '../components/Chip';
import './SearchTab.css';

interface SearchTabProps {
  onResults: (results: ChordResult[], analysis: AIAnalysis | null, capo: number) => void;
}

const PRESETS = [
  { label: 'G D Em C', chords: 'G D Em C', capo: 0 },
  { label: 'Wonderwall', chords: 'Em G D A7', capo: 2 },
  { label: 'Hotel California', chords: 'Am E G D F C Dm E', capo: 0 },
  { label: 'Hallelujah', chords: 'C Am C Am F G C G', capo: 0 },
  { label: 'Let It Be', chords: 'C G Am F', capo: 0 },
];

function parseChords(raw: string): string[] {
  return [...new Set(raw.split(/\s+/).filter(Boolean))];
}

export default function SearchTab({ onResults }: SearchTabProps) {
  const [input, setInput] = useState('G D Em C');
  const [capo, setCapo] = useState(2);
  const [results, setResults] = useState<ChordResult[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  // Song search state
  const [songQuery, setSongQuery] = useState('');
  const [songResults, setSongResults] = useState<MusicSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchingOnline, setSearchingOnline] = useState(false);
  const [fetchingChords, setFetchingChords] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSongResults([]);
      setShowDropdown(false);
      return;
    }

    // Instant local cache results first
    const localMatches = searchLocalCache(query);
    const localResults: MusicSearchResult[] = localMatches.map((s) => ({
      id: `local-${s.title}`,
      title: s.title,
      artist: s.artist,
      hasLocalChords: true,
      chords: s.chords,
      capo: s.capo,
    }));

    setSongResults(localResults);
    if (localResults.length > 0) setShowDropdown(true);

    // Then search MusicBrainz API
    setSearchingOnline(true);
    try {
      const mbResults = await searchMusicBrainz(query);

      // Merge: local results first, then MB results (skip duplicates)
      const localTitles = new Set(localMatches.map((s) => s.title.toLowerCase()));
      const onlineOnly = mbResults.filter(
        (r) => !localTitles.has(r.title.toLowerCase())
      );

      // Check if any MB results have local chord data
      for (const r of onlineOnly) {
        const cached = findInCache(r.title, r.artist);
        if (cached) {
          r.hasLocalChords = true;
          r.chords = cached.chords;
          r.capo = cached.capo;
        }
      }

      const combined = [...localResults, ...onlineOnly];
      setSongResults(combined);
      if (combined.length > 0) setShowDropdown(true);
    } catch {
      // Local results already shown
    }
    setSearchingOnline(false);
  }, []);

  function handleSongSearch(query: string) {
    setSongQuery(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void performSearch(query);
    }, 350); // debounce MusicBrainz calls (rate limit: 1/sec)
  }

  async function selectSong(song: MusicSearchResult) {
    setShowDropdown(false);
    setSongQuery(`${song.title} — ${song.artist}`);

    if (song.hasLocalChords && song.chords) {
      // Instant — chords are cached locally
      setInput(song.chords.join(' '));
      setCapo(song.capo ?? 0);
      void analyze(song.chords.join(' '), song.capo ?? 0);
    } else {
      // Need to fetch chords from AI
      setFetchingChords(song.title);
      const result = await fetchChordsFromAI(song.title, song.artist);
      setFetchingChords(null);

      if (result) {
        setInput(result.chords.join(' '));
        setCapo(result.capo);
        void analyze(result.chords.join(' '), result.capo);
      } else {
        // No AI key — prompt user to enter chords manually
        setInput('');
        setCapo(0);
      }
    }
  }

  async function analyze(chordStr?: string, capoVal?: number) {
    const chord = chordStr ?? input;
    const c = capoVal ?? capo;
    const chords = parseChords(chord);
    if (chords.length === 0) return;

    const built = chords.map((ch) => getShapeForCapo(ch, c));
    setResults(built);

    // Show local analysis immediately
    const localAnalysis = analyzeProgressionLocal(chords, c);
    setAnalysis(localAnalysis);
    onResults(built, localAnalysis, c);

    // Fire AI in background — only replace if it returns real content
    setLoading(true);
    try {
      const ai = await analyzeProgression(chords, c);
      if (ai.progression && ai.progression !== 'API key not configured' && ai.progression !== 'Analysis unavailable') {
        setAnalysis(ai);
        onResults(built, ai, c);
      }
    } catch {
      // Local analysis already shown
    }
    setLoading(false);
  }

  function handlePreset(preset: typeof PRESETS[number]) {
    setInput(preset.chords);
    setCapo(preset.capo);
    void analyze(preset.chords, preset.capo);
  }

  return (
    <div className="search-tab">
      {/* Song search — MusicBrainz live API */}
      <div className="song-search-wrapper" ref={dropdownRef}>
        <input
          type="text"
          className="search-chord-input song-search-input"
          placeholder="Search any song (live search powered by MusicBrainz)..."
          value={songQuery}
          onChange={(e) => handleSongSearch(e.target.value)}
          onFocus={() => { if (songResults.length > 0) setShowDropdown(true); }}
        />
        {searchingOnline && <span className="song-search-spinner">searching...</span>}
        {showDropdown && songResults.length > 0 && (
          <div className="song-dropdown">
            {songResults.map((song) => (
              <button
                key={song.id}
                className="song-dropdown-item"
                onClick={() => void selectSong(song)}
              >
                <span className="song-dropdown-title">{song.title}</span>
                <span className="song-dropdown-artist">{song.artist}</span>
                {song.hasLocalChords ? (
                  <span className="song-dropdown-badge song-dropdown-badge--cached">chords ready</span>
                ) : (
                  <span className="song-dropdown-badge song-dropdown-badge--online">online</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {fetchingChords && (
        <p className="song-fetching">Looking up chords for "{fetchingChords}" via AI...</p>
      )}

      <div className="search-input-row">
        <input
          type="text"
          className="search-chord-input"
          placeholder="e.g. G D Em C"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void analyze(); }}
        />
        <input
          type="number"
          className="search-capo-input"
          min={0}
          max={12}
          value={capo}
          onChange={(e) => setCapo(Math.max(0, Math.min(12, Number(e.target.value))))}
        />
        <button className="btn-primary" onClick={() => void analyze()} disabled={loading}>
          {loading ? 'Enhancing...' : 'Analyze'}
        </button>
      </div>

      <div className="search-presets">
        {PRESETS.map((p) => (
          <Chip key={p.label} label={p.label} onClick={() => handlePreset(p)} />
        ))}
      </div>

      <CapoStrip capo={capo} />

      {results.length > 0 && (
        <>
          <SectionLabel text="Chord Shapes" />
          <Legend />

          <div className="search-chord-grid">
            {results.map((r, i) => (
              <ChordCard
                key={r.soundingChord + i}
                result={r}
                animationDelay={i * 0.08}
              />
            ))}
          </div>
        </>
      )}

      {analysis && (
        <div className="ai-panel card" style={{ animation: 'fadeSlide 0.4s ease both' }}>
          <div className="ai-section">
            <span className="ai-progression">{analysis.progression}</span>
            {analysis.key && <span className="ai-key-badge">{analysis.key}</span>}
            {loading && <span className="ai-enhancing-badge">AI enhancing...</span>}
          </div>

          {analysis.capoRationale && (
            <p className="ai-rationale">{analysis.capoRationale}</p>
          )}

          {analysis.chordExplanations.length > 0 && (
            <div className="ai-explanations">
              {analysis.chordExplanations.map((ce) => (
                <div className="ai-explanation" key={ce.chord}>
                  <span className="ai-ex-chord">{ce.chord}</span>
                  <span className="ai-ex-shape">{ce.shape} shape</span>
                  <span className="ai-ex-why">{ce.why}</span>
                  <span className="ai-ex-theory">{ce.theory}</span>
                </div>
              ))}
            </div>
          )}

          {analysis.playabilityNote && (
            <p className="ai-playability">{analysis.playabilityNote}</p>
          )}

          {analysis.similarSongs.length > 0 && (
            <div className="ai-similar">
              <SectionLabel text="Similar Songs" />
              {analysis.similarSongs.map((song) => (
                <Chip key={song} label={song} onClick={() => {}} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
