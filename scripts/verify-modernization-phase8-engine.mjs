import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

let totalChecks = 0;
let passedChecks = 0;

function assert(condition, message) {
  totalChecks += 1;
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    passedChecks += 1;
    console.log(`PASS: ${message}`);
  }
}

const htmlPath = path.join(projectRoot, 'MechanicsLab', 'SevereWeather_Warning.html');
const adapterPath = path.join(projectRoot, 'src', 'legacy', 'legacy-runtime-adapter.ts');
const physicsContractsPath = path.join(projectRoot, 'src', 'gameplay', 'physics', 'tornado-physics-contracts.ts');
const physicsSystemPath = path.join(projectRoot, 'src', 'gameplay', 'physics', 'tornado-physics-system.ts');
const collisionSystemPath = path.join(projectRoot, 'src', 'gameplay', 'physics', 'collision-detection-system.ts');
const vfxContractsPath = path.join(projectRoot, 'src', 'presentation', 'vfx', 'particle-system-contracts.ts');
const vfxSystemPath = path.join(projectRoot, 'src', 'presentation', 'vfx', 'particle-system.ts');
const loopContractsPath = path.join(projectRoot, 'src', 'gameplay', 'loop', 'game-loop-contracts.ts');
const loopSystemPath = path.join(projectRoot, 'src', 'gameplay', 'loop', 'game-loop-controller.ts');
const sourceMapPath = path.join(projectRoot, 'Docs', 'PHASE8_ENGINE_SOURCE_MAP.md');

// 1. Files existence
assert(fs.existsSync(physicsContractsPath), 'tornado-physics-contracts.ts exists');
assert(fs.existsSync(physicsSystemPath), 'tornado-physics-system.ts exists');
assert(fs.existsSync(collisionSystemPath), 'collision-detection-system.ts exists');
assert(fs.existsSync(vfxContractsPath), 'particle-system-contracts.ts exists');
assert(fs.existsSync(vfxSystemPath), 'particle-system.ts exists');
assert(fs.existsSync(loopContractsPath), 'game-loop-contracts.ts exists');
assert(fs.existsSync(loopSystemPath), 'game-loop-controller.ts exists');
assert(fs.existsSync(sourceMapPath), 'PHASE8_ENGINE_SOURCE_MAP.md exists');

// 2. HTML Markers
const htmlContent = fs.readFileSync(htmlPath, 'utf8');
assert(htmlContent.includes('MODERNIZATION_PHASE8_ENGINE_V1'), 'HTML contains MODERNIZATION_PHASE8_ENGINE_V1');
assert(htmlContent.includes('[SW:ARCH:PHASE8_ENGINE_BRIDGE]'), 'HTML contains Phase 8 bridge anchor');
assert(htmlContent.includes('[SW:SOURCE:modernization-phase8-engine.js]'), 'HTML contains Phase 8 source marker');
assert(htmlContent.includes('__SW_PHASE8_ENGINE_BRIDGE__'), 'HTML assigns global __SW_PHASE8_ENGINE_BRIDGE__');

// 3. Adapter Bridge Wiring
const adapterContent = fs.readFileSync(adapterPath, 'utf8');
assert(adapterContent.includes('attachEngine'), 'LegacyRuntimeAdapter has attachEngine()');
assert(adapterContent.includes('hasEngineBridge'), 'LegacyRuntimeAdapter reports hasEngineBridge');
assert(adapterContent.includes('runEngineContractProbe'), 'LegacyRuntimeAdapter has runEngineContractProbe()');
assert(adapterContent.includes('getEngineBridgeSnapshot'), 'LegacyRuntimeAdapter has getEngineBridgeSnapshot()');

// 4. Contracts & Invariants
const physicsContent = fs.readFileSync(physicsContractsPath, 'utf8');
assert(physicsContent.includes('RankineVortexConfig'), 'physics-contracts exports RankineVortexConfig');
assert(physicsContent.includes('isProtected: boolean'), 'DamageableEntity enforces First Law protection');

const loopContent = fs.readFileSync(loopContractsPath, 'utf8');
assert(loopContent.includes('GameLifecycleState'), 'loop-contracts exports GameLifecycleState');

console.log(`\nPhase 8 physics & engine verification: ${passedChecks}/${totalChecks} checks passed.`);
if (passedChecks !== totalChecks) {
  process.exit(1);
}
