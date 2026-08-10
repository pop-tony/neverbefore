import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Frontend lives in client/ but the project root (where .env, package.json,
// node_modules, and tsconfig live) stays one level up. Vite is invoked from
// the project root via `vite --config client/vite.config.ts`, so all paths
// here are resolved relative to this config file and anchored explicitly.
export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  plugins: [react()],
  envDir: fileURLToPath(new URL('..', import.meta.url)),
  css: {
    postcss: fileURLToPath(new URL('./postcss.config.js', import.meta.url)),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL('../dist', import.meta.url)),
    emptyOutDir: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
