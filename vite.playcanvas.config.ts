import { defineConfig } from 'vite';

export default defineConfig({
  root: 'playcanvas-slice',
  base: './',
  publicDir: 'public',
  build: {
    outDir: '../playcanvas-slice-dist',
    emptyOutDir: true,
    sourcemap: true,
    target: 'es2022',
  },
});
