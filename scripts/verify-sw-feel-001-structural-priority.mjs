import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = await readFile(path.join(root, 'runtime', 'sw-feel-001-structural-priority.js'), 'utf8');
const apply = await readFile(path.join(root, 'scripts', 'apply-sw-feel-001-structural-priority.mjs'), 'utf8');

const checks = [];
const check = (name, pass) => { checks.push({ name, pass: Boolean(pass) }); console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`); };
const replacesExplosionArray = /\bactiveExplosionFragments\s*=(?!=)/.test(runtime);
check('structural-priority marker is stable', runtime.includes('SW_FEEL_001_STRUCTURAL_PRIORITY_V1'));
check('generic fragment budget is exactly two for structural events', runtime.includes('swFeel001StructuralPriorityBudget = 2'));
check('anatomy geometries bypass suppression', runtime.includes('swFeel001StructuralPriorityIsAnatomyGeometry'));
check('trees and cows are excluded from structural throttling', runtime.includes('!target.isTree') && runtime.includes('!target.isCow'));
check('original destruction presentation remains authoritative event source', runtime.includes('swFeel001StructuralPriorityPrevPresentation'));
check('legacy explosion bookkeeping is observed but not replaced', runtime.includes('activeExplosionFragments') && !replacesExplosionArray);
check('legacy fragment predicate is limited to small uniform BoxGeometry', runtime.includes("geometry.type !== 'BoxGeometry'") && runtime.includes('uniformCube') && runtime.includes('minDimension >= 0.7') && runtime.includes('maxDimension <= 2.1'));
check('legacy structural cubes are hidden rather than deleted', runtime.includes('mesh.visible = false') && runtime.includes('swFeel001LegacyCubeHidden') && !runtime.includes('activeExplosionFragments.splice'));
check('cube suppression is spatially bounded around destroyed target', runtime.includes('Math.hypot(dx, dz) > 12'));
check('larger inherited roof/wall/part fragments are preserved by dimension bound', runtime.includes('maxDimension <= 2.1'));
check('cube suppression telemetry is exported', runtime.includes('inheritedCubeFragmentsHidden'));
check('priority telemetry is exported', runtime.includes('getSwFeel001StructuralPriorityState'));
check('apply requires structural anatomy', apply.includes('SW_FEEL_001_STRUCTURAL_ANATOMY_V1'));
for (const forbidden of ['target.health =','target.destroyed =','score =','combo =','storm.speed =','storm.radius =','triggerAbility =']) {
  check(`no protected authority write: ${forbidden}`, !runtime.includes(forbidden));
}
const failed = checks.filter(item => !item.pass);
console.log(`FEEL-001 structural-priority verifier ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
