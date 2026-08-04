import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const bridgePath = path.join(projectRoot, 'runtime', 'modernization-phase5-presentation-world.js');

let html = await readFile(sourcePath, 'utf8');
const bridgeSource = (await readFile(bridgePath, 'utf8')).trim();
const marker = 'MODERNIZATION_PHASE5_PRESENTATION_WORLD_V2';

const UNGUARDED_CAMERA_BLOCK = [
  '  if (bovineCowCam.active && bovineCowCam.cow && bovineCowCam.cow.mesh) {',
  '    const cow = bovineCowCam.cow;',
  '    const cinematicX = cow.x + 23;',
  '    const cinematicY = cow.groundY + cow.altitude + 17;',
  '    const cinematicZ = cow.z + 27;',
  '    camera.position.x = THREE.MathUtils.lerp(camera.position.x, cinematicX, 0.11);',
  '    camera.position.y = THREE.MathUtils.lerp(camera.position.y, cinematicY, 0.11);',
  '    camera.position.z = THREE.MathUtils.lerp(camera.position.z, cinematicZ, 0.11);',
  '    camera.lookAt(cow.x, cow.groundY + cow.altitude, cow.z);',
  '  } else {',
  '    camera.position.x = THREE.MathUtils.lerp(camera.position.x, camTargetX, 0.08);',
  '    camera.position.y = THREE.MathUtils.lerp(camera.position.y, storm.pos.y + currentCamY, 0.08);',
  '    camera.position.z = THREE.MathUtils.lerp(camera.position.z, camTargetZ, 0.08);',
  '    camera.lookAt(storm.pos.x + (moveX * 8), storm.pos.y + 1.5, storm.pos.z + (moveZ * 8));',
  '  }',
].join('\n');

const GUARDED_CAMERA_BLOCK = [
  '  if (!globalThis.productionQaPrepared && !(typeof globalThis.isPhase5PresentationLatched === \'function\' && globalThis.isPhase5PresentationLatched())) {',
  '    if (bovineCowCam.active && bovineCowCam.cow && bovineCowCam.cow.mesh) {',
  '      const cow = bovineCowCam.cow;',
  '      const cinematicX = cow.x + 23;',
  '      const cinematicY = cow.groundY + cow.altitude + 17;',
  '      const cinematicZ = cow.z + 27;',
  '      camera.position.x = THREE.MathUtils.lerp(camera.position.x, cinematicX, 0.11);',
  '      camera.position.y = THREE.MathUtils.lerp(camera.position.y, cinematicY, 0.11);',
  '      camera.position.z = THREE.MathUtils.lerp(camera.position.z, cinematicZ, 0.11);',
  '      camera.lookAt(cow.x, cow.groundY + cow.altitude, cow.z);',
  '    } else {',
  '      camera.position.x = THREE.MathUtils.lerp(camera.position.x, camTargetX, 0.08);',
  '      camera.position.y = THREE.MathUtils.lerp(camera.position.y, storm.pos.y + currentCamY, 0.08);',
  '      camera.position.z = THREE.MathUtils.lerp(camera.position.z, camTargetZ, 0.08);',
  '      camera.lookAt(storm.pos.x + (moveX * 8), storm.pos.y + 1.5, storm.pos.z + (moveZ * 8));',
  '    }',
  '  }',
].join('\n');

const cameraGuardMarker = "if (!globalThis.productionQaPrepared && !(typeof globalThis.isPhase5PresentationLatched === 'function' && globalThis.isPhase5PresentationLatched()))";
const isCrlf = html.includes('\r\n');
const searchBlock = isCrlf ? UNGUARDED_CAMERA_BLOCK.replaceAll('\n', '\r\n') : UNGUARDED_CAMERA_BLOCK;
const replaceBlock = isCrlf ? GUARDED_CAMERA_BLOCK.replaceAll('\n', '\r\n') : GUARDED_CAMERA_BLOCK;

const hasMarker = html.includes(marker);
const hasGuardedCamera = html.includes(cameraGuardMarker);

if (hasMarker && hasGuardedCamera) {
  console.log(`Phase 5 presentation and world bridge already present in ${sourcePath}`);
  process.exit(0);
}
if (html.includes('MODERNIZATION_PHASE5_PRESENTATION_WORLD_V1')) {
  throw new Error('Obsolete Phase 5 V1 mannequin bridge is present. Rebuild from the clean historical source.');
}

for (const prerequisite of [
  'MODERNIZATION_PHASE4_SCORING_CAMPAIGN_V2',
  'MODERNIZATION_PHASE3_INPUT_ABILITIES_V1',
  'MODERNIZATION_PHASE2_CLOCKS_V1',
  'V510_THREEJS_PRODUCTION_SLICE_V1',
]) {
  if (!html.includes(prerequisite)) {
    throw new Error(`Phase 5 requires the accepted Phase 4 runtime: missing ${prerequisite}`);
  }
}

if (!hasGuardedCamera) {
  const normHtml = html.replaceAll('\r\n', '\n');
  const normSearch = UNGUARDED_CAMERA_BLOCK.replaceAll('\r\n', '\n');
  const matches = normHtml.split(normSearch).length - 1;
  if (matches === 0) {
    throw new Error('Phase 5 camera lerp anchor is missing in HTML.');
  }
  if (matches > 1) {
    throw new Error('Phase 5 camera lerp anchor appears more than once in HTML.');
  }
  html = isCrlf ? html.replace(searchBlock, replaceBlock) : normHtml.replace(normSearch, GUARDED_CAMERA_BLOCK);
}

if (!hasMarker) {
  const mainScriptCloseIndex = html.lastIndexOf('</script>');
  const bodyCloseIndex = html.lastIndexOf('</body>');
  if (mainScriptCloseIndex < 0 || bodyCloseIndex < 0 || mainScriptCloseIndex > bodyCloseIndex) {
    throw new Error('Phase 5 bridge could not locate the final game script boundary.');
  }
  if (bridgeSource.includes('</script>')) {
    throw new Error('Phase 5 bridge contains a closing script tag.');
  }
  for (const prohibited of [
    'new THREE.WebGLRenderer',
    'new THREE.Scene',
    'new THREE.PerspectiveCamera',
    'requestAnimationFrame(',
  ]) {
    if (bridgeSource.includes(prohibited)) {
      throw new Error(`Phase 5 passive bridge may not create presentation authority: ${prohibited}`);
    }
  }

  const newline = isCrlf ? '\r\n' : '\n';
  const bundledBridge = `${newline}${newline}// [SW:SOURCE:modernization-phase5-presentation-world.js]${newline}${bridgeSource}${newline}`;
  html = html.slice(0, mainScriptCloseIndex) + bundledBridge + html.slice(mainScriptCloseIndex);
}

for (const required of [
  marker,
  '[SW:ARCH:PHASE5_PRESENTATION_WORLD_BRIDGE]',
  '__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__',
  'phase5ReadLegacySnapshot',
  'syncFromLegacy()',
  'runContractProbe()',
  'isPhase5PresentationLatched()',
]) {
  if (!html.includes(required)) throw new Error(`Phase 5 verification failed: missing ${required}`);
}

await writeFile(sourcePath, html, 'utf8');
console.log(`Applied passive Phase 5 live presentation/world mirror to ${sourcePath}`);
