import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7124',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    target: 'es2015',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('antd')) {
              return 'antd';
            }
            if (id.includes('@microsoft/signalr')) {
              return 'signalr';
            }
            if (id.includes('axios')) {
              return 'vendor-axios';
            }
            if (id.includes('sweetalert2')) {
              return 'vendor-sweetalert';
            }
          }
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})
