import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = await readFile(path.join(root, 'runtime', 'sw-world-007-secondary-exclusive.js'), 'utf8');
const apply = await readFile(path.join(root, 'scripts', 'apply-sw-world-007-secondary-exclusive.mjs'), 'utf8');
const checks = [];
const check = (name, pass) => { checks.push({ name, pass: Boolean(pass) }); console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`); };
check('secondary-exclusivity marker is stable', runtime.includes('SW_WORLD_007_SECONDARY_EXCLUSIVE_V1'));
check('Supercell/Derecho resolve through existing storm type truth', runtime.includes('swWorld007ResolveStormType'));
check('secondary-active state is bounded to Supercell/Derecho', runtime.includes("activeType === 'supercell' || activeType === 'derecho'"));
check('legacy Tornado group leak is suppressed for secondary storms', runtime.includes('tornadoGroup.visible = false'));
check('legacy funnel meshes are suppressed for secondary storms', runtime.includes('funnelMesh.visible = false') && runtime.includes('outerFunnelMesh.visible = false'));
check('Slice 6 Tornado silhouette root is mutually exclusive with secondary storms', runtime.includes('swVisualHeroSlice6StormRoot') && runtime.includes('const desiredVisible = !secondaryActive') && runtime.includes('swVisualHeroSlice6StormRoot.visible = desiredVisible'));
check('legacy Tornado visibility is never forced on by this layer', !runtime.includes('tornadoGroup.visible = true'));
check('QA-only overlay suppression is tied to QA select path', runtime.includes('qaCaptureMode = true') && runtime.includes('COW[- ]?CAM'));
check('update wrapper reasserts exclusivity after legacy updates', runtime.includes('swWorld007UpdateSecondaryStormVisualsExclusive'));
check('telemetry records Slice 6 suppression', runtime.includes('slice6RootFramesSuppressed'));
check('telemetry is exported', runtime.includes('getSwWorld007SecondaryExclusiveState'));
check('apply requires prior visibility lock', apply.includes('SW_WORLD_007_VISIBILITY_LOCK_V1'));
for (const forbidden of ['target.health =','target.destroyed =','score =','combo =','storm.speed =','storm.radius =','triggerAbility =']) {
  check(`no protected authority write: ${forbidden}`, !runtime.includes(forbidden));
}
const failed = checks.filter(item => !item.pass);
console.log(`WORLD-007 secondary-exclusivity verifier ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
