// ============================================================================
// [SW:ARCH:MODULE_ENTRY]
// Vite/TypeScript entrypoint for the modern shell through Phase 4.
// ============================================================================

import { bootstrapSevereWeather } from './app/bootstrap';

declare global {
  var __SEVERE_WEATHER__: Awaited<ReturnType<typeof bootstrapSevereWeather>> | undefined;
  var __SW_MODERN_SHELL_READY__: boolean | undefined;
}

try {
  globalThis.__SEVERE_WEATHER__ = await bootstrapSevereWeather();
  globalThis.__SW_MODERN_SHELL_READY__ = true;
  document.documentElement.dataset.swArchitecture = 'modern-shell-v1';
  document.documentElement.dataset.swModernizationPhase = 'phase-4-scoring-campaign';
} catch (error) {
  globalThis.__SW_MODERN_SHELL_READY__ = false;
  console.error('[Severe Weather Warning] Modern shell bootstrap failed.', error);
  throw error;
}
