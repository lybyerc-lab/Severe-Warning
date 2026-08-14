import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = await readFile(path.join(root, 'runtime', 'sw-ui-003-run-shell-identity.js'), 'utf8');
const apply = await readFile(path.join(root, 'scripts', 'apply-sw-ui-003-run-shell-identity.mjs'), 'utf8');

const checks = [];
const check = (name, pass, detail = '') => {
  checks.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
};

check('run shell identity marker is stable', runtime.includes('SW_UI_003_RUN_SHELL_IDENTITY_V1'));
check('pause overlay receives newspaper styling', runtime.includes('newspaper-pause-overlay') && runtime.includes('newspaper-pause-card'));
check('pause card includes masthead and kicker framing', runtime.includes('newspaper-pause-masthead') && runtime.includes('newspaper-pause-kicker'));
check('pause buttons use high-contrast woodblock layout', runtime.includes('newspaper-pause-btns') && runtime.includes('.pause-btn.primary'));
check('dynamic location wiring handles moo level', runtime.includes("label: 'SECRET BOVINE PASTURE'"));
check('dynamic location wiring handles storm sites', runtime.includes('stormSiteDefinition') || runtime.includes('stormSiteSelection'));
check('dynamic location wiring handles campaign districts', runtime.includes('DISTRICTS'));
check('results screen receives ink stamped grade badge', runtime.includes('.grade-stamp') && runtime.includes('transform: rotate(-3.5deg)'));
check('results screen includes structured metric breakdown grid', runtime.includes('newspaper-results-breakdown-grid') && runtime.includes('newspaper-results-breakdown-card'));
check('runtime exports getSwUi003State', runtime.includes('getSwUi003State'));

check('apply script enforces baseline dependencies', apply.includes('SW_UI_001_NEWSPAPER_PRESENTATION_V1') && apply.includes('pauseOverlay') && apply.includes('resultsOverlay'));
check('apply script blocks prohibited gameplay authority writes', apply.includes('prohibited gameplay authority write'));

for (const forbidden of ['target.health =', 'score =', 'combo =', 'storm.pos.set(', 'triggerAbility =', 'neonFunnelUnlocked =']) {
  check(`runtime does not write protected authority: ${forbidden}`, !runtime.includes(forbidden));
}

const failed = checks.filter(item => !item.pass);
console.log(`SW-UI-003 static verifier ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
