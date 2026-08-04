import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR)
  : path.join(projectRoot, 'qa-artifacts', 'modernization-phase-5');
const baseUrl = process.env.SEVERE_WEATHER_QA_URL || 'http://127.0.0.1:4173/';
const executablePath = process.env.CHROME_BIN || undefined;

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath,
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--enable-webgl',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
    '--disable-gpu-sandbox',
  ],
});

const viewports = [
  { name: 'desktop-1365x768', width: 1365, height: 768, isMobile: false },
  { name: 'mobile-915x412', width: 915, height: 412, isMobile: true },
  { name: 'wide-landscape-1280x540', width: 1280, height: 540, isMobile: true },
];
const results = [];
const jsonEqual = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const maxSpread = (values) => Math.max(...values) - Math.min(...values);

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.isMobile,
    hasTouch: viewport.isMobile,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForFunction(() => (
    globalThis.__SW_MODERN_SHELL_READY__ === true
    && globalThis.__SEVERE_WEATHER__?.modernizationPhase === 'phase-5-rendering-world'
    && globalThis.__SEVERE_WEATHER__?.qa?.getPresentationWorldBridgeSnapshot?.().attached === true
    && globalThis.__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__?.version === 'MODERNIZATION_PHASE5_PRESENTATION_WORLD_V2'
  ));

  const evidence = await page.evaluate(async () => {
    const shell = globalThis.__SEVERE_WEATHER__;
    const bridge = globalThis.__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__;
    if (!shell || !bridge) throw new Error('Phase 5 shell or bridge unavailable.');
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    await shell.qa.prepareScenario('production-hero');
    await sleep(120);
    const snapshot = bridge.getSnapshot();
    const probe = bridge.runContractProbe();
    const productionQa = shell.qa.getSnapshot();

    const cycles = [];
    for (let cycle = 0; cycle < 5; cycle += 1) {
      const memoryBefore = { ...bridge.getSnapshot().renderer.memory };
      shell.app.reset();
      await sleep(40);
      await shell.qa.prepareScenario('production-hero');
      await sleep(100);
      const cycleSnapshot = bridge.getSnapshot();
      const memoryAfter = { ...cycleSnapshot.renderer.memory };
      cycles.push({
        memoryBefore,
        memoryAfter,
        rendererMemory: { ...cycleSnapshot.renderer.memory },
        sceneChildCount: cycleSnapshot.scene.childCount,
        sceneMeshCount: cycleSnapshot.scene.meshCount,
        uniqueMaterialCount: cycleSnapshot.scene.uniqueMaterialCount,
        targetsCount: cycleSnapshot.world.targetsCount,
        landmarksCount: cycleSnapshot.world.landmarksCount,
        mediaCrewsCount: cycleSnapshot.world.mediaCrewsCount,
        animalsCount: cycleSnapshot.world.animalsCount,
        cow17Present: cycleSnapshot.world.cow17.present,
        cow17Decorated: cycleSnapshot.world.cow17.decorated,
        detachedFragmentCount: cycleSnapshot.tornado.detachedFragmentCount,
        barnStage: cycleSnapshot.setpieces.hartFarm.legacyStage,
      });
    }

    const finalSnapshot = bridge.getSnapshot();
    const trace = document.getElementById('qa4ForensicTrace');
    return {
      architecture: shell.architecture,
      modernizationPhase: shell.modernizationPhase,
      documentPhase: document.documentElement.dataset.swModernizationPhase ?? null,
      snapshot,
      finalSnapshot,
      probe,
      productionQa,
      cycles,
      forensic: {
        mode: document.documentElement.dataset.swQaForensics ?? null,
        hidden: trace?.hidden ?? null,
        display: trace ? getComputedStyle(trace).display : null,
      },
    };
  });

  const typedLiveAgreement = {
    renderer: jsonEqual(evidence.snapshot.renderer, evidence.snapshot.live.renderer),
    scene: jsonEqual(evidence.snapshot.scene, evidence.snapshot.live.scene),
    camera: jsonEqual(evidence.snapshot.camera, evidence.snapshot.live.camera),
    atmosphere: jsonEqual(evidence.snapshot.atmosphere, evidence.snapshot.live.atmosphere),
    tornado: jsonEqual(evidence.snapshot.tornado, evidence.snapshot.live.tornado),
    world: jsonEqual(evidence.snapshot.world, evidence.snapshot.live.world),
    hartFarm: jsonEqual(evidence.snapshot.setpieces.hartFarm, evidence.snapshot.live.setpieces.hartFarm),
    secondStructure: jsonEqual(
      evidence.snapshot.setpieces.secondStructure,
      evidence.snapshot.live.setpieces.secondStructure,
    ),
  };

  const stableCycles = evidence.cycles.slice(1);
  const cleanupEvidence = {
    geometrySpread: maxSpread(stableCycles.map((cycle) => cycle.rendererMemory.geometries)),
    textureSpread: maxSpread(stableCycles.map((cycle) => cycle.rendererMemory.textures)),
    sceneChildSpread: maxSpread(stableCycles.map((cycle) => cycle.sceneChildCount)),
    sceneMeshSpread: maxSpread(stableCycles.map((cycle) => cycle.sceneMeshCount)),
    materialSpread: maxSpread(stableCycles.map((cycle) => cycle.uniqueMaterialCount)),
    targetSpread: maxSpread(stableCycles.map((cycle) => cycle.targetsCount)),
    landmarkSpread: maxSpread(stableCycles.map((cycle) => cycle.landmarksCount)),
    mediaSpread: maxSpread(stableCycles.map((cycle) => cycle.mediaCrewsCount)),
    animalSpread: maxSpread(stableCycles.map((cycle) => cycle.animalsCount)),
    allCow17Present: stableCycles.every((cycle) => cycle.cow17Present),
    allCow17Decorated: stableCycles.every((cycle) => cycle.cow17Decorated),
    stableBarnStage: stableCycles.every((cycle) => cycle.barnStage === stableCycles[0].barnStage),
    stableFragments: stableCycles.every(
      (cycle) => cycle.detachedFragmentCount === stableCycles[0].detachedFragmentCount,
    ),
  };

  const qaState = evidence.productionQa;
  const checks = {
    phaseIdentity: evidence.modernizationPhase === 'phase-5-rendering-world'
      && evidence.documentPhase === 'phase-5-rendering-world',
    liveBridgeV2: evidence.snapshot?.version === 'MODERNIZATION_PHASE5_PRESENTATION_WORLD_V2'
      && evidence.snapshot?.attached === true,
    contractProbe: evidence.probe?.passed === true
      && Object.values(evidence.probe?.checks ?? {}).every(Boolean),
    allTypedMirrorsAgree: Object.values(typedLiveAgreement).every(Boolean),
    rendererIdentity: evidence.snapshot.renderer.rendererName === 'Three.js WebGLRenderer'
      && evidence.snapshot.renderer.version === 'r128'
      && evidence.snapshot.renderer.antialias === true,
    rendererSettings: evidence.snapshot.renderer.shadowMapEnabled === true
      && evidence.snapshot.renderer.shadowMapType === 'PCFSoftShadowMap'
      && evidence.snapshot.renderer.toneMapping === 'ACESFilmicToneMapping'
      && evidence.snapshot.renderer.outputEncoding === 'sRGBEncoding',
    rendererViewport: evidence.snapshot.renderer.viewportWidth === viewport.width
      && evidence.snapshot.renderer.viewportHeight === viewport.height,
    liveScene: evidence.snapshot.scene.childCount > 0
      && evidence.snapshot.scene.meshCount > 0
      && evidence.snapshot.scene.uniqueMaterialCount > 0
      && evidence.snapshot.scene.fog.type === 'FogExp2',
    liveCamera: evidence.snapshot.camera.fov === qaState.camera.fov
      && Math.abs(evidence.snapshot.camera.position.y - qaState.camera.y) < 0.05
      && Math.abs(evidence.snapshot.camera.position.z - qaState.camera.z) < 0.05,
    liveTornado: evidence.snapshot.tornado.funnelLayerCount === qaState.funnelLayers
      && evidence.snapshot.tornado.suctionRingCount === qaState.suctionRings
      && evidence.snapshot.tornado.activeDebrisCount === qaState.debrisInstances
      && evidence.snapshot.tornado.funnelLayerCount >= 3
      && evidence.snapshot.tornado.suctionRingCount === 3,
    liveWorldDressing: evidence.snapshot.world.cropRowsCount === qaState.dressing.cropRows
      && evidence.snapshot.world.treesCount === qaState.dressing.trees
      && evidence.snapshot.world.fencesCount === qaState.dressing.fences
      && evidence.snapshot.world.streetPropsCount === qaState.dressing.streetProps,
    liveCow17: evidence.snapshot.world.cow17.present === true
      && evidence.snapshot.world.cow17.decorated === qaState.cow17.decorated
      && evidence.snapshot.world.cow17.airborne === qaState.cow17.airborne
      && Math.abs(evidence.snapshot.world.cow17.scale - qaState.cow17.scale) < 0.001
      && evidence.snapshot.world.cow17.earTag === '#17',
    exactHartFarm: evidence.snapshot.setpieces.hartFarm.legacyStage === qaState.barn.stage
      && Math.abs(evidence.snapshot.setpieces.hartFarm.health - qaState.barn.health) < 0.05
      && evidence.snapshot.setpieces.hartFarm.maxHealth === qaState.barn.maxHealth
      && evidence.snapshot.setpieces.hartFarm.currentStageId === 'roof-peel',
    existingSecondStructureLifecycle: ['intact', 'destroyed'].includes(
      evidence.snapshot.setpieces.secondStructure.currentStageId,
    ),
    fiveResetCycles: evidence.cycles.length === 5,
    boundedRendererMemory: cleanupEvidence.geometrySpread <= 2
      && cleanupEvidence.textureSpread <= 1,
    boundedSceneResources: cleanupEvidence.sceneChildSpread <= 2
      && cleanupEvidence.sceneMeshSpread <= 2
      && cleanupEvidence.materialSpread <= 2,
    boundedWorldPopulation: cleanupEvidence.targetSpread === 0
      && cleanupEvidence.landmarkSpread === 0
      && cleanupEvidence.mediaSpread === 0
      && cleanupEvidence.animalSpread === 0,
    stableProtectedObjects: cleanupEvidence.allCow17Present
      && cleanupEvidence.allCow17Decorated
      && cleanupEvidence.stableBarnStage
      && cleanupEvidence.stableFragments,
    playerForensicsHidden: evidence.forensic.mode === 'silent'
      && evidence.forensic.hidden === true
      && evidence.forensic.display === 'none',
    noPageErrors: pageErrors.length === 0,
    noConsoleErrors: consoleErrors.length === 0,
  };

  const screenshotPath = path.join(outputDir, `${viewport.name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });
  results.push({
    viewport,
    evidence,
    typedLiveAgreement,
    cleanupEvidence,
    checks,
    pageErrors,
    consoleErrors,
    screenshot: path.relative(projectRoot, screenshotPath).replaceAll('\\', '/'),
    passed: Object.values(checks).every(Boolean),
  });
  await context.close();
}

await browser.close();
const report = {
  version: 'MODERNIZATION_PHASE5_PRESENTATION_WORLD_QA_V2',
  generatedAt: new Date().toISOString(),
  sourceUrl: baseUrl,
  results,
  passed: results.every((result) => result.passed),
};
await writeFile(
  path.join(outputDir, 'presentation-world-report.json'),
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8',
);
for (const result of results) {
  console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.viewport.name} :: ${JSON.stringify(result.checks)}`);
}
if (!report.passed) process.exitCode = 1;
