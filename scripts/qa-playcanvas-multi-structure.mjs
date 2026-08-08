import { mkdir, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { chromium } from 'playwright';

const url = process.env.PLAYCANVAS_SLICE_URL ?? 'http://127.0.0.1:4175/?qa=1';
const evidenceDir = 'playcanvas-slice-evidence';
const EXPECTED_IDS = ['storefront', 'house', 'industrial', 'barn'];
const DEBRIS_CLASSES = ['trim', 'roof', 'wall', 'frame'];
await mkdir(evidenceDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1365, height: 630 }, deviceScaleFactor: 1 });
const consoleErrors = [];
const pageErrors = [];
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => pageErrors.push(error.message));

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitFrames(frameCount = 8) {
  await page.evaluate((count) => new Promise((resolve) => {
    let remaining = count;
    const step = () => {
      remaining -= 1;
      if (remaining <= 0) {
        resolve();
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), frameCount);
}

async function readState() {
  return page.evaluate(() => {
    const handle = globalThis.__SW_PLAYCANVAS_SLICE__;
    return {
      authority: handle?.getAuthoritySnapshot() ?? null,
      presentation: handle?.getStructurePresentationTelemetry() ?? null,
      debris: handle?.getStructureDebrisTelemetry() ?? null,
      data: { ...document.documentElement.dataset },
    };
  });
}

function byId(state, id) {
  return state?.authority?.structures?.find((structure) => structure.id === id) ?? null;
}

function summarizeDebris(initialState, state) {
  const initialBodies = new Map((initialState?.debris?.bodies ?? []).map((body) => [body.id, body]));
  const activeBodies = (state?.debris?.bodies ?? []).filter((body) => body.active);
  const classes = Object.fromEntries(DEBRIS_CLASSES.map((debrisClass) => {
    const bodies = activeBodies.filter((body) => body.debrisClass === debrisClass);
    const masses = bodies.map((body) => Number(body.mass));
    const horizontal = bodies.map((body) => Number(body.horizontalDisplacement));
    const rises = bodies.map((body) => {
      const initial = initialBodies.get(body.id);
      return Number(body.peakHeight) - Number(initial?.peakHeight ?? body.peakHeight);
    });
    return [debrisClass, {
      count: bodies.length,
      minMass: bodies.length ? Math.min(...masses) : null,
      maxMass: bodies.length ? Math.max(...masses) : null,
      maxHorizontal: bodies.length ? Math.max(...horizontal) : 0,
      maxRise: bodies.length ? Math.max(...rises) : 0,
      bodies,
    }];
  }));
  return { activeCount: activeBodies.length, activeBodies, classes };
}

async function driveAcceptedStormTo(id, timeoutMs = 18_000) {
  return page.evaluate(async ({ targetId, timeout }) => {
    const handle = globalThis.__SW_PLAYCANVAS_SLICE__;
    const frame = document.querySelector('#playcanvas-authority-frame');
    const bridge = frame?.contentWindow?.__SW_PLAYCANVAS_AUTHORITY__;
    if (!handle || !bridge) throw new Error('Accepted authority movement bridge is unavailable.');

    const startedAt = performance.now();
    let lastDistance = Infinity;
    while (performance.now() - startedAt < timeout) {
      const snapshot = handle.getAuthoritySnapshot();
      const target = snapshot?.structures?.find((structure) => structure.id === targetId);
      if (!snapshot || !target) throw new Error(`Missing authoritative structure ${targetId}.`);
      const dx = target.x - snapshot.storm.x;
      const dz = target.z - snapshot.storm.z;
      const distance = Math.hypot(dx, dz);
      lastDistance = distance;
      const stopDistance = Math.max(0.9, snapshot.storm.radius * 0.58);
      if (distance <= stopDistance) {
        bridge.setJoystick(0, 0, false);
        return { reached: true, distance, stopDistance };
      }
      const length = Math.max(0.001, distance);
      bridge.setJoystick(dx / length, dz / length, true);
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    bridge.setJoystick(0, 0, false);
    return { reached: false, distance: lastDistance, stopDistance: null };
  }, { targetId: id, timeout: timeoutMs });
}

async function clickVisibleAbilityWhenReady(slot, timeoutMs = 12_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const snapshot = (await readState()).authority;
    const remaining = Number(snapshot?.cooldowns?.[slot] ?? Infinity);
    if (remaining <= 0.05) {
      const before = Number((await readState()).data.swPlaycanvasAbilityAcceptedCount ?? 0);
      await page.locator(`[data-ability="${slot}"]`).click();
      await waitFrames(3);
      const after = await readState();
      const acceptedCount = Number(after.data.swPlaycanvasAbilityAcceptedCount ?? 0);
      return {
        accepted: after.data.swPlaycanvasLastAbility === slot
          && after.data.swPlaycanvasLastAbilityAccepted === 'true'
          && acceptedCount === before + 1,
        before,
        after: acceptedCount,
      };
    }
    await sleep(100);
  }
  return { accepted: false, before: null, after: null };
}

async function waitForStructure(id, predicate, timeoutMs = 16_000) {
  const startedAt = Date.now();
  let last = await readState();
  while (Date.now() - startedAt < timeoutMs) {
    last = await readState();
    const structure = byId(last, id);
    if (structure && predicate(structure, last)) return { matched: true, state: last, structure };
    await sleep(120);
  }
  return { matched: false, state: last, structure: byId(last, id) };
}

async function ensureAuthoritativeDamage(id) {
  const before = await readState();
  const initial = byId(before, id);
  if (!initial) throw new Error(`Missing initial authoritative structure ${id}.`);
  const drive = await driveAcceptedStormTo(id);
  if (!drive.reached) throw new Error(`Accepted storm could not reach ${id}; final distance=${drive.distance}.`);

  const gust = await clickVisibleAbilityWhenReady('secondary');
  if (!gust.accepted) throw new Error(`Visible Gust was not accepted near ${id}.`);

  const damaged = await waitForStructure(
    id,
    (structure) => structure.health < initial.health - 0.5 || structure.damageStage > initial.damageStage || structure.destroyed,
    8_000,
  );
  return { initial, drive, gust, damaged };
}

let report;
try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90_000 });
  await page.waitForFunction(() => document.documentElement.dataset.swPlaycanvasSliceReady === 'true', null, { timeout: 90_000 });
  await waitFrames(10);

  await page.evaluate(() => globalThis.__SW_PLAYCANVAS_SLICE__?.reset());
  await waitFrames(10);
  const initial = await readState();
  await page.screenshot({ path: `${evidenceDir}/playcanvas-multi-structure-intact.png`, fullPage: true });

  const ids = initial.authority?.structures?.map((structure) => structure.id) ?? [];
  const bindingIds = initial.presentation?.bindings?.map((binding) => binding.id) ?? [];
  const allInsideWorld = Boolean(initial.presentation)
    && initial.presentation.bindings.every((binding) => Math.abs(binding.x) <= 88 && Math.abs(binding.z) <= 88);
  const initialHealth = Object.fromEntries(
    (initial.authority?.structures ?? []).map((structure) => [structure.id, structure.health]),
  );
  const initialScore = Number(initial.authority?.score?.destructionScore ?? 0);

  const storefrontDamage = await ensureAuthoritativeDamage('storefront');
  if (!storefrontDamage.damaged.matched) {
    throw new Error(`Storefront did not take authoritative damage. health=${storefrontDamage.damaged.structure?.health}`);
  }
  await waitFrames(6);
  await page.screenshot({ path: `${evidenceDir}/playcanvas-multi-structure-damage.png`, fullPage: true });

  const pull = await clickVisibleAbilityWhenReady('primary');
  if (!pull.accepted) throw new Error('Visible Pull was not accepted after structure damage.');
  await waitFrames(20);

  let storefrontDestroyed = await waitForStructure('storefront', (structure) => structure.destroyed, 4_000);
  for (let attempt = 0; !storefrontDestroyed.matched && attempt < 4; attempt += 1) {
    const gust = await clickVisibleAbilityWhenReady('secondary', 12_000);
    if (!gust.accepted) break;
    storefrontDestroyed = await waitForStructure('storefront', (structure) => structure.destroyed, 4_000);
  }
  if (!storefrontDestroyed.matched) {
    throw new Error(`Storefront never reached authoritative destruction. health=${storefrontDestroyed.structure?.health}`);
  }
  await waitFrames(20);
  const destroyedState = await readState();
  const massHierarchy = summarizeDebris(initial, destroyedState);
  await page.screenshot({ path: `${evidenceDir}/playcanvas-multi-structure-destroyed.png`, fullPage: true });

  const houseDamage = await ensureAuthoritativeDamage('house');
  if (!houseDamage.damaged.matched) {
    throw new Error(`House did not take authoritative damage. health=${houseDamage.damaged.structure?.health}`);
  }
  await waitFrames(8);

  const afterDamage = await readState();
  const changedIds = EXPECTED_IDS.filter((id) => {
    const structure = byId(afterDamage, id);
    return structure && structure.health < Number(initialHealth[id] ?? structure.health) - 0.5;
  });
  const scoreAfterDestruction = Number(afterDamage.authority?.score?.destructionScore ?? 0);
  const presentationMatchesAuthority = EXPECTED_IDS.every((id) => {
    const structure = byId(afterDamage, id);
    const binding = afterDamage.presentation?.bindings?.find((item) => item.id === id);
    if (!structure || !binding) return false;
    return binding.destroyed === structure.destroyed
      && binding.damageStage === Math.min(2, Math.max(0, structure.damageStage))
      && Math.abs(binding.health - structure.health) < 0.01;
  });
  const debrisActivated = Number(afterDamage.debris?.activationCount ?? 0) > 0
    && Number(afterDamage.debris?.activeCount ?? 0) > 0;
  const debrisMoved = Number(afterDamage.debris?.maxDisplacement ?? 0) > 0.15;

  const trim = massHierarchy.classes.trim;
  const roof = massHierarchy.classes.roof;
  const wall = massHierarchy.classes.wall;
  const frame = massHierarchy.classes.frame;
  const massOrder = Number(trim.minMass) < Number(roof.minMass)
    && Number(roof.minMass) < Number(wall.minMass)
    && Number(wall.minMass) < Number(frame.minMass);
  const heavyTrailsLight = trim.maxHorizontal > frame.maxHorizontal + 0.25;
  const roofLiftsMoreThanFrame = roof.maxRise > frame.maxRise + 0.15;

  const resetSnapshot = await page.evaluate(() => globalThis.__SW_PLAYCANVAS_SLICE__?.reset() ?? null);
  await waitFrames(12);
  const afterReset = await readState();
  const resetStructuresIntact = EXPECTED_IDS.every((id) => {
    const structure = byId(afterReset, id);
    return Boolean(structure)
      && structure.destroyed === false
      && structure.damageStage === 0
      && Math.abs(structure.health - structure.maxHealth) < 0.05;
  });
  const resetPresentationIntact = afterReset.presentation?.damagedCount === 0
    && afterReset.presentation?.destroyedCount === 0;
  const resetDebrisClean = afterReset.debris?.activeCount === 0
    && afterReset.debris?.bodies?.every((body) => !body.active && !body.airborne && body.displacement < 0.02);

  const cowSafe = afterReset.authority?.cow17?.safe === true;
  const checks = [
    { name: 'four-authoritative-structures-bound', passed: EXPECTED_IDS.every((id) => ids.includes(id)) && ids.length === 4, detail: { ids } },
    { name: 'four-presentation-bindings-bound', passed: EXPECTED_IDS.every((id) => bindingIds.includes(id)) && bindingIds.length === 4, detail: { bindingIds } },
    { name: 'structures-inside-test-world', passed: allInsideWorld, detail: initial.presentation?.bindings ?? [] },
    { name: 'storefront-damaged-through-accepted-gameplay', passed: storefrontDamage.damaged.matched, detail: storefrontDamage.damaged.structure },
    { name: 'storefront-destroyed-through-accepted-gameplay', passed: storefrontDestroyed.matched, detail: storefrontDestroyed.structure },
    { name: 'second-distinct-structure-damaged', passed: houseDamage.damaged.matched && changedIds.includes('house'), detail: { changedIds, house: houseDamage.damaged.structure } },
    { name: 'at-least-two-structures-authoritatively-damaged', passed: changedIds.length >= 2, detail: { changedIds } },
    { name: 'destruction-score-grows-through-authority', passed: scoreAfterDestruction > initialScore, detail: { initialScore, scoreAfterDestruction } },
    { name: 'presentation-matches-authority', passed: presentationMatchesAuthority, detail: { authority: afterDamage.authority?.structures, presentation: afterDamage.presentation?.bindings } },
    { name: 'authoritative-stage-activates-structure-debris', passed: debrisActivated, detail: afterDamage.debris },
    { name: 'accepted-pull-moves-detached-structure-debris', passed: pull.accepted && debrisMoved && Number(afterDamage.debris?.pullAcceptedCount ?? 0) >= 1, detail: afterDamage.debris },
    { name: 'all-four-structure-debris-classes-activate', passed: DEBRIS_CLASSES.every((debrisClass) => massHierarchy.classes[debrisClass].count >= 1), detail: massHierarchy.classes },
    { name: 'structure-debris-mass-order-is-readable', passed: massOrder, detail: massHierarchy.classes },
    { name: 'heavy-frame-trails-light-trim', passed: heavyTrailsLight, detail: { trim, frame } },
    { name: 'roof-lifts-more-than-frame', passed: roofLiftsMoreThanFrame, detail: { roof, frame } },
    { name: 'structure-debris-count-remains-bounded', passed: massHierarchy.activeCount >= 5 && massHierarchy.activeCount <= 20, detail: { activeCount: massHierarchy.activeCount } },
    { name: 'reset-restores-authoritative-structures', passed: resetStructuresIntact && Boolean(resetSnapshot), detail: afterReset.authority?.structures },
    { name: 'reset-restores-structure-presentation', passed: resetPresentationIntact, detail: afterReset.presentation },
    { name: 'reset-clears-structure-debris', passed: resetDebrisClean, detail: afterReset.debris },
    { name: 'cow17-remains-safe', passed: cowSafe, detail: afterReset.authority?.cow17 },
    { name: 'no-console-errors-multi-structure', passed: consoleErrors.length === 0, detail: consoleErrors },
    { name: 'no-page-errors-multi-structure', passed: pageErrors.length === 0, detail: pageErrors },
  ];

  const failedChecks = checks.filter((check) => !check.passed).map((check) => check.name);
  report = {
    version: 'PLAYCANVAS_MULTI_STRUCTURE_QA_V2',
    passed: failedChecks.length === 0,
    checks,
    failedChecks,
    evidence: {
      initial,
      storefrontDamage,
      storefrontDestroyed: storefrontDestroyed.structure,
      destroyedState,
      massHierarchy,
      houseDamage,
      afterDamage,
      afterReset,
      changedIds,
      score: { initial: initialScore, afterDestruction: scoreAfterDestruction },
    },
    consoleErrors,
    pageErrors,
  };
} catch (error) {
  report = {
    version: 'PLAYCANVAS_MULTI_STRUCTURE_QA_V2',
    passed: false,
    checks: [],
    failedChecks: ['harness-exception'],
    harnessException: error instanceof Error ? error.stack ?? error.message : String(error),
    consoleErrors,
    pageErrors,
  };
} finally {
  await writeFile(`${evidenceDir}/playcanvas-multi-structure-report.json`, `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
}

console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exit(1);
