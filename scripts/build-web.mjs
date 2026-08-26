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
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_Warning.html');
const packageJsonPath = path.join(projectRoot, 'package.json');
const sourceAudioDir = path.join(projectRoot, 'assets', 'audio');
const sourceModelsDir = path.join(projectRoot, 'assets', 'models');
const modernDistDir = path.join(projectRoot, 'modern-dist');
const modernEntryPath = path.join(modernDistDir, 'modern-shell.js');
const economyPreludePath = path.join(modernDistDir, 'sw-economy-prelude.js');
const gltfLoaderPath = path.join(projectRoot, 'vendor', 'three-gltfloader-r128.js');
const outputDir = process.env.SEVERE_WEATHER_WWW_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_WWW_DIR)
  : path.join(projectRoot, 'www');
const outputFonts = path.join(outputDir, 'fonts');
const outputAudio = path.join(outputDir, 'audio');
const outputModels = path.join(outputDir, 'models');
const outputAssetsModels = path.join(outputDir, 'assets', 'models');
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

// [SW:VENDOR:GLTF_LOADER] three r128's GLTFLoader, inlined for the same reason as
// the prelude: the gameplay is a classic script that cannot import, and three
// itself is inlined rather than resolved from npm. The vendored copy is the
// legacy examples/js IIFE, which assigns THREE.GLTFLoader onto the global. It is
// kept as its own file so it stays auditable and re-extractable, and injected
// here so the gameplay source is not carrying 96 KB of third-party code inline.
const GLTF_LOADER_MARKER = '<!-- [SW:BUILD:GLTF_LOADER] -->';
if (!html.includes(GLTF_LOADER_MARKER)) {
  throw new Error(`Gameplay source is missing ${GLTF_LOADER_MARKER}; the glTF loader has nowhere to land.`);
}
const gltfLoaderSource = await readFile(gltfLoaderPath, 'utf8');
if (gltfLoaderSource.includes('</script>')) {
  throw new Error('Vendored glTF loader contains a closing script tag.');
}
// A loader that silently failed to define itself would surface much later, as
// actors quietly missing from the world. Fail the build instead.
if (!gltfLoaderSource.includes('THREE.GLTFLoader = GLTFLoader')) {
  throw new Error('Vendored glTF loader does not assign THREE.GLTFLoader; wrong build or wrong file.');
}
html = html.replace(
  GLTF_LOADER_MARKER,
  `<script>\n/* [SW:SOURCE:three-gltfloader-r128.js] vendored from three@0.128.0 examples/js */\n${gltfLoaderSource}\n</script>`,
);
html = html.replace(/<script src="\.\.\/vendor\/three-gltfloader-r128\.js"><\/script>\s*/g, '');

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
await mkdir(outputModels, { recursive: true });
await mkdir(outputAssetsModels, { recursive: true });
await writeFile(path.join(outputDir, 'index.html'), html, 'utf8');

for (const [packagePath, outputName] of fontFiles) {
  await copyFile(path.join(projectRoot, 'node_modules', packagePath), path.join(outputFonts, outputName));
}
for (const audioFile of await readdir(sourceAudioDir)) {
  await copyFile(path.join(sourceAudioDir, audioFile), path.join(outputAudio, audioFile));
}
await cp(modernDistDir, outputModern, { recursive: true });

// [SW:BUILD:MODELS]
// Blender-authored .glb actors and scenery.
//
// Deliberately discovered rather than listed. Every other asset here is named
// explicitly, which means adding one is a four-file change -- this script, the
// package verifier, the workflow's sync check and the file inventory -- and a
// missed edit shows up as an asset that silently is not in the APK. Models will
// arrive in batches from an external authoring pipeline, so they enumerate
// themselves, and the manifest below carries the result to whoever asserts on it.
//
// An empty or absent directory is a normal state, not an error: the loader falls
// back to procedural geometry for anything it cannot find.
const models = [];
let modelSourceNames = [];
try {
  modelSourceNames = (await readdir(sourceModelsDir)).filter(name => name.toLowerCase().endsWith('.glb')).sort();
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
for (const modelFile of modelSourceNames) {
  const bytes = await readFile(path.join(sourceModelsDir, modelFile));
  // A glTF binary opens with the ASCII magic 'glTF'. Catching a mis-exported or
  // truncated file here costs nothing; catching it on a device means working
  // backwards from an actor that simply never appeared.
  if (bytes.length < 12 || bytes.toString('ascii', 0, 4) !== 'glTF') {
    throw new Error(`assets/models/${modelFile} is not a binary glTF (.glb); expected 'glTF' magic.`);
  }
  await copyFile(path.join(sourceModelsDir, modelFile), path.join(outputModels, modelFile));
  await copyFile(path.join(sourceModelsDir, modelFile), path.join(outputAssetsModels, modelFile));
  models.push({
    file: `models/${modelFile}`,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex')
  });
}
// [SW:BUILD:MODEL_GUARDS]
// Two ways a model batch goes wrong silently, both of which have now happened.
//
// First: the models arrive in a directory that only differs by case. This repo
// still carries the Unity-era `Assets/` tree beside the live `assets/` one, and
// a batch landing in `Assets/models/` looks correct on a case-insensitive
// machine while being a different directory here and in CI. Nothing failed --
// the build simply packaged none of them and thirty-nine buildings quietly fell
// back to procedural boxes, because a model that fails to load leaves the
// stand-in behind by design.
//
// Second, and more general: the gameplay names a model the build did not
// package. However that happens -- wrong directory, typo, an export that never
// got committed -- the symptom is identical and invisible. So the build now
// reads the names the game actually asks for and refuses to produce a bundle
// that cannot serve them.
const strayModelDirs = [];
for (const strayDir of ['Assets/models', 'Assets/Models', 'assets/Models']) {
  const absolute = path.join(projectRoot, strayDir);
  if (path.resolve(absolute) === path.resolve(sourceModelsDir)) continue;
  try {
    const strays = (await readdir(absolute)).filter(name => name.toLowerCase().endsWith('.glb'));
    if (strays.length) strayModelDirs.push(`${strayDir} (${strays.length} .glb)`);
  } catch (error) {
    if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') throw error;
  }
}
if (strayModelDirs.length) {
  throw new Error(
    `Models found outside assets/models: ${strayModelDirs.join(', ')}. ` +
    'Only assets/models is packaged; move them with git mv and regenerate FILE_INVENTORY.txt.'
  );
}

const packagedModelNames = new Set(modelSourceNames.map(name => name.replace(/\.glb$/i, '')));
// The gameplay names models as plain quoted strings -- instantiateActorModel and
// loadActorModel both take a bare name. Reading them back out of the source is
// crude, but it is the same list the runtime will ask for, which is the point.
const referencedModelNames = new Set();
for (const match of html.matchAll(/\b(?:instantiateActorModel|loadActorModel)\(\s*'([a-z0-9-]+)'/g)) {
  referencedModelNames.add(match[1]);
}
// Wrecks are resolved by convention rather than named at the call site.
for (const name of [...referencedModelNames]) {
  if (packagedModelNames.has(`${name}-wreck`)) referencedModelNames.add(`${name}-wreck`);
}
const missingModels = [...referencedModelNames].filter(name => !packagedModelNames.has(name)).sort();
if (missingModels.length) {
  throw new Error(
    `Gameplay references models that are not packaged: ${missingModels.join(', ')}. ` +
    'Every name passed to instantiateActorModel/loadActorModel must exist in assets/models.'
  );
}

const modelsTotalBytes = models.reduce((sum, entry) => sum + entry.bytes, 0);

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
    gltfLoaderSha256: createHash('sha256').update(gltfLoaderSource).digest('hex'),
    models,
    modelsTotalBytes,
    inlinedRegions
  }, null, 2)}\n`,
  'utf8'
);

console.log(`Built offline web bundle v${buildVersion} (${buildLabel}): www/index.html (${sourceSha256}), modern shell (${modernShellSha256}), audio (${audioSha256}), inlined regions (${inlinedRegions.length}), models (${models.length}${models.length ? `, ${(modelsTotalBytes / 1048576).toFixed(2)} MB` : ''})`);