import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = await readFile(path.join(root, 'runtime', 'sw-ui-006-mobile-orientation-touch.js'), 'utf8');
const apply = await readFile(path.join(root, 'scripts', 'apply-sw-ui-006-mobile-orientation-touch.mjs'), 'utf8');

const checks = [];
const check = (name, pass, detail = '') => checks.push({ name, pass: Boolean(pass), detail });

check('marker', runtime.includes('SW_UI_006_MOBILE_ORIENTATION_TOUCH_V1'));
check('rotate-gate-authored', runtime.includes('swUi006RotateGate') && runtime.includes('Rotate to Play'));
check('portrait-gameplay-class', runtime.includes('sw-ui-006-portrait-gameplay'));
check('portrait-requires-touch-and-gameplay', runtime.includes('touchMode && gameplayActive && portrait'));
check('portrait-underlay-hidden', runtime.includes('> *:not(#swUi006RotateGate):not(script):not(style)'));
check('touch-mode-class', runtime.includes('sw-ui-006-touch'));
check('keyboard-hints-marked', runtime.includes('sw-ui-006-keyboard-hint') && runtime.includes('directSpans[1]'));
check('keyboard-hints-touch-only-hidden', runtime.includes('body.sw-ui-006-touch .touch-controls .sw-ui-006-keyboard-hint'));
check('short-landscape-rule', runtime.includes('(orientation: landscape) and (max-height: 480px)'));
check('short-landscape-telemetry-fit', runtime.includes('max-width: calc(100vw - 220px)'));
check('desktop-not-force-hidden', !runtime.includes('body:not(.sw-ui-006-touch) .sw-ui-006-keyboard-hint'));
check('state-export', runtime.includes('getSwUi006State') && runtime.includes('presentationOnly: true'));
check('apply-requires-ui005', apply.includes('SW_UI_005_FIELD_CONTROLS_V1'));
check('apply-requires-world007', apply.includes('SW_WORLD_007_SECONDARY_EXCLUSIVE_V1'));
check('apply-requires-feel001', apply.includes('SW_FEEL_001_STRUCTURAL_PRIORITY_V1'));

const protectedMutationPattern = /\b(?:score|combo|remainingSeconds|currentStage|selectedCampaignIndex|gameStarted|isPaused)\s*(?:\+\+|--|\+=|-=|\*=|\/=|%=|=(?!=))|\bstorm\.(?:speed|radius|pos)\s*(?:\+\+|--|\+=|-=|\*=|\/=|%=|=(?!=))|\btarget\.(?:health|maxHealth|points|damageStage|destroyed|x|z)\s*(?:\+\+|--|\+=|-=|\*=|\/=|%=|=(?!=))/g;
const protectedMutations = [...runtime.matchAll(protectedMutationPattern)].map((match) => match[0]);
check('no-protected-gameplay-mutations', protectedMutations.length === 0, protectedMutations.join(', '));
check('no-camera-authority', !/\bcamera\.(?:position|rotation)|\bcamera\.lookAt\s*\(/.test(runtime));
check('no-ability-execution', !/\b(?:triggerAbility|usePull|useGust|useZap)\s*\(/.test(runtime));
check('no-input-handler-authority', !/(?:keydown|keyup|touchstart|touchmove|pointerdown)/.test(runtime));
check('no-score-campaign-storage-writes', !/(?:localStorage\.setItem|sessionStorage\.setItem)/.test(runtime));

const report = {
  version: 'SW_UI_006_STATIC_V1',
  passed: checks.every((entry) => entry.pass),
  checks,
  failedChecks: checks.filter((entry) => !entry.pass),
  evidence: {
    base: 'de2e62835e79567b4bbfc079a372ce2af4ee0879',
    protectedMutations,
    presentationOnly: true,
  },
};

await writeFile(path.join(root, 'sw-ui-006-static-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
if (!report.passed) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
console.log(`SW-UI-006 static verification passed ${checks.length}/${checks.length}.`);
