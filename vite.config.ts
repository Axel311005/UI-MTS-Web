import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  base: '/',
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
    // Configuración básica de build sin chunks manuales
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Asegurar que los chunks se generen con rutas relativas
        manualChunks: undefined,
        // Generar nombres de chunks más predecibles
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Asegurar que los assets se generen correctamente
    assetsDir: 'assets',
    // Mejorar la generación de source maps para debugging
    sourcemap: false,
  },
});
