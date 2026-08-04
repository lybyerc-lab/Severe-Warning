import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');

const checks = [];
function check(name, passed, detail = '') {
  checks.push({ name, passed: Boolean(passed), detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
}

for (const file of [
  'Docs/PHASE5_PRESENTATION_SOURCE_MAP.md',
  'Docs/PHASE5_VISUAL_BASELINE.md',
  'src/presentation/renderer/renderer-contracts.ts',
  'src/presentation/renderer/renderer-system.ts',
  'src/presentation/scene/scene-contracts.ts',
  'src/presentation/scene/scene-system.ts',
  'src/presentation/camera/camera-contracts.ts',
  'src/presentation/camera/camera-system.ts',
  'src/presentation/atmosphere/atmosphere-contracts.ts',
  'src/presentation/atmosphere/atmosphere-system.ts',
  'src/presentation/tornado/tornado-presentation-contracts.ts',
  'src/presentation/tornado/tornado-presentation-system.ts',
  'src/world/world-contracts.ts',
  'src/world/world-system.ts',
  'src/world/setpieces/destructible-setpiece-contracts.ts',
  'src/world/setpieces/destructible-setpiece-system.ts',
  'src/world/setpieces/hart-farm-definition.ts',
  'src/world/setpieces/second-structure-definition.ts',
  'runtime/modernization-phase5-presentation-world.js',
  'scripts/apply-modernization-phase5-presentation-world.mjs',
]) {
  try {
    await access(path.join(projectRoot, file));
    check(`file ${file}`, true);
  } catch (error) {
    check(`file ${file}`, false, error.message);
  }
}

const html = await readFile(sourcePath, 'utf8');
const renderer = await readFile(path.join(projectRoot, 'src', 'presentation', 'renderer', 'renderer-system.ts'), 'utf8');
const scene = await readFile(path.join(projectRoot, 'src', 'presentation', 'scene', 'scene-system.ts'), 'utf8');
const camera = await readFile(path.join(projectRoot, 'src', 'presentation', 'camera', 'camera-system.ts'), 'utf8');
const atmosphere = await readFile(path.join(projectRoot, 'src', 'presentation', 'atmosphere', 'atmosphere-system.ts'), 'utf8');
const tornado = await readFile(path.join(projectRoot, 'src', 'presentation', 'tornado', 'tornado-presentation-system.ts'), 'utf8');
const world = await readFile(path.join(projectRoot, 'src', 'world', 'world-system.ts'), 'utf8');
const hartFarm = await readFile(path.join(projectRoot, 'src', 'world', 'setpieces', 'hart-farm-definition.ts'), 'utf8');
const silo = await readFile(path.join(projectRoot, 'src', 'world', 'setpieces', 'second-structure-definition.ts'), 'utf8');
const adapter = await readFile(path.join(projectRoot, 'src', 'legacy', 'legacy-runtime-adapter.ts'), 'utf8');
const app = await readFile(path.join(projectRoot, 'src', 'app', 'game-app.ts'), 'utf8');

for (const marker of [
  'MODERNIZATION_PHASE5_PRESENTATION_WORLD_V1',
  '[SW:ARCH:PHASE5_PRESENTATION_WORLD_BRIDGE]',
  '[SW:SOURCE:modernization-phase5-presentation-world.js]'
]) check(`HTML marker ${marker}`, html.includes(marker));

check('typed renderer authority', renderer.includes('export class RendererSystem'));
check('typed scene authority', scene.includes('export class SceneSystem'));
check('typed camera authority', camera.includes('export class CameraSystem'));
check('typed atmosphere authority', atmosphere.includes('export class AtmosphereSystem'));
check('typed tornado presentation authority', tornado.includes('export class TornadoPresentationSystem'));
check('typed world authority', world.includes('export class WorldSystem'));
check('Hart Farm 5-stage contract', hartFarm.includes('roof-peel') && hartFarm.includes('wreckage'));
check('Second structure (Silo) contract reuse', silo.includes('lincoln-grain-silo') && silo.includes('stageId'));
check('legacy adapter attaches Phase 5', adapter.includes('attachPresentationWorld('));
check('app attaches Phase 5', app.includes('attachPresentationWorld('));

const failures = checks.filter((item) => !item.passed);
console.log(`\nPhase 5 rendering, world, and setpiece destruction verification: ${checks.length - failures.length}/${checks.length} checks passed.`);
if (failures.length > 0) {
  console.error(`Failed checks: ${failures.map((item) => item.name).join(', ')}`);
  process.exitCode = 1;
}
