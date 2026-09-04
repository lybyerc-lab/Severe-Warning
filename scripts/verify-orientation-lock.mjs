// [SW:UI:ORIENTATION_LOCK] Static guard for the landscape decision (D-011).
//
// The game is landscape-only. That is enforced in three separate places, none of
// which knows about the others, and the failure mode is silence: a portrait
// viewport in a QA script does not error, it just measures a layout that cannot
// ship. scripts/qa-play-full-round.mjs drove every evidence run at 430x932 for
// months and nothing anywhere noticed.
//
// So this asserts all three, cheaply, on every build:
//   1. Android still declares a landscape-only screenOrientation.
//   2. The web build still carries the lock request and the stand-by gate.
//   3. Every viewport any script opens a page at is wider than it is tall.

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const failures = [];
const passes = [];

function check(name, condition, detail) {
  if (condition) passes.push(`${name}${detail ? ` (${detail})` : ''}`);
  else failures.push(`${name}${detail ? `: ${detail}` : ''}`);
}

// --- 1. Android -------------------------------------------------------------
const manifestPath = 'android/app/src/main/AndroidManifest.xml';
const manifest = readFileSync(manifestPath, 'utf8');
const orientationMatch = manifest.match(/android:screenOrientation="([^"]+)"/);
const LANDSCAPE_ONLY = new Set(['landscape', 'sensorLandscape', 'reverseLandscape', 'userLandscape']);
check(
  'AndroidManifest declares a landscape-only orientation',
  Boolean(orientationMatch) && LANDSCAPE_ONLY.has(orientationMatch[1]),
  orientationMatch ? orientationMatch[1] : 'no android:screenOrientation at all'
);

// --- 2. The web build's lock and gate ---------------------------------------
const gamePath = 'MechanicsLab/SevereWeather_Warning.html';
const game = readFileSync(gamePath, 'utf8');
const required = [
  ['orientation anchor is present', '[SW:UI:ORIENTATION_LOCK]'],
  ['the stand-by gate markup exists', 'id="rotateGate"'],
  ['the lock is actually requested', "orientation.lock('landscape')"],
  ['the gate is driven by a portrait media query', '(orientation: portrait) and (max-width: 900px)'],
  ['the bot and QA lanes can bypass the gate', 'sw-orientation-ungated'],
  ['a gated run is suspended, not played sideways', 'runSuspendedByRotation'],
  // Without fullscreen the lock is refused on Android Chrome, so a build that
  // asks for the lock but never asks for fullscreen can only nag, never hold.
  ['fullscreen is requested so the lock can succeed', 'function requestImmersiveLandscape'],
  ['the start gesture takes the game immersive', 'if (typeof requestImmersiveLandscape'],
  ['the lock is re-asked after entering fullscreen', "addEventListener('fullscreenchange'"],
  ['the stand-by card is itself the fullscreen button', 'rotate-gate-actionable']
];
for (const [name, needle] of required) {
  check(name, game.includes(needle), needle);
}

// --- 3. Every harness viewport ----------------------------------------------
// Matches both shapes used in this repo: an inline `viewport: { width: W,
// height: H }` and the `{ name, width, height }` entries the phase harnesses
// list. A page opened taller than it is wide is measuring a layout that cannot
// ship, so it fails here rather than producing a confident wrong report.
const VIEWPORT_PATTERNS = [
  /viewport:\s*\{\s*width:\s*(\d+)\s*,\s*height:\s*(\d+)/g,
  /\bwidth:\s*(\d+)\s*,\s*height:\s*(\d+)\s*,\s*isMobile\b/g
];
const scriptsDir = 'scripts';
let viewportsSeen = 0;
for (const file of readdirSync(scriptsDir).filter((f) => f.endsWith('.mjs')).sort()) {
  const source = readFileSync(path.join(scriptsDir, file), 'utf8');
  for (const pattern of VIEWPORT_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(source)) !== null) {
      const width = Number(match[1]);
      const height = Number(match[2]);
      viewportsSeen += 1;
      if (width < height) {
        failures.push(`scripts/${file} opens a PORTRAIT viewport ${width}x${height}; the game is landscape-only`);
      }
    }
  }
}
check('every harness viewport is landscape', true, `${viewportsSeen} viewports scanned`);
if (viewportsSeen < 8) {
  failures.push(`only ${viewportsSeen} viewports found; the scanner has stopped matching how this repo declares them`);
}

// --- report -----------------------------------------------------------------
for (const line of passes) console.log(`  PASS ${line}`);
for (const line of failures) console.error(`  FAIL ${line}`);
console.log(`\nOrientation-lock verification: ${passes.length}/${passes.length + failures.length} checks passed.`);
if (failures.length > 0) process.exit(1);
