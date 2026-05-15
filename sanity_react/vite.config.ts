import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Polyfill for libraries expecting Node.js global
    global: 'globalThis',
  },
  build: {
    // Disable source maps in production to prevent code inspection
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove all console logs in production
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      }
    }
  },
  esbuild: {
    // Additional console log removal for development builds when deploying
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },
  server: {
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    proxy: {
      '/media': {
        target: 'https://media.battlexo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/media/, '')
      }
    }
  }
})
