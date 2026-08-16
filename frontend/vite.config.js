import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path the app is served under. Vercel and local dev serve from the
// domain root, so this stays '/' unless VITE_BASE_PATH is set at build time
// (e.g. by the university-server Docker build, which serves under /trackly/).
// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
})
