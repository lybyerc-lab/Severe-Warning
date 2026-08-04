import { defineConfig } from 'vite';
import packageJson from './package.json';

export default defineConfig({
  define: {
    __SW_BUILD_VERSION__: JSON.stringify(packageJson.version),
    __SW_BUILD_LABEL__: JSON.stringify(packageJson.buildLabel ?? 'Severe Weather Warning'),
  },
  build: {
    outDir: 'modern-dist',
    emptyOutDir: true,
    sourcemap: true,
    target: 'es2022',
    lib: {
      entry: 'src/main.ts',
      formats: ['es'],
      fileName: () => 'modern-shell.js',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'modern-shell.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
