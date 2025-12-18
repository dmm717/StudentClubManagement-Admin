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
            if (id.includes('antd')) {
              if (id.includes('antd/es/table') || id.includes('antd/es/table/')) {
                return 'antd-table';
              }
              if (id.includes('antd/es/form') || id.includes('antd/es/form/')) {
                return 'antd-form';
              }
              if (id.includes('antd/es/date-picker') || id.includes('antd/es/date-picker/')) {
                return 'antd-datepicker';
              }
              return 'antd';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
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
            if (id.includes('@heroicons')) {
              return 'vendor-icons';
            }
            if (id.includes('dayjs')) {
              return 'vendor-dayjs';
            }
            return 'vendor-other';
          }
        }
      }
    },
    chunkSizeWarningLimit: 500
  }
})
