import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const sourceFile = resolve(
  process.env.SEVERE_WEATHER_SOURCE_PATH || resolve(repoRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html')
);
const outputFile = resolve(
  process.env.SEVERE_WEATHER_VISUAL_AUDIT_OUTPUT ||
    resolve(repoRoot, 'Docs', 'Evidence', 'VisualEngineLab', 'visual-engine-baseline.json')
);

function fail(message) {
  console.error(`[visual-engine-audit] ${message}`);
  process.exit(1);
}

function git(...args) {
  try {
    return execFileSync(process.env.SEVERE_WEATHER_GIT_BIN || 'git', args, { cwd: repoRoot, encoding: 'utf8' }).trim();
  } catch {
    return 'unavailable';
  }
}

function count(pattern, source) {
  return [...source.matchAll(pattern)].length;
}

function collectFamilies(source, expression, capture = 1) {
  return [...new Set([...source.matchAll(expression)].map((match) => match[capture]))].sort();
}

function markerGroup(name, markers, source) {
  const results = markers.map((marker) => ({ marker, detected: source.includes(marker) }));
  const detected = results.filter((entry) => entry.detected).length;
  return {
    name,
    confidence: Number((detected / markers.length).toFixed(2)),
    detected,
    expected: markers.length,
    markers: results
  };
}

let source;
try {
  source = readFileSync(sourceFile, 'utf8');
} catch (error) {
  fail(`Expected production source was not readable: ${sourceFile}\n${error.message}`);
}

if (!source.includes('new THREE.Scene()') || !source.includes('new THREE.WebGLRenderer')) {
  fail(`Expected Three.js scene and renderer constructors were not found in ${sourceFile}`);
}

const lineCount = source.split(/\r?\n/).length;
const scriptBlocks = [...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
const threeRevision = source.match(/const e="(\d+)",n=100,i=300/)?.[1] ||
  source.match(/THREE\.REVISION\s*=\s*["'](\d+)["']/)?.[1] ||
  'unknown';

const anchors = [
  '[SW:AUDIO:ENGINE]', '[SW:AUDIO:MUSIC]', '[SW:AUDIO:AMBIENCE]',
  '[SW:GAMEPLAY:STORM_CONTROL]', '[SW:GAMEPLAY:ABILITIES]',
  '[SW:GAMEPLAY:DISTRICT_PROGRESSION]', '[SW:GAMEPLAY:RUN_CLOCK]',
  '[SW:UI:RAMPAGE_FEEDBACK]', '[SW:UI:RESULTS]', '[SW:WORLD:TREE_RESPONSE]',
  '[SW:WORLD:DESTRUCTION]', '[SW:WORLD:MEDIA]', '[SW:WORLD:ANIMALS]',
  '[SW:WORLD:BOVINE_SIGNATURE]', '[SW:WORLD:POWER_GRID]',
  '[SW:RUNTIME:LIFECYCLE]', '[SW:RUNTIME:CLEANUP]',
  '[SW:LAW:PLAYER-IS-STORM]', '[SW:LAW:MEDIA-NOT-COMBAT]',
  '[SW:LAW:SAFE-ANIMALS]', '[SW:LAW:OFFLINE-RUNTIME]'
];

const groups = [
  markerGroup('animation-loop', ['function animate(now)', 'requestAnimationFrame(animate)', 'renderer.render(scene, camera)'], source),
  markerGroup('world-generation', ['function init3DWorld()', 'function buildLivingCounty()', 'function terrainHeightAt(', 'createTerrainRoad('], source),
  markerGroup('tornado-system', ['const tornadoGroup', 'const funnelMesh', 'const outerFunnelMesh', 'const dustBowlGroup'], source),
  markerGroup('animal-system', ['animal', 'cow', '[SW:LAW:SAFE-ANIMALS]'], source),
  markerGroup('destruction', ['function damageTarget(', 'function destroyTarget(', 'function explodeStructure(', 'spawnPersistentRuin('], source),
  markerGroup('cleanup', ['function resetWarningRun()', '.dispose()', 'visibilitychange'], source),
  markerGroup('intro', ['newspaper', 'Moo Brew', 'cup drop', 'camera rises'], source)
];

const warnings = [];
for (const group of groups) {
  if (group.confidence < 0.5) warnings.push(`${group.name} confidence is below 0.50`);
}
if (threeRevision === 'unknown') warnings.push('Three.js revision could not be determined from the embedded distribution.');
if (!source.includes('renderer.info')) warnings.push('No runtime renderer.info performance instrumentation detected in the checked-in source.');
if (!source.includes('renderer.dispose()')) warnings.push('No explicit WebGL renderer disposal detected in the checked-in source.');
if (!source.includes('removeEventListener')) warnings.push('No explicit DOM listener removal detected in the checked-in source.');

const report = {
  schemaVersion: 'visual-engine-baseline.v1',
  generatedAt: new Date().toISOString(),
  sourceCommit: process.env.SEVERE_WEATHER_SOURCE_COMMIT || process.env.GITHUB_SHA || git('rev-parse', 'HEAD'),
  sourceBranch: process.env.SEVERE_WEATHER_SOURCE_BRANCH || process.env.GITHUB_REF_NAME || git('branch', '--show-current'),
  sourceFile: sourceFile.replace(`${repoRoot}\\`, '').replaceAll('\\', '/'),
  sourceBytes: statSync(sourceFile).size,
  sourceLines: lineCount,
  inlineScripts: scriptBlocks.length,
  inlineScriptBytes: scriptBlocks.map((match) => Buffer.byteLength(match[1], 'utf8')),
  threeJs: {
    revision: threeRevision,
    delivery: 'embedded minified UMD distribution',
    rendererConstructors: collectFamilies(source, /new THREE\.(WebGLRenderer)\b/g),
    sceneConstructors: collectFamilies(source, /new THREE\.(Scene)\b/g),
    cameraConstructors: collectFamilies(source, /new THREE\.(PerspectiveCamera|OrthographicCamera)\b/g),
    lightConstructors: collectFamilies(source, /new THREE\.(AmbientLight|HemisphereLight|DirectionalLight|PointLight|SpotLight)\b/g),
    materialFamilies: collectFamilies(source, /new THREE\.([A-Za-z]+Material)\b/g),
    geometryFamilies: collectFamilies(source, /new THREE\.([A-Za-z]+Geometry)\b/g)
  },
  counts: {
    meshes: count(/new THREE\.Mesh\b/g, source),
    groups: count(/new THREE\.Group\b/g, source),
    instancedMeshes: count(/new THREE\.InstancedMesh\b/g, source),
    pointsSystems: count(/new THREE\.Points\b/g, source),
    requestAnimationFrameMarkers: count(/requestAnimationFrame\s*\(/g, source),
    disposeCalls: count(/\.dispose\s*\(/g, source),
    addEventListeners: count(/addEventListener\s*\(/g, source),
    removeEventListeners: count(/removeEventListener\s*\(/g, source)
  },
  detectedSystems: groups,
  particleRelatedSystems: collectFamilies(source, /\b(particleSystem|dustBowlGroup|damagePuffs|supercellHail|debrisPool|debrisPieces)\b/g, 1),
  animationLoopMarkers: ['function animate(now)', 'renderer.render(scene, camera)', 'requestAnimationFrame(animate)'].filter((value) => source.includes(value)),
  worldGenerationMarkers: ['terrainHeightAt', 'createTerrainRoad', 'buildLivingCounty', 'init3DWorld'].filter((value) => source.includes(value)),
  tornadoSystemMarkers: ['tornadoGroup', 'funnelMesh', 'outerFunnelMesh', 'dustBowlGroup', 'particleSystem'].filter((value) => source.includes(value)),
  animalSystemMarkers: ['animals', 'cow', '[SW:LAW:SAFE-ANIMALS]'].filter((value) => source.toLowerCase().includes(value.toLowerCase())),
  destructionMarkers: ['damageTarget', 'destroyTarget', 'explodeStructure', 'spawnPersistentRuin'].filter((value) => source.includes(value)),
  cleanupMarkers: ['resetWarningRun', 'visibilitychange', '.dispose()'].filter((value) => source.includes(value)),
  introMarkers: ['newspaper', 'Moo Brew', 'coffee', 'cup', 'barn', 'touchdown'].map((value) => ({
    marker: value,
    occurrences: count(new RegExp(value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi'), source)
  })),
  stableAnchors: anchors.map((anchor) => ({ anchor, detected: source.includes(anchor) })),
  limitations: [
    'The checked-in HTML is an immutable baseline; active V5 behavior is reconstructed by ordered patch scripts during builds.',
    'Regex-based detection proves markers and constructors, not runtime reachability or visual quality.',
    'Historical branches, generated build outputs, and physical-device behavior require separate audits.'
  ],
  warnings
};

mkdirSync(dirname(outputFile), { recursive: true });
writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`[visual-engine-audit] wrote ${outputFile}`);
console.log(`[visual-engine-audit] Three.js r${threeRevision}; ${lineCount} lines; ${warnings.length} warnings`);
