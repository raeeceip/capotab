/**
 * Cloudflare Pages Function — proxies MusicBrainz Recording Search.
 * Browser calls GET /api/search?q=wonderwall
 *
 * Does TWO parallel MusicBrainz searches:
 * 1. Default query (matches song titles well)
 * 2. artist:"query" (finds songs BY that artist)
 * Then merges, deduplicates, and filters noise.
 */

interface MBRecording {
  id: string;
  score?: number;
  title: string;
  disambiguation?: string;
  'artist-credit'?: { name: string }[];
  releases?: { title: string }[];
}

interface MBResponse {
  recordings?: MBRecording[];
}

interface CleanResult {
  id: string;
  title: string;
  artist: string;
  album?: string;
}

const NOISE = /\binterview\b|\bspeaks?\b|\bdance camp\b|\bkaraoke\b|\binstrumental\b|\btribute\b|\bmedley\b/i;
const MB_HEADERS = {
  'User-Agent': 'CapoTab/1.0 (https://capotab.pages.dev)',
  'Accept': 'application/json',
};

function cleanRecordings(data: MBResponse): CleanResult[] {
  const results: CleanResult[] = [];
  for (const rec of data.recordings ?? []) {
    const title = rec.title ?? '';
    const artist =
      rec['artist-credit']?.map((ac) => ac.name).join(', ') ?? 'Unknown';

    if (rec.score !== undefined && rec.score < 40) continue;
    if (title.startsWith('[')) continue;
    if (NOISE.test(title)) continue;
    if (rec.disambiguation && NOISE.test(rec.disambiguation)) continue;

    results.push({
      id: rec.id,
      title,
      artist,
      album: rec.releases?.[0]?.title,
    });
  }
  return results;
}

export const onRequestGet: PagesFunction = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') ?? '';

  if (query.trim().length < 2) {
    return Response.json({ recordings: [] });
  }

  const base = 'https://musicbrainz.org/ws/2/recording';

  // Two parallel searches: song title match + artist match
  const [titleResp, artistResp] = await Promise.allSettled([
    fetch(`${base}?query=${encodeURIComponent(query)}&fmt=json&limit=15`, { headers: MB_HEADERS }),
    fetch(`${base}?query=artist:${encodeURIComponent(`"${query}"`)}&fmt=json&limit=15`, { headers: MB_HEADERS }),
  ]);

  const titleResults: CleanResult[] = [];
  const artistResults: CleanResult[] = [];

  if (titleResp.status === 'fulfilled' && titleResp.value.ok) {
    const data: MBResponse = await titleResp.value.json();
    titleResults.push(...cleanRecordings(data));
  }

  if (artistResp.status === 'fulfilled' && artistResp.value.ok) {
    const data: MBResponse = await artistResp.value.json();
    artistResults.push(...cleanRecordings(data));
  }

  // Merge: artist results first (more relevant when searching by artist name),
  // then title results (more relevant when searching by song name)
  const seen = new Set<string>();
  const merged: CleanResult[] = [];

  for (const rec of [...artistResults, ...titleResults]) {
    const key = `${rec.title.toLowerCase()}|${rec.artist.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(rec);
    if (merged.length >= 12) break;
  }

  return Response.json({ recordings: merged });
};
