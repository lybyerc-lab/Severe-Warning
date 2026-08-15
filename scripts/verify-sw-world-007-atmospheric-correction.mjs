import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = await readFile(path.join(root, 'runtime', 'sw-world-007-atmospheric-correction.js'), 'utf8');
const apply = await readFile(path.join(root, 'scripts', 'apply-sw-world-007-atmospheric-correction.mjs'), 'utf8');

const checks = [];
const check = (name, pass, detail = '') => {
  checks.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
};

check('atmospheric correction marker is defined', runtime.includes('SW_WORLD_007_ATMOSPHERIC_CORRECTION_V1'));
check('Supercell correction mass exists', runtime.includes('SWWorld007SupercellAtmosphericMass'));
check('Supercell uses irregular anvil/updraft/wall cloud groups',
  runtime.includes('SWWorld007SupercellAtmosphericAnvil')
  && runtime.includes('SWWorld007SupercellAtmosphericUpdraft')
  && runtime.includes('SWWorld007SupercellAtmosphericWallCloud'));
check('Supercell includes soft precipitation and ground inflow',
  runtime.includes('SWWorld007SupercellAtmosphericPrecip')
  && runtime.includes('SWWorld007SupercellAtmosphericGround'));
check('Derecho correction wall exists', runtime.includes('SWWorld007DerechoAtmosphericWall'));
check('Derecho uses shelf/roll/rain/outflow cloud groups',
  runtime.includes('SWWorld007DerechoAtmosphericShelf')
  && runtime.includes('SWWorld007DerechoAtmosphericRolls')
  && runtime.includes('SWWorld007DerechoAtmosphericRain')
  && runtime.includes('SWWorld007DerechoAtmosphericOutflow'));
check('correction uses soft sprite masses', runtime.includes('new THREE.Sprite(') && runtime.includes('new THREE.SpriteMaterial('));
check('correction hides rejected legacy parent presentation', runtime.includes('swWorld007AtmosHideLegacyParentChildren'));
check('correction hides rejected WORLD-007 primitive groups', runtime.includes('swWorld007AtmosHideOwnedPrimitiveGroups'));
check('correction wraps real Supercell and Derecho builders',
  runtime.includes('swWorld007BuildSupercellVisuals = function swWorld007BuildSupercellCorrected')
  && runtime.includes('swWorld007BuildDerechoVisuals = function swWorld007BuildDerechoCorrected'));
check('correction animates through real secondary-storm update path',
  runtime.includes('swWorld007UpdateSecondaryStormVisuals = function swWorld007UpdateSecondaryStormVisualsCorrected'));
check('correction exports telemetry', runtime.includes('getSwWorld007AtmosphericCorrectionState'));
check('correction positions are deterministic', runtime.includes('swWorld007AtmosNoise'));

for (const primitive of ['new THREE.CylinderGeometry(', 'new THREE.TorusGeometry(', 'new THREE.RingGeometry(', 'new THREE.BoxGeometry(']) {
  check(`correction does not introduce rejected hard-body primitive: ${primitive}`, !runtime.includes(primitive));
}

for (const forbidden of [
  'target.health =',
  'score =',
  'combo =',
  'storm.speed =',
  'storm.radius =',
  'storm.pos.set(',
  'triggerAbility =',
  'funnelMesh.geometry =',
  'outerFunnelMesh.geometry =',
]) {
  check(`correction does not write protected authority: ${forbidden}`, !runtime.includes(forbidden));
}

check('apply stage requires exact WORLD-007 and accepted rescue markers',
  apply.includes('SW_WORLD_007_SECONDARY_STORM_FORMS_V1')
  && apply.includes('SW_QUALITY_002_VISUAL_RESCUE_V1'));
check('apply stage rejects gameplay writes', apply.includes('prohibited gameplay authority write'));

const failed = checks.filter((item) => !item.pass);
console.log(`SW-WORLD-007 atmospheric correction static verifier ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
