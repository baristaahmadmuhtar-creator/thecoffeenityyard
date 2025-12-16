import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    allowedHosts: ['proprofit-puzzlingly-alta.ngrok-free.dev']
  },
  esbuild: {
    // HAPUS bagian 'drop'. Ganti dengan 'pure'.
    // Ini artinya: "Anggap console.log itu tidak penting, jadi hapus saja. Tapi biarkan yang lain (seperti console.info)"
    pure: mode === 'production' ? ['console.log', 'debugger'] : [],
  },
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('framer-motion')) return 'framer';
            return 'vendor';
          }
        }
      }
    }
  }
}))