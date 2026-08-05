import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const bridgePath = path.join(projectRoot, 'runtime', 'modernization-phase6-performance.js');

let html = await readFile(sourcePath, 'utf8');
const bridgeSource = (await readFile(bridgePath, 'utf8')).trim();
const marker = 'MODERNIZATION_PHASE6_PERFORMANCE_V2';

function requireMarker(value) {
  if (!html.includes(value)) throw new Error(`Phase 6 performance verification failed: missing ${value}`);
}

function replaceRegex(pattern, replacement, label) {
  const matches = [...html.matchAll(pattern)];
  if (matches.length !== 1) {
    throw new Error(`${label}: expected exactly one source match, found ${matches.length}`);
  }
  html = html.replace(pattern, replacement);
}

if (html.includes(marker)) {
  [
    '[SW:ARCH:PHASE6_PERFORMANCE_BRIDGE]',
    '__SW_PHASE6_PERFORMANCE_BRIDGE__',
    'phase6Pooled',
    'recordFrame(effectiveDt, effectiveNow)',
    "resetTransientState('clear-production-slice')",
  ].forEach(requireMarker);
  console.log(`Phase 6 performance contracts already applied to ${sourcePath}`);
  process.exit(0);
}

if (html.includes('MODERNIZATION_PHASE6_PERFORMANCE_V1')) {
  throw new Error('Stale Phase 6 V1 generated output detected. Rebuild from the clean historical source.');
}

for (const prerequisite of [
  'MODERNIZATION_PHASE5_PRESENTATION_WORLD_V2',
  'function spawnProductionDustBurst(',
  'function updateProductionPulseEffects(dt)',
  'function updateProductionSlice(dt, now, isMoving)',
  'productionPulseEffects.forEach(effect => disposeProductionObject(effect.mesh));',
]) {
  if (!html.includes(prerequisite)) {
    throw new Error(`Phase 6 requires the accepted Phase 5 runtime: missing ${prerequisite}`);
  }
}

replaceRegex(
  /function spawnProductionDustBurst\(x, y, z, color = '#b99a72', count = 7\) \{[\s\S]*?\n\}\n\nfunction detachProductionBarnPart/g,
  `function spawnProductionDustBurst(x, y, z, color = '#b99a72', count = 7) {\n  const bridge = globalThis.__SW_PHASE6_PERFORMANCE_BRIDGE__;\n  if (!bridge || typeof bridge.spawnDustBurst !== 'function') {\n    throw new Error('Phase 6 performance bridge is required for production dust bursts.');\n  }\n  return bridge.spawnDustBurst(x, y, z, color, count);\n}\n\nfunction detachProductionBarnPart`,
  'production dust executor integration',
);

replaceRegex(
  /    if \(effect\.life <= 0\) \{\n      disposeProductionObject\(effect\.mesh\);\n      productionPulseEffects\.splice\(i, 1\);\n    \}/g,
  `    if (effect.life <= 0) {\n      if (effect.phase6Pooled === true) {\n        globalThis.__SW_PHASE6_PERFORMANCE_BRIDGE__?.releaseDustEffect(effect);\n      } else {\n        disposeProductionObject(effect.mesh);\n      }\n      productionPulseEffects.splice(i, 1);\n    }`,
  'pooled effect release integration',
);

replaceRegex(
  /  productionPulseEffects\.forEach\(effect => disposeProductionObject\(effect\.mesh\)\);\n  productionPulseEffects = \[\];/g,
  `  productionPulseEffects.forEach(effect => {\n    if (effect.phase6Pooled === true) {\n      globalThis.__SW_PHASE6_PERFORMANCE_BRIDGE__?.releaseDustEffect(effect);\n    } else {\n      disposeProductionObject(effect.mesh);\n    }\n  });\n  productionPulseEffects = [];\n  globalThis.__SW_PHASE6_PERFORMANCE_BRIDGE__?.resetTransientState('clear-production-slice');`,
  'production reset integration',
);

replaceRegex(
  /  if \(effectiveDt > 0 && effectiveDt < 0\.2\) \{\n    productionFrameSamples\.push\(1 \/ effectiveDt\);\n    if \(productionFrameSamples\.length > 180\) productionFrameSamples\.shift\(\);\n  \}/g,
  `  if (effectiveDt > 0 && effectiveDt < 0.2) {\n    productionFrameSamples.push(1 / effectiveDt);\n    if (productionFrameSamples.length > 180) productionFrameSamples.shift();\n    globalThis.__SW_PHASE6_PERFORMANCE_BRIDGE__?.recordFrame(effectiveDt, effectiveNow);\n  }`,
  'production frame integration',
);

const mainScriptCloseIndex = html.lastIndexOf('</script>');
const bodyCloseIndex = html.lastIndexOf('</body>');
if (mainScriptCloseIndex < 0 || bodyCloseIndex < 0 || mainScriptCloseIndex > bodyCloseIndex) {
  throw new Error('Phase 6 bridge could not locate the final game script boundary.');
}
if (bridgeSource.includes('</script>')) {
  throw new Error('Phase 6 bridge contains a closing script tag.');
}

const newline = html.includes('\r\n') ? '\r\n' : '\n';
const bundledBridge = `${newline}${newline}// [SW:SOURCE:modernization-phase6-performance.js]${newline}${bridgeSource}${newline}`;
html = html.slice(0, mainScriptCloseIndex) + bundledBridge + html.slice(mainScriptCloseIndex);

const headTag = '</head>';
const headerMarker = '<!-- MODERNIZATION_PHASE6_PERFORMANCE_V2 -->\n<!-- [SW:ARCH:PHASE6_PERFORMANCE_BRIDGE] -->';
html = html.replace(headTag, `${headerMarker.replaceAll('\n', newline)}${newline}${headTag}`);

await writeFile(sourcePath, html, 'utf8');

for (const required of [
  marker,
  '[SW:ARCH:PHASE6_PERFORMANCE_BRIDGE]',
  '[SW:SOURCE:modernization-phase6-performance.js]',
  '__SW_PHASE6_PERFORMANCE_BRIDGE__',
  'phase6Pooled',
  'recordFrame(effectiveDt, effectiveNow)',
  "resetTransientState('clear-production-slice')",
  'phase6ResetLiveInput',
]) {
  requireMarker(required);
}

console.log(`Applied integrated Phase 6 Android performance contracts to ${sourcePath}`);
