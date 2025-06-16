import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/quiz-app/' : '/', // Relative pentru build local, absolute pentru dev
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Elimină source maps pentru producție
    minify: 'terser', // Utilizează terser pentru minificare mai bună
    rollupOptions: {
      output: {
        manualChunks: {
          // Separă vendor libraries în chunk-uri separate
          vendor: ['react', 'react-dom'],
          antd: ['antd']
        },
        chunkFileNames: 'assets/js/[name].[hash].js',
        entryFileNames: 'assets/js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name!.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name!)) {
            return `assets/images/[name].[hash].${ext}`;
          }
          if (/\.(css)$/i.test(assetInfo.name!)) {
            return `assets/css/[name].[hash].${ext}`;
          }
          if (/\.(json)$/i.test(assetInfo.name!)) {
            return `assets/data/[name].[hash].${ext}`;
          }
          return `assets/[name].[hash].${ext}`;
        }
      }
    },
    // Optimizări pentru dimensiunea fișierelor
    terserOptions: {
      compress: {
        drop_console: true, // Elimină console.log în producție
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      }
    },
    // Setează pragul pentru warning-uri de dimensiune
    chunkSizeWarningLimit: 1000,
  },
  // Optimizări pentru dev
  server: {
    open: true,
    port: 3000
  }
}))
