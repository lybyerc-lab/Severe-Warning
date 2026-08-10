import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR || path.join(projectRoot, 'qa-artifacts', 'opening-cinematic');
const runtimePath = path.join(projectRoot, 'runtime', 'threejs-opening-cinematic-foundation.js');
const sourceHtmlPath = path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
await mkdir(outputDir, { recursive: true });

const [runtime, productionHtml] = await Promise.all([readFile(runtimePath, 'utf8'), readFile(sourceHtmlPath, 'utf8')]);
const threeMatch = productionHtml.match(/<script>\s*(\/\* INLINED THREE\.JS R128 \*\/[\s\S]*?)<\/script>/);
if (!threeMatch) throw new Error('SW-CIN-001 QA could not locate the local Three.js r128 source.');
const harnessPath = path.join(outputDir, 'sw-cin-001-qa-harness.html');
const harness = `<!doctype html>
<html><head><meta charset="utf-8"><title>SW-CIN-001 QA</title><style>html,body,canvas{margin:0;width:100%;height:100%;overflow:hidden;background:#172132}</style></head>
<body><canvas id="cinematic-canvas"></canvas><script>${threeMatch[1]}</script><script>${runtime}</script><script>
  (() => {
    // QA-only renderer: production integration will receive the existing renderer and scene.
    const canvas = document.getElementById('cinematic-canvas');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#24384b');
    scene.fog = new THREE.FogExp2('#24384b', 0.022);
    const camera = new THREE.PerspectiveCamera(37, 1280 / 720, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(1280, 720, false);
    renderer.setPixelRatio(1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene.add(new THREE.HemisphereLight('#8aa8bd', '#3b2c1d', 2.0));
    const key = new THREE.DirectionalLight('#ffe2a8', 3.2);
    key.position.set(-7, 12, 9);
    key.castShadow = true;
    scene.add(key);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: '#4e6d42', roughness: 0.95 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    const foundation = globalThis.__SW_OPENING_CINEMATIC_FOUNDATION__.createFoundation({ scene });
    globalThis.__SW_CINEMATIC_QA_SESSION__ = {
      capture(beat) {
        foundation.setBeat(beat);
        foundation.applyShot(camera, beat);
        renderer.render(scene, camera);
        return foundation.getSnapshot();
      },
      cleanup() { foundation.dispose(); renderer.dispose(); },
      rendererRevision: THREE.REVISION,
    };
  })();
</script></body></html>`;
await writeFile(harnessPath, harness, 'utf8');

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
page.setDefaultTimeout(30000);
const errors = [];
const logs = [];
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
page.on('console', (message) => {
  logs.push(`[${message.type()}] ${message.text()}`);
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});
const report = { version: 'SW_CIN_001_BROWSER_QA_V1', generatedAt: new Date().toISOString(), passed: false, frames: {}, telemetry: null, rendererRevision: null, errors, failures: [] };
function requireCondition(condition, message) { if (!condition) report.failures.push(message); }

try {
  await page.goto(pathToFileURL(harnessPath).href, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof globalThis.__SW_CINEMATIC_QA_SESSION__?.capture === 'function');
  report.rendererRevision = await page.evaluate(() => globalThis.__SW_CINEMATIC_QA_SESSION__.rendererRevision);
  requireCondition(report.rendererRevision === '128', `QA harness used Three.js r${report.rendererRevision}, expected r128.`);
  for (const [beat, filename] of [
    ['fence-conversation', 'sw-cin-001-fence-conversation.png'],
    ['double-take', 'sw-cin-001-double-take.png'],
    ['last-sip-setup', 'sw-cin-001-last-sip-setup.png'],
  ]) {
    const snapshot = await page.evaluate((requestedBeat) => globalThis.__SW_CINEMATIC_QA_SESSION__.capture(requestedBeat), beat);
    report.frames[beat] = snapshot;
    await page.screenshot({ path: path.join(outputDir, filename), fullPage: true });
    requireCondition(snapshot.beat === beat, `${beat}: timeline did not resolve requested beat.`);
    requireCondition(snapshot.actors.cow17 && snapshot.actors.chickens >= 2 && snapshot.actors.cup && snapshot.actors.fence, `${beat}: actor composition is incomplete.`);
  }
  report.telemetry = report.frames['last-sip-setup']?.budget || null;
  requireCondition(Number(report.telemetry?.meshes) > 0, 'Presentation mesh telemetry is missing.');
  requireCondition(Number(report.telemetry?.materials) > 0, 'Presentation material telemetry is missing.');
} finally {
  await page.evaluate(() => globalThis.__SW_CINEMATIC_QA_SESSION__?.cleanup?.()).catch(() => {});
  await writeFile(path.join(outputDir, 'sw-cin-001-browser.log'), `${logs.join('\n')}\n`, 'utf8');
  await browser.close();
}
if (errors.length) report.failures.push(`Browser errors: ${errors.join(' | ')}`);
report.passed = report.failures.length === 0;
await writeFile(path.join(outputDir, 'sw-cin-001-browser-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`SW-CIN-001 browser QA: ${report.passed ? 'PASS' : 'FAIL'}; frames=${Object.keys(report.frames).length}; budget=${JSON.stringify(report.telemetry)}.`);
if (!report.passed) {
  report.failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
