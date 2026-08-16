#!/usr/bin/env node
// [SW:ART:009:BROWSER_QA]
// Small behavioral proof: real Cow 17, official loader, authored texture/skin,
// active walk animation, protected cow safety, and deterministic fallback.

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR)
  : path.join(projectRoot, 'qa-artifacts', 'sw-art-009-cow17-runtime');
const qaUrl = process.env.SEVERE_WEATHER_QA_URL || 'http://127.0.0.1:4173/';
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const report = {
  version: 'SW_ART_009_COW17_BROWSER_QA_V3',
  generatedAt: new Date().toISOString(),
  passed: false,
  success: null,
  visual: null,
  fallback: null,
  failures: [],
};

function requireCondition(condition, message) {
  if (!condition) report.failures.push(message);
}

async function makePage() {
  const page = await browser.newPage({ viewport: { width: 932, height: 430 } });
  page.setDefaultTimeout(45000);
  const logs = [];
  const errors = [];
  page.on('console', (message) => {
    const line = `[${message.type()}] ${message.text()}`;
    logs.push(line);
    if (message.type() === 'error') errors.push(line);
  });
  page.on('pageerror', (error) => {
    const line = `pageerror: ${error.message}`;
    logs.push(line);
    errors.push(line);
  });
  return { page, logs, errors };
}

async function dismissIntroAndStart(page) {
  await page.waitForFunction(() => typeof globalThis.__SW_PRESENTATION_IDENTITY_BRIDGE__?.getSnapshot === 'function');
  await page.evaluate(() => globalThis.__SW_PRESENTATION_IDENTITY_BRIDGE__.hideIntro());
  await page.waitForTimeout(80);
  const menuVisible = await page.evaluate(() => {
    const menu = document.getElementById('mainMenu');
    if (!menu) return false;
    const style = getComputedStyle(menu);
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0;
  });
  if (menuVisible) await page.click('#btnStartMenu');
  await page.waitForTimeout(300);
}

async function successSnapshot(page) {
  return page.evaluate(() => {
    const cow = typeof animals !== 'undefined' ? animals.find((candidate) => candidate.id === 17) : null;
    const visual = cow?.mesh?.getObjectByName?.('SW_COW17_AUTHORED_VISUAL') || null;
    let texturedMaterials = 0;
    let skinnedMeshes = 0;
    if (visual) {
      const seen = new Set();
      visual.traverse((object) => {
        if (object?.isSkinnedMesh) skinnedMeshes += 1;
        if (!object?.isMesh) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if (!material || seen.has(material)) continue;
          seen.add(material);
          if (material.map?.isTexture) texturedMaterials += 1;
        }
      });
    }
    return {
      revision: globalThis.THREE?.REVISION || null,
      loaderAvailable: typeof globalThis.THREE?.GLTFLoader === 'function',
      runtime: globalThis.__SW_COW17_RUNTIME_ASSET__?.getSnapshot?.() || null,
      bovine: typeof globalThis.getBovineQaState === 'function' ? globalThis.getBovineQaState() : null,
      cow: cow ? {
        id: cow.id,
        cow17Marker: cow.mesh?.userData?.cow17 === true,
        authoredAssetId: cow.mesh?.userData?.swCow17AuthoredAssetId || null,
        authoredVisualPresent: Boolean(visual),
        rootMaterialVisible: cow.mesh?.material?.visible !== false,
        fallbackChildrenVisible: [...(cow.mesh?.children || [])]
          .filter((child) => child !== visual)
          .some((child) => child.visible !== false),
        texturedMaterials,
        skinnedMeshes,
      } : null,
    };
  });
}

async function renderFocusedCow(page) {
  return page.evaluate(() => {
    const cow = animals.find((candidate) => candidate.id === 17);
    const visual = cow?.mesh?.getObjectByName?.('SW_COW17_AUTHORED_VISUAL');
    if (!cow || !visual) return null;

    productionQaPrepared = true;
    globalThis.productionQaPrepared = true;
    runActive = false;
    cameraShakeIntensity = 0;
    if (typeof tornadoGroup !== 'undefined' && tornadoGroup) tornadoGroup.visible = false;

    visual.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(visual);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const proofCamera = new THREE.PerspectiveCamera(48, 932 / 430, 0.1, 1000);
    const direction = new THREE.Vector3(0.75, 0.2, 1).normalize();
    const distance = Math.max(6.2, size.y * 2.35);
    proofCamera.position.copy(center).addScaledVector(direction, distance);
    proofCamera.lookAt(center);
    proofCamera.updateProjectionMatrix();
    proofCamera.updateMatrixWorld(true);
    renderer.render(scene, proofCamera);
    globalThis.__SW_COW17_QA_CAMERA__ = proofCamera;

    return {
      assetId: cow.mesh.userData.swCow17AuthoredAssetId || null,
      size: { x: size.x, y: size.y, z: size.z },
      center: { x: center.x, y: center.y, z: center.z },
    };
  });
}

const success = await makePage();
try {
  await success.page.goto(`${qaUrl}?qa=1&intro=0&identity=1&cow17Asset=1`, { waitUntil: 'domcontentloaded' });
  await success.page.waitForFunction(() => typeof globalThis.__SW_COW17_RUNTIME_ASSET__?.getSnapshot === 'function');
  await dismissIntroAndStart(success.page);
  await success.page.waitForFunction(() => {
    const state = globalThis.__SW_COW17_RUNTIME_ASSET__?.getSnapshot?.();
    const cow = typeof animals !== 'undefined' ? animals.find((candidate) => candidate.id === 17) : null;
    const visual = cow?.mesh?.getObjectByName?.('SW_COW17_AUTHORED_VISUAL') || null;
    return state?.version === 'SW_COW17_RUNTIME_ASSET_V2'
      && state?.loader === 'THREE.GLTFLoader r128'
      && state?.activeCowId === 17
      && state?.activeAnimation === 'Armature|walking_man|baselayer'
      && state?.activeJointCount === 24
      && state?.activeTriangleCount === 198050
      && state?.activeTexturedMaterialCount >= 1
      && state?.activeSkinnedMeshCount >= 1
      && state?.fallbackVisible === false
      && cow?.mesh?.userData?.swCow17AuthoredAssetId === 'character.cow17.walking.v1'
      && Boolean(visual);
  });
  await success.page.waitForFunction(() => globalThis.__SW_COW17_RUNTIME_ASSET__?.getSnapshot?.().animationTicks >= 8);
  report.success = await successSnapshot(success.page);
  await success.page.screenshot({ path: path.join(outputDir, 'cow17-authored-gameplay.png'), fullPage: true });
  report.visual = await renderFocusedCow(success.page);
  await success.page.waitForTimeout(80);
  await success.page.evaluate(() => renderer.render(scene, globalThis.__SW_COW17_QA_CAMERA__ || camera));
  await success.page.locator('canvas').first().screenshot({ path: path.join(outputDir, 'cow17-authored-focused.png') });

  requireCondition(report.success.revision === '128', `Three.js revision changed: ${report.success.revision}.`);
  requireCondition(report.success.loaderAvailable === true, 'Official THREE.GLTFLoader is not present at runtime.');
  requireCondition(report.success.runtime?.version === 'SW_COW17_RUNTIME_ASSET_V2', `Cow runtime version mismatch: ${report.success.runtime?.version}.`);
  requireCondition(report.success.runtime?.loader === 'THREE.GLTFLoader r128', `Cow loader identity mismatch: ${report.success.runtime?.loader}.`);
  requireCondition(report.success.runtime?.loadFailures === 0, `Successful Cow path recorded ${report.success.runtime?.loadFailures} load failures.`);
  requireCondition(report.success.runtime?.activeCowId === 17, `Authored visual attached to unexpected cow ${report.success.runtime?.activeCowId}.`);
  requireCondition(report.success.runtime?.activeAnimation === 'Armature|walking_man|baselayer', `Unexpected Cow animation ${report.success.runtime?.activeAnimation}.`);
  requireCondition(report.success.runtime?.activeJointCount === 24, `Unexpected joint count ${report.success.runtime?.activeJointCount}.`);
  requireCondition(report.success.runtime?.activeTriangleCount === 198050, `Unexpected triangle count ${report.success.runtime?.activeTriangleCount}.`);
  requireCondition(report.success.runtime?.activeTexturedMaterialCount >= 1, 'Cow runtime found no authored base-color texture.');
  requireCondition(report.success.runtime?.activeSkinnedMeshCount >= 1, 'Cow runtime found no skinned mesh.');
  requireCondition(report.success.runtime?.animationTicks >= 8 && report.success.runtime?.animationSeconds > 0, 'Cow walk animation did not advance.');
  requireCondition(report.success.runtime?.fallbackVisible === false, 'Primitive fallback remained active after authored Cow loaded.');
  requireCondition(report.success.cow?.id === 17 && report.success.cow?.cow17Marker === true, 'Protected Cow 17 identity changed.');
  requireCondition(report.success.cow?.authoredVisualPresent === true, 'Authored Cow 17 visual is not attached.');
  requireCondition(report.success.cow?.rootMaterialVisible === false, 'Primitive Cow root remained visible after authored Cow loaded.');
  requireCondition(report.success.cow?.fallbackChildrenVisible === false, 'Primitive Cow decoration remained visible after authored Cow loaded.');
  requireCondition(report.success.cow?.texturedMaterials >= 1, 'Live Cow scene has no material with a base-color map.');
  requireCondition(report.success.cow?.skinnedMeshes >= 1, 'Live Cow scene has no skinned mesh.');
  requireCondition(report.success.bovine?.invariant === 'Cow injuries: 0', `Cow safety invariant changed: ${report.success.bovine?.invariant}.`);
  requireCondition(report.visual?.assetId === 'character.cow17.walking.v1', 'Focused screenshot is not the authored Cow 17 asset.');
  if (success.errors.length) report.failures.push(`Success-path browser errors: ${success.errors.join(' | ')}`);
} finally {
  await writeFile(path.join(outputDir, 'cow17-success-browser.log'), `${success.logs.join('\n')}\n`, 'utf8');
  await success.page.close();
}

const fallback = await makePage();
try {
  await fallback.page.route('**/assets/production/characters/cow17-walking-v1.glb', async (route) => {
    await route.fulfill({ status: 404, contentType: 'application/octet-stream', body: 'Cow 17 fallback probe' });
  });
  await fallback.page.goto(`${qaUrl}?qa=1&intro=0&identity=1&cow17Fallback=1`, { waitUntil: 'domcontentloaded' });
  await fallback.page.waitForFunction(() => typeof globalThis.__SW_COW17_RUNTIME_ASSET__?.getSnapshot === 'function');
  await dismissIntroAndStart(fallback.page);
  await fallback.page.waitForFunction(() => {
    const state = globalThis.__SW_COW17_RUNTIME_ASSET__?.getSnapshot?.();
    const cow = typeof animals !== 'undefined' ? animals.find((candidate) => candidate.id === 17) : null;
    const visual = cow?.mesh?.getObjectByName?.('SW_COW17_AUTHORED_VISUAL') || null;
    return state?.loadFailures >= 1
      && state?.activeCowId === null
      && state?.fallbackVisible === true
      && Boolean(cow)
      && !visual;
  });
  report.fallback = await fallback.page.evaluate(() => {
    const cow = animals.find((candidate) => candidate.id === 17);
    const runtime = globalThis.__SW_COW17_RUNTIME_ASSET__?.getSnapshot?.() || null;
    return {
      runtime,
      bovine: typeof globalThis.getBovineQaState === 'function' ? globalThis.getBovineQaState() : null,
      cow: cow ? {
        id: cow.id,
        authoredVisualPresent: Boolean(cow.mesh?.getObjectByName?.('SW_COW17_AUTHORED_VISUAL')),
        rootMaterialVisible: cow.mesh?.material?.visible !== false,
        fallbackChildrenVisible: [...(cow.mesh?.children || [])].some((child) => child.visible !== false),
      } : null,
    };
  });
  await fallback.page.locator('canvas').first().screenshot({ path: path.join(outputDir, 'cow17-fallback.png') });

  requireCondition(report.fallback.runtime?.loadFailures >= 1, '404 probe did not record a Cow asset load failure.');
  requireCondition(report.fallback.runtime?.activeCowId === null, 'Failed Cow asset remained active.');
  requireCondition(report.fallback.runtime?.fallbackVisible === true, 'Failed Cow asset did not retain primitive fallback.');
  requireCondition(report.fallback.cow?.id === 17, 'Fallback is no longer attached to protected Cow 17.');
  requireCondition(report.fallback.cow?.authoredVisualPresent === false, 'Authored Cow remained attached during forced 404 fallback.');
  requireCondition(report.fallback.cow?.rootMaterialVisible === true, 'Primitive Cow root did not restore on load failure.');
  requireCondition(report.fallback.cow?.fallbackChildrenVisible === true, 'Primitive Cow decoration did not restore on load failure.');
  requireCondition(report.fallback.bovine?.invariant === 'Cow injuries: 0', `Cow safety changed in fallback: ${report.fallback.bovine?.invariant}.`);
  const unexpectedErrors = fallback.errors.filter((line) => !line.includes('cow17-walking-v1.glb') && !line.includes('404'));
  if (unexpectedErrors.length) report.failures.push(`Fallback browser errors: ${unexpectedErrors.join(' | ')}`);
} finally {
  await writeFile(path.join(outputDir, 'cow17-fallback-browser.log'), `${fallback.logs.join('\n')}\n`, 'utf8');
  await fallback.page.close();
}

await browser.close();
report.passed = report.failures.length === 0;
await writeFile(path.join(outputDir, 'sw-art-009-cow17-runtime-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`SW-ART-009 Cow 17 browser QA ${report.passed ? 'PASS' : 'FAIL'}`);
if (!report.passed) {
  report.failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
