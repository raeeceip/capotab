import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Dev: proxy /api/search to MusicBrainz directly (in prod, Cloudflare Pages Function handles this)
      '/api/search': {
        target: 'https://musicbrainz.org',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://localhost');
          const q = url.searchParams.get('q') ?? '';
          return `/ws/2/recording?query=${encodeURIComponent(q)}&fmt=json&limit=25`;
        },
        headers: {
          'User-Agent': 'CapoTab/1.0 (https://capotab.pages.dev)',
        },
      },
    },
  },
})
