export interface Song {
  title: string;
  artist: string;
  chords: string[];
  capo: number;
  genre: string;
}

/**
 * Local chord cache — instant results for popular songs.
 * This supplements the MusicBrainz live search, not replaces it.
 * Songs found via AI chord lookup could be added here in the future.
 */
const CHORD_CACHE: Song[] = [
  { title: 'Wonderwall', artist: 'Oasis', chords: ['Em', 'G', 'D', 'A7'], capo: 2, genre: 'pop' },
  { title: 'Let It Be', artist: 'The Beatles', chords: ['C', 'G', 'Am', 'F'], capo: 0, genre: 'pop' },
  { title: 'Someone Like You', artist: 'Adele', chords: ['A', 'E', 'F#m', 'D'], capo: 2, genre: 'pop' },
  { title: 'Stitches', artist: 'Shawn Mendes', chords: ['Bm', 'G', 'D', 'A'], capo: 0, genre: 'pop' },
  { title: 'Shape of You', artist: 'Ed Sheeran', chords: ['C#m', 'F#m', 'A', 'B'], capo: 0, genre: 'pop' },
  { title: 'Perfect', artist: 'Ed Sheeran', chords: ['G', 'Em', 'C', 'D'], capo: 1, genre: 'pop' },
  { title: 'Thinking Out Loud', artist: 'Ed Sheeran', chords: ['D', 'D/F#', 'G', 'A'], capo: 0, genre: 'pop' },
  { title: 'Love Yourself', artist: 'Justin Bieber', chords: ['C', 'G', 'Am', 'F'], capo: 4, genre: 'pop' },
  { title: 'Stay With Me', artist: 'Sam Smith', chords: ['Am', 'F', 'C'], capo: 0, genre: 'pop' },
  { title: 'Shallow', artist: 'Lady Gaga & Bradley Cooper', chords: ['Em', 'D', 'G', 'C'], capo: 0, genre: 'pop' },
  { title: 'Viva La Vida', artist: 'Coldplay', chords: ['C', 'D', 'G', 'Em'], capo: 1, genre: 'pop' },
  { title: 'Yellow', artist: 'Coldplay', chords: ['G', 'D', 'C', 'Em'], capo: 0, genre: 'pop' },
  { title: 'Counting Stars', artist: 'OneRepublic', chords: ['Am', 'C', 'G', 'F'], capo: 0, genre: 'pop' },
  { title: 'Hotel California', artist: 'Eagles', chords: ['Am', 'E', 'G', 'D', 'F', 'C', 'Dm', 'E'], capo: 0, genre: 'rock' },
  { title: 'Wish You Were Here', artist: 'Pink Floyd', chords: ['Em', 'G', 'A', 'C', 'D'], capo: 0, genre: 'rock' },
  { title: 'Knockin on Heavens Door', artist: 'Bob Dylan', chords: ['G', 'D', 'Am', 'C'], capo: 0, genre: 'rock' },
  { title: 'Sweet Home Alabama', artist: 'Lynyrd Skynyrd', chords: ['D', 'C', 'G'], capo: 0, genre: 'rock' },
  { title: 'Free Fallin', artist: 'Tom Petty', chords: ['F', 'Bb', 'C', 'F'], capo: 3, genre: 'rock' },
  { title: 'Creep', artist: 'Radiohead', chords: ['G', 'B', 'C', 'Cm'], capo: 0, genre: 'rock' },
  { title: 'Zombie', artist: 'The Cranberries', chords: ['Em', 'C', 'G', 'D'], capo: 0, genre: 'rock' },
  { title: 'Nothing Else Matters', artist: 'Metallica', chords: ['Em', 'D', 'C', 'G', 'B7', 'Am'], capo: 0, genre: 'rock' },
  { title: 'Stairway To Heaven', artist: 'Led Zeppelin', chords: ['Am', 'E', 'C', 'D', 'Fmaj7'], capo: 0, genre: 'rock' },
  { title: 'Hallelujah', artist: 'Leonard Cohen', chords: ['C', 'Am', 'F', 'G'], capo: 0, genre: 'folk' },
  { title: 'The Sound of Silence', artist: 'Simon & Garfunkel', chords: ['Am', 'G', 'F', 'C'], capo: 6, genre: 'folk' },
  { title: 'Fast Car', artist: 'Tracy Chapman', chords: ['C', 'G', 'Em', 'D'], capo: 2, genre: 'folk' },
  { title: 'Wagon Wheel', artist: 'Old Crow Medicine Show', chords: ['G', 'D', 'Em', 'C'], capo: 2, genre: 'folk' },
  { title: 'Riptide', artist: 'Vance Joy', chords: ['Am', 'G', 'C'], capo: 1, genre: 'folk' },
  { title: 'Take Me Home Country Roads', artist: 'John Denver', chords: ['A', 'F#m', 'E', 'D'], capo: 2, genre: 'folk' },
  { title: 'Jolene', artist: 'Dolly Parton', chords: ['Am', 'C', 'G', 'Em'], capo: 4, genre: 'country' },
  { title: 'Ring of Fire', artist: 'Johnny Cash', chords: ['G', 'C', 'D'], capo: 0, genre: 'country' },
  { title: 'Three Little Birds', artist: 'Bob Marley', chords: ['A', 'D', 'E'], capo: 0, genre: 'reggae' },
  { title: 'No Woman No Cry', artist: 'Bob Marley', chords: ['C', 'G', 'Am', 'F'], capo: 0, genre: 'reggae' },
  { title: 'Redemption Song', artist: 'Bob Marley', chords: ['G', 'Em', 'C', 'Am', 'D'], capo: 0, genre: 'reggae' },
  { title: 'House of the Rising Sun', artist: 'The Animals', chords: ['Am', 'C', 'D', 'F', 'E'], capo: 0, genre: 'rock' },
  { title: 'Hey There Delilah', artist: 'Plain White Ts', chords: ['D', 'F#m', 'Bm', 'G', 'A'], capo: 0, genre: 'pop' },
  { title: 'Boulevard of Broken Dreams', artist: 'Green Day', chords: ['Em', 'G', 'D', 'A'], capo: 1, genre: 'rock' },
  { title: 'Photograph', artist: 'Ed Sheeran', chords: ['E', 'C#m', 'B', 'A'], capo: 4, genre: 'pop' },
  { title: 'Im Yours', artist: 'Jason Mraz', chords: ['C', 'G', 'Am', 'F'], capo: 4, genre: 'pop' },
  { title: 'Somewhere Over The Rainbow', artist: 'Israel Kamakawiwoole', chords: ['C', 'Em', 'Am', 'F', 'G'], capo: 0, genre: 'folk' },
];

/** Lookup from local chord cache (instant, no network) */
export function searchLocalCache(query: string): Song[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return CHORD_CACHE.filter(
    (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
  );
}

/** Find a specific song in the cache by title+artist fuzzy match */
export function findInCache(title: string, artist: string): Song | undefined {
  const t = title.toLowerCase();
  const a = artist.toLowerCase();
  return CHORD_CACHE.find(
    (s) => s.title.toLowerCase().includes(t) || t.includes(s.title.toLowerCase()) &&
           (s.artist.toLowerCase().includes(a) || a.includes(s.artist.toLowerCase()))
  );
}

/** Used by localAnalysis to find similar songs */
export { CHORD_CACHE as SONG_DATABASE };
