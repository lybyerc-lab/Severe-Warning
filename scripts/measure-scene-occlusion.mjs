// [SW:QA:SCENE_OCCLUSION]
// Answers "how much of the frame is this actually responsible for?" for a change
// made inside the live scene -- and refuses to answer unless it can first prove,
// in the same run, that it is looking at something that responds to changes.
//
// WHY IT LEADS WITH A CONTROL
//
// The first attempt at this measurement paused the game, mutated a material and
// screenshotted the page. Every variant came back between 0.25% and 0.87%: a
// tidy table that looked like a result and was worth nothing, because pausing
// stops the render loop and no screenshot taken afterwards reflected any change.
// Nothing in the output said so. It took hiding the ENTIRE tornado and measuring
// 0.69% -- for an object that fills a third of the screen -- to expose it.
//
// So the control is mandatory and runs before anything else. If removing
// something unmissable does not move an unmissable number of pixels, this exits
// non-zero and prints nothing else. Three more guards exist for the same reason:
// the run must actually be in gameplay, the baseline must contain a real scene
// rather than one flat colour, and the noise floor must come out near zero.
//
// WHY EVERY EXPOSURE IS ITS OWN RUN
//
// This world animates per FRAME, not per elapsed millisecond -- the mesocyclone
// canopy turns +0.04 rad a frame whatever the clock says. An earlier version of
// this rig held one page open and re-rendered it at a fixed timestamp, assuming
// that froze the picture; two untouched captures still differed by 16% of the
// frame, because each capture had cost one more frame of animation than the one
// before it.
//
// Two frames are comparable only if the same number of frames has been stepped
// to reach them. So each exposure boots its own page, steps an identical frame
// count under installQaFrameController with a fixed seed, applies its mutation
// immediately before the final frame, and captures. It costs a page load per
// measurement and it is the only version of this that has produced a number
// worth quoting.
//
// USAGE
//   node scripts/measure-scene-occlusion.mjs
// Env:
//   CHROME_BIN            browser to drive (defaults to Playwright's own)
//   SW_OCCLUSION_PORT     static server port
//
// Mutations are real functions handed to the page. They cannot be strings: the
// built page ships a Content-Security-Policy without 'unsafe-eval', so a
// string-bodied mutation dies with EvalError instead of measuring anything.

import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { installQaFrameController, decodePng } from './lib/qa-visual-rig.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const wwwDir = path.join(projectRoot, 'www');
const PORT = Number(process.env.SW_OCCLUSION_PORT || 4390);
const SEED = 20260828;
const FRAME_MS = 16.6667;
const BOOT_FRAMES = 24;
const CINEMATIC_FRAMES = 30;
const SETTLE_FRAMES = 120;

// The rig is trusted only if removing the tornado moves at least this much of
// the frame. It fills a large part of every gameplay capture; if it can vanish
// without registering, the captures are not live.
const CONTROL_MIN_PERCENT = 5.0;
// Two identical runs must agree this closely, or the run is not reproducible and
// no difference smaller than the disagreement means anything.
const FLOOR_MAX_PERCENT = 0.5;

if (!fs.existsSync(path.join(wwwDir, 'index.html'))) {
  console.error('www/ is not built. Run `node scripts/build-web.mjs` first.');
  process.exit(1);
}

const mime = {
  '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json',
  '.glb': 'model/gltf-binary', '.wav': 'audio/wav', '.png': 'image/png', '.woff2': 'font/woff2'
};
const server = http.createServer((req, res) => {
  let file = path.join(wwwDir, path.normalize(decodeURIComponent(req.url.split('?')[0])));
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(PORT, '127.0.0.1', resolve));

// The state to measure in: stage 3 at EF-5 with a skin equipped, which is where
// the funnel complaint came from.
function setupScene() {
  currentStage = 3;
  destructionScore = getActiveCampaignLevel().scoreTarget * 1.2;
  updateEFRating();
  if (typeof applyFunnelSkinMaterials === 'function') applyFunnelSkinMaterials('crimson-fury');
}

const NO_MUTATION = { label: 'baseline', apply: () => {} };
const CONTROL = { label: 'CONTROL: whole tornado hidden', apply: () => { tornadoGroup.visible = false; } };

const setOuterOpacity = value => { outerFunnelMat.uniforms.uOpacity.value = value; };

const MUTATIONS = [
  { label: 'outer sheath hidden', apply: () => { outerFunnelMesh.visible = false; } },
  { label: 'inner funnel hidden', apply: () => { funnelMesh.visible = false; } },
  { label: 'skin off (default slate)', apply: () => { applyFunnelSkinMaterials('default-classic'); } },
  ...[0.30, 0.24, 0.18, 0.12].map(value => ({
    label: `outer sheath opacity ${value.toFixed(2)}`,
    apply: setOuterOpacity,
    arg: value
  }))
];

const browser = await chromium.launch({
  executablePath: process.env.CHROME_BIN || undefined,
  headless: true,
  args: ['--use-angle=swiftshader']
});

// One exposure: a whole page life, stepped to a fixed frame count, with the
// mutation applied immediately before the final frame so the mutation is the
// only thing the picture can differ by.
async function expose({ apply, arg }) {
  const context = await browser.newContext({ viewport: { width: 915, height: 412 } });
  await context.addInitScript(installQaFrameController, SEED);
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(String(error)));
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'domcontentloaded' });

  const boot = await page.evaluate(async ({ frameDuration, padTo }) => {
    const controller = globalThis.__SW_QA_TIME_CONTROLLER__;
    const isReady = () => globalThis.__SW_PRODUCTION_SLICE_READY__ === true
      || typeof globalThis.getProductionSliceQaState === 'function';
    let readyAtFrame = -1;
    let stepped = 0;
    while (stepped < 400) {
      if (readyAtFrame < 0 && isReady()) readyAtFrame = stepped;
      if (readyAtFrame >= 0 && stepped >= padTo) break;
      controller.stepFrame(1000.0 + stepped * frameDuration);
      stepped += 1;
      if (readyAtFrame < 0) await new Promise(resolve => setTimeout(resolve, 0));
    }
    return { ready: isReady(), framesUsed: stepped };
  }, { frameDuration: FRAME_MS, padTo: BOOT_FRAMES });
  if (!boot.ready) throw new Error(`Deterministic boot never reached readiness: ${JSON.stringify(boot)}`);
  if (boot.framesUsed !== BOOT_FRAMES) {
    throw new Error(`Boot took ${boot.framesUsed} frames, not the fixed ${BOOT_FRAMES}; exposures would not share a phase.`);
  }

  let launched = null;
  for (const selector of ['#btnTvPower', '#btnStartMenu', '#btnLaunchFromMap']) {
    if (await page.locator(selector).first().isVisible().catch(() => false)) {
      await page.click(selector, { force: true });
      launched = selector;
      break;
    }
  }
  if (!launched) throw new Error('No visible launch control; cannot reach gameplay.');

  const drive = await page.evaluate(async ({ frameDuration, cinematicFrames, settleFrames }) => {
    const controller = globalThis.__SW_QA_TIME_CONTROLLER__;
    let frame = 0;
    const step = async () => {
      controller.stepFrame(1000.0 + frame * frameDuration);
      frame += 1;
      if (frame % 20 === 0) await new Promise(resolve => setTimeout(resolve, 0));
    };
    // The run opens on the Hart Farm cinematic. Skipping it is not optional: an
    // earlier rig measured the cutscene -- a farmyard with no tornado in it --
    // and duly reported that hiding the tornado changed nothing. The skip must
    // come AFTER the cinematic has started; on the same turn as the launch
    // click it is a no-op, because there is nothing yet to finish.
    for (let i = 0; i < cinematicFrames; i += 1) {
      await step();
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    // Skip, then CHECK. Calling it once and moving on is what let an earlier
    // version capture the cutscene: if the cinematic has not started yet the
    // call is a no-op, and it starts a few frames later with nothing to stop it.
    let skipAttempts = 0;
    while (typeof openingCinematicState !== 'undefined' && openingCinematicState.active && skipAttempts < 60) {
      if (typeof skipOpeningCinematic === 'function') skipOpeningCinematic();
      await step();
      await new Promise(resolve => setTimeout(resolve, 0));
      skipAttempts += 1;
    }
    for (let i = 0; i < settleFrames; i += 1) await step();
    return { skipAttempts };
  }, { frameDuration: FRAME_MS, cinematicFrames: CINEMATIC_FRAMES, settleFrames: SETTLE_FRAMES });

  await page.evaluate(setupScene);

  const state = await page.evaluate(() => ({
    skipAttempts: null,
    ef: efRating,
    scale: funnelScale,
    stage: currentStage,
    runActive: Boolean(runActive),
    tornadoVisible: Boolean(tornadoGroup && tornadoGroup.visible),
    cinematic: Boolean(typeof openingCinematicState !== 'undefined' && openingCinematicState.active)
  }));
  state.skipAttempts = drive.skipAttempts;
  if (!state.runActive || !state.tornadoVisible || state.cinematic) {
    throw new Error(`Not in gameplay when the capture was due: ${JSON.stringify(state)}`);
  }

  await page.evaluate(apply, arg);
  // The final frame, at the same index in every exposure, rendered after the
  // mutation has been applied.
  await page.evaluate(({ frameDuration, frames }) => {
    globalThis.__SW_QA_TIME_CONTROLLER__.stepFrame(1000.0 + frames * frameDuration);
  }, { frameDuration: FRAME_MS, frames: CINEMATIC_FRAMES + SETTLE_FRAMES + 1 });

  const canvas = page.locator('#webgl, canvas#gameCanvas, canvas').first();
  const decoded = decodePng(await canvas.screenshot({ type: 'png' }));
  await context.close();
  return { decoded, state, pageErrors };
}

function differencePercent(a, b) {
  let changed = 0;
  const total = a.pixels.length / 4;
  for (let i = 0; i < a.pixels.length; i += 4) {
    if (Math.abs(a.pixels[i] - b.pixels[i]) > 8
      || Math.abs(a.pixels[i + 1] - b.pixels[i + 1]) > 8
      || Math.abs(a.pixels[i + 2] - b.pixels[i + 2]) > 8) changed += 1;
  }
  return changed / total * 100;
}

const baseline = await expose(NO_MUTATION);
const repeat = await expose(NO_MUTATION);
const floor = differencePercent(baseline.decoded, repeat.decoded);

// A capture of one flat colour differences to zero against anything, and would
// sail through every check below it.
const distinct = new Set();
for (let i = 0; i < baseline.decoded.pixels.length; i += 4) {
  distinct.add((baseline.decoded.pixels[i] << 16)
    | (baseline.decoded.pixels[i + 1] << 8)
    | baseline.decoded.pixels[i + 2]);
  if (distinct.size > 256) break;
}

const control = await expose(CONTROL);
const controlPercent = differencePercent(baseline.decoded, control.decoded);

console.log('='.repeat(68));
console.log('  SCENE OCCLUSION — share of the frame a change is responsible for');
console.log('='.repeat(68));
console.log(`state: ${baseline.state.ef} stage ${baseline.state.stage}, funnel scale ${baseline.state.scale}`);
console.log(`frames per exposure: ${BOOT_FRAMES} boot + ${CINEMATIC_FRAMES} cinematic + ${SETTLE_FRAMES} settle + 1`);
console.log(`baseline distinct colours: ${distinct.size > 256 ? '>256' : distinct.size}`);
console.log(`noise floor (two independent runs, untouched): ${floor.toFixed(3)}%`);
console.log(`${CONTROL.label}: ${controlPercent.toFixed(2)}%`);
console.log('');

const failures = [];
if (distinct.size <= 256) failures.push(`baseline has only ${distinct.size} distinct colours; it is not a rendered scene`);
if (floor > FLOOR_MAX_PERCENT) failures.push(`noise floor ${floor.toFixed(3)}% exceeds ${FLOOR_MAX_PERCENT}%; runs are not reproducible`);
if (controlPercent < CONTROL_MIN_PERCENT) failures.push(`control moved ${controlPercent.toFixed(2)}%, under the required ${CONTROL_MIN_PERCENT}%; captures are not responding to scene changes`);

if (failures.length) {
  console.error('RIG NOT TRUSTED:');
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error('Refusing to print measurements. Fix the rig before believing any number.');
  await browser.close();
  server.close();
  process.exit(1);
}

for (const mutation of MUTATIONS) {
  const exposure = await expose(mutation);
  const percent = differencePercent(baseline.decoded, exposure.decoded);
  const note = percent <= floor ? '   (at or below the noise floor)' : '';
  console.log(`  ${mutation.label.padEnd(32)} ${percent.toFixed(2)}%${note}`);
}

console.log('');
console.log(`page errors: ${baseline.pageErrors.length}`);

await browser.close();
server.close();
