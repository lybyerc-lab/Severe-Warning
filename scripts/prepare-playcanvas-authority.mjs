import { access, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const authorityRoot = path.resolve('playcanvas-slice/public/authority');
const htmlPath = path.join(authorityRoot, 'index.html');
const bridgePath = path.join(authorityRoot, 'runtime', 'playcanvas-authority-bridge.js');
const bridgeTag = '<script src="./runtime/playcanvas-authority-bridge.js"></script>';
const modernTag = '<script type="module" src="./modern/modern-shell.js"></script>';
const cowOrbitMarker = 'PLAYCANVAS_COW_ORBIT_STABILITY_V1';

await access(bridgePath);
let html = await readFile(htmlPath, 'utf8');
let changed = false;

// ============================================================================
// [SW:PLAYCANVAS:COW_ORBIT_STABILITY]
// The legacy safe-cow comedy loop launches cattle whenever they are inside
// storm.radius * 1.8. Its authored airborne orbit can remain inside that same
// threshold forever, so a cow may never reach the landing branch. Keep Cow 17
// safe and slapstick, but bound each orbit and require the storm to move away
// before that cow can be armed for another launch.
// ============================================================================
if (!html.includes(cowOrbitMarker)) {
  const before = `  const cowMotionScale = bovineCowCam.active ? 0.32 : 1;\n  animals.forEach(cow => {\n    const dist = Math.hypot(cow.x - storm.pos.x, cow.z - storm.pos.z);\n    if (dist < storm.radius * 1.8) {`;
  const after = `  const cowMotionScale = bovineCowCam.active ? 0.32 : 1;\n  const PLAYCANVAS_COW_ORBIT_STABILITY_V1 = true;\n  const playcanvasCowMaxOrbitSeconds = 2.35;\n  animals.forEach(cow => {\n    const dist = Math.hypot(cow.x - storm.pos.x, cow.z - storm.pos.z);\n    if (!cow.airborne && cow.flightTime >= playcanvasCowMaxOrbitSeconds && dist >= storm.radius * 2.2) {\n      cow.flightTime = 0;\n    }\n    const playcanvasCowOrbitWindowOpen = !cow.airborne || cow.flightTime < playcanvasCowMaxOrbitSeconds;\n    if (dist < storm.radius * 1.8 && playcanvasCowOrbitWindowOpen) {`;
  const matches = html.split(before).length - 1;
  if (matches !== 1) {
    throw new Error(`PlayCanvas cow orbit stability patch expected one authority match, found ${matches}.`);
  }
  html = html.replace(before, after);
  changed = true;
}

if (!html.includes(cowOrbitMarker)) {
  throw new Error('PlayCanvas Cow 17 orbit stability marker is missing after patch.');
}

if (!html.includes(bridgeTag)) {
  if (!html.includes(modernTag)) {
    throw new Error('Generated authority bundle is missing the modern-shell script tag.');
  }
  html = html.replace(modernTag, `${bridgeTag}\n${modernTag}`);
  changed = true;
}

if (!html.includes('PLAYCANVAS_AUTHORITY_V1') && !html.includes('playcanvas-authority-bridge.js')) {
  throw new Error('PlayCanvas authority bridge injection failed.');
}

if (changed) {
  await writeFile(htmlPath, html, 'utf8');
  console.log('Prepared same-origin PlayCanvas gameplay authority bundle with bounded Cow 17 orbit.');
} else {
  console.log('PlayCanvas authority bridge and Cow 17 orbit stability are already prepared.');
}
