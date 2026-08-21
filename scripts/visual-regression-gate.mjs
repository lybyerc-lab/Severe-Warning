// [SW:QA:VISUAL_REGRESSION_GATE]
// Renders the current build against the last build that could have changed how
// the game looks, and fails when the picture moved in a way the harness can tell
// apart from its own measured noise.
//
// Why this exists: every verify-*.mjs check in this repo asserts that a STRING is
// present in the source. They cannot see. Roads on causeways, a sand checkerboard
// across the map, every metal surface rendering solid black, cars buried in the
// asphalt, and a modern shell that had never once booted all shipped with those
// checks fully green. scripts/compare-phase5-visual-baseline.mjs already knew how
// to catch that class of bug and was wired into nothing.
//
// The comparison itself lives in compare-phase5-visual-baseline.mjs, which is
// self-calibrating: it renders the baseline twice to measure its own noise floor,
// then requires the candidate to land inside it. This script's job is only to put
// the right two builds in front of it.
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { get as httpGet } from 'node:http';
import { cp, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Deliberately not 4173/4174: the workflow that runs this already has a server on
// 4173 serving www for the playtest steps, and binding over it would be a silent
// mess to debug.
const CANDIDATE_PORT = Number(process.env.VISUAL_CANDIDATE_PORT || 4183);
const BASELINE_PORT = Number(process.env.VISUAL_BASELINE_PORT || 4184);

// Everything that can change what the page looks like. src and build-web belong
// here as much as the gameplay HTML does: src compiles into the economy prelude
// the game calls for its ratings, and build-web decides how the page is assembled
// - when it grew a new requirement, rebuilding an older commit with the current
// build-web failed outright, which is how this list was found to be incomplete.
const RENDER_INPUTS = [
  'MechanicsLab/SevereWeather_3D_Lab.html',
  'src',
  'scripts/build-web.mjs',
];

const git = (...args) => execFileSync('git', args, { cwd: projectRoot, encoding: 'utf8' }).trim();
const run = (cmd, args, env) =>
  execFileSync(cmd, args, { cwd: projectRoot, stdio: 'inherit', env: { ...process.env, ...env } });

function resolveBaselineRef() {
  if (process.env.VISUAL_BASELINE_REF) return process.env.VISUAL_BASELINE_REF;
  // Uncommitted edits to the render inputs are themselves the change under test,
  // so HEAD is the thing to compare them against. CI never hits this branch;
  // it matters when running the gate by hand before committing.
  if (git('status', '--porcelain', '--', ...RENDER_INPUTS)) return 'HEAD';
  // NOT HEAD~1. The full-round workflow commits playtest evidence back to qa, so
  // HEAD~1 is frequently a Docs-only bot commit whose render inputs are identical
  // to HEAD - which would compare the build against itself and pass every time.
  // Walk back to the last commit that actually touched something we render.
  const commits = git('log', '-2', '--format=%H', '--', ...RENDER_INPUTS).split('\n').filter(Boolean);
  const head = git('rev-parse', 'HEAD');
  // When HEAD itself changed a render input, compare against the one before it.
  // When it did not - a CI-only or script-only commit - the newest render-input
  // commit IS this build, so comparing against it is a true no-op. Taking the one
  // before that instead would re-report the previous commit's already-accepted
  // change as a fresh regression, and a gate that cries wolf gets switched off.
  return (commits[0] === head ? commits[1] : commits[0]) || null;
}

async function buildInto(destination) {
  // src is a render input, so the bundles have to be rebuilt from whichever
  // revision is currently checked out, not carried over from the last build.
  run('npm', ['run', '--silent', 'modern:build']);
  run('node', ['scripts/build-web.mjs']);
  await rm(destination, { recursive: true, force: true });
  await cp(path.join(projectRoot, 'www'), destination, { recursive: true });
}

function serve(port, directory) {
  const child = spawn('python3', ['-m', 'http.server', String(port), '--directory', directory],
    { cwd: projectRoot, stdio: 'ignore', detached: true });
  child.unref();
  return child;
}

// Deliberately not fetch(). fetch keeps its sockets alive in a pool, and killing
// the static servers at the end of the run left undici holding a connection that
// had just been torn out from under it - which crashed the whole process with
// `assert(!this.paused)` AFTER the comparison had finished, failing the step no
// matter what the verdict was. A raw request that closes its own socket has no
// pool to outlive the server.
function waitForServer(port) {
  const probe = () => new Promise((resolve) => {
    // agent:false means this connection is not pooled and closes with the
    // response, so nothing outlives the server we later kill.
    const request = httpGet({ host: '127.0.0.1', port, path: '/', agent: false }, (response) => {
      const ok = response.statusCode === 200;
      response.resume();
      response.on('end', () => resolve(ok));
    });
    request.on('error', () => resolve(false));
    request.setTimeout(2000, () => { request.destroy(); resolve(false); });
  });
  return (async () => {
    for (let attempt = 0; attempt < 40; attempt++) {
      if (await probe()) return;
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    throw new Error(`Static server on port ${port} never became ready.`);
  })();
}

// A visual gate fails on INTENDED changes too - that is the whole point, and it
// is also how this kind of check dies. The previous incarnation of this
// comparison was demoted to "advisory evidence" and then wired into nothing,
// which is why a sand checkerboard and roads on causeways reached a phone.
// So: fail by default, and let a commit opt in deliberately by saying so in its
// message. That keeps a permanent, greppable record in history of every commit
// that was allowed to move the picture, instead of a setting nobody revisits.
const ACK_MARKER = '[visual-change]';
function changeIsAcknowledged() {
  try {
    return git('log', '-1', '--format=%B').includes(ACK_MARKER);
  } catch {
    return false;
  }
}

const baselineRef = resolveBaselineRef();
if (!baselineRef) {
  // A branch whose history contains no earlier change to the render inputs has
  // nothing to compare against. That is not a regression.
  console.log('Visual regression gate: no earlier build to compare against; skipping.');
  process.exit(0);
}

const shortRef = baselineRef.slice(0, 7);
console.log(`Visual regression gate: comparing HEAD against ${shortRef}`);

const visualDir = process.env.SEVERE_WEATHER_VISUAL_DIR
  || path.join(projectRoot, 'qa-artifacts', 'visual-regression');
const workspace = await mkdtemp(path.join(tmpdir(), 'sw-visual-'));
const baselineDir = path.join(workspace, 'baseline-www');
const candidateDir = path.join(workspace, 'candidate-www');
const stampedWww = path.join(workspace, 'stamped-www');
const savedInputs = path.join(workspace, 'saved-inputs');
const servers = [];
let failure = null;

try {
  // Both sides are built fresh and UNSTAMPED. By the time this runs, www has
  // usually been through stamp-qa-pages, which prints the run number and commit
  // into the corner of the page - so comparing the live www against a freshly
  // built baseline diffs the build label rather than the game. Keep the stamped
  // copy aside and hand it back afterwards, so every later step still sees it.
  await cp(path.join(projectRoot, 'www'), stampedWww, { recursive: true });
  await buildInto(candidateDir);

  // Copy the render inputs aside EXACTLY as they stand before touching them.
  // Restoring them with `git checkout HEAD --` would overwrite uncommitted work
  // with the committed version and silently destroy it - which is precisely what
  // an earlier draft of this script did to a working tree.
  for (const input of RENDER_INPUTS) {
    const saved = path.join(savedInputs, input);
    await mkdir(path.dirname(saved), { recursive: true });
    await cp(path.join(projectRoot, input), saved, { recursive: true });
  }

  // `git checkout <ref> -- <paths>` would ALSO stage the baseline version. The
  // workflow that runs this later calls `git commit` to record playtest evidence,
  // and a plain commit takes whatever is staged - so that stale index entry would
  // quietly commit the baseline gameplay source back onto qa, reverting the very
  // change under test. git archive writes the working tree only and never touches
  // the index.
  const baselineTar = path.join(workspace, 'baseline-inputs.tar');
  git('archive', '-o', baselineTar, baselineRef, '--', ...RENDER_INPUTS);
  execFileSync('tar', ['-xf', baselineTar, '-C', projectRoot], { stdio: 'inherit' });
  try {
    await buildInto(baselineDir);
  } finally {
    for (const input of RENDER_INPUTS) {
      const live = path.join(projectRoot, input);
      await rm(live, { recursive: true, force: true });
      await cp(path.join(savedInputs, input), live, { recursive: true });
    }
    await rm(path.join(projectRoot, 'www'), { recursive: true, force: true });
    await cp(stampedWww, path.join(projectRoot, 'www'), { recursive: true });
  }

  servers.push(serve(CANDIDATE_PORT, candidateDir), serve(BASELINE_PORT, baselineDir));
  await Promise.all([waitForServer(CANDIDATE_PORT), waitForServer(BASELINE_PORT)]);

  // Reading the harness's evidence properly instead of just its exit code.
  //
  // Each line reports repeat= (how much the BASELINE differs from a second render
  // of itself - its own noise floor) and candidate= (how much the candidate
  // differs from the baseline). On this project's CI runner the renderer is
  // nondeterministic often enough that a scenario's noise floor jumps to ~20%
  // roughly half the time, and it hits a different scenario on every attempt. A
  // scenario in that state has measured nothing: it is not evidence of a
  // regression, and failing on it would red-light half of all builds for no
  // reason - which is how the previous version of this check got demoted to
  // advisory and then forgotten.
  //
  // So per scenario, across attempts, take the strongest evidence available:
  //   stable baseline + small candidate diff  -> proven unchanged
  //   stable baseline + large candidate diff  -> proven regression, fail
  //   noisy baseline every time               -> inconclusive, say so loudly
  // Inconclusive never fails the build on its own, but an ALL-inconclusive run
  // means the gate measured nothing at all, and that does fail - otherwise it
  // could rot into a no-op without anyone noticing.
  const LINE = /^(PASS|FAIL) (\S+) (\S+) :: repeat=([\d.]+)% candidate=([\d.]+)%/;
  const NOISE_LIMIT = 0.05;   // percent; the harness's own baseRepeatNoise limit
  const CHANGE_LIMIT = 0.10;  // percent above the noise floor to count as moved
  const attempts = 3;
  // Per scenario, every measurement taken while the baseline was reproducible.
  const samples = new Map();

  for (let attempt = 1; attempt <= attempts; attempt++) {
    // spawnSync, not execFileSync: the comparison exits non-zero whenever any
    // scenario fails, and its output is exactly what has to be read to tell a
    // real change from a scenario that could not measure itself. Throwing on the
    // exit code would discard the evidence this gate is built to weigh.
    const result = spawnSync(process.execPath, ['scripts/compare-phase5-visual-baseline.mjs'], {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
      env: {
        ...process.env,
        SEVERE_WEATHER_QA_URL: `http://127.0.0.1:${CANDIDATE_PORT}/`,
        SEVERE_WEATHER_BASE_URL: `http://127.0.0.1:${BASELINE_PORT}/`,
        SEVERE_WEATHER_VISUAL_DIR: path.join(visualDir, attempt === 1 ? '.' : `attempt-${attempt}`),
      },
    });
    const output = result.stdout || '';
    process.stdout.write(output);

    for (const line of output.split('\n')) {
      const match = LINE.exec(line.trim());
      if (!match) continue;
      const [, , viewport, scenario, repeatText, candidateText] = match;
      const key = `${viewport} ${scenario}`;
      if (!samples.has(key)) samples.set(key, []);
      // A noisy baseline measured nothing; record no sample for it.
      if (Number(repeatText) > NOISE_LIMIT) continue;
      samples.get(key).push({ repeat: Number(repeatText), candidate: Number(candidateText) });
    }
  }

  // A real visual change is deterministic: every usable measurement shows it.
  // A flaky render is random, so it shows up in one attempt and not the others.
  // Requiring agreement across at least two usable measurements is what separates
  // them - a single sample cannot, because the CANDIDATE render flakes too. CI
  // has produced repeat=0.0000% candidate=19.9414% between two builds that differ
  // only in test scripts, which a one-sample rule would have called a regression.
  const moved = [];
  const unmeasured = [];
  for (const [key, list] of samples) {
    if (list.length < 2) { unmeasured.push([key, list.length]); continue; }
    if (list.every(sample => sample.candidate > sample.repeat + CHANGE_LIMIT)) {
      moved.push([key, list]);
    }
  }
  const measured = samples.size - unmeasured.length;

  console.log(`\nScenarios with enough agreeing measurements: ${measured} of ${samples.size}.`);
  for (const [key, count] of unmeasured) {
    console.log(`  INCONCLUSIVE ${key} - only ${count} usable measurement(s) in ${attempts} attempts.`);
  }
  for (const [key, list] of moved) {
    console.log(`  CHANGED ${key} - moved in all ${list.length} measurements `
      + `(${list.map(x => x.candidate.toFixed(2) + '%').join(', ')}).`);
  }

  if (moved.length > 0) {
    throw new Error(`${moved.length} scenario(s) moved consistently across attempts.`);
  }
  if (measured === 0) {
    throw new Error(`No scenario could be measured twice in ${attempts} attempts; this gate proved nothing.`);
  }
} catch (error) {
  failure = error;
} finally {
  for (const server of servers) {
    try { process.kill(-server.pid); } catch { /* already gone */ }
  }
  await rm(workspace, { recursive: true, force: true });
}

if (failure) {
  if (changeIsAcknowledged()) {
    console.log(`\nThe picture moved against ${shortRef}, and this commit says that was intended`);
    console.log(`(its message carries ${ACK_MARKER}). Recording the change and passing.`);
    console.log('The diff images in the artifact are worth a look before you ship it.');
    process.exit(0);
  }
  console.error(`\nVisual regression gate FAILED against ${shortRef}.`);
  console.error('The rendered picture moved further than this harness\'s own measured noise.');
  console.error('The diff images in the run artifact show exactly what moved.');
  console.error(`If you meant to change it, put ${ACK_MARKER} in the commit message.`);
  process.exit(1);
}
console.log(`\nVisual regression gate passed against ${shortRef}.`);
