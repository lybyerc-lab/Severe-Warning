import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimePaths = [
  path.join(projectRoot, 'runtime', 'presentation-identity-core.js'),
  path.join(projectRoot, 'runtime', 'presentation-identity-style-part-1.js'),
  path.join(projectRoot, 'runtime', 'presentation-identity-style-part-2.js'),
  path.join(projectRoot, 'runtime', 'presentation-identity-style-part-3.js'),
  path.join(projectRoot, 'runtime', 'presentation-identity-styles.js'),
  path.join(projectRoot, 'runtime', 'presentation-identity-ui.js'),
];

let html = await readFile(sourcePath, 'utf8');
const runtime = (await Promise.all(runtimePaths.map((runtimePath) => readFile(runtimePath, 'utf8'))))
  .map((source) => source.trim())
  .join('\n\n');
const marker = 'PRESENTATION_IDENTITY_MOO_BREW_V1';
const sourceMarker = '[SW:SOURCE:presentation-identity-moo-brew.js]';
const insertionMarker = '// --- MAIN ANIMATION LOOP WITH 3-STAGE ESCALATION ---';

function requireMarker(value) {
  if (!html.includes(value)) throw new Error(`Presentation identity verification failed: missing ${value}`);
}

if (html.includes(marker)) {
  [
    '[SW:PRESENTATION:MOO_BREW_IDENTITY]',
    sourceMarker,
    '__SW_PRESENTATION_IDENTITY_BRIDGE__',
    'presentationIdentityDecorateBovineMesh',
    'presentationIdentityBuildLivingCounty',
    'identityConfigureResultsCard',
    'identityLaunchIntro',
  ].forEach(requireMarker);
  console.log(`Presentation identity pass already applied to ${sourcePath}`);
  process.exit(0);
}

for (const prerequisite of [
  'CITY_FABRIC_DESTRUCTION_V1',
  'V500_BOVINE_SIGNATURE_V1',
  'V500_MOBILE_LAYOUT_FIX_V2',
  'function decorateBovineMesh(',
  'function updateBovineSignature(',
  'function buildLivingCounty()',
  'id="resultsOverlay"',
  'id="btnStartMenu"',
  insertionMarker,
]) {
  if (!html.includes(prerequisite)) {
    throw new Error(`Presentation identity pass requires the accepted city-fabric runtime: missing ${prerequisite}`);
  }
}
if (runtime.includes('</script>')) throw new Error('Presentation identity runtime contains a closing script tag.');

const newline = html.includes('\r\n') ? '\r\n' : '\n';
const bundled = `${newline}// ${sourceMarker}${newline}${runtime}${newline}${newline}`;
html = html.replace(insertionMarker, `${bundled}${insertionMarker}`);
html = html.replace('</head>', `<!-- ${marker} -->${newline}<!-- [SW:PRESENTATION:MOO_BREW_IDENTITY] -->${newline}</head>`);
await writeFile(sourcePath, html, 'utf8');

for (const required of [
  marker,
  '[SW:PRESENTATION:MOO_BREW_IDENTITY]',
  sourceMarker,
  '__SW_PRESENTATION_IDENTITY_BRIDGE__',
  'presentationIdentityDecorateBovineMesh',
  'presentationIdentityUpdateBovineSignature',
  'presentationIdentityBuildLivingCounty',
  'identity-results-scroll',
  'mooBrewIntro',
  'MOO BREW POST-STORM HYDRATION DESK',
]) requireMarker(required);

const cityIndex = html.indexOf('[SW:SOURCE:city-fabric-destruction.js]');
const identityIndex = html.indexOf(sourceMarker);
const loopIndex = html.indexOf(insertionMarker);
if (cityIndex < 0 || identityIndex < 0 || loopIndex < 0 || cityIndex > identityIndex || identityIndex > loopIndex) {
  throw new Error('Presentation identity runtime must be installed after city fabric and before first world initialization.');
}
console.log(`Applied Moo Brew presentation identity pass to ${sourcePath}`);
