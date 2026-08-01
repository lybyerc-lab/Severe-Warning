import { access, copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourceHtml = path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const packageJsonPath = path.join(projectRoot, 'package.json');
const sourceAudioDir = path.join(projectRoot, 'assets', 'audio');
const outputDir = path.join(projectRoot, 'www');
const outputFonts = path.join(outputDir, 'fonts');
const outputAudio = path.join(outputDir, 'audio');

const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
const buildVersion = packageJson.version;
const buildLabel = packageJson.buildLabel ?? 'Severe Weather';

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

const html = await readFile(sourceHtml, 'utf8');
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

const sourceSha256 = createHash('sha256').update(html).digest('hex');
const audioSha256 = createHash('sha256').update(await readFile(path.join(sourceAudioDir, 'storm-feel-sprite.wav'))).digest('hex');
await writeFile(
  path.join(outputDir, 'build-info.json'),
  `${JSON.stringify({ version: buildVersion, label: buildLabel, source: 'MechanicsLab/SevereWeather_3D_Lab.html', sourceSha256, audioSha256 }, null, 2)}\n`,
  'utf8'
);

console.log(`Built offline web bundle v${buildVersion} (${buildLabel}): www/index.html (${sourceSha256}), audio (${audioSha256})`);
