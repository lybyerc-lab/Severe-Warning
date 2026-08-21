import { access, copyFile, cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  extractInlinedRegions,
  MODERNIZATION_BRIDGE_REGIONS,
  PRODUCTION_SLICE_REGIONS,
} from './lib/inlined-regions.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourceHtml = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const packageJsonPath = path.join(projectRoot, 'package.json');
const sourceAudioDir = path.join(projectRoot, 'assets', 'audio');
const modernDistDir = path.join(projectRoot, 'modern-dist');
const modernEntryPath = path.join(modernDistDir, 'modern-shell.js');
const economyPreludePath = path.join(modernDistDir, 'sw-economy-prelude.js');
const outputDir = process.env.SEVERE_WEATHER_WWW_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_WWW_DIR)
  : path.join(projectRoot, 'www');
const outputFonts = path.join(outputDir, 'fonts');
const outputAudio = path.join(outputDir, 'audio');
const outputModern = path.join(outputDir, 'modern');

const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
const buildVersion = packageJson.version;
const buildLabel = packageJson.buildLabel ?? 'Severe Weather Warning';

if (!/^\d+\.\d+\.\d+$/.test(buildVersion)) {
  throw new Error(`package.json version must be semantic x.y.z, received: ${buildVersion}`);
}

const fontFiles = [
  ['@fontsource/inter/files/inter-latin-400-normal.woff2', 'inter-latin-400-normal.woff2'],
  ['@fontsource/inter/files/inter-latin-600-normal.woff2', 'inter-latin-600-normal.woff2'],
  ['@fontsource/inter/files/inter-latin-800-normal.woff2', 'inter-latin-800-normal.woff2'],
  ['@fontsource/inter/files/inter-latin-900-normal.woff2', 'inter-latin-900-normal.woff2'],
  ['@fontsource/outfit/files/outfit-latin-700-normal.woff2', 'outfit-latin-700-normal.woff2'],
  ['@fontsource/outfit/files/outfit-latin-900-normal.woff2', 'outfit-latin-900-normal.woff2']
];

let html = await readFile(sourceHtml, 'utf8');
const forbiddenRemoteResources = [...html.matchAll(/<(?:script|link)[^>]+(?:src|href)=["']https?:\/\/[^"']+/gi)];
if (forbiddenRemoteResources.length > 0) {
  throw new Error(`Remote runtime resource found: ${forbiddenRemoteResources[0][0]}`);
}
if (!html.includes('Content-Security-Policy')) {
  throw new Error('The game must define a Content Security Policy before Android packaging.');
}

const gameplayVersions = [...new Set(
  [...html.matchAll(/\bv(\d+\.\d+\.\d+)\b/g)].map((match) => match[1])
)];
if (!gameplayVersions.includes(buildVersion)) {
  throw new Error(`Gameplay source identity must include v${buildVersion} before packaging. Found: ${gameplayVersions.join(', ') || 'none'}`);
}
const staleVersions = gameplayVersions.filter((version) => version !== buildVersion);
if (staleVersions.length > 0) {
  throw new Error(`Gameplay source contains mixed version identities. Expected only v${buildVersion}; found stale: ${staleVersions.join(', ')}`);
}
if (/enemyVehicles|Police\/Fire\/Guard resistance/.test(html)) {
  throw new Error('Hostile vehicle terminology is not allowed in the production gameplay source.');
}

for (const [packagePath] of fontFiles) {
  await access(path.join(projectRoot, 'node_modules', packagePath));
}
for (const requiredAudioFile of ['storm-feel-sprite.wav', 'storm-feel-manifest.json', 'LICENSE.md']) {
  await access(path.join(sourceAudioDir, requiredAudioFile));
}
// The production slice and the modernization bridges have to be INSIDE the
// gameplay script - they close over its `let` bindings, so they cannot load as
// separate files. This used to be checked by requiring mirrored runtime/*.js
// copies to exist on disk and then shipping them next to the bundle, where
// nothing loaded them. Assert against the source that actually gets packaged.
const inlinedRegions = [...extractInlinedRegions(html).keys()];
const missingRegions = [...PRODUCTION_SLICE_REGIONS, ...MODERNIZATION_BRIDGE_REGIONS]
  .filter((region) => !inlinedRegions.includes(region));
if (missingRegions.length > 0) {
  throw new Error(`Gameplay source is missing inlined region(s): ${missingRegions.join(', ')}`);
}
await access(modernEntryPath);
await access(economyPreludePath);

// [SW:ARCH:ECONOMY_PRELUDE] The gameplay source is one classic script in a single
// lexical scope and cannot import. To let it call typed, unit-tested TypeScript
// synchronously while it builds the world, the compiled economy bundle is inlined
// at a marker ahead of that script. It must be INLINE and it must come first: a
// module or a deferred src would arrive after the game has already run.
const PRELUDE_MARKER = '<!-- [SW:BUILD:ECONOMY_PRELUDE] -->';
if (!html.includes(PRELUDE_MARKER)) {
  throw new Error(`Gameplay source is missing ${PRELUDE_MARKER}; the economy prelude has nowhere to land.`);
}
const economyPreludeSource = await readFile(economyPreludePath, 'utf8');
if (economyPreludeSource.includes('</script>')) {
  throw new Error('Economy prelude contains a closing script tag.');
}
html = html.replace(
  PRELUDE_MARKER,
  `<script>\n/* [SW:SOURCE:sw-economy-prelude.js] built from src/gameplay/economy */\n${economyPreludeSource}\n</script>`,
);

const modernScriptTag = '<script type="module" src="./modern/modern-shell.js"></script>';
if (html.includes(modernScriptTag)) {
  throw new Error('Source gameplay HTML must not contain the generated modern-shell script tag.');
}
const bodyCloseIndex = html.lastIndexOf('</body>');
if (bodyCloseIndex < 0) {
  throw new Error('Gameplay source is missing </body>; cannot attach the modern shell.');
}
html = `${html.slice(0, bodyCloseIndex)}${modernScriptTag}\n${html.slice(bodyCloseIndex)}`;

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputFonts, { recursive: true });
await mkdir(outputAudio, { recursive: true });
await writeFile(path.join(outputDir, 'index.html'), html, 'utf8');

for (const [packagePath, outputName] of fontFiles) {
  await copyFile(path.join(projectRoot, 'node_modules', packagePath), path.join(outputFonts, outputName));
}
for (const audioFile of await readdir(sourceAudioDir)) {
  await copyFile(path.join(sourceAudioDir, audioFile), path.join(outputAudio, audioFile));
}
await cp(modernDistDir, outputModern, { recursive: true });

const sourceSha256 = createHash('sha256').update(html).digest('hex');
const audioSha256 = createHash('sha256').update(await readFile(path.join(sourceAudioDir, 'storm-feel-sprite.wav'))).digest('hex');
const modernShellSha256 = createHash('sha256').update(await readFile(modernEntryPath)).digest('hex');
await writeFile(
  path.join(outputDir, 'build-info.json'),
  `${JSON.stringify({
    productName: 'Severe Weather Warning',
    version: buildVersion,
    label: buildLabel,
    renderer: 'Three.js r128',
    architecture: 'modern-shell-v1',
    source: path.relative(projectRoot, sourceHtml).replaceAll('\\', '/'),
    sourceSha256,
    audioSha256,
    modernShellSha256,
    economyPreludeSha256: createHash('sha256').update(economyPreludeSource).digest('hex'),
    inlinedRegions
  }, null, 2)}\n`,
  'utf8'
);

console.log(`Built offline web bundle v${buildVersion} (${buildLabel}): www/index.html (${sourceSha256}), modern shell (${modernShellSha256}), audio (${audioSha256}), inlined regions (${inlinedRegions.length})`);