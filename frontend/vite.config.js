import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,      // This enables network access (equivalent to --host)
    port: 3000,      // Keeps your app running on port 3000
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      }
    }
  },
  envPrefix: ['VITE_', 'REACT_APP_'],
  define: {
    // Use VITE_BACKEND_URL for production, fallback to custom domain, then localhost for dev
    'process.env.REACT_APP_BACKEND_URL': JSON.stringify(
      process.env.VITE_BACKEND_URL || 
      process.env.REACT_APP_BACKEND_URL || 
      'https://charisbilleasy.store'
    ),
    'import.meta.env.VITE_BACKEND_URL': JSON.stringify(
      process.env.VITE_BACKEND_URL || 
      'https://charisbilleasy.store'
    ),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
});
