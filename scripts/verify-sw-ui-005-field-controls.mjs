import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = await readFile(path.join(root, 'runtime', 'sw-ui-005-field-controls.js'), 'utf8');
const apply = await readFile(path.join(root, 'scripts', 'apply-sw-ui-005-field-controls.mjs'), 'utf8');
const checks = [];
const check = (name, pass) => { checks.push({ name, pass: Boolean(pass) }); console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`); };

check('UI-005 marker is stable', runtime.includes('SW_UI_005_FIELD_CONTROLS_V1'));
check('desktop field control header is product-native', runtime.includes('FIELD CONTROLS'));
check('developer row labels are replaced only in desktop mode', runtime.includes("const labels = ['STEER', 'ABILITIES', 'WARNING AREA']") && runtime.includes("matchMedia('(min-width: 900px)')"));
check('mobile labels restore from captured originals', runtime.includes('swUi005RestoreMobileLabels') && runtime.includes('swUi005OriginalLabel'));
check('existing Pull/Gust/Zap span IDs are read not recreated', runtime.includes("getElementById('verbSpace')") && runtime.includes("getElementById('verbQ')") && runtime.includes("getElementById('verbE')"));
check('district status remains existing DOM truth', runtime.includes("getElementById('stageStatusTag')"));
check('desktop treatment is style-scoped above 900px', runtime.includes('@media (min-width: 900px)'));
check('adapter exports QA state', runtime.includes('getSwUi005State'));
check('apply requires accepted UI-003/UI-004 commercial shell', apply.includes('SW_UI_003_RUN_SHELL_IDENTITY_V1') && apply.includes('SW_UI_004_GAMEPLAY_PRODUCT_IDENTITY_V1'));
check('apply explicitly forbids input event rewiring', apply.includes("'keydown'") && apply.includes("'touchstart'") && apply.includes("'pointerdown'"));
for (const forbidden of ['target.health =','target.destroyed =','score =','combo =','currentStage =','storm.speed =','storm.radius =','triggerAbility =','addEventListener(\'keydown\'','addEventListener("keydown"']) {
  check(`no protected authority seam: ${forbidden}`, !runtime.includes(forbidden));
}
const failed = checks.filter(item => !item.pass);
console.log(`SW-UI-005 static verifier ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
