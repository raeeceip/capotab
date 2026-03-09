/**
 * Real song search — calls /api/search which is handled by:
 * - Production: Cloudflare Pages Function (server-side proxy to MusicBrainz)
 * - Dev: Vite proxy forwarding to MusicBrainz
 *
 * Both return MusicBrainz JSON; the client normalizes either format.
 */

export interface MusicSearchResult {
  id: string;
  title: string;
  artist: string;
  album?: string;
  /** true if this result came from the local chord cache */
  hasLocalChords: boolean;
  /** pre-loaded chords if from local cache */
  chords?: string[];
  /** pre-loaded capo if from local cache */
  capo?: number;
}

// Raw MusicBrainz recording shape
interface MBRawRecording {
  id: string;
  score?: number;
  title: string;
  disambiguation?: string;
  'artist-credit'?: { name: string }[];
  releases?: { title: string }[];
}

// Our Pages Function cleaned shape
interface CleanRecording {
  id: string;
  title: string;
  artist: string;
  album?: string;
}

function isRawMB(rec: MBRawRecording | CleanRecording): rec is MBRawRecording {
  return 'artist-credit' in rec;
}

export async function searchMusicBrainz(query: string): Promise<MusicSearchResult[]> {
  if (!query.trim() || query.trim().length < 2) return [];

  const resp = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!resp.ok) return [];

  const data = await resp.json();
  const recordings: (MBRawRecording | CleanRecording)[] = data.recordings ?? [];

  // Noise patterns — skip interviews, DJ mixes, tributes, cover compilations
  const NOISE = /\binterview\b|\bspeaks?\b|\bdance camp\b|\bkaraoke\b|\binstrumental\b|\btribute\b|\bmedley\b/i;

  const seen = new Set<string>();
  const results: MusicSearchResult[] = [];

  for (const rec of recordings) {
    let title: string;
    let artist: string;
    let album: string | undefined;

    if (isRawMB(rec)) {
      // Raw MusicBrainz format (Vite dev proxy)
      title = rec.title ?? '';
      artist = rec['artist-credit']?.map((ac) => ac.name).join(', ') ?? 'Unknown';
      album = rec.releases?.[0]?.title;

      // Skip low-relevance results and noise
      if (rec.score !== undefined && rec.score < 50) continue;
      if (rec.disambiguation && NOISE.test(rec.disambiguation)) continue;
    } else {
      // Cleaned format (Pages Function in production)
      title = rec.title;
      artist = rec.artist;
      album = rec.album;
    }

    // Skip bracket-prefixed non-song entries like "[Adele speaks]"
    if (title.startsWith('[')) continue;
    if (NOISE.test(title)) continue;

    const key = `${title.toLowerCase()}|${artist.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    results.push({
      id: rec.id,
      title,
      artist,
      album,
      hasLocalChords: false,
    });

    if (results.length >= 12) break;
  }

  return results;
}

/**
 * Ask Claude to suggest chords for a song.
 * Returns {chords, capo} or null if AI unavailable.
 */
export async function fetchChordsFromAI(
  title: string,
  artist: string
): Promise<{ chords: string[]; capo: number } | null> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_key_here') return null;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system:
          'You are a guitar chord expert. When asked about a song, return ONLY a JSON object with the main chord progression and recommended capo. No markdown, no explanation.',
        messages: [
          {
            role: 'user',
            content: `What are the main guitar chords for "${title}" by ${artist}? Return ONLY this JSON format:\n{"chords": ["G", "D", "Em", "C"], "capo": 0}\nUse the simplest common chord version of the song. Just the unique chords in order of first appearance.`,
          },
        ],
      }),
    });

    if (!resp.ok) return null;

    const data = await resp.json();
    const text = data.content?.[0]?.text ?? '';
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed.chords) && typeof parsed.capo === 'number') {
      return { chords: parsed.chords, capo: parsed.capo };
    }
    return null;
  } catch {
    return null;
  }
}
