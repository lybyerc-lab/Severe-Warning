import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    sourcemap: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1800
  },
  server: {
    port: 4174,
    strictPort: true
  },
  preview: {
    port: 4174,
    strictPort: true
  }
});
