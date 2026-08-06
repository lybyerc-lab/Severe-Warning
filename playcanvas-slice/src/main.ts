// ============================================================================
// [SW:PLAYCANVAS:PRODUCTION_SLICE_ENTRY]
// Isolated Prairie Junction renderer proof. This lane never initializes the
// accepted Three.js game and owns no scoring, controls, timing, or save state.
// ============================================================================

import './styles.css';
import {
  PLAYCANVAS_VERSION,
  ROAD_CLEARANCE,
  TORNADO_GROUND_CLEARANCE,
} from './constants';
import type { PcApplication, PlayCanvasModule } from './engine-types';
import { populatePrairieJunctionScene } from './scene';

interface SliceTelemetry {
  readonly renderer: 'PlayCanvas';
  readonly engineVersion: string;
  readonly roadClearance: number;
  readonly tornadoGroundClearance: number;
  readonly entityCount: number;
  readonly qaMode: boolean;
}

interface SliceHandle {
  readonly telemetry: SliceTelemetry;
  dispose(): void;
}

declare global {
  var __SW_PLAYCANVAS_SLICE__: SliceHandle | undefined;
}

function setStatus(message: string, state: 'loading' | 'ready' | 'error'): void {
  const status = document.querySelector<HTMLElement>('#slice-status');
  if (!status) return;
  status.textContent = message;
  status.dataset.ready = state === 'ready' ? 'true' : 'false';
  status.dataset.error = state === 'error' ? 'true' : 'false';
}

async function loadPlayCanvasEngine(): Promise<PlayCanvasModule> {
  const engineUrl = new URL(`vendor/playcanvas-${PLAYCANVAS_VERSION}.min.mjs`, document.baseURI).href;
  return (await import(/* @vite-ignore */ engineUrl)) as unknown as PlayCanvasModule;
}

function clearTelemetry(): void {
  delete document.documentElement.dataset.swPlaycanvasSliceReady;
  delete document.documentElement.dataset.swPlaycanvasEngineVersion;
  delete document.documentElement.dataset.swRoadClearance;
  delete document.documentElement.dataset.swTornadoGroundClearance;
  delete document.documentElement.dataset.swRenderer;
}

function animateTornado(app: PcApplication, tornadoParts: readonly import('./engine-types').PcEntity[]): void {
  app.on('update', (deltaSeconds) => {
    tornadoParts.forEach((part, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      part.rotate(0, direction * deltaSeconds * (30 + index * 8), 0);
    });
  });
}

async function bootstrapSlice(): Promise<SliceHandle> {
  setStatus('Loading PlayCanvas renderer…', 'loading');
  const pc = await loadPlayCanvasEngine();
  const qaMode = new URLSearchParams(window.location.search).get('qa') === '1';
  const mount = document.querySelector<HTMLElement>('#app');
  if (!mount) throw new Error('PlayCanvas slice mount is missing.');

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-label', 'PlayCanvas Prairie Junction renderer proof');
  mount.prepend(canvas);

  const app = new pc.Application(canvas, {
    graphicsDeviceOptions: {
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance',
    },
  });
  app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(pc.RESOLUTION_AUTO);

  const resize = (): void => app.resizeCanvas();
  window.addEventListener('resize', resize);
  const scene = populatePrairieJunctionScene(pc, app);
  if (!qaMode) animateTornado(app, scene.tornadoParts);

  app.start();
  resize();

  const telemetry: SliceTelemetry = Object.freeze({
    renderer: 'PlayCanvas',
    engineVersion: PLAYCANVAS_VERSION,
    roadClearance: ROAD_CLEARANCE,
    tornadoGroundClearance: TORNADO_GROUND_CLEARANCE,
    entityCount: scene.entities.length,
    qaMode,
  });

  document.documentElement.dataset.swPlaycanvasSliceReady = 'true';
  document.documentElement.dataset.swPlaycanvasEngineVersion = PLAYCANVAS_VERSION;
  document.documentElement.dataset.swRoadClearance = ROAD_CLEARANCE.toFixed(2);
  document.documentElement.dataset.swTornadoGroundClearance = TORNADO_GROUND_CLEARANCE.toFixed(2);
  document.documentElement.dataset.swRenderer = 'PlayCanvas';
  setStatus('PlayCanvas slice ready', 'ready');

  return Object.freeze({
    telemetry,
    dispose(): void {
      window.removeEventListener('resize', resize);
      app.destroy();
      canvas.remove();
      clearTelemetry();
      globalThis.__SW_PLAYCANVAS_SLICE__ = undefined;
    },
  });
}

try {
  globalThis.__SW_PLAYCANVAS_SLICE__ = await bootstrapSlice();
} catch (error) {
  document.documentElement.dataset.swPlaycanvasSliceReady = 'false';
  document.documentElement.dataset.swPlaycanvasSliceError = 'true';
  setStatus('PlayCanvas slice failed to initialize', 'error');
  console.error('[Severe Weather Warning] PlayCanvas production slice failed.', error);
  throw error;
}
