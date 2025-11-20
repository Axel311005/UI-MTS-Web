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
    legalComments: 'none', // Eliminar comentarios legales
    minifyIdentifiers: true, // Minificar identificadores
    minifySyntax: true, // Minificar sintaxis
    minifyWhitespace: true, // Minificar espacios en blanco
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
    minify: 'terser', // Usar terser para mejor minificación y ofuscación
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log en producción
        drop_debugger: true, // Eliminar debugger
        pure_funcs: [
          'console.log',
          'console.info',
          'console.debug',
          'console.warn',
          'console.error',
        ], // Eliminar todas las funciones de console
        passes: 2, // Múltiples pases para mejor compresión
      },
      format: {
        comments: false, // Eliminar comentarios
      },
      mangle: {
        properties: false, // No ofuscar propiedades (puede romper código)
        toplevel: true, // Ofuscar variables de nivel superior
        keep_classnames: false, // Ofuscar nombres de clases
        keep_fnames: false, // Ofuscar nombres de funciones
      },
    },
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
    // Deshabilitar source maps en producción para seguridad
    sourcemap: false,
    // Asegurar que no se generen source maps en ningún caso
    cssCodeSplit: true,
    // Ocultar información de módulos
    reportCompressedSize: false,
  },
});
