import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = await readFile(path.join(root, 'runtime', 'sw-ui-004-gameplay-product-identity.js'), 'utf8');
const apply = await readFile(path.join(root, 'scripts', 'apply-sw-ui-004-gameplay-product-identity.mjs'), 'utf8');

const checks = [];
const check = (name, pass, detail = '') => {
  checks.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
};

check('SW-UI-004 marker is stable', runtime.includes('SW_UI_004_GAMEPLAY_PRODUCT_IDENTITY_V1'));
check('canonical product title replacement is present', runtime.includes('SEVERE WEATHER WARNING'));
check('legacy gameplay title is targeted presentation-only', runtime.includes('/SEVERE\\s+WEATHER\\s+3D/gi'));
check('3D LAB production badge is targeted', runtime.includes('3D\\s+LAB') && runtime.includes('PRODUCTION\\s+SLICE'));
check('warning implementation label is targeted', runtime.includes('NOAA\\s+EAS') && runtime.includes('3D\\s+'));
check('dev chrome hiding is deepest-node bounded', runtime.includes('childAlsoMatches'));
check('observer reapplies product identity after presentation mutations', runtime.includes('new MutationObserver'));
check('state telemetry is exported', runtime.includes('getSwUi004State'));
check('apply stage requires QUALITY-002 and existing legacy label',
  apply.includes('SW_QUALITY_002_VISUAL_RESCUE_V1') && apply.includes('SEVERE WEATHER 3D'));
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
  check(`runtime does not write protected authority: ${forbidden}`, !runtime.includes(forbidden));
}

const failed = checks.filter(item => !item.pass);
console.log(`SW-UI-004 static verifier ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
