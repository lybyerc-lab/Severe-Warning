import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = await readFile(path.join(root, 'runtime', 'sw-feel-001-destruction-consequence.js'), 'utf8');
const apply = await readFile(path.join(root, 'scripts', 'apply-sw-feel-001-destruction-consequence.mjs'), 'utf8');
const checks = [];
const check = (name, pass, detail = '') => {
  checks.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
};

check('destruction feel marker is stable', runtime.includes('SW_FEEL_001_DESTRUCTION_CONSEQUENCE_V1'));
check('pre-allocated debris pool is bounded', runtime.includes('SW_FEEL_001_MAX_DEBRIS = 48'));
check('pre-allocated shockwave pool is bounded', runtime.includes('SW_FEEL_001_MAX_SHOCKWAVES = 8'));
check('pre-allocated dust pool is bounded', runtime.includes('SW_FEEL_001_MAX_DUST = 24'));
check('material families include wood, masonry, glass, metal, tree, carnival', 
  runtime.includes('wood') && runtime.includes('masonry') && runtime.includes('glass') &&
  runtime.includes('metal') && runtime.includes('tree') && runtime.includes('carnival')
);
check('directional cyclonic vortex calculation present', runtime.includes('tanX = -dz / dist') && runtime.includes('tanZ = dx / dist'));
check('ground shockwave presentation present', runtime.includes('swFeel001SpawnShockwave'));
check('lifecycle reset clears all active pooled objects', runtime.includes('swFeel001ResetAll') && runtime.includes('item.active = false'));
check('state telemetry exposed on globalThis', runtime.includes('getSwFeel001State') && runtime.includes('__SW_FEEL_001_STATE__'));
check('apply script requires quality002 and destruction seams', apply.includes('SW_QUALITY_002_VISUAL_RESCUE_V1') && apply.includes('function destroyTarget'));
check('apply script enforces no prohibited gameplay writes', apply.includes('prohibited gameplay authority write'));

for (const forbidden of ['target.health =', 'score =', 'combo =', 'storm.pos.set(', 'triggerAbility =']) {
  check(`runtime does not write protected authority: ${forbidden}`, !runtime.includes(forbidden));
}

const failed = checks.filter(item => !item.pass);
console.log(`SW-FEEL-001 static verifier ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
