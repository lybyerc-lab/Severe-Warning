import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const checks = [];

function check(name, condition, detail = '') {
  const passed = Boolean(condition);
  checks.push({ name, passed, detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
}

async function read(relativePath) {
  return readFile(path.join(projectRoot, relativePath), 'utf8');
}

const workflow = await read('.github/workflows/modernization-phase-6.yml');
const runtime = await read('runtime/modernization-phase6-performance.js');
const apply = await read('scripts/apply-modernization-phase6-performance.mjs');
const verify = await read('scripts/verify-modernization-phase6-performance.mjs');
const qa = await read('scripts/qa-modernization-phase6-performance.mjs');
const measure = await read('scripts/measure-phase6-performance.mjs');
const agents = await read('AGENTS.md');
const bridge = await read('Docs/AGENT_BRIDGE.md');

check('Phase 6 workflow has no duplicate push trigger', !/^\s{2}push:/m.test(workflow));
check('Phase 6 workflow targets only the long-lived base PR branch', /pull_request:\s*\n\s*branches:\s*\n\s*- agent\/phase4-knowledge-antigravity-handoff/m.test(workflow) && !/\n\s*- agent\/phase6-android-performance-antigravity\s*$/m.test(workflow));
check('workflow checks out accepted Phase 5 base for same-runner comparison', workflow.includes('ref: 182f916807f3195dfe0546775a1fff7dc8c64aaa') && workflow.includes('path: phase6-base') && workflow.includes('fetch-depth: 0'));
check('workflow requires implementation truth verification', workflow.includes('pnpm run verify:process'));
check('workflow fails when artifact contents are missing', workflow.includes('if-no-files-found: error'));
check('workflow packages baseline, candidate, and comparison reports', ['baseline-report.json', 'candidate-report.json', 'comparison-report.json'].every((name) => workflow.includes(name)));
check('runtime bridge is V2 integrated authority', runtime.includes('MODERNIZATION_PHASE6_PERFORMANCE_V2'));
check('runtime exposes production integration counters', runtime.includes('productionUpdateSamples') && runtime.includes('productionDustBurstCalls') && runtime.includes('pooledDustSpawned'));
check('runtime installs a bounded wrapper around real production dust', runtime.includes('spawnProductionDustBurst = function phase6PooledProductionDustBurst'));
check('runtime installs production frame and cleanup wrappers', runtime.includes('updateProductionSlice = function phase6MeasuredProductionUpdate') && runtime.includes('clearProductionSlice = function phase6BoundedProductionClear'));
check('runtime protects pooled shared geometry from legacy disposal', runtime.includes('disposeProductionObject = function phase6AwareDisposeProductionObject'));
check('runtime resets the Phase 3 input authority', runtime.includes('__SW_PHASE3_INPUT_ABILITY_BRIDGE__?.reset'));
check('runtime does not write ineffective global move variables', !runtime.includes('globalThis.moveX') && !runtime.includes('globalThis.moveZ'));
check('apply script appends the bridge instead of rewriting accepted runtime modules', !apply.includes('replaceRegex(') && apply.includes('wrapper-integrated'));
check('apply script rebinds the stable V5.1 update pointer after wrapper installation', apply.includes('[SW:ARCH:PHASE6_STABLE_EXECUTOR_REBIND]') && apply.includes('globalThis.__SW_V510_UPDATE__ = updateProductionSlice'));
check('apply script rebinds the stable V5.1 rebuild pointer after wrapper installation', apply.includes('globalThis.__SW_V510_REBUILD__ = rebuildProductionSlice'));
check('verification proves accepted runtime modules remain byte-for-byte bundled', verify.includes('remains byte-for-byte bundled'));
check('QA proves real Hart Farm execution instead of direct helper-only allocation', qa.includes("triggerProductionSliceQa('hero')") && qa.includes('productionDustBurstCalls > dustBefore'));
check('QA proves production update samples arrive through the stable executor', qa.includes('productionUpdateSamples > 0'));
check('QA proves retry cleanup and listener stability', qa.includes('activeCount === 0') && qa.includes('listenerCount === 2'));
check('performance evidence is dual-build', measure.includes('SEVERE_WEATHER_BASE_URL') && measure.includes('SEVERE_WEATHER_CANDIDATE_URL'));
check('performance evidence measures frame percentiles and renderer work', measure.includes('frameTimeP95Ms') && measure.includes('drawCallsDelta') && measure.includes('trianglesDelta'));
check('performance capture does not disable GPU rendering', !measure.includes('--disable-gpu'));
check('performance capture has explicit navigation and frame watchdogs', measure.includes('FRAME_CAPTURE_TIMEOUT_MS') && measure.includes('NAVIGATION_TIMEOUT_MS') && measure.includes('Phase 6 frame capture timed out'));
check('repository startup contract requires implementation truth gate', agents.includes('Docs/IMPLEMENTATION_TRUTH_GATE.md'));
check('bridge does not call debug APK signed', !/Signed Android APK/i.test(bridge));

const failed = checks.filter((entry) => !entry.passed);
console.log(`\nImplementation truth verification: ${checks.length - failed.length}/${checks.length} checks passed.`);
if (failed.length) process.exit(1);
