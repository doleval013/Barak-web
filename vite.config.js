import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // Needed for Docker/Cloud
    port: process.env.PORT ? parseInt(process.env.PORT) : 80,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      }
    }
  },
  preview: {
    host: true, // Needed for Docker/Cloud
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
    allowedHosts: true,
  },
})
