import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimeFileNames = [
  'v510-foundation.js',
  'v510-tornado.js',
  'v510-world.js',
  'v510-runtime.js'
];
const runtimeParts = await Promise.all(runtimeFileNames.map(async fileName => {
  const source = await readFile(path.join(projectRoot, 'runtime', fileName), 'utf8');
  if (source.includes('</script>')) {
    throw new Error(`Runtime source ${fileName} contains a closing script tag and cannot be safely bundled.`);
  }
  return `\n// [SW:SOURCE:${fileName}]\n${source.trim()}\n`;
}));
const productionRuntimeBundle = runtimeParts.join('\n');

let html = await readFile(sourcePath, 'utf8');

const marker = 'V510_THREEJS_PRODUCTION_SLICE_V1';
const requiredHtmlMarkers = [
  marker,
  'v510ProductionSliceStyles',
  'btnProductionQuality',
  '[SW:SOURCE:v510-foundation.js]',
  '[SW:SOURCE:v510-tornado.js]',
  '[SW:SOURCE:v510-world.js]',
  '[SW:SOURCE:v510-runtime.js]',
  '__SW_V510_UPDATE__',
  '__SW_V510_REBUILD__',
  'getProductionSliceQaState',
  'triggerProductionSliceQa'
];

if (html.includes(marker)) {
  requiredHtmlMarkers.forEach(required => {
    if (!html.includes(required)) throw new Error(`v5.1.0 production slice HTML is incomplete: missing ${required}`);
  });
  console.log(`v5.1.0 Three.js production slice already present in ${sourcePath}`);
  process.exit(0);
}

for (const prerequisite of [
  'V500_CAMPAIGN_FOUNDATION_V1',
  'V500_WORLD_TOUR_V1',
  'V500_BOVINE_SIGNATURE_V1',
  '[SW:LAW:DISTRICTS-FORWARD-ONLY]'
]) {
  if (!html.includes(prerequisite)) {
    throw new Error(`v5.1.0 production slice requires the accepted V5 patch chain: missing ${prerequisite}`);
  }
}

function replaceExact(before, after, label) {
  const count = html.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one source match, found ${count}`);
  html = html.replace(before, after);
}

const oldVersionCount = html.split('v5.0.0').length - 1;
if (oldVersionCount < 1) throw new Error('build identity: expected at least one v5.0.0 marker before production-slice patching');
html = html.split('v5.0.0').join('v5.1.0');
html = html.split('Heartland Campaign Foundation').join('Three.js Production Slice');
html = html.split('ARCADE DISASTER SIMULATOR v5.1.0 HEARTLAND CAMPAIGN').join('ARCADE DISASTER SIMULATOR v5.1.0 PRODUCTION SLICE');
html = html.split('3D LAB v5.1.0 HEARTLAND CAMPAIGN').join('3D LAB v5.1.0 PRODUCTION SLICE');

replaceExact(
  '</head>',
  String.raw`<!-- V510_THREEJS_PRODUCTION_SLICE_V1: authored visual-density, atmosphere, tornado, barn, and Cow 17 pass. -->
<style id="v510ProductionSliceStyles">
  :root {
    --production-glass: rgba(7, 16, 29, 0.82);
    --production-line: rgba(148, 197, 255, 0.28);
    --production-warm: #f6c453;
  }
  #productionSliceBadge {
    position: fixed;
    top: calc(env(safe-area-inset-top) + 30px);
    left: 50%;
    z-index: 1550;
    transform: translateX(-50%);
    padding: 4px 10px;
    border: 1px solid var(--production-line);
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(8, 21, 37, 0.9), rgba(5, 12, 22, 0.74));
    color: #dbeafe;
    font: 800 8px/1 Inter, sans-serif;
    letter-spacing: 0.12em;
    pointer-events: none;
    box-shadow: 0 7px 24px rgba(0, 0, 0, 0.34);
  }
  body.production-run #productionSliceBadge { opacity: 0.78; }
  .panel {
    background: linear-gradient(150deg, rgba(10, 21, 37, 0.88), rgba(5, 12, 23, 0.72));
    border-color: rgba(151, 197, 255, 0.24);
    box-shadow: 0 12px 34px rgba(0, 0, 0, 0.34), inset 0 1px rgba(255, 255, 255, 0.035);
  }
  .telemetry { backdrop-filter: blur(10px); }
  .action-btn {
    background: radial-gradient(circle at 35% 28%, rgba(42, 61, 82, 0.96), rgba(7, 15, 27, 0.94));
    border-color: rgba(246, 196, 83, 0.9);
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.52), inset 0 1px rgba(255, 255, 255, 0.08);
  }
  .action-btn:active, .action-btn.active { box-shadow: 0 0 22px rgba(246, 196, 83, 0.7); }
  #joystickZone {
    background: radial-gradient(circle, rgba(28, 48, 70, 0.38), rgba(4, 10, 18, 0.24));
    border-color: rgba(190, 219, 255, 0.26);
    box-shadow: inset 0 0 24px rgba(0, 0, 0, 0.28);
  }
  #joystickThumb { background: #f6c453; box-shadow: 0 0 18px rgba(246, 196, 83, 0.68); }
  .production-quality-btn { border-color: rgba(96, 165, 250, 0.72) !important; color: #dbeafe !important; }
  .production-quality-btn[data-quality="SHOWCASE"] { border-color: #f6c453 !important; color: #fde68a !important; }
  @media (max-height: 540px), (max-width: 850px) {
    #productionSliceBadge { top: calc(env(safe-area-inset-top) + 22px); padding: 3px 8px; font-size: 7px; }
    #hud { padding-top: calc(25px + var(--safe-top)); }
    .radar-box, .radar-box canvas { width: 78px; height: 78px; }
    .touch-controls { gap: 8px; }
    .action-btn { width: 52px; height: 52px; }
    #joystickZone { bottom: calc(40px + var(--safe-bottom)); left: calc(14px + var(--safe-left)); }
    .telemetry { max-width: 54vw; overflow: hidden; white-space: nowrap; }
  }
</style>
</head>`,
  'production slice stylesheet'
);

replaceExact(
  '<body>',
  '<body>\n<div id="productionSliceBadge">THREE.JS PRODUCTION SLICE · BALANCED</div>',
  'production slice build badge'
);

replaceExact(
  '    <div class="menu-options">',
  `    <div class="menu-options">
      <button class="opt-btn production-quality-btn" id="btnProductionQuality" data-quality="BALANCED" onclick="cycleProductionQuality()">VISUALS: BALANCED</button>`,
  'production quality control'
);

replaceExact(
  "const funnelMat = new THREE.MeshStandardMaterial({ color: '#090d16', transparent: true, opacity: 0.82, roughness: 0.15, side: THREE.DoubleSide });",
  "const funnelMat = new THREE.MeshStandardMaterial({ color: '#1b2536', transparent: true, opacity: 0.46, roughness: 1.0, metalness: 0.0, side: THREE.DoubleSide, depthWrite: false });",
  'inner funnel production material'
);
replaceExact(
  "const outerFunnelMat = new THREE.MeshBasicMaterial({ color: '#334155', transparent: true, opacity: 0.38, side: THREE.DoubleSide });",
  "const outerFunnelMat = new THREE.MeshBasicMaterial({ color: '#9fb0c8', transparent: true, opacity: 0.24, side: THREE.DoubleSide, depthWrite: false, blending: THREE.NormalBlending });",
  'outer funnel production material'
);
replaceExact(
  "const dustMat = new THREE.MeshStandardMaterial({ color: '#1e293b', transparent: true, opacity: 0.55, roughness: 0.9 });",
  "const dustMat = new THREE.MeshStandardMaterial({ color: '#7d6f5b', transparent: true, opacity: 0.5, roughness: 1.0, metalness: 0.0, depthWrite: false });",
  'touchdown dust material'
);
replaceExact(
  "const particleMat = new THREE.PointsMaterial({ size: 1.2, vertexColors: true, transparent: true, opacity: 0.85 });",
  "const particleMat = new THREE.PointsMaterial({ size: 0.95, vertexColors: true, transparent: true, opacity: 0.74, depthWrite: false });",
  'tornado debris particle material'
);

replaceExact(
  `function configureBovineAnimal(cowMesh, index, x, z, groundY) {
  const id = index === 0 ? 17 : (index < 17 ? index : index + 1);
  decorateBovineMesh(cowMesh, id);
  return {`,
  `function configureBovineAnimal(cowMesh, index, x, z, groundY) {
  const id = index === 0 ? 17 : (index < 17 ? index : index + 1);
  decorateBovineMesh(cowMesh, id);
  const productionScale = id === 17 ? 1.32 : 1.0;
  cowMesh.scale.setScalar(productionScale);
  cowMesh.userData.productionBaseScale = productionScale;
  return {`,
  'Cow 17 production scale'
);

replaceExact(
  `  let baseCamY = 78, baseCamZ = 110;
  if (currentStorm === 'supercell') { baseCamY = 105; baseCamZ = 150; }
  else if (currentStorm === 'derecho') { baseCamY = 130; baseCamZ = 185; }`,
  `  let baseCamY = isMobileDevice ? 44 : 46, baseCamZ = isMobileDevice ? 104 : 108;
  if (currentStorm === 'supercell') { baseCamY = isMobileDevice ? 62 : 64; baseCamZ = isMobileDevice ? 145 : 150; }
  else if (currentStorm === 'derecho') { baseCamY = isMobileDevice ? 73 : 76; baseCamZ = isMobileDevice ? 172 : 178; }`,
  'tighter authored camera composition'
);

replaceExact(
  `  init3DWorld();
  applyCampaignPresentation();
  selectStormClass(currentStorm);`,
  `  init3DWorld();
  applyCampaignPresentation();
  if (globalThis.__SW_V510_REBUILD__) globalThis.__SW_V510_REBUILD__();
  selectStormClass(currentStorm);`,
  'production slice replay rebuild hook'
);

replaceExact(
  `  // News vans and storm chasers are invincible witnesses, never hostile targets.
  updateMediaCrews(dt);`,
  `  if (globalThis.__SW_V510_UPDATE__) globalThis.__SW_V510_UPDATE__(dt, now, isMoving);

  // News vans and storm chasers are invincible witnesses, never hostile targets.
  updateMediaCrews(dt);`,
  'production slice frame hook'
);

const mainScriptCloseIndex = html.lastIndexOf('</script>');
const bodyCloseIndex = html.lastIndexOf('</body>');
const animateRequestIndex = html.lastIndexOf('requestAnimationFrame(animate);');
if (mainScriptCloseIndex < 0 || bodyCloseIndex < 0 || mainScriptCloseIndex > bodyCloseIndex) {
  throw new Error('production runtime lexical bundle: could not locate the final game script boundary');
}
if (animateRequestIndex < 0 || animateRequestIndex > mainScriptCloseIndex) {
  throw new Error('production runtime lexical bundle: final game script is missing the animation bootstrap');
}
const bundledRuntime = `\n\n// ============================================================================
// [SW:VISUAL:PRODUCTION_SLICE_BUNDLE]
// Generated from the maintained runtime/v510-*.js sources. Bundling inside
// the established game script preserves direct access to accepted V5 state.
// ============================================================================
${productionRuntimeBundle}\n`;
html = html.slice(0, mainScriptCloseIndex) + bundledRuntime + html.slice(mainScriptCloseIndex);

requiredHtmlMarkers.forEach(required => {
  if (!html.includes(required)) throw new Error(`v5.1.0 production slice verification failed: missing ${required}`);
});
if (html.includes('v5.0.0')) throw new Error('stale v5.0.0 identity remains after v5.1.0 patch');
if (html.includes('<script src="runtime/v510-')) throw new Error('v5.1.0 runtime must be lexically bundled, not loaded as isolated scripts');

replaceExact(
  '    camera.lookAt(storm.pos.x + (moveX * 8), storm.pos.y + 1.5, storm.pos.z + (moveZ * 8));',
  '    camera.lookAt(storm.pos.x + (moveX * 8), storm.pos.y + 14, storm.pos.z + (moveZ * 8));',
  'camera aim height'
);

await writeFile(sourcePath, html, 'utf8');
console.log(`Applied v5.1.0 Three.js production slice to ${sourcePath}`);
