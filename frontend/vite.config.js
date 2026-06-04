import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// =========================================
// Vite Config — Cloudflare Pages + Railway
// =========================================
//
// LOCAL DEVELOPMENT:
//   Frontend: http://localhost:3000 (proxies /api to :8001)
//   Backend:  http://localhost:8001
//
// PRODUCTION (Cloudflare Pages):
//   Set VITE_BACKEND_URL in Cloudflare Dashboard → Settings → Environment Variables
//   Set VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX for Google Analytics 4

const BACKEND_URL = process.env.VITE_BACKEND_URL;

export default defineConfig({
  plugins: [react()],

  server: {
    host: true,   // Allow LAN access for mobile testing
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true
      }
    }
  },

  envPrefix: ['VITE_', 'REACT_APP_'],

  define: {
    'process.env.REACT_APP_BACKEND_URL': JSON.stringify(BACKEND_URL || ''),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  build: {
    // Target modern browsers — smaller, faster output
    target: 'esnext',
    // Warn only for truly huge chunks
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Split vendor libraries into separate cached chunks.
        // This means React/Recharts/Radix only re-download when THOSE packages change,
        // not on every app deploy.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // Heavy charting library — its own chunk
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'charts';
          }
          // All Radix UI primitives — one chunk
          if (id.includes('@radix-ui')) {
            return 'radix-ui';
          }
          // React core + DOM — stays tiny and cached longest
          if (id.includes('react-dom') || id.includes('react-router')) {
            return 'react-vendor';
          }
          // PDF generation — large, only needed for invoice pages
          if (id.includes('pdfkit') || id.includes('pdf-lib') || id.includes('pdfmake')) {
            return 'pdf-vendor';
          }
          // Everything else from node_modules
          return 'vendor';
        }
      }
    }
  }
});
