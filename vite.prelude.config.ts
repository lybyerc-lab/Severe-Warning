// [SW:ARCH:ECONOMY_PRELUDE] build
// A second, deliberately tiny bundle. modern-shell.js is an ES module that loads
// after the page and mirrors the running game; this one is an IIFE that has to be
// in place BEFORE the gameplay script's first line, because the game calls into
// it synchronously while building the world.
//
// Kept separate from vite.config.ts rather than folded in as a second entry: the
// two have opposite delivery contracts (module vs inlined classic script), and
// collapsing them would make it easy to ship the prelude as a module by accident,
// which would silently arrive too late and leave the game on its fallbacks.
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'modern-dist',
    // modern-shell.js is built first and lives here too.
    emptyOutDir: false,
    sourcemap: false,
    target: 'es2019',
    minify: false,
    lib: {
      entry: 'src/gameplay/economy/economy-prelude.ts',
      formats: ['iife'],
      name: '__SW_ECONOMY_BUNDLE__',
      fileName: () => 'sw-economy-prelude.js',
    },
  },
});
