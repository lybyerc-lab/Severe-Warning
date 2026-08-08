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
    && contents.structures.includes('stageVisible')
    && contents.structures.includes('!destroyed && stageVisible'),
  'visible stages are downstream of authority snapshots',
);

check(
  'staged-breakup-is-authority-driven',
  contents.structures.includes('[SW:PLAYCANVAS:STAGED_BREAKUP]')
    && contents.structures.includes('visibleFromStage')
    && contents.structures.includes('visibleThroughStage')
    && contents.structures.includes("addCore('interior-wound'")
    && contents.structures.includes("addCore('frame-"),
  'damage stages reveal wounds and frame anatomy without renderer-owned HP',
);

check(
  'building-anatomy-is-readable',
  contents.structures.includes('[SW:PLAYCANVAS:BUILDING_ANATOMY]')
    && contents.structures.includes("addCore('roof-left'")
    && contents.structures.includes("addCore('roof-right'")
    && contents.structures.includes("addCore('window-left'")
    && contents.structures.includes("addCore('glass-left'")
    && contents.structures.includes("addCore('loading-door'")
    && contents.structures.includes("addCore('loft-trim'"),
  'representative structures have silhouette/anatomy cues beyond colored boxes',
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
  'structure-mass-hierarchy-explicit',
  contents.structures.includes('[SW:PLAYCANVAS:STRUCTURE_MASS_HIERARCHY]')
    && contents.structures.includes("StructureDebrisClass = 'trim' | 'roof' | 'wall' | 'frame'")
    && contents.structures.includes('const DEBRIS_PROFILES')
    && contents.structures.includes('liftScale: 1.38')
    && contents.structures.includes('liftScale: 0.24')
    && contents.structures.includes("addDebris('frame-beam'")
    && contents.structures.includes("'frame', 3"),
  'mass hierarchy is explicit and heavy frame pieces are destruction-only debris',
);

check(
  'heavy-structure-motion-is-bounded',
  contents.structures.includes("frame: Object.freeze({")
    && contents.structures.includes('launchVertical: 0.65')
    && contents.structures.includes('gustScale: 0.44')
    && contents.structures.includes('groundDamping: 0.48')
    && contents.structures.includes("body.debrisClass === 'trim' || body.debrisClass === 'roof'"),
  'frame chunks begin heavy/low while trim and roof pieces are allowed to loft',
);

check(
  'mass-telemetry-is-playtest-visible',
  contents.structures.includes('debrisClass: body.debrisClass')
    && contents.structures.includes('mass: body.mass')
    && contents.structures.includes('horizontalDisplacement')
    && contents.structures.includes('peakHeight: body.peakHeight')
    && contents.structures.includes('airborneCount:'),
  'browser playtests can compare class-specific structure motion instead of relying on feel alone',
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
  'qa-demands-readable-mass-hierarchy',
  contents.qa.includes("name: 'all-four-structure-debris-classes-activate'")
    && contents.qa.includes("name: 'structure-debris-mass-order-is-readable'")
    && contents.qa.includes("name: 'heavy-frame-trails-light-trim'")
    && contents.qa.includes("name: 'roof-lifts-more-than-frame'")
    && contents.qa.includes("name: 'structure-debris-count-remains-bounded'")
    && contents.qa.includes("version: 'PLAYCANVAS_MULTI_STRUCTURE_QA_V2'"),
  'browser playtest now blocks on class-specific structure motion and bounded body count',
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
