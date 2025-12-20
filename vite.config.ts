import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to avoid CORS issues
      '/api/sachet': {
        target: 'https://sachet.ndma.gov.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sachet/, '/cap_public_website/rss/rss_india.xml'),
        secure: false,
      },
      '/api/ogd': {
        target: 'https://api.data.gov.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ogd/, ''),
        secure: false,
      },

    }
  }
})

