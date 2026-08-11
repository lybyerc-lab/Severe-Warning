import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relativePath => readFile(path.join(projectRoot, relativePath), 'utf8');
const manifest = JSON.parse(await read('pwa/manifest.webmanifest'));
const manifestUrl = new URL('https://lybyerc-lab.github.io/Severe-Warning/manifest.webmanifest');

assert.equal(manifest.name, 'Severe Weather Warning');
assert.equal(manifest.short_name, 'Severe Weather Warning');
assert.equal(manifest.display, 'standalone');
assert.equal(manifest.orientation, 'landscape');
assert.equal(new URL(manifest.start_url, manifestUrl).pathname, '/Severe-Warning/');
assert.equal(new URL(manifest.scope, manifestUrl).pathname, '/Severe-Warning/');
assert.equal(manifest.icons.length, 1);
assert.equal(new URL(manifest.icons[0].src, manifestUrl).pathname, '/Severe-Warning/pwa/icons/severe-weather-warning.svg');
assert.equal(manifest.icons[0].purpose, 'any maskable');

const policySource = await read('pwa/cache-policy.js');
const policyContext = { self: {}, URL };
vm.runInNewContext(policySource, policyContext, { filename: 'pwa/cache-policy.js' });
const policy = policyContext.self.SevereWeatherPwaPolicy;
assert.equal(policy.cacheName, 'severe-weather-warning-shell-v1');
assert.equal(policy.isBuildIdentity('https://lybyerc-lab.github.io/Severe-Warning/index.html'), true);
assert.equal(policy.isBuildIdentity('https://lybyerc-lab.github.io/Severe-Warning/qa-build.json'), true);
assert.equal(policy.isBuildIdentity('https://lybyerc-lab.github.io/Severe-Warning/build-info.json'), true);
assert.equal(policy.isBuildIdentity('https://lybyerc-lab.github.io/Severe-Warning/modern/modern-shell.js'), false);
assert.equal(policy.isOfflineAsset('https://lybyerc-lab.github.io/Severe-Warning/pwa/icons/severe-weather-warning.svg'), true);
assert.equal(policy.isOfflineAsset('https://lybyerc-lab.github.io/Severe-Warning/qa-build.json'), false);
assert.equal(policy.isManagedCache('severe-weather-warning-shell-v0'), true);
assert.equal(policy.isManagedCache('unrelated-cache'), false);

const [buildWeb, serviceWorker, registerPwa, serveWww, icon] = await Promise.all([
  read('scripts/build-web.mjs'),
  read('pwa/service-worker.js'),
  read('pwa/register-pwa.js'),
  read('scripts/serve-www.mjs'),
  read('pwa/icons/severe-weather-warning.svg'),
]);
assert.match(buildWeb, /SEVERE_WEATHER_PWA_SHELL_V1/);
assert.match(buildWeb, /manifest\.webmanifest/);
assert.match(buildWeb, /service-worker\.js/);
assert.match(buildWeb, /await cp\(sourcePwaDir, outputPwa/);
assert.match(serviceWorker, /fetch\(request, \{ cache: 'no-store' \}\)/);
assert.match(serviceWorker, /request\.mode === 'navigate' \|\| policy\.isBuildIdentity/);
assert.match(serviceWorker, /self\.skipWaiting/);
assert.match(serviceWorker, /self\.clients\.claim/);
assert.match(registerPwa, /updateViaCache: 'none'/);
assert.match(registerPwa, /registration\.update\(\)/);
assert.match(registerPwa, /fetch\('\.\/qa-build\.json', \{ cache: 'no-store' \}\)/);
assert.match(registerPwa, /fetch\('\.\/build-info\.json', \{ cache: 'no-store' \}\)/);
assert.match(registerPwa, /Severe Weather Warning/);
assert.match(serveWww, /application\/manifest\+json/);
assert.match(serveWww, /image\/svg\+xml/);
assert.match(icon, /viewBox="0 0 512 512"/);
assert.match(icon, /Severe Weather Warning/);

const fixtureDir = await mkdtemp(path.join(os.tmpdir(), 'severe-weather-pwa-build-'));
const fixtureSource = path.join(fixtureDir, 'source.html');
const fixtureOutput = path.join(fixtureDir, 'www');
try {
  await writeFile(fixtureSource, `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'self'"><title>Fixture v5.1.0</title></head><body>Fixture v5.1.0</body></html>`, 'utf8');
  const build = spawnSync(process.execPath, ['scripts/build-web.mjs'], {
    cwd: projectRoot,
    env: { ...process.env, SEVERE_WEATHER_SOURCE_PATH: fixtureSource, SEVERE_WEATHER_WWW_DIR: fixtureOutput },
    encoding: 'utf8',
  });
  assert.equal(build.status, 0, `${build.stdout}\n${build.stderr}`);
  const builtIndex = await readFile(path.join(fixtureOutput, 'index.html'), 'utf8');
  assert.match(builtIndex, /SEVERE_WEATHER_PWA_SHELL_V1/);
  assert.match(builtIndex, /<link rel="manifest" href="\.\/manifest\.webmanifest">/);
  assert.match(builtIndex, /<script type="module" src="\.\/pwa\/register-pwa\.js"><\/script>/);
  for (const outputFile of [
    'manifest.webmanifest',
    'service-worker.js',
    'offline.html',
    'pwa/register-pwa.js',
    'pwa/cache-policy.js',
    'pwa/icons/severe-weather-warning.svg',
  ]) {
    await readFile(path.join(fixtureOutput, outputFile), 'utf8');
  }
} finally {
  await rm(fixtureDir, { recursive: true, force: true });
}

console.log('SW-PWA-001 static PWA shell contract: PASS');
