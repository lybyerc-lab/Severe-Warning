import { readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(scriptDir, 'compare-phase5-visual-baseline-legacy.mjs');
const generatedPath = path.join(scriptDir, '.compare-phase5-visual-baseline-generated.mjs');
let source = await readFile(sourcePath, 'utf8');

function replaceExact(before, after, label) {
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, found ${count}`);
  source = source.replace(before, after);
}

replaceExact(
  "const fixedTimestamps = [1000.0, 1016.6667, 1033.3334, 1050.0001, 1066.6668];",
  "const fixedTimestamps = [];",
  'static visual capture timestamp sequence',
);

replaceExact(
  `    shell?.app?.reset?.();
    window.dispatchEvent(new Event('resize'));

    const prepared = globalThis.triggerProductionSliceQa(scenarioName === 'hero' ? 'hero' : 'initial');`,
  `    shell?.app?.reset?.();
    window.dispatchEvent(new Event('resize'));

    if (typeof globalThis.__SW_V510_REBUILD__ === 'function') {
      globalThis.__SW_V510_REBUILD__();
    }

    const normalizeCow17 = () => {
      if (typeof animals === 'undefined') return;
      animals.forEach((animal) => {
        if (!animal?.mesh) return;
        animal.mesh.visible = animal.id === 17;
        if (animal.id !== 17) return;
        animal.airborne = false;
        animal.altitude = 0.8;
        animal.flightTime = 0;
        animal.flightDistance = 0;
        animal.flightMaxAltitude = 0;
        animal.previousX = animal.x;
        animal.previousZ = animal.z;
        animal.exceptionalCallout = false;
        animal.flightCounted = false;
        animal.orbitAngle = 0;
        animal.mesh.rotation.set(0, 0, 0);
      });
      if (typeof bovineCowCam !== 'undefined') {
        bovineCowCam = { active: false, timer: 0, triggered: false, cow: null };
      }
      document.body.classList.remove('cow-cam-active');
      document.getElementById('cowCamOverlay')?.classList.remove('active');
    };

    normalizeCow17();
    const prepared = globalThis.triggerProductionSliceQa(scenarioName === 'hero' ? 'hero' : 'initial');`,
  'seeded production slice rebuild and Cow 17 reset',
);

replaceExact(
  `    if (prepared !== true) throw new Error(\`Failed to prepare \${scenarioName} visual scenario.\`);

    // The Phase 5 camera guard is QA-only. Disable the prepared flag for the`,
  `    if (prepared !== true) throw new Error(\`Failed to prepare \${scenarioName} visual scenario.\`);
    normalizeCow17();

    const cow17 = typeof animals !== 'undefined'
      ? animals.find((animal) => animal.id === 17)
      : null;
    if (cow17 && typeof productionBarn !== 'undefined' && productionBarn) {
      cow17.x = productionBarn.x + 14;
      cow17.z = productionBarn.z + 10;
      cow17.groundY = terrainHeightAt(cow17.x, cow17.z);
      cow17.previousX = cow17.x;
      cow17.previousZ = cow17.z;
      cow17.mesh.position.set(cow17.x, cow17.groundY + cow17.altitude, cow17.z);
      cow17.mesh.rotation.set(0, 0, 0);
    }

    if (typeof campaignAnimatedMeshes !== 'undefined') {
      campaignAnimatedMeshes.forEach((item) => {
        if (item?.mesh && item.axis) item.mesh.rotation[item.axis] = 0;
      });
    }
    if (typeof productionTornadoRoot !== 'undefined' && productionTornadoRoot) {
      productionTornadoRoot.rotation.set(0, 0, 0);
    }
    if (typeof productionBarn !== 'undefined' && productionBarn) {
      productionBarn.group.rotation.set(0, 0, 0);
      productionBarn.beacon.rotation.z = 0;
    }
    if (typeof productionFlashTimer !== 'undefined') productionFlashTimer = 0;
    if (typeof renderer !== 'undefined') renderer.toneMappingExposure = 0.94;
    if (typeof scene !== 'undefined' && scene.fog) {
      const blueprint = typeof getCampaignWorldBlueprint === 'function' ? getCampaignWorldBlueprint() : null;
      scene.fog.density = blueprint?.fogDensity ?? 0.0021;
      scene.fog.color.set('#162437');
      if (scene.background?.set) scene.background.set('#162437');
    }
    if (typeof ambientLight !== 'undefined') ambientLight.intensity = 1.02;
    if (typeof skyLight !== 'undefined') skyLight.intensity = 0.46;
    if (typeof dirLight !== 'undefined') {
      dirLight.intensity = 1.72;
      dirLight.color.set('#f1ddb0');
    }

    // The Phase 5 camera guard is QA-only. Disable the prepared flag for the`,
  'static presentation normalization after scenario preparation',
);

replaceExact(
  "version: 'PHASE5_DUAL_BUILD_VISUAL_BASELINE_V4'",
  "version: 'PHASE5_DUAL_BUILD_VISUAL_BASELINE_V5'",
  'visual report version',
);
replaceExact(
  "comparisonSource: 'Playwright canvas PNG after deterministic reset, scenario preparation, and RAF stepping'",
  "comparisonSource: 'Playwright canvas PNG after seeded production-slice rebuild, static scenario normalization, and explicit render'",
  'visual report comparison source',
);

await writeFile(generatedPath, source, 'utf8');
try {
  await import(`${pathToFileURL(generatedPath).href}?v=${Date.now()}`);
} finally {
  await rm(generatedPath, { force: true });
}
