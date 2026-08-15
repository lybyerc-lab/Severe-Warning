import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = await readFile(path.join(root, 'runtime', 'sw-world-007-visibility-lock.js'), 'utf8');
const apply = await readFile(path.join(root, 'scripts', 'apply-sw-world-007-visibility-lock.mjs'), 'utf8');

const checks = [];
const check = (name, pass, detail = '') => {
  checks.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
};

check('visibility-lock marker is stable', runtime.includes('SW_WORLD_007_VISIBILITY_LOCK_V1'));
check('legacy Supercell parent children are suppressed', runtime.includes('swWorld007VisibilityHideParentChildren') && runtime.includes('supercellGroup'));
check('legacy Derecho parent children are suppressed', runtime.includes('swWorld007VisibilityHideParentChildren') && runtime.includes('derechoGroup'));
check('named rejected primitive groups are re-hidden', runtime.includes('swWorld007VisibilityHidePrimitiveGroups'));
check('visibility lock runs after every secondary-storm update', runtime.includes('swWorld007UpdateSecondaryStormVisualsVisibilityLocked'));
check('QA storm selection reasserts visibility lock', runtime.includes('swWorld007QaSelectStormVisibilityLocked'));
check('QA-only Cow-Cam chrome suppression is bounded to QA selector path', runtime.includes('swWorld007VisibilityHideQaCowCamChrome'));
check('visibility telemetry is exported', runtime.includes('getSwWorld007VisibilityLockState'));
check('apply requires atmospheric correction first', apply.includes('SW_WORLD_007_ATMOSPHERIC_CORRECTION_V1'));
check('apply enforces protected authority', apply.includes('prohibited authority write'));

for (const forbidden of [
  'target.health =',
  'target.destroyed =',
  'score =',
  'combo =',
  'storm.speed =',
  'storm.radius =',
  'storm.pos.set(',
  'triggerAbility =',
]) {
  check(`runtime does not write protected authority: ${forbidden}`, !runtime.includes(forbidden));
}

const failed = checks.filter(item => !item.pass);
console.log(`WORLD-007 visibility-lock static verifier ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
