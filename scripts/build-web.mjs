import { access, copyFile, cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourceHtml = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const packageJsonPath = path.join(projectRoot, 'package.json');
const sourceAudioDir = path.join(projectRoot, 'assets', 'audio');
const sourceProductionAssetsDir = path.join(projectRoot, 'assets', 'production');
const sourceRuntimeDir = path.join(projectRoot, 'runtime');
const sourcePwaDir = path.join(projectRoot, 'pwa');
const modernDistDir = path.join(projectRoot, 'modern-dist');
const modernEntryPath = path.join(modernDistDir, 'modern-shell.js');
const cow17RuntimeFile = 'sw-art-009-cow17-runtime.js';
const cow17RuntimePath = path.join(sourceRuntimeDir, cow17RuntimeFile);
const cow17LoaderFile = 'vendor/GLTFLoader-r128.js';
const cow17LoaderPath = path.join(sourceRuntimeDir, cow17LoaderFile);
const cow17LicenseFile = 'vendor/THREE-LICENSE.txt';
const cow17LicensePath = path.join(sourceRuntimeDir, cow17LicenseFile);
const cow17LoaderExpectedBlob = 'cfa518ede1b0893f1da14347d78fcd19355f3686';
const cow17LicenseExpectedBlob = '5303437e406ed22d8cb0b4c12398870792a25878';
const cow17AssetRelativePath = path.join('characters', 'cow17-walking-v1.glb');
const cow17ProductionAssetPath = path.join(sourceProductionAssetsDir, cow17AssetRelativePath);
const cow17ExpectedSha256 = 'd5bb4e47a12fde652808a53fdcb3dfddf71b944f2efb6641bf18ce8ac5c82a93';
const cow17ExpectedBytes = 14412828;
const cow17LoaderMarker = '[SW:SOURCE:GLTFLoader-r128.js]';
const cow17InjectionMarker = '[SW:SOURCE:sw-art-009-cow17-runtime.js]';
const gameplayLoopMarker = '// --- MAIN ANIMATION LOOP WITH 3-STAGE ESCALATION ---';
const outputDir = process.env.SEVERE_WEATHER_WWW_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_WWW_DIR)
  : path.join(projectRoot, 'www');
const outputFonts = path.join(outputDir, 'fonts');
const outputAudio = path.join(outputDir, 'audio');
const outputProductionAssets = path.join(outputDir, 'assets', 'production');
const outputRuntime = path.join(outputDir, 'runtime');
const outputModern = path.join(outputDir, 'modern');
const outputPwa = path.join(outputDir, 'pwa');

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
const runtimeFiles = [
  'v510-foundation.js',
  'v510-tornado.js',
  'v510-world.js',
  'v510-runtime.js',
  cow17LoaderFile,
  cow17LicenseFile,
  cow17RuntimeFile,
];

function gitBlobSha1(bytes) {
  const header = Buffer.from(`blob ${bytes.length}\0`, 'utf8');
  return createHash('sha1').update(header).update(bytes).digest('hex');
}

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
for (const runtimeFile of runtimeFiles) {
  await access(path.join(sourceRuntimeDir, runtimeFile));
}
await access(sourceProductionAssetsDir);
await access(path.join(sourceProductionAssetsDir, 'structures', 'storefront-v1.json'));
await access(cow17ProductionAssetPath);
await access(modernEntryPath);
for (const pwaFile of [
  'manifest.webmanifest',
  'offline.html',
  'service-worker.js',
  'register-pwa.js',
  'cache-policy.js',
  'icons/severe-weather-warning.svg'
]) {
  await access(path.join(sourcePwaDir, pwaFile));
}

const cow17Bytes = await readFile(cow17ProductionAssetPath);
const cow17Sha256 = createHash('sha256').update(cow17Bytes).digest('hex');
if (cow17Sha256 !== cow17ExpectedSha256) {
  throw new Error(`Cow 17 production GLB SHA-256 mismatch: ${cow17Sha256}`);
}
if (cow17Bytes.length !== cow17ExpectedBytes) {
  throw new Error(`Cow 17 production GLB byte count mismatch: ${cow17Bytes.length}`);
}
if (cow17Bytes.length > 15000000) {
  throw new Error(`Cow 17 production GLB exceeds 15 MB mobile guard: ${cow17Bytes.length}`);
}

const cow17LoaderBytes = await readFile(cow17LoaderPath);
const cow17LicenseBytes = await readFile(cow17LicensePath);
if (gitBlobSha1(cow17LoaderBytes) !== cow17LoaderExpectedBlob) {
  throw new Error('Vendored Cow 17 GLTFLoader does not match official Three.js r128 source.');
}
if (gitBlobSha1(cow17LicenseBytes) !== cow17LicenseExpectedBlob) {
  throw new Error('Vendored Three.js license does not match r128.');
}
const cow17Loader = cow17LoaderBytes.toString('utf8').trim();
const cow17Runtime = (await readFile(cow17RuntimePath, 'utf8')).trim();
if (!cow17Loader.includes('THREE.GLTFLoader = GLTFLoader;')) {
  throw new Error('Official r128 GLTFLoader registration is missing.');
}
for (const prerequisite of [
  'V500_BOVINE_SIGNATURE_V1',
  'function configureBovineAnimal',
  'function updateBovineSignature',
  'function resetBovineSignature',
  gameplayLoopMarker,
]) {
  if (!html.includes(prerequisite)) {
    throw new Error(`Cow 17 runtime integration requires accepted bovine seam: missing ${prerequisite}`);
  }
}
if (cow17Loader.includes('</script>') || cow17Runtime.includes('</script>')) {
  throw new Error('Cow 17 injected runtime source contains a closing script tag.');
}
if (html.includes(cow17LoaderMarker) || html.includes(cow17InjectionMarker)) {
  throw new Error('Source gameplay HTML must not contain generated Cow 17 runtime injection markers.');
}
const cow17RuntimeBundle = `\n// ${cow17LoaderMarker}\n${cow17Loader}\n\n// ${cow17InjectionMarker}\n${cow17Runtime}\n\n`;
html = html.replace(gameplayLoopMarker, `${cow17RuntimeBundle}${gameplayLoopMarker}`);
if (
  !html.includes(cow17LoaderMarker)
  || !html.includes(cow17InjectionMarker)
  || html.indexOf(cow17LoaderMarker) > html.indexOf(cow17InjectionMarker)
  || html.indexOf(cow17InjectionMarker) > html.indexOf(gameplayLoopMarker)
) {
  throw new Error('Official GLTFLoader and Cow 17 adapter must be injected in order before the gameplay loop.');
}

const modernScriptTag = '<script type="module" src="./modern/modern-shell.js"></script>';
const pwaHeadTags = `<!-- SEVERE_WEATHER_PWA_SHELL_V1 -->\n<link rel="manifest" href="./manifest.webmanifest">\n<meta name="application-name" content="Severe Weather Warning">\n<meta name="apple-mobile-web-app-title" content="Severe Weather Warning">\n<meta name="theme-color" content="#030712">\n<link rel="icon" href="./pwa/icons/severe-weather-warning.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="./pwa/icons/severe-weather-warning.svg">`;
const pwaScriptTag = '<script type="module" src="./pwa/register-pwa.js"></script>';
if (html.includes(modernScriptTag)) {
  throw new Error('Source gameplay HTML must not contain the generated modern-shell script tag.');
}
if (html.includes('SEVERE_WEATHER_PWA_SHELL_V1')) {
  throw new Error('Source gameplay HTML must not contain generated PWA shell markers.');
}
const headCloseIndex = html.lastIndexOf('</head>');
if (headCloseIndex < 0) {
  throw new Error('Gameplay source is missing </head>; cannot attach the PWA shell.');
}
html = `${html.slice(0, headCloseIndex)}${pwaHeadTags}\n${html.slice(headCloseIndex)}`;
const bodyCloseIndex = html.lastIndexOf('</body>');
if (bodyCloseIndex < 0) {
  throw new Error('Gameplay source is missing </body>; cannot attach the modern shell.');
}
html = `${html.slice(0, bodyCloseIndex)}${modernScriptTag}\n${pwaScriptTag}\n${html.slice(bodyCloseIndex)}`;

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputFonts, { recursive: true });
await mkdir(outputAudio, { recursive: true });
await mkdir(outputProductionAssets, { recursive: true });
await mkdir(outputRuntime, { recursive: true });
await mkdir(outputPwa, { recursive: true });
await writeFile(path.join(outputDir, 'index.html'), html, 'utf8');

for (const [packagePath, outputName] of fontFiles) {
  await copyFile(path.join(projectRoot, 'node_modules', packagePath), path.join(outputFonts, outputName));
}
for (const audioFile of await readdir(sourceAudioDir)) {
  await copyFile(path.join(sourceAudioDir, audioFile), path.join(outputAudio, audioFile));
}
await cp(sourceProductionAssetsDir, outputProductionAssets, { recursive: true });
await cp(sourceRuntimeDir, outputRuntime, { recursive: true });
await cp(modernDistDir, outputModern, { recursive: true });
await cp(sourcePwaDir, outputPwa, { recursive: true });
await copyFile(path.join(sourcePwaDir, 'manifest.webmanifest'), path.join(outputDir, 'manifest.webmanifest'));
await copyFile(path.join(sourcePwaDir, 'offline.html'), path.join(outputDir, 'offline.html'));
await copyFile(path.join(sourcePwaDir, 'service-worker.js'), path.join(outputDir, 'service-worker.js'));

const sourceSha256 = createHash('sha256').update(html).digest('hex');
const audioSha256 = createHash('sha256').update(await readFile(path.join(sourceAudioDir, 'storm-feel-sprite.wav'))).digest('hex');
const modernShellSha256 = createHash('sha256').update(await readFile(modernEntryPath)).digest('hex');
const storefrontSha256 = createHash('sha256').update(await readFile(path.join(sourceProductionAssetsDir, 'structures', 'storefront-v1.json'))).digest('hex');
const cow17RuntimeSha256 = createHash('sha256').update(cow17Runtime).digest('hex');
const cow17LoaderSha256 = createHash('sha256').update(cow17LoaderBytes).digest('hex');
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
    runtimeFiles,
    cow17RuntimeSha256,
    cow17Loader: {
      source: cow17LoaderFile,
      upstreamCommit: 'd4aa9e00ea29808534a3e082f602c544e5f2419c',
      gitBlob: cow17LoaderExpectedBlob,
      sha256: cow17LoaderSha256,
    },
    productionAssets: {
      root: 'assets/production',
      storefront: 'assets/production/structures/storefront-v1.json',
      storefrontSha256,
      cow17: 'assets/production/characters/cow17-walking-v1.glb',
      cow17Sha256,
      cow17Bytes: cow17Bytes.length,
    }
  }, null, 2)}\n`,
  'utf8'
);

console.log(`Built offline web bundle v${buildVersion} (${buildLabel}): www/index.html (${sourceSha256}), PWA shell (manifest + root-scoped service worker), modern shell (${modernShellSha256}), audio (${audioSha256}), runtime (${runtimeFiles.length} files), official Cow 17 GLTFLoader (${cow17LoaderExpectedBlob}), authored storefront (${storefrontSha256}), Cow 17 (${cow17Sha256}, ${cow17Bytes.length} bytes)`);
