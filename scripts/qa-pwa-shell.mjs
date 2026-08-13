import { chromium } from 'playwright';
import http from 'node:http';
import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifactDir = path.resolve(process.env.SEVERE_WEATHER_PWA_ARTIFACT_DIR || path.join(projectRoot, 'qa-artifacts', 'sw-pwa-001'));
const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), 'severe-weather-pwa-'));
const projectPath = path.join(fixtureRoot, 'Severe-Warning');
const sourcePwa = path.join(projectRoot, 'pwa');
let revision = { runNumber: '47', shortSha: 'old47aa' };
let networkAvailable = true;
const serverRequests = [];

await mkdir(projectPath, { recursive: true });
await cp(sourcePwa, path.join(projectPath, 'pwa'), { recursive: true });
await cp(path.join(sourcePwa, 'manifest.webmanifest'), path.join(projectPath, 'manifest.webmanifest'));
await cp(path.join(sourcePwa, 'offline.html'), path.join(projectPath, 'offline.html'));
await cp(path.join(sourcePwa, 'service-worker.js'), path.join(projectPath, 'service-worker.js'));

// QA-opt-in fixture index.html (with severe-weather-qa-build meta marker)
await writeFile(path.join(projectPath, 'index.html'), `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="manifest" href="./manifest.webmanifest">
    <meta name="application-name" content="Severe Weather Warning">
    <meta name="theme-color" content="#030712">
    <meta name="severe-weather-qa-build" content="./qa-build.json">
    <title>Severe Weather Warning</title>
  </head>
  <body>
    <main data-browser-playable="true">Playable browser shell remains available without installation.</main>
    <script type="module" src="./pwa/register-pwa.js"></script>
  </body>
</html>`, 'utf8');

// Production-style fixture prod.html (WITHOUT severe-weather-qa-build meta marker)
await writeFile(path.join(projectPath, 'prod.html'), `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="manifest" href="./manifest.webmanifest">
    <meta name="application-name" content="Severe Weather Warning">
    <meta name="theme-color" content="#030712">
    <title>Severe Weather Warning</title>
  </head>
  <body>
    <main data-browser-playable="true">Playable browser shell remains available without installation.</main>
    <script type="module" src="./pwa/register-pwa.js"></script>
  </body>
</html>`, 'utf8');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
};
const server = http.createServer(async (request, response) => {
  if (!networkAvailable) {
    request.socket.destroy();
    return;
  }
  const parsed = new URL(request.url, 'http://127.0.0.1');
  serverRequests.push(parsed.pathname);
  if (!parsed.pathname.startsWith('/Severe-Warning/')) {
    response.writeHead(404).end();
    return;
  }
  if (parsed.pathname === '/Severe-Warning/qa-build.json') {
    response.writeHead(200, { 'Content-Type': mimeTypes['.json'], 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ ...revision, channel: 'qa' }));
    return;
  }
  if (parsed.pathname === '/Severe-Warning/build-info.json') {
    response.writeHead(200, { 'Content-Type': mimeTypes['.json'], 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ version: '5.1.0', sourceSha256: 'abc1234def5678' }));
    return;
  }
  const relativePath = parsed.pathname.slice('/Severe-Warning/'.length) || 'index.html';
  const filePath = path.resolve(projectPath, relativePath);
  if (!filePath.startsWith(`${projectPath}${path.sep}`)) {
    response.writeHead(403).end();
    return;
  }
  try {
    const content = await readFile(filePath);
    response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(content);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}/Severe-Warning/`;
const report = {
  version: 'SW_PWA_001_BROWSER_QA_V2',
  authority: 'PWA shell browser evidence only - not production QA or Android device acceptance',
  baseUrl,
  checks: {},
  errors: [],
  passed: false,
};

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const context = await browser.newContext({ viewport: { width: 932, height: 430 }, isMobile: true, hasTouch: true });
const page = await context.newPage();
page.on('pageerror', error => report.errors.push(error.message));
page.on('console', msg => {
  if (msg.type() === 'error') {
    report.errors.push(`Console Error: ${msg.text()}`);
  }
});

try {
  // A. QA-opt-in fixture (index.html with meta marker)
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForFunction(() => globalThis.__SEVERE_WEATHER_PWA__?.status === 'registered', null, { timeout: 30000 });
  await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForFunction(() => navigator.serviceWorker.controller && globalThis.__SEVERE_WEATHER_PWA__?.sourceIdentity === 'QA #47 · old47aa', null, { timeout: 30000 });

  const initial = await page.evaluate(async () => ({
    manifest: document.querySelector('link[rel="manifest"]')?.href,
    playShell: document.querySelector('[data-browser-playable]')?.textContent,
    serviceWorkerScope: (await navigator.serviceWorker.ready).scope,
    standalone: window.matchMedia('(display-mode: standalone)').matches,
    sourceIdentity: globalThis.__SEVERE_WEATHER_PWA__?.sourceIdentity,
  }));
  report.checks.manifestUsesGitHubPagesProjectPath = initial.manifest === `${baseUrl}manifest.webmanifest`;
  report.checks.serviceWorkerControlsProjectPath = initial.serviceWorkerScope === baseUrl;
  report.checks.nonInstalledBrowserShellRemainsPlayable = Boolean(initial.playShell) && initial.standalone === false;
  report.checks.initialDeterministicIdentityVisible = initial.sourceIdentity === 'QA #47 · old47aa';

  revision = { runNumber: '48', shortSha: 'new48bb' };
  await page.evaluate(async () => {
    const cache = await caches.open('severe-weather-warning-shell-v1');
    await cache.put(new URL('./qa-build.json', location.href).toString(), new Response(JSON.stringify({ runNumber: '47', shortSha: 'old47aa' })));
  });
  await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForFunction(() => globalThis.__SEVERE_WEATHER_PWA__?.sourceIdentity === 'QA #48 · new48bb', null, { timeout: 30000 });
  report.checks.newerIdentitySupersedesCachedOlderIdentity = (await page.title()) === 'Severe Weather Warning · QA #48 · new48bb';

  // B. Production-style fixture (prod.html WITHOUT meta marker)
  const prodUrl = `${baseUrl}prod.html`;
  const prodRequestsStart = serverRequests.length;
  await page.goto(prodUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForFunction(() => globalThis.__SEVERE_WEATHER_PWA__?.sourceIdentity === 'v5.1.0 · abc1234', null, { timeout: 30000 });
  const prodIdentity = await page.evaluate(() => globalThis.__SEVERE_WEATHER_PWA__?.sourceIdentity);
  report.checks.productionStyleLoadsBuildInfoWithoutQaProbe = prodIdentity === 'v5.1.0 · abc1234';

  const prodRequests = serverRequests.slice(prodRequestsStart);
  report.checks.noQaBuildProbingHttp404 = !prodRequests.includes('/Severe-Warning/qa-build.json');

  // Offline navigation test
  networkAvailable = false;
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  report.checks.offlineNavigationUsesTruthfulFallback = (await page.locator('body').innerText()).includes('Reconnect to load the latest storm warning');
  networkAvailable = true;

  report.checks.noPageErrors = report.errors.length === 0;
  report.passed = Object.values(report.checks).every(Boolean);
} catch (error) {
  report.errors.push(error.stack || error.message);
} finally {
  await mkdir(artifactDir, { recursive: true });
  await writeFile(path.join(artifactDir, 'pwa-browser-qa-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await context.close();
  await browser.close();
  await new Promise(resolve => server.close(resolve));
  await rm(fixtureRoot, { recursive: true, force: true });
}

console.log(`${report.passed ? 'PASS' : 'FAIL'} SW-PWA-001 browser shell QA :: ${JSON.stringify(report.checks)}`);
console.log(`Report: ${path.join(artifactDir, 'pwa-browser-qa-report.json')}`);
if (!report.passed) process.exitCode = 1;
