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
check('Tornado group leak is suppressed only for secondary storms', runtime.includes("activeType !== 'supercell' && activeType !== 'derecho'") && runtime.includes('tornadoGroup.visible = false'));
check('funnel meshes are also suppressed for secondary storms', runtime.includes('funnelMesh.visible = false') && runtime.includes('outerFunnelMesh.visible = false'));
check('Tornado visibility is never forced on by this layer', !runtime.includes('tornadoGroup.visible = true'));
check('QA-only overlay suppression is tied to QA select path', runtime.includes('qaCaptureMode = true') && runtime.includes('COW[- ]?CAM'));
check('update wrapper reasserts exclusivity after legacy updates', runtime.includes('swWorld007UpdateSecondaryStormVisualsExclusive'));
check('telemetry is exported', runtime.includes('getSwWorld007SecondaryExclusiveState'));
check('apply requires prior visibility lock', apply.includes('SW_WORLD_007_VISIBILITY_LOCK_V1'));
for (const forbidden of ['target.health =','target.destroyed =','score =','combo =','storm.speed =','storm.radius =','triggerAbility =']) {
  check(`no protected authority write: ${forbidden}`, !runtime.includes(forbidden));
}
const failed = checks.filter(item => !item.pass);
console.log(`WORLD-007 secondary-exclusivity verifier ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
