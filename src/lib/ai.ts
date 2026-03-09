import type { AIAnalysis } from '../types';

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

export async function analyzeProgression(
  chords: string[],
  capo: number
): Promise<AIAnalysis> {
  const fallback: AIAnalysis = {
    progression: 'Analysis unavailable',
    key: '',
    capoRationale: '',
    chordExplanations: [],
    playabilityNote: '',
    similarSongs: []
  };

  if (!apiKey || apiKey === 'your_key_here') {
    return {
      ...fallback,
      progression: 'API key not configured',
      capoRationale: 'Set VITE_ANTHROPIC_API_KEY in .env to enable AI analysis.'
    };
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'You are a guitar theory expert. You explain chord progressions and capo usage clearly and concisely, as if talking to an intermediate guitarist. Be direct — no filler. Respond ONLY with valid JSON matching the AIAnalysis schema provided. No markdown fences, no preamble.',
        messages: [{
          role: 'user',
          content: `Analyze this guitar chord progression:\nChords: ${chords.join(' ')}\nCapo: ${capo} (these are the SOUNDING chords; the player uses capo ${capo} and plays shapes transposed down ${capo} semitones)\n\nReturn JSON with this exact structure:\n{\n  "progression": "string — name or description of this progression",\n  "key": "string — likely key",\n  "capoRationale": "string — why a guitarist would use this capo position",\n  "chordExplanations": [\n    {\n      "chord": "sounding chord name",\n      "shape": "open-string shape name",\n      "why": "why this shape is used",\n      "theory": "role in the key (e.g. I, IV, V)"\n    }\n  ],\n  "playabilityNote": "string — difficulty/beginner notes",\n  "similarSongs": ["song 1", "song 2", "song 3"]\n}`
        }]
      })
    });

    if (!response.ok) {
      console.error('API error:', response.status);
      return fallback;
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const parsed = JSON.parse(text) as AIAnalysis;
    return parsed;
  } catch (err) {
    console.error('AI analysis failed:', err);
    return fallback;
  }
}
