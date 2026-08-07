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
// safe and slapstick, but bound orbit + total flight by monotonic wall time and
// require the storm to move away before that cow can be armed for another launch.
// ============================================================================
if (!html.includes(cowOrbitMarker)) {
  const before = `  const cowMotionScale = bovineCowCam.active ? 0.32 : 1;\n  animals.forEach(cow => {\n    const dist = Math.hypot(cow.x - storm.pos.x, cow.z - storm.pos.z);\n    if (dist < storm.radius * 1.8) {`;
  const after = `  const cowMotionScale = bovineCowCam.active ? 0.32 : 1;\n  const PLAYCANVAS_COW_ORBIT_STABILITY_V1 = true;\n  const playcanvasCowMaxOrbitMilliseconds = 2350;\n  const playcanvasCowMaxFlightMilliseconds = 5200;\n  const playcanvasCowRearmDistanceScale = 2.2;\n  const playcanvasCowNowMilliseconds = performance.now();\n  animals.forEach(cow => {\n    const dist = Math.hypot(cow.x - storm.pos.x, cow.z - storm.pos.z);\n    if (!cow.airborne && cow.playcanvasOrbitLocked === true && dist >= storm.radius * playcanvasCowRearmDistanceScale) {\n      cow.playcanvasOrbitLocked = false;\n      cow.playcanvasOrbitStartedAtMilliseconds = 0;\n      cow.flightTime = 0;\n    }\n    if (!cow.airborne && cow.playcanvasOrbitLocked !== true && dist < storm.radius * 1.8) {\n      cow.playcanvasOrbitStartedAtMilliseconds = playcanvasCowNowMilliseconds;\n    }\n    if (cow.airborne && !Number.isFinite(cow.playcanvasOrbitStartedAtMilliseconds)) {\n      cow.playcanvasOrbitStartedAtMilliseconds = playcanvasCowNowMilliseconds;\n    }\n    const playcanvasCowOrbitAgeMilliseconds = cow.airborne\n      ? Math.max(0, playcanvasCowNowMilliseconds - Number(cow.playcanvasOrbitStartedAtMilliseconds || playcanvasCowNowMilliseconds))\n      : 0;\n    const playcanvasCowOrbitWindowOpen = cow.playcanvasOrbitLocked !== true\n      && (!cow.airborne || playcanvasCowOrbitAgeMilliseconds < playcanvasCowMaxOrbitMilliseconds);\n    if (cow.airborne && !playcanvasCowOrbitWindowOpen) cow.playcanvasOrbitLocked = true;\n    if (dist < storm.radius * 1.8 && playcanvasCowOrbitWindowOpen) {`;
  const matches = html.split(before).length - 1;
  if (matches !== 1) {
    throw new Error(`PlayCanvas cow orbit stability patch expected one authority match, found ${matches}.`);
  }
  html = html.replace(before, after);

  const descentBefore = `      cow.altitude -= 27 * dt * cowMotionScale;`;
  const descentAfter = `      const playcanvasCowFlightAgeMilliseconds = Math.max(0, playcanvasCowNowMilliseconds - Number(cow.playcanvasOrbitStartedAtMilliseconds || playcanvasCowNowMilliseconds));\n      const playcanvasCowDescentProgress = Math.max(0, Math.min(1,\n        (playcanvasCowFlightAgeMilliseconds - playcanvasCowMaxOrbitMilliseconds)\n        / Math.max(1, playcanvasCowMaxFlightMilliseconds - playcanvasCowMaxOrbitMilliseconds)\n      ));\n      const playcanvasCowWallClockAltitude = 20 - (19.2 * playcanvasCowDescentProgress);\n      const playcanvasCowDescentScale = cow.playcanvasOrbitLocked === true ? 1 : cowMotionScale;\n      cow.altitude = Math.min(cow.altitude - 27 * dt * playcanvasCowDescentScale, playcanvasCowWallClockAltitude);`;
  const descentMatches = html.split(descentBefore).length - 1;
  if (descentMatches !== 1) {
    throw new Error(`PlayCanvas cow descent stability patch expected one match, found ${descentMatches}.`);
  }
  html = html.replace(descentBefore, descentAfter);

  const qaBefore = `    cow17: cow17 ? { id: cow17.id, airborne: cow17.airborne, altitude: cow17.altitude, x: cow17.x, z: cow17.z, tagged: cow17.mesh.userData.cow17 === true } : null,`;
  const qaAfter = `    cow17: cow17 ? {\n      id: cow17.id,\n      airborne: cow17.airborne,\n      altitude: cow17.altitude,\n      x: cow17.x,\n      z: cow17.z,\n      tagged: cow17.mesh.userData.cow17 === true,\n      flightTime: cow17.flightTime,\n      playcanvasOrbitLocked: cow17.playcanvasOrbitLocked === true,\n      playcanvasOrbitAgeMilliseconds: Number.isFinite(cow17.playcanvasOrbitStartedAtMilliseconds)\n        ? Math.max(0, performance.now() - cow17.playcanvasOrbitStartedAtMilliseconds)\n        : 0\n    } : null,`;
  const qaMatches = html.split(qaBefore).length - 1;
  if (qaMatches !== 1) {
    throw new Error(`PlayCanvas cow QA telemetry patch expected one match, found ${qaMatches}.`);
  }
  html = html.replace(qaBefore, qaAfter);
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
  console.log('Prepared same-origin PlayCanvas gameplay authority bundle with wall-time-bounded Cow 17 flight.');
} else {
  console.log('PlayCanvas authority bridge and Cow 17 orbit stability are already prepared.');
}
