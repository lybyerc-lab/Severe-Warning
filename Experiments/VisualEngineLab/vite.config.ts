import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';

let commit = 'HEAD';
try {
  commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
} catch (e) {
  // fallback if git CLI is absent
}

export default defineConfig({
  define: {
    __BUILD_COMMIT__: JSON.stringify(commit)
  },
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
