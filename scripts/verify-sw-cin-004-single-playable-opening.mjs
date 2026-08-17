import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = await readFile(path.join(root, 'runtime', 'sw-cin-004-single-playable-opening.js'), 'utf8');
const apply = await readFile(path.join(root, 'scripts', 'apply-sw-cin-004-single-playable-opening.mjs'), 'utf8');
const checks = [];
const check = (name, pass, detail = '') => checks.push({ name, pass: Boolean(pass), detail });

check('marker', runtime.includes('SW_CIN_004_SINGLE_PLAYABLE_OPENING_V1'));
check('flat-start-intercept-retired', runtime.includes('swCin004NeverInterceptForFlatOpening') && runtime.includes('return false'));
check('flat-markup-retired', runtime.includes('swCin004DoNotCreateFlatOpening') && runtime.includes("document.getElementById('mooBrewIntro')") && runtime.includes('legacy.remove()'));
check('playable-opening-retained', runtime.includes('__SW_OPENING_CINEMATIC_PLAYABLE__') && runtime.includes('playable.finish'));
check('repeat-skip-reachable', runtime.includes('swCin004SkipOpening') && runtime.includes("playable.finish('skip-button')") && runtime.includes('canSkip'));
check('skip-safe-area', runtime.includes('env(safe-area-inset-right)') && runtime.includes('env(safe-area-inset-top)'));
check('broadcast-personality-preserved-in-world', runtime.includes('body.sw-cin-004-opening #mooBrewBroadcastBug'));
check('single-path-telemetry', runtime.includes('normalOpeningPathCount: 1') && runtime.includes('legacyFlatIntroPresent'));
check('direct-handoff-observed', runtime.includes('handoffCount') && runtime.includes('runActive'));
check('cinematic-only-framing-correction', runtime.includes('playable?.active') && runtime.includes('camera.fov = 48') && runtime.includes('gameplayCameraAuthorityChanged: false'));
check('apply-requires-presentation-identity', apply.includes('PRESENTATION_IDENTITY_MOO_BREW_V1'));
check('apply-requires-cin003', apply.includes('SW_CIN_003_PLAYABLE_OPENING_V1'));

const mutationOperator = String.raw`(?:\+\+|--|\+=|-=|\*=|\/=|%=|=(?!=))`;
const protectedPattern = new RegExp(String.raw`\b(?:score|combo|remainingSeconds|currentStage)\s*${mutationOperator}|\bstorm\.(?:speed|radius|pos)\s*${mutationOperator}|\btarget\.(?:health|points|destroyed)\s*${mutationOperator}`, 'g');
const protectedMutations = [...runtime.matchAll(protectedPattern)].map((match) => match[0]);
check('no-protected-gameplay-mutations', protectedMutations.length === 0, protectedMutations.join(', '));
check('no-gameplay-camera-write', !/\bcamera\.(?:position|rotation)|\bcamera\.lookAt\s*\(/.test(runtime));
check('no-ability-write', !/\b(?:triggerAbility|usePull|useGust|useZap)\s*=/.test(runtime));
check('no-new-animation-loop', !runtime.includes('requestAnimationFrame('));

const report = {
  version: 'SW_CIN_004_STATIC_V1',
  passed: checks.every((entry) => entry.pass),
  checks,
  failedChecks: checks.filter((entry) => !entry.pass),
  evidence: { base: 'de2e62835e79567b4bbfc079a372ce2af4ee0879', protectedMutations },
};
await writeFile(path.join(root, 'sw-cin-004-static-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
if (!report.passed) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
console.log(`SW-CIN-004 static verification passed ${checks.length}/${checks.length}.`);
