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
            // React y sus dependencias deben estar juntos
            if (id.includes('react') || id.includes('scheduler') || id.includes('react-dom')) {
              return 'react-core';
            }
            // Radix UI debe estar con React, no separado
            if (id.includes('@radix-ui')) {
              return 'react-core';
            }
            if (id.includes('react-router')) return 'router';
            if (id.includes('@tanstack/react-query')) return 'react-query';
            if (id.includes('lucide-react')) return 'icons';
            return 'vendor';
          }
          if (id.includes('/src/facturas/')) return 'facturas';
        },
      },
    },
  },
});
