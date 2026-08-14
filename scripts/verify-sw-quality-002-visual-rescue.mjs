import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = await readFile(path.join(root, 'runtime', 'sw-quality-002-visual-rescue.js'), 'utf8');
const apply = await readFile(path.join(root, 'scripts', 'apply-sw-quality-002-visual-rescue.mjs'), 'utf8');
const checks = [];
const check = (name, pass, detail = '') => {
  checks.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
};

check('visual rescue marker is stable', runtime.includes('SW_QUALITY_002_VISUAL_RESCUE_V1'));
check('phone newspaper uses three-column decision grid', runtime.includes('grid-template-columns:repeat(3,minmax(0,1fr))'));
check('campaign map is compacted instead of microscopic prose', runtime.includes('.campaign-stop { min-height:36px!important'));
check('storm site newspaper cards recover paper contrast', runtime.includes('.storm-site-card') && runtime.includes('background:rgba(255,255,255,.38)!important'));
check('dirty storm volume is presentation-owned', runtime.includes('SWQuality002StormVolume') && runtime.includes('SWQuality002StormPuff'));
check('whole-column volume includes lower ground dust', runtime.includes('SWQuality002GroundDust'));
check('county fair gets a distinct after-dark identity', runtime.includes('county-fair-after-dark') && runtime.includes('SWQuality002FairMidwayPath') && runtime.includes('SWQuality002FairBulb'));
check('coast gets ocean shoreline and lighthouse identity', runtime.includes('gullwind-storm-coast') && runtime.includes('SWQuality002CoastalOcean') && runtime.includes('SWQuality002LighthouseTower'));
check('storm sites explicitly end only the inherited playable opening', runtime.includes("opening.finish('storm-site-direct')"));
check('cinematic replaces major box masses at presentation time', runtime.includes("['cow17-torso-mass', 'sphere']") && runtime.includes("['cow17-right-upper-foreleg', 'cylinder']"));
check('cinematic removes prototype chrome and ghost newspaper', runtime.includes('THREE.JS PRODUCTION SLICE') && runtime.includes('paper.visible = t < 0.58'));
check('cinematic uses temporary lighting and restores it', runtime.includes('SWQuality002CinematicWarmKey') && runtime.includes('swQuality002RemoveCinematicLights'));
check('apply script requires quality001 and accepted feature stack', apply.includes('SW_QUALITY_001_OWNER_PLAYTEST_RESCUE_V1') && apply.includes('SW_LEVEL_001_STORM_SITE_FRAMEWORK_V1'));
check('apply script rejects direct gameplay authority writes', apply.includes('prohibited gameplay authority write'));
for (const forbidden of ['target.health =', 'score =', 'combo =', 'storm.pos.set(', 'triggerAbility =']) {
  check(`runtime does not write protected authority: ${forbidden}`, !runtime.includes(forbidden));
}

const failed = checks.filter(item => !item.pass);
console.log(`SW-QUALITY-002 static verifier ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
