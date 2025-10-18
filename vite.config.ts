import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      // Proxy API to local express to avoid CORS when fetching arf.json upstream
      '/api': 'http://localhost:5174'
    }
  }
})
