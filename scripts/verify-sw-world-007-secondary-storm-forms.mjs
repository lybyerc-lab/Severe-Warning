import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = await readFile(path.join(root, 'runtime', 'sw-world-007-secondary-storm-forms.js'), 'utf8');
const apply = await readFile(path.join(root, 'scripts', 'apply-sw-world-007-secondary-storm-forms.mjs'), 'utf8');

const checks = [];
const check = (name, pass, detail = '') => {
  checks.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
};

check('SW-WORLD-007 marker is defined', runtime.includes('SW_WORLD_007_SECONDARY_STORM_FORMS_V1'));
check('Supercell root presentation group is constructed', runtime.includes('SWWorld007SupercellPresentationRoot'));
check('Supercell includes sprawling upper anvil and shelf ring', runtime.includes('SWWorld007SupercellAnvilGroup') && runtime.includes('shelfRingGeo'));
check('Supercell includes mammatus underbelly clusters', runtime.includes('SWWorld007SupercellMammatus') && runtime.includes('SWWorld007MammatusPuff_'));
check('Supercell includes striated rotating mesocyclone core tiers', runtime.includes('SWWorld007SupercellMesoCore') && runtime.includes('SWWorld007MesoTier_'));
check('Supercell includes rotating wall cloud collar', runtime.includes('SWWorld007SupercellWallCloud'));
check('Supercell includes low-altitude ground inflow collar', runtime.includes('SWWorld007SupercellInflowCollar'));
check('Supercell includes volumetric convective cloud puff orbits', runtime.includes('SWWorld007SupercellPuffOrbits') && runtime.includes('SWWorld007SupercellOrbit_'));
check('Supercell includes vertical hail shaft shimmer column', runtime.includes('SWWorld007SupercellHailShaft'));

check('Derecho root presentation group is constructed', runtime.includes('SWWorld007DerechoPresentationRoot'));
check('Derecho includes multi-tiered curved bow echo shelf arc', runtime.includes('SWWorld007DerechoShelfArcGroup') && runtime.includes('SWWorld007DerechoShelfTier_'));
check('Derecho includes underside whales mouth roll clouds', runtime.includes('SWWorld007DerechoRollClouds') && runtime.includes('SWWorld007DerechoRoll_'));
check('Derecho includes forward microburst gale vector streaks', runtime.includes('SWWorld007DerechoMicroburstStreaks') && runtime.includes('SWWorld007MicroburstStreak_'));
check('Derecho includes leading ground outflow dust wall', runtime.includes('SWWorld007DerechoOutflowDust') && runtime.includes('SWWorld007OutflowDust_'));

check('Secondary storm update loop drives real render frames', runtime.includes('swWorld007UpdateSecondaryStormVisuals') && runtime.includes('renderer.render'));
check('State telemetry snapshot function is exported', runtime.includes('globalThis.getSwWorld007State'));
check('QA automation test interface is exported', runtime.includes('globalThis.__SW_WORLD_007_QA__'));

check('Apply script verifies prerequisites and rejects gameplay writes', apply.includes('SW_QUALITY_002_VISUAL_RESCUE_V1') && apply.includes('prohibited gameplay authority write'));

for (const forbidden of [
  'target.health =',
  'score =',
  'combo =',
  'storm.pos.set(',
  'triggerAbility =',
  'storm.speed =',
  'storm.radius =',
  'funnelMesh.geometry =',
  'outerFunnelMesh.geometry =',
]) {
  check(`runtime does not write protected authority or alter tornado: ${forbidden}`, !runtime.includes(forbidden));
}

const failed = checks.filter((item) => !item.pass);
console.log(`SW-WORLD-007 static verifier ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
