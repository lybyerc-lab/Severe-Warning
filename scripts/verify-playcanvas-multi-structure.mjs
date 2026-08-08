import { readFile, writeFile } from 'node:fs/promises';

const files = {
  authorityBridge: 'runtime/playcanvas-authority-bridge.js',
  authorityClient: 'playcanvas-slice/src/authority-client.ts',
  entry: 'playcanvas-slice/src/main.ts',
  structures: 'playcanvas-slice/src/multi-structure-destruction.ts',
  stormForce: 'playcanvas-slice/src/storm-force-field.ts',
  scene: 'playcanvas-slice/src/scene.ts',
  qa: 'scripts/qa-playcanvas-multi-structure.mjs',
  workflow: '.github/workflows/playcanvas-production-slice.yml',
};

const contents = Object.fromEntries(
  await Promise.all(Object.entries(files).map(async ([key, path]) => [key, await readFile(path, 'utf8')])),
);

const checks = [];
const check = (name, passed, detail) => checks.push({ name, passed, detail });

check(
  'authority-selects-four-real-targets',
  contents.authorityBridge.includes('[SW:PLAYCANVAS:MULTI_STRUCTURE_AUTHORITY]')
    && contents.authorityBridge.includes("id: 'storefront', district: 0, isCommercial: true")
    && contents.authorityBridge.includes("id: 'house', district: 1, isCommercial: false")
    && contents.authorityBridge.includes("id: 'industrial', district: 2, isCommercial: true")
    && contents.authorityBridge.includes("id: 'barn', district: 3, isCommercial: false")
    && contents.authorityBridge.includes('for (const target of targets)')
    && contents.authorityBridge.includes('if (!target || target.isTree) continue;'),
  'the four archetypes are deterministic non-tree targets from the accepted Living County target array',
);

check(
  'authority-exposes-real-damage-state',
  contents.authorityBridge.includes('health: Number(selected.health)')
    && contents.authorityBridge.includes('maxHealth: Number(selected.maxHealth ?? selected.health)')
    && contents.authorityBridge.includes('damageStage: Number(selected.damageStage)')
    && contents.authorityBridge.includes('destroyed: Boolean(selected.destroyed)')
    && contents.authorityBridge.includes('points: Number(selected.points ?? selected.meshData?.points)'),
  'snapshot carries accepted health, stage, destruction, and points state',
);

check(
  'typed-structure-contract',
  contents.authorityClient.includes("AuthorityStructureArchetype = 'storefront' | 'house' | 'industrial' | 'barn'")
    && contents.authorityClient.includes('readonly structures: readonly AuthorityStructureSnapshot[];'),
  'PlayCanvas client types the bounded structure authority seam',
);

check(
  'renderer-never-owns-legacy-damage',
  !contents.entry.includes('damageTarget(')
    && !contents.structures.includes('damageTarget(')
    && !contents.entry.includes('destroyTarget(')
    && !contents.structures.includes('destroyTarget(')
    && !contents.entry.includes('addScore(')
    && !contents.structures.includes('addScore(')
    && !contents.entry.includes('.health =')
    && !contents.structures.includes('.health ='),
  'renderer cannot mutate accepted HP, destruction, or scoring',
);

check(
  'presentation-mirrors-authority',
  contents.structures.includes('class MultiStructurePresentation')
    && contents.structures.includes('snapshot.damageStage')
    && contents.structures.includes('snapshot.destroyed')
    && contents.structures.includes('part.entity.enabled = !destroyed'),
  'visible stages are downstream of authority snapshots',
);

check(
  'staged-anatomy-and-damage-wounds',
  contents.structures.includes('[SW:PLAYCANVAS:STRUCTURE_ANATOMY]')
    && contents.structures.includes("type StructurePartRole = 'body' | 'roof' | 'accent' | 'wound'")
    && contents.structures.includes('showFromStage')
    && contents.structures.includes('hideAtStage')
    && contents.structures.includes('visibleWoundParts')
    && contents.structures.includes("addCore('wound-dark'")
    && contents.structures.includes("addCore('roof-left'")
    && contents.structures.includes("addCore('window-left'")
    && contents.structures.includes("addCore('loading-door'"),
  'representative structures expose readable anatomy and stage-driven wounds instead of box-only collapse',
);

check(
  'structure-mass-hierarchy-contract',
  contents.structures.includes('[SW:PLAYCANVAS:STRUCTURE_MASS_HIERARCHY]')
    && contents.structures.includes("type DebrisWeightClass = 'light' | 'roof' | 'wall' | 'frame' | 'industrial'")
    && contents.structures.includes('const DEBRIS_PROFILES')
    && contents.structures.includes("0.9, 'light'")
    && contents.structures.includes("4.8, 'roof'")
    && contents.structures.includes("8.5, 'wall'")
    && contents.structures.includes("14.0, 'frame'")
    && contents.structures.includes("24.0, 'industrial'")
    && contents.structures.includes('maxHorizontalSpeed')
    && contents.structures.includes('maxVerticalSpeed'),
  'light/roof/wall/frame/industrial pieces have explicit increasing inertia and bounded speed profiles',
);

check(
  'structure-flight-envelope-contract',
  contents.structures.includes('[SW:PLAYCANVAS:STRUCTURE_FLIGHT_ENVELOPE]')
    && contents.structures.includes('softHeight')
    && contents.structures.includes('softTravel')
    && contents.structures.includes('heightBrake')
    && contents.structures.includes('travelBrake')
    && contents.structures.includes('const heightExcess = Math.max(0, body.y - profile.softHeight)')
    && contents.structures.includes('const travelExcess = Math.max(0, horizontalTravel - profile.softTravel)')
    && contents.structures.includes('const verticalBrake = heightExcess * profile.heightBrake'),
  'structure debris uses soft drag envelopes instead of hard position clamps or unbounded ballistic flight',
);

check(
  'structure-debris-isolated-from-tree-force',
  contents.structures.includes('[SW:PLAYCANVAS:STRUCTURE_DEBRIS_FIELD]')
    && contents.structures.includes('class StructureDebrisField')
    && !contents.stormForce.includes('StructureDebrisField')
    && !contents.scene.includes("kind: 'structure-debris'"),
  'Run 53 tree/light-prop force registry stays isolated from new structure chunks',
);

check(
  'debris-activation-requires-authority-stage',
  contents.structures.includes('snapshot.destroyed || snapshot.damageStage >= body.activationStage')
    && contents.structures.includes('body.entity.enabled = true')
    && contents.structures.includes('body.entity.enabled = false'),
  'chunks stay hidden until accepted stage/destruction state activates them',
);

check(
  'accepted-ability-gates-structure-force',
  contents.entry.includes('[SW:PLAYCANVAS:MULTI_STRUCTURE_EXECUTOR_INTEGRATION]')
    && contents.entry.includes('const result = authority.requestAbility(slot, source)')
    && contents.entry.includes('if (result.accepted) {')
    && contents.entry.includes('structureDebris.triggerAbility(slot, forceInput)')
    && contents.entry.indexOf('structureDebris.triggerAbility(slot, forceInput)') > contents.entry.indexOf('const result = authority.requestAbility(slot, source)'),
  'Pull/Gust structure impulses are downstream of the accepted ability executor',
);

check(
  'qa-uses-accepted-movement-and-visible-abilities',
  contents.qa.includes("document.querySelector('#playcanvas-authority-frame')")
    && contents.qa.includes('bridge.setJoystick(')
    && contents.qa.includes('page.locator(`[data-ability="${slot}"]`).click()')
    && contents.qa.includes("ensureAuthoritativeDamage('storefront')")
    && contents.qa.includes("ensureAuthoritativeDamage('house')"),
  'browser setup steers the real authority and fires visible controls',
);

check(
  'qa-cannot-bypass-damage-or-physics',
  !contents.qa.includes('damageTarget(')
    && !contents.qa.includes('destroyTarget(')
    && !contents.qa.includes('addScore(')
    && !contents.qa.includes('new StructureDebrisField')
    && !contents.qa.includes('structureDebris.triggerAbility')
    && !contents.qa.includes('new StormForceField')
    && !contents.qa.includes('stormPhysics.triggerAbility'),
  'browser QA cannot directly invoke damage, score, or renderer force helpers',
);

check(
  'qa-demands-two-damaged-one-destroyed-and-score',
  contents.qa.includes("name: 'at-least-two-structures-authoritatively-damaged'")
    && contents.qa.includes("name: 'storefront-destroyed-through-accepted-gameplay'")
    && contents.qa.includes("name: 'destruction-score-grows-through-authority'")
    && contents.qa.includes("name: 'presentation-matches-authority'")
    && contents.qa.includes("name: 'authoritative-stage-activates-structure-debris'")
    && contents.qa.includes("name: 'reset-restores-authoritative-structures'"),
  'browser proof blocks on actual destruction, scoring, mirror truth, debris, and reset',
);

check(
  'qa-demands-anatomy-breakup-and-weight-response',
  contents.qa.includes("version: 'PLAYCANVAS_MULTI_STRUCTURE_QA_V3'")
    && contents.qa.includes("name: 'intact-building-anatomy-readable'")
    && contents.qa.includes("name: 'five-debris-weight-classes-declared'")
    && contents.qa.includes("name: 'damage-stage-reveals-wound-and-detaches-anatomy'")
    && contents.qa.includes("name: 'light-debris-outtravels-heavy-frame'")
    && contents.qa.includes('signBody.peakDisplacement')
    && contents.qa.includes('frameBody.peakDisplacement'),
  'browser proof requires visible staged breakup plus a measured mass hierarchy under real accepted play',
);

check(
  'qa-bounds-light-debris-flight',
  contents.qa.includes("name: 'light-debris-flight-stays-readable'")
    && contents.qa.includes("name: 'structure-flight-envelope-bounded'")
    && contents.qa.includes('Number(signBody.peakDisplacement) < 45')
    && contents.qa.includes('Number(signBody.peakHeight) < 32')
    && contents.qa.includes('maxDisplacement ?? Infinity) < 50')
    && contents.qa.includes('maxHeight ?? Infinity) < 35'),
  'browser proof rejects the Run 77 satellite-debris failure even when light debris still out-travels heavy pieces',
);

check(
  'qa-protects-cow-and-errors',
  contents.qa.includes("name: 'cow17-remains-safe'")
    && contents.qa.includes("name: 'no-console-errors-multi-structure'")
    && contents.qa.includes("name: 'no-page-errors-multi-structure'"),
  'safe-animal and runtime-error boundaries remain blocking',
);

check(
  'workflow-runs-multi-structure-gates',
  contents.workflow.includes('verify-playcanvas-multi-structure.mjs')
    && contents.workflow.includes('qa-playcanvas-multi-structure.mjs')
    && contents.workflow.includes('playcanvas-multi-structure-report.json')
    && contents.workflow.includes('playcanvas-multi-structure-intact.png')
    && contents.workflow.includes('playcanvas-multi-structure-damage.png')
    && contents.workflow.includes('playcanvas-multi-structure-destroyed.png'),
  'repository-owned CI blocks on multi-structure static, behavior, report, and screenshots',
);

const failed = checks.filter((item) => !item.passed);
const report = {
  passed: failed.length === 0,
  checks,
  failedChecks: failed.map((item) => item.name),
};
await writeFile('playcanvas-multi-structure-static-report.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failed.length > 0) process.exit(1);
