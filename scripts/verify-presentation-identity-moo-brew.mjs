import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const checks = [];

function check(name, condition, detail = '') {
  const passed = Boolean(condition);
  checks.push({ name, passed, detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
}

async function read(relativePath) {
  return readFile(path.join(projectRoot, relativePath), 'utf8');
}

const html = await read('MechanicsLab/SevereWeather_3D_Lab.html');
const runtime = [
  await read('runtime/presentation-identity-core.js'),
  await read('runtime/presentation-identity-style-part-1.js'),
  await read('runtime/presentation-identity-style-part-2.js'),
  await read('runtime/presentation-identity-style-part-3.js'),
  await read('runtime/presentation-identity-styles.js'),
  await read('runtime/presentation-identity-ui.js'),
].join('\n');
const apply = await read('scripts/apply-presentation-identity-moo-brew.mjs');
const qa = await read('scripts/qa-presentation-identity-moo-brew.mjs');
const packageJson = JSON.parse(await read('package.json'));
const workflow = await read('.github/workflows/presentation-identity-moo-brew.yml');

for (const marker of [
  'PRESENTATION_IDENTITY_MOO_BREW_V1',
  '[SW:PRESENTATION:MOO_BREW_IDENTITY]',
  '[SW:SOURCE:presentation-identity-moo-brew.js]',
  '__SW_PRESENTATION_IDENTITY_BRIDGE__',
  'presentationIdentityDecorateBovineMesh',
  'presentationIdentityUpdateBovineSignature',
  'presentationIdentityBuildLivingCounty',
  'identityConfigureResultsCard',
  'identityLaunchIntro',
]) {
  check(`generated HTML includes ${marker}`, html.includes(marker));
}

check('identity runtime is inserted exactly once', html.split('[SW:SOURCE:presentation-identity-moo-brew.js]').length === 2);
check('identity runtime follows city fabric', html.indexOf('[SW:SOURCE:city-fabric-destruction.js]') < html.indexOf('[SW:SOURCE:presentation-identity-moo-brew.js]'));
check('identity runtime precedes first world initialization', html.indexOf('[SW:SOURCE:presentation-identity-moo-brew.js]') < html.indexOf('// --- MAIN ANIMATION LOOP WITH 3-STAGE ESCALATION ---'));
check('score screen uses viewport-safe fixed header and actions layout', runtime.includes('grid-template-rows: auto auto minmax(0, 1fr) auto') && runtime.includes('max-height: calc(100dvh') && runtime.includes('identity-results-scroll'));
check('score screen retains Moo Brew identity', runtime.includes('MOO BREW POST-STORM HYDRATION DESK') && runtime.includes('All scores final. All cattle statements pending legal review.'));
check('canonical intro begins with newspaper and ends in live handoff', runtime.includes("'newspaper'") && runtime.includes("'moo-brew-sip'") && runtime.includes("'cow-double-take'") && runtime.includes("'chicken-scatter'") && runtime.includes("'tornado-touchdown'") && runtime.includes("'tactical-handoff'"));
check('intro is skippable and production start is resumed through existing button', runtime.includes('mooBrewIntroSkip') && runtime.includes('startButton.click()'));
check('QA and bot runs bypass the production intro unless explicitly forced', runtime.includes("params.get('qa') === '1'") && runtime.includes("params.get('intro') === '1'"));
check('cow rig has explicit head, muzzle, eyes, ears, horns, four legs, hooves, udder, spots, and tail', [
  'cow-head', 'cow-muzzle', 'cow-eye-left', 'cow-ear-left', 'cow-horn-left', 'cow-leg-', 'cow-hoof-', 'cow-udder', 'cow-spot-', 'cow-tail'
].every((token) => runtime.includes(token)));
check('Cow 17 retains a readable identity tag', runtime.includes('OFFICIAL AIRSPACE COW') && runtime.includes('cow-17-tag'));
check('cow expression is integrated into accepted bovine update instead of a second animation loop', runtime.includes('presentationIdentityUpdateBovineSignature') && !runtime.includes('function identityCowAnimationLoop'));
check('Moo Brew world dressing is non-target scene decoration', runtime.includes('identityCreateBillboard') && runtime.includes('identityCreateDeliveryTruck') && runtime.includes('mooBrewDecor'));
check('world dressing is rebuilt through accepted county lifecycle', runtime.includes('presentationIdentityBuildLivingCounty') && runtime.includes('identityClearWorldProps'));
check('presentation runtime does not alter score or combo laws', !/combo cap|combo step|scoreMultiplier\s*=|campaignScoreMultiplier\s*=/.test(runtime));
check('package exposes presentation identity commands', packageJson.scripts['patch:presentation-identity'] && packageJson.scripts['verify:presentation-identity'] && packageJson.scripts['qa:presentation-identity']);
check('apply script requires accepted city-fabric and bovine prerequisites', apply.includes('CITY_FABRIC_DESTRUCTION_V1') && apply.includes('V500_BOVINE_SIGNATURE_V1'));
check('QA tests intro, cows, world dressing, and compact results layouts', qa.includes('intro-moo-brew-sip') && qa.includes('cow17HasFourLegs') && qa.includes('mooBrewPropCount') && qa.includes('withinViewport'));
check('workflow is single-trigger', !/^\s{2}push:/m.test(workflow));
check('workflow targets city-fabric base branch', workflow.includes('- agent/city-fabric-destruction-pass'));
check('workflow compares exact green city-fabric base', workflow.includes('ref: 1f0df3b6df41fefa9a37163136106f9ca9909b9b'));
check('workflow packages screenshots, report, APK, and checksum', workflow.includes('presentation-identity-report.json') && workflow.includes("find qa-artifacts/presentation-identity/identity -name 'presentation-identity-*.png'") && workflow.includes('test \"$(find qa-artifacts/presentation-identity/identity') && workflow.includes('sha256sum \"$output_apk\" | tee \"$output_apk.sha256\"'));
check('workflow artifact is fail-fast', workflow.includes('if-no-files-found: error'));

const failed = checks.filter((entry) => !entry.passed);
console.log(`\nPresentation identity verification: ${checks.length - failed.length}/${checks.length} checks passed.`);
if (failed.length) process.exit(1);
