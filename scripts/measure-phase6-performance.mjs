import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = process.env.SEVERE_WEATHER_PERF_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_PERF_DIR)
  : path.join(projectRoot, 'qa-artifacts', 'modernization-phase-6', 'performance');
const baselineUrl = process.env.SEVERE_WEATHER_BASE_URL;
const candidateUrl = process.env.SEVERE_WEATHER_CANDIDATE_URL || process.env.SEVERE_WEATHER_QA_URL;
const NAVIGATION_TIMEOUT_MS = 20000;
const FRAME_OBSERVATION_WINDOW_MS = 3500;
const MIN_VALID_FRAME_DELTAS = 5;
if (!baselineUrl || !candidateUrl) {
  throw new Error('Phase 6 performance evidence requires SEVERE_WEATHER_BASE_URL and SEVERE_WEATHER_CANDIDATE_URL.');
}
await mkdir(outputDir, { recursive: true });

function percentile(values, ratio) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * ratio))];
}

function summarizeFrameTimes(frameTimesMs, observationWindowMs) {
  const valid = frameTimesMs.length >= MIN_VALID_FRAME_DELTAS;
  const median = percentile(frameTimesMs, 0.5);
  const p95 = percentile(frameTimesMs, 0.95);
  return {
    timingEvidenceValid: valid,
    timingEvidenceStatus: valid ? 'valid' : 'insufficient-observed-frames',
    observationWindowMs,
    sampleCount: frameTimesMs.length,
    frameTimeMedianMs: valid ? Number(median.toFixed(3)) : null,
    frameTimeP95Ms: valid ? Number(p95.toFixed(3)) : null,
    fpsMedian: valid && median > 0 ? Number((1000 / median).toFixed(2)) : null,
    fpsP95: valid && p95 > 0 ? Number((1000 / p95).toFixed(2)) : null,
    longFrame33Count: frameTimesMs.filter((value) => value > 33.3).length,
    longFrame50Count: frameTimesMs.filter((value) => value > 50).length,
  };
}

async function installPassiveFrameObserver(page) {
  await page.addInitScript(() => {
    const originalRequestAnimationFrame = globalThis.requestAnimationFrame.bind(globalThis);
    const timestamps = [];
    Object.defineProperty(globalThis, '__SW_PHASE6_FRAME_TIMESTAMPS__', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: timestamps,
    });
    globalThis.requestAnimationFrame = (callback) => originalRequestAnimationFrame((timestamp) => {
      timestamps.push(Number(timestamp));
      if (timestamps.length > 5000) timestamps.splice(0, timestamps.length - 5000);
      callback(timestamp);
    });
  });
}

async function collectObservedFrameDeltas(page, durationMs = FRAME_OBSERVATION_WINDOW_MS) {
  const startIndex = await page.evaluate(() => {
    const values = globalThis.__SW_PHASE6_FRAME_TIMESTAMPS__ || [];
    return Math.max(0, values.length - 1);
  });
  await page.waitForTimeout(durationMs);
  const timestamps = await page.evaluate((index) => (
    (globalThis.__SW_PHASE6_FRAME_TIMESTAMPS__ || []).slice(index)
  ), startIndex);
  const deltas = [];
  for (let index = 1; index < timestamps.length; index += 1) {
    const delta = Number(timestamps[index]) - Number(timestamps[index - 1]);
    if (Number.isFinite(delta) && delta > 0 && delta < 1000) deltas.push(delta);
  }
  return deltas;
}

async function runtimeMetrics(page) {
  return page.evaluate(() => {
    const phase5 = globalThis.__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__?.getSnapshot?.() || null;
    const phase6 = globalThis.__SW_PHASE6_PERFORMANCE_BRIDGE__?.getSnapshot?.() || null;
    const live = phase5?.live || null;
    const memory = performance.memory && Number.isFinite(performance.memory.usedJSHeapSize)
      ? Number((performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(3))
      : null;
    return {
      renderer: live?.renderer?.frame || null,
      rendererMemory: live?.renderer?.memory || null,
      scene: live?.scene ? {
        meshCount: live.scene.meshCount,
        uniqueMaterialCount: live.scene.uniqueMaterialCount,
        uniqueGeometryCount: live.scene.uniqueGeometryCount,
        uniqueTextureCount: live.scene.uniqueTextureCount,
      } : null,
      productionQa: live?.productionQa || null,
      heapUsageMbProxy: memory,
      phase6,
    };
  });
}

async function captureScenario(page, label, setup, observationWindowMs = FRAME_OBSERVATION_WINDOW_MS) {
  if (setup) await setup();
  await page.waitForTimeout(150);
  const frameTimes = await collectObservedFrameDeltas(page, observationWindowMs);
  const metrics = await runtimeMetrics(page);
  await page.screenshot({ path: path.join(outputDir, `${label}.png`), fullPage: true, timeout: 15000 });
  return {
    ...summarizeFrameTimes(frameTimes, observationWindowMs),
    ...metrics,
  };
}

async function measureBuild(browser, url, label) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.setDefaultTimeout(NAVIGATION_TIMEOUT_MS);
  page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT_MS);
  await installPassiveFrameObserver(page);
  const errors = [];
  const logs = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    logs.push(`[${message.type()}] ${message.text()}`);
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });

  try {
    await page.goto(`${url}?qa=1&phase6perf=1`, { waitUntil: 'domcontentloaded', timeout: NAVIGATION_TIMEOUT_MS });
    await page.waitForFunction(
      () => typeof globalThis.__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__?.getSnapshot === 'function',
      null,
      { timeout: NAVIGATION_TIMEOUT_MS },
    );
    await page.waitForTimeout(500);

    const scenarios = {};
    scenarios.initial = await captureScenario(page, `${label}-initial`, null);
    scenarios.movement = await captureScenario(page, `${label}-movement`, async () => {
      await page.keyboard.down('ArrowUp');
      await page.waitForTimeout(500);
    });
    await page.keyboard.up('ArrowUp');
    scenarios.heavyDestruction = await captureScenario(page, `${label}-heavy-destruction`, async () => {
      await page.evaluate(() => globalThis.triggerProductionSliceQa('hero'));
    }, 4500);
    scenarios.afterReset = await captureScenario(page, `${label}-after-reset`, async () => {
      await page.evaluate(() => globalThis.__SW_V510_REBUILD__());
    }, 2500);

    return {
      label,
      url,
      capturedAt: new Date().toISOString(),
      scenarios,
      errors,
    };
  } finally {
    await writeFile(path.join(outputDir, `${label}-browser.log`), `${logs.join('\n')}\n`, 'utf8');
    await page.close();
  }
}

function nullableDelta(candidateValue, baselineValue) {
  if (!Number.isFinite(candidateValue) || !Number.isFinite(baselineValue)) return null;
  return Number((candidateValue - baselineValue).toFixed(3));
}

function compareScenario(baseline, candidate) {
  return {
    timingComparisonValid: baseline.timingEvidenceValid === true && candidate.timingEvidenceValid === true,
    baselineTimingStatus: baseline.timingEvidenceStatus,
    candidateTimingStatus: candidate.timingEvidenceStatus,
    frameTimeMedianMsDelta: nullableDelta(candidate.frameTimeMedianMs, baseline.frameTimeMedianMs),
    frameTimeP95MsDelta: nullableDelta(candidate.frameTimeP95Ms, baseline.frameTimeP95Ms),
    fpsMedianDelta: nullableDelta(candidate.fpsMedian, baseline.fpsMedian),
    longFrame33Delta: Number((candidate.longFrame33Count || 0) - (baseline.longFrame33Count || 0)),
    longFrame50Delta: Number((candidate.longFrame50Count || 0) - (baseline.longFrame50Count || 0)),
    drawCallsDelta: Number((candidate.renderer?.calls || 0) - (baseline.renderer?.calls || 0)),
    trianglesDelta: Number((candidate.renderer?.triangles || 0) - (baseline.renderer?.triangles || 0)),
    meshCountDelta: Number((candidate.scene?.meshCount || 0) - (baseline.scene?.meshCount || 0)),
    geometryCountDelta: Number((candidate.scene?.uniqueGeometryCount || 0) - (baseline.scene?.uniqueGeometryCount || 0)),
    materialCountDelta: Number((candidate.scene?.uniqueMaterialCount || 0) - (baseline.scene?.uniqueMaterialCount || 0)),
  };
}

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});
let baseline;
let candidate;
try {
  baseline = await measureBuild(browser, baselineUrl, 'baseline');
  candidate = await measureBuild(browser, candidateUrl, 'candidate');
} finally {
  await browser.close();
}

const comparison = {
  version: 'MODERNIZATION_PHASE6_DUAL_BUILD_PERFORMANCE_V3',
  passed: true,
  generatedAt: new Date().toISOString(),
  runnerNote: 'Frame timings are same-runner advisory evidence. Integration and bounded-resource contracts remain blocking.',
  captureMethod: {
    type: 'passive-requestAnimationFrame-observer',
    defaultObservationWindowMs: FRAME_OBSERVATION_WINDOW_MS,
    minimumValidFrameDeltas: MIN_VALID_FRAME_DELTAS,
    navigationTimeoutMs: NAVIGATION_TIMEOUT_MS,
    insufficientTimingDoesNotBlock: true,
  },
  scenarios: Object.fromEntries(
    Object.keys(baseline.scenarios).map((name) => [name, compareScenario(baseline.scenarios[name], candidate.scenarios[name])]),
  ),
  candidateIntegration: candidate.scenarios.heavyDestruction.phase6?.integration || null,
  candidatePool: candidate.scenarios.heavyDestruction.phase6?.debrisPool || null,
  errors: { baseline: baseline.errors, candidate: candidate.errors },
};

const integration = comparison.candidateIntegration;
if (!integration || integration.productionUpdateSamples <= 0 || integration.productionDustBurstCalls <= 0 || integration.pooledDustSpawned <= 0) {
  throw new Error(`Phase 6 candidate did not prove real executor integration: ${JSON.stringify(integration)}`);
}
if (baseline.errors.length || candidate.errors.length) {
  throw new Error(`Performance capture saw browser errors: ${JSON.stringify(comparison.errors)}`);
}

await writeFile(path.join(outputDir, 'baseline-report.json'), JSON.stringify(baseline, null, 2), 'utf8');
await writeFile(path.join(outputDir, 'candidate-report.json'), JSON.stringify(candidate, null, 2), 'utf8');
await writeFile(path.join(outputDir, 'comparison-report.json'), JSON.stringify(comparison, null, 2), 'utf8');

const scenarioRows = Object.entries(comparison.scenarios)
  .map(([name, metrics]) => `| ${name} | ${metrics.timingComparisonValid ? 'valid' : 'advisory unavailable'} | ${metrics.frameTimeMedianMsDelta ?? 'n/a'} | ${metrics.frameTimeP95MsDelta ?? 'n/a'} | ${metrics.drawCallsDelta} | ${metrics.trianglesDelta} |`)
  .join('\n');
const markdown = `# Phase 6 Dual-Build Performance Evidence\n\nGenerated: ${comparison.generatedAt}\n\nThis report compares the accepted Phase 5 base and the Phase 6 candidate on the same GitHub Actions runner. Timing values are advisory; executor integration, bounded pools, reset behavior, and telemetry integrity are blocking.\n\nFrame timing uses a passive requestAnimationFrame observer installed before application load. Every scenario has a fixed observation window, so evidence collection cannot wait indefinitely for a target frame count.\n\n| Scenario | Timing status | Median frame delta ms | P95 frame delta ms | Draw-call delta | Triangle delta |\n|---|---|---:|---:|---:|---:|\n${scenarioRows}\n\n## Candidate integration proof\n\n- Production update samples: ${integration.productionUpdateSamples}\n- Production dust burst calls: ${integration.productionDustBurstCalls}\n- Pooled dust spawned: ${integration.pooledDustSpawned}\n- Pool high-water mark: ${comparison.candidatePool?.highWaterMark ?? 'n/a'} / ${comparison.candidatePool?.poolCapacity ?? 'n/a'}\n`;
await writeFile(path.join(outputDir, 'phase6-performance-report.md'), markdown, 'utf8');
console.log(`[SW:PERF] Wrote dual-build evidence to ${outputDir}`);
