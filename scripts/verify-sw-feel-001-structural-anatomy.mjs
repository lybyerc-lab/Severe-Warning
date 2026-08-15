import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = await readFile(path.join(root, 'runtime', 'sw-feel-001-structural-anatomy.js'), 'utf8');
const apply = await readFile(path.join(root, 'scripts', 'apply-sw-feel-001-structural-anatomy.mjs'), 'utf8');

const checks = [];
const check = (name, pass, detail = '') => {
  checks.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
};

check('structural anatomy marker is stable', runtime.includes('SW_FEEL_001_STRUCTURAL_ANATOMY_V1'));
check('roof panel anatomy exists', runtime.includes('roofPanel') && runtime.includes('Roof peels upward'));
check('wall panel anatomy exists', runtime.includes('wallPanel') && runtime.includes('Two wall sections fail'));
check('facade panel anatomy exists', runtime.includes('facadePanel') && runtime.includes('Front/facade panel'));
check('anatomy uses existing bounded debris pool', runtime.includes('swFeel001SpawnDebrisFragment'));
check('anatomy uses existing pooled dust', runtime.includes('swFeel001SpawnDustPuff'));
check('anatomy preserves material-family presentation', runtime.includes('swFeel001AnatomyMaterials'));
check('anatomy is driven by the accepted destruction presentation seam',
  runtime.includes('swFeel001PresentDestruction = function swFeel001PresentDestructionWithAnatomy'));
check('anatomy telemetry is exported', runtime.includes('getSwFeel001StructuralAnatomyState'));
check('apply stage requires FEEL-001 and QUALITY-002 markers',
  apply.includes('SW_FEEL_001_DESTRUCTION_CONSEQUENCE_V1') && apply.includes('SW_QUALITY_002_VISUAL_RESCUE_V1'));
check('apply stage enforces protected authority', apply.includes('prohibited gameplay authority write'));

for (const forbidden of [
  'target.health =',
  'score =',
  'combo =',
  'storm.speed =',
  'storm.radius =',
  'storm.pos.set(',
  'triggerAbility =',
]) {
  check(`structural anatomy does not write protected authority: ${forbidden}`, !runtime.includes(forbidden));
}

const failed = checks.filter(item => !item.pass);
console.log(`SW-FEEL-001 structural anatomy static verifier ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
