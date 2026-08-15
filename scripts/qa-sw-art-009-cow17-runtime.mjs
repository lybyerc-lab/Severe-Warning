#!/usr/bin/env node
// [SW:ART:009:BROWSER_QA]
// Behavioral proof that the real Cow 17 executor owns gameplay while the authored
// walking GLB is presentation-only and fails back to the accepted primitive cow.

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
  version: 'SW_ART_009_COW17_BROWSER_QA_V2',
  generatedAt: new Date().toISOString(),
  passed: false,
  success: null,
  animationProbe: null,
  visualProbe: null,
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
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
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
  await page.waitForTimeout(500);
}

async function snapshot(page) {
  return page.evaluate(() => {
    const cow = typeof animals !== 'undefined' ? animals.find((candidate) => candidate.id === 17) : null;
    const visual = cow?.mesh?.getObjectByName?.('SW_COW17_AUTHORED_VISUAL') || null;
    const assetUrl = new URL('./assets/production/characters/cow17-walking-v1.glb', location.href).href;
    const resource = performance.getEntriesByName(assetUrl).at(-1);
    return {
      revision: globalThis.THREE?.REVISION || null,
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
        airborne: cow.airborne === true,
      } : null,
      resource: resource ? {
        durationMs: Number(resource.duration.toFixed(2)),
        transferSize: resource.transferSize || 0,
        decodedBodySize: resource.decodedBodySize || 0,
      } : null,
    };
  });
}

async function animationProbe(page) {
  const before = await page.evaluate(() => {
    const cow = animals.find((candidate) => candidate.id === 17);
    const hips = cow?.mesh?.getObjectByName?.('Hips');
    return {
      ticks: globalThis.__SW_COW17_RUNTIME_ASSET__?.getSnapshot?.().animationTicks || 0,
      seconds: globalThis.__SW_COW17_RUNTIME_ASSET__?.getSnapshot?.().animationSeconds || 0,
      hips: hips ? {
        px: hips.position.x, py: hips.position.y, pz: hips.position.z,
        qx: hips.quaternion.x, qy: hips.quaternion.y, qz: hips.quaternion.z, qw: hips.quaternion.w,
      } : null,
    };
  });
  await page.waitForTimeout(450);
  const after = await page.evaluate(() => {
    const cow = animals.find((candidate) => candidate.id === 17);
    const hips = cow?.mesh?.getObjectByName?.('Hips');
    return {
      ticks: globalThis.__SW_COW17_RUNTIME_ASSET__?.getSnapshot?.().animationTicks || 0,
      seconds: globalThis.__SW_COW17_RUNTIME_ASSET__?.getSnapshot?.().animationSeconds || 0,
      hips: hips ? {
        px: hips.position.x, py: hips.position.y, pz: hips.position.z,
        qx: hips.quaternion.x, qy: hips.quaternion.y, qz: hips.quaternion.z, qw: hips.quaternion.w,
      } : null,
    };
  });
  const values = (value) => value ? Object.values(value).map(Number) : [];
  const beforeValues = values(before.hips);
  const afterValues = values(after.hips);
  const hipsChanged = beforeValues.length === afterValues.length
    && beforeValues.some((value, index) => Math.abs(value - afterValues[index]) > 1e-5);
  return {
    before,
    after,
    tickDelta: after.ticks - before.ticks,
    secondsDelta: Number((after.seconds - before.seconds).toFixed(3)),
    hipsChanged,
  };
}

async function focusCow17(page) {
  return page.evaluate(() => {
    const cow = animals.find((candidate) => candidate.id === 17);
    const visual = cow?.mesh?.getObjectByName?.('SW_COW17_AUTHORED_VISUAL');
    const hips = visual?.getObjectByName?.('Hips');
    if (!cow || !visual || !hips) return null;

    productionQaPrepared = true;
    globalThis.productionQaPrepared = true;
    runActive = false;
    cameraShakeIntensity = 0;
    if (typeof tornadoGroup !== 'undefined' && tornadoGroup) tornadoGroup.visible = false;

    const canvas = renderer?.domElement || document.querySelector('canvas');
    for (const child of [...document.body.children]) {
      if (child === canvas || child.contains?.(canvas) || child.tagName === 'SCRIPT' || child.tagName === 'STYLE') continue;
      child.style.visibility = 'hidden';
    }

    visual.updateMatrixWorld(true);
    const focus = new THREE.Vector3();
    hips.getWorldPosition(focus);
    const distance = 7.6;
    const viewDirection = new THREE.Vector3(0.72, 0.24, 1).normalize();
    camera.position.copy(focus).addScaledVector(viewDirection, distance);
    camera.lookAt(focus);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
    renderer.render(scene, camera);
    const focusNdc = focus.clone().project(camera);
    const runtime = globalThis.__SW_COW17_RUNTIME_ASSET__?.getSnapshot?.() || null;
    const diagnosticBox = new THREE.Box3().setFromObject(visual);
    const diagnosticSize = new THREE.Vector3();
    diagnosticBox.getSize(diagnosticSize);
    return {
      id: cow.id,
      assetId: cow.mesh.userData.swCow17AuthoredAssetId || null,
      intendedHeight: runtime?.activeHeight || 0,
      diagnosticSize: { x: diagnosticSize.x, y: diagnosticSize.y, z: diagnosticSize.z },
      focus: { x: focus.x, y: focus.y, z: focus.z },
      framing: { centerX: focusNdc.x, centerY: focusNdc.y },
      cowRootPosition: { x: cow.mesh.position.x, y: cow.mesh.position.y, z: cow.mesh.position.z },
      cameraPosition: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
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
    return state?.loadSuccesses >= 1
      && state?.appliedCount >= 1
      && state?.cleanupCount >= 1
      && state?.registrations >= 2
      && state?.activeCowId === 17
      && state?.activeAnimation === 'Armature|walking_man|baselayer'
      && state?.activeJointCount === 24
      && state?.activeTriangleCount === 198050
      && state?.fallbackVisible === false
      && cow?.mesh?.userData?.swCow17AuthoredAssetId === 'character.cow17.walking.v1'
      && Boolean(visual);
  });
  await success.page.waitForFunction(() => globalThis.__SW_COW17_RUNTIME_ASSET__?.getSnapshot?.().animationTicks >= 8);
  report.success = await snapshot(success.page);
  report.animationProbe = await animationProbe(success.page);
  await success.page.screenshot({ path: path.join(outputDir, 'cow17-authored-gameplay.png'), fullPage: true });
  report.visualProbe = await focusCow17(success.page);
  await success.page.waitForTimeout(80);
  await success.page.evaluate(() => renderer.render(scene, camera));
  await success.page.screenshot({ path: path.join(outputDir, 'cow17-authored-focused.png'), fullPage: true });

  requireCondition(report.success.revision === '128', `Three.js revision changed: ${report.success.revision}.`);
  requireCondition(report.success.runtime?.version === 'SW_COW17_RUNTIME_ASSET_V1', `Cow 17 runtime version mismatch: ${report.success.runtime?.version}.`);
  requireCondition(report.success.runtime?.loadFailures === 0, `Successful Cow 17 path recorded ${report.success.runtime?.loadFailures} load failures.`);
  requireCondition(report.success.runtime?.appliedCount >= 1, `Expected at least one Cow 17 authored visual application; got ${report.success.runtime?.appliedCount}.`);
  requireCondition(report.success.runtime?.cleanupCount >= 1, `Expected player-start Cow 17 cleanup/rebind lifecycle; got ${report.success.runtime?.cleanupCount}.`);
  requireCondition(report.success.runtime?.registrations >= 2, `Expected Cow 17 to register before and after player-start rebuild; got ${report.success.runtime?.registrations}.`);
  requireCondition(report.success.runtime?.activeCowId === 17, `Authored runtime attached to unexpected cow id ${report.success.runtime?.activeCowId}.`);
  requireCondition(report.success.runtime?.activeAnimation === 'Armature|walking_man|baselayer', `Unexpected active animation ${report.success.runtime?.activeAnimation}.`);
  requireCondition(report.success.runtime?.activeJointCount === 24, `Unexpected Cow 17 joint count ${report.success.runtime?.activeJointCount}.`);
  requireCondition(report.success.runtime?.activeTriangleCount === 198050, `Unexpected Cow 17 triangle count ${report.success.runtime?.activeTriangleCount}.`);
  requireCondition(report.success.runtime?.activeHeight === 3, `Unexpected Cow 17 visual-local target height ${report.success.runtime?.activeHeight}.`);
  requireCondition(report.success.runtime?.fallbackVisible === false, 'Authored Cow 17 succeeded but runtime still reports fallback visible.');
  requireCondition(report.success.cow?.id === 17 && report.success.cow?.cow17Marker === true, 'Real bovine executor no longer identifies Cow 17 as protected id 17.');
  requireCondition(report.success.cow?.authoredAssetId === 'character.cow17.walking.v1', `Cow 17 root missing authored asset id: ${report.success.cow?.authoredAssetId}.`);
  requireCondition(report.success.cow?.authoredVisualPresent === true, 'Authored Cow 17 visual is not attached to the real cow root.');
  requireCondition(report.success.cow?.rootMaterialVisible === false, 'Primitive Cow 17 root material was not hidden after authored visual success.');
  requireCondition(report.success.cow?.fallbackChildrenVisible === false, 'Primitive Cow 17 decoration remained visible after authored visual success.');
  requireCondition(report.success.bovine?.invariant === 'Cow injuries: 0', `Cow safety invariant changed: ${report.success.bovine?.invariant}.`);
  requireCondition(report.animationProbe?.tickDelta > 0, `Cow 17 animation mixer did not advance; tick delta ${report.animationProbe?.tickDelta}.`);
  requireCondition(report.animationProbe?.secondsDelta > 0, `Cow 17 animation time did not advance; seconds delta ${report.animationProbe?.secondsDelta}.`);
  requireCondition(report.animationProbe?.hipsChanged === true, 'Cow 17 Hips transform did not change while the real runtime animation advanced.');
  requireCondition(report.visualProbe?.id === 17 && report.visualProbe?.assetId === 'character.cow17.walking.v1', 'Focused proof is not using the active authored Cow 17.');
  requireCondition(Number(report.visualProbe?.intendedHeight) === 3, `Focused Cow 17 target height drifted: ${report.visualProbe?.intendedHeight}.`);
  requireCondition(Math.abs(Number(report.visualProbe?.framing?.centerX)) <= 0.05, `Focused Cow 17 Hips target is too far off-center horizontally: ${report.visualProbe?.framing?.centerX}.`);
  requireCondition(Math.abs(Number(report.visualProbe?.framing?.centerY)) <= 0.05, `Focused Cow 17 Hips target is too far off-center vertically: ${report.visualProbe?.framing?.centerY}.`);
  requireCondition(Number(report.success.resource?.decodedBodySize || 0) === 14412828 || Number(report.success.resource?.transferSize || 0) >= 14412828, `Cow 17 resource timing did not report the expected 14,412,828-byte asset: ${JSON.stringify(report.success.resource)}.`);
  if (success.errors.length) report.failures.push(`Success-path browser errors: ${success.errors.join(' | ')}`);
} finally {
  await writeFile(path.join(outputDir, 'cow17-success-browser.log'), `${success.logs.join('\n')}\n`, 'utf8');
  await success.page.close();
}

const fallback = await makePage();
try {
  await fallback.page.route('**/assets/production/characters/cow17-walking-v1.glb', async (route) => {
    await route.fulfill({ status: 404, contentType: 'application/octet-stream', body: 'Cow 17 QA fallback probe' });
  });
  await fallback.page.goto(`${qaUrl}?qa=1&intro=0&identity=1&cow17Fallback=1`, { waitUntil: 'domcontentloaded' });
  await fallback.page.waitForFunction(() => typeof globalThis.__SW_COW17_RUNTIME_ASSET__?.getSnapshot === 'function');
  await dismissIntroAndStart(fallback.page);
  await fallback.page.waitForFunction(() => {
    const state = globalThis.__SW_COW17_RUNTIME_ASSET__?.getSnapshot?.();
    return state?.generation >= 2 && state?.registrations >= 2 && state?.loadFailures >= 2 && state?.fallbackVisible === true;
  });
  report.fallback = await snapshot(fallback.page);
  await fallback.page.screenshot({ path: path.join(outputDir, 'cow17-fallback-gameplay.png'), fullPage: true });

  requireCondition(report.fallback.revision === '128', `Fallback page Three.js revision changed: ${report.fallback.revision}.`);
  requireCondition(report.fallback.runtime?.loadSuccesses === 0, `Fallback path unexpectedly loaded authored Cow 17 ${report.fallback.runtime?.loadSuccesses} time(s).`);
  requireCondition(report.fallback.runtime?.appliedCount === 0, `Fallback path unexpectedly applied authored Cow 17 ${report.fallback.runtime?.appliedCount} time(s).`);
  requireCondition(report.fallback.runtime?.fallbackVisible === true, 'Cow 17 primitive fallback is not reported visible after asset failure.');
  requireCondition(String(report.fallback.runtime?.lastError || '').includes('HTTP 404'), `Fallback did not record expected HTTP 404: ${report.fallback.runtime?.lastError}.`);
  requireCondition(report.fallback.cow?.id === 17 && report.fallback.cow?.cow17Marker === true, 'Fallback path lost the real Cow 17 gameplay identity.');
  requireCondition(report.fallback.cow?.authoredAssetId === null, `Fallback path reports authored asset id ${report.fallback.cow?.authoredAssetId}.`);
  requireCondition(report.fallback.cow?.authoredVisualPresent === false, 'Fallback path retained an authored Cow 17 visual after load failure.');
  requireCondition(report.fallback.cow?.rootMaterialVisible === true, 'Fallback Cow 17 root primitive is hidden after load failure.');
  requireCondition(report.fallback.cow?.fallbackChildrenVisible === true, 'Fallback Cow 17 decoration is hidden after load failure.');
  requireCondition(report.fallback.bovine?.invariant === 'Cow injuries: 0', `Fallback cow safety invariant changed: ${report.fallback.bovine?.invariant}.`);
  if (fallback.errors.length) {
    const unexpectedErrors = fallback.errors.filter((line) => !line.includes('404'));
    if (unexpectedErrors.length) report.failures.push(`Fallback-path unexpected browser errors: ${unexpectedErrors.join(' | ')}`);
  }
} finally {
  await writeFile(path.join(outputDir, 'cow17-fallback-browser.log'), `${fallback.logs.join('\n')}\n`, 'utf8');
  await fallback.page.close();
}

await browser.close();
report.passed = report.failures.length === 0;
await writeFile(path.join(outputDir, 'sw-art-009-cow17-runtime-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`SW-ART-009 Cow 17 browser QA ${report.passed ? 'PASS' : 'FAIL'}; applied=${report.success?.runtime?.appliedCount ?? 0}; animationTicks=${report.success?.runtime?.animationTicks ?? 0}; fallbackFailures=${report.fallback?.runtime?.loadFailures ?? 0}.`);
if (!report.passed) {
  report.failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
