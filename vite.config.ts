import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  esbuild: {
    drop: ['console', 'debugger'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React y sus dependencias deben estar juntos y primero
            if (
              id.includes('react') ||
              id.includes('scheduler') ||
              id.includes('react-dom') ||
              id.includes('react/jsx-runtime') ||
              id.includes('react/jsx-dev-runtime')
            ) {
              return 'react-core';
            }
            // Radix UI debe estar con React, no separado
            if (id.includes('@radix-ui')) {
              return 'react-core';
            }
            // framer-motion también depende de React
            if (id.includes('framer-motion')) {
              return 'react-core';
            }
            if (id.includes('react-router')) return 'router';
            if (id.includes('@tanstack/react-query')) return 'react-query';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('axios')) return 'axios';
            if (id.includes('zustand')) return 'zustand';
            return 'vendor';
          }
          if (id.includes('/src/facturas/')) return 'facturas';
        },
      },
    },
  },
});
