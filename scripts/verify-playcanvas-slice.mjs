import { readFile, writeFile } from 'node:fs/promises';

const files = {
  entry: 'playcanvas-slice/src/main.ts',
  chaseCamera: 'playcanvas-slice/src/chase-camera.ts',
  stormForceField: 'playcanvas-slice/src/storm-force-field.ts',
  multiStructure: 'playcanvas-slice/src/multi-structure-destruction.ts',
  authorityClient: 'playcanvas-slice/src/authority-client.ts',
  authorityBridge: 'runtime/playcanvas-authority-bridge.js',
  authorityPrep: 'scripts/prepare-playcanvas-authority.mjs',
  engineTypes: 'playcanvas-slice/src/engine-types.ts',
  constants: 'playcanvas-slice/src/constants.ts',
  html: 'playcanvas-slice/index.html',
  scene: 'playcanvas-slice/src/scene.ts',
  vite: 'vite.playcanvas.config.ts',
  tsconfig: 'tsconfig.playcanvas.json',
  fetcher: 'scripts/fetch-playcanvas-engine.mjs',
  browserQa: 'scripts/qa-playcanvas-slice.mjs',
  workflow: '.github/workflows/playcanvas-production-slice.yml',
};

const contents = Object.fromEntries(
  await Promise.all(Object.entries(files).map(async ([key, file]) => [key, await readFile(file, 'utf8')])),
);

const checks = [];
const check = (name, passed, detail) => checks.push({ name, passed, detail });

check('isolated-entry-anchor', contents.entry.includes('[SW:PLAYCANVAS:PRODUCTION_SLICE_ENTRY]'), 'stable slice entry anchor exists');
check('no-threejs-import', !/from\s+['"]three['"]|THREE\./.test(contents.entry + contents.stormForceField + contents.multiStructure), 'visible PlayCanvas slice and force fields do not import or drive Three.js');
check('engine-version-pinned', contents.constants.includes("PLAYCANVAS_VERSION = '2.21.3'"), 'runtime version is exact');
check('vendor-version-pinned', contents.fetcher.includes("const version = '2.21.3'"), 'vendor URL version is exact');
check('vendor-size-gate', contents.fetcher.includes('engine.byteLength < 1_000_000'), 'truncated engine payload fails');
check('optional-checksum-gate', contents.fetcher.includes('PLAYCANVAS_EXPECTED_SHA256'), 'workflow can hard-pin discovered SHA-256');
check('module-version-contract', contents.engineTypes.includes('readonly version: string;'), 'loaded module exposes engine version');
check('module-revision-contract', contents.engineTypes.includes('readonly revision: string;'), 'loaded module exposes engine revision');
check('entity-enabled-contract', contents.engineTypes.includes('enabled: boolean;'), 'structure presentation can explicitly hide intact/detached entities');
check('loaded-version-authority', contents.entry.includes('engineVersion: pc.version') && !contents.entry.includes('engineVersion: PLAYCANVAS_VERSION'), 'telemetry reads loaded PlayCanvas version');
check('loaded-revision-authority', contents.entry.includes('engineRevision: pc.revision'), 'telemetry reads loaded PlayCanvas revision');
check('loaded-version-guard', contents.entry.includes('pc.version !== PLAYCANVAS_VERSION'), 'runtime rejects mismatched engine version');
check('loaded-revision-guard', contents.entry.includes("pc.revision.includes('$_CURRENT_')"), 'runtime rejects unresolved engine revision');
check('authority-version', contents.authorityBridge.includes("PLAYCANVAS_AUTHORITY_VERSION = 'PLAYCANVAS_AUTHORITY_V1'"), 'authority bridge is explicitly versioned');
check('authority-uses-phase3-bridge', contents.authorityBridge.includes('__SW_PHASE3_INPUT_ABILITY_BRIDGE__') && contents.authorityBridge.includes('requestAbility(slot, source)'), 'abilities route through accepted Phase 3 executor bridge');
check('authority-uses-phase4-observation', contents.authorityBridge.includes('__SW_PHASE4_SCORING_CAMPAIGN_BRIDGE__'), 'scoring mirror remains connected to accepted Phase 4 bridge');
check('authority-readonly-storm-telemetry', contents.authorityBridge.includes('x: Number(storm.pos.x)') && contents.authorityBridge.includes('z: Number(storm.pos.z)'), 'PlayCanvas consumes live legacy storm position');
check('authority-bundle-injected', contents.authorityPrep.includes('playcanvas-authority-bridge.js') && contents.workflow.includes('prepare-playcanvas-authority.mjs'), 'same-origin authority bridge is packaged intentionally');
check('authority-client-same-origin', contents.authorityClient.includes("authority/index.html?playcanvasAuthority=1"), 'PlayCanvas page loads bundled same-origin authority');
check('visible-presentation-authority-separation', contents.entry.includes('PlayCanvasAuthorityClient') && contents.entry.includes("gameplayAuthority: 'PLAYCANVAS_AUTHORITY_V1'"), 'visible renderer declares legacy gameplay authority explicitly');

check(
  'multi-structure-authority-contract',
  contents.authorityBridge.includes('[SW:PLAYCANVAS:MULTI_STRUCTURE_AUTHORITY]')
    && contents.authorityBridge.includes("id: 'storefront', district: 0, isCommercial: true")
    && contents.authorityBridge.includes("id: 'house', district: 1, isCommercial: false")
    && contents.authorityBridge.includes("id: 'industrial', district: 2, isCommercial: true")
    && contents.authorityBridge.includes("id: 'barn', district: 3, isCommercial: false")
    && contents.authorityBridge.includes('typeof targets ===')
    && contents.authorityBridge.includes('if (!target || target.isTree) continue;')
    && contents.authorityBridge.includes('structures,'),
  'four deterministic non-tree Living County targets are mirrored through the accepted authority bridge',
);
check(
  'multi-structure-authority-readonly',
  !contents.multiStructure.includes('damageTarget(')
    && !contents.entry.includes('damageTarget(')
    && !contents.multiStructure.includes('.health =')
    && !contents.entry.includes('.health =')
    && !contents.multiStructure.includes('addScore(')
    && !contents.entry.includes('addScore('),
  'renderer owns no legacy structure HP, destruction executor, score, or combo mutation',
);
check(
  'multi-structure-snapshot-typing',
  contents.authorityClient.includes("AuthorityStructureArchetype = 'storefront' | 'house' | 'industrial' | 'barn'")
    && contents.authorityClient.includes('readonly structures: readonly AuthorityStructureSnapshot[];')
    && contents.authorityClient.includes('readonly damageStage: number;')
    && contents.authorityClient.includes('readonly destroyed: boolean;'),
  'typed client carries the authoritative four-structure destruction state',
);
check(
  'multi-structure-visual-contract',
  contents.multiStructure.includes('[SW:PLAYCANVAS:MULTI_STRUCTURE_DESTRUCTION]')
    && contents.multiStructure.includes("['storefront', 'house', 'industrial', 'barn'] as const")
    && contents.multiStructure.includes('class MultiStructurePresentation')
    && contents.multiStructure.includes('snapshot.damageStage')
    && contents.multiStructure.includes('snapshot.destroyed')
    && contents.multiStructure.includes('part.entity.enabled = !destroyed'),
  'four visible archetypes mirror accepted health stages and destruction state',
);
check(
  'multi-structure-tree-force-isolation',
  contents.multiStructure.includes('[SW:PLAYCANVAS:STRUCTURE_DEBRIS_FIELD]')
    && contents.multiStructure.includes('class StructureDebrisField')
    && !contents.stormForceField.includes('StructureDebrisField')
    && !contents.scene.includes("kind: 'structure-debris'"),
  'new structure debris stays outside the frozen tree/light-prop StormForceField registry',
);
check(
  'multi-structure-authority-activation',
  contents.multiStructure.includes('snapshot.destroyed || snapshot.damageStage >= body.activationStage')
    && contents.multiStructure.includes('body.entity.enabled = true')
    && contents.multiStructure.includes('body.entity.enabled = false'),
  'structure chunks are hidden until authoritative stage/destruction activates them and reset hides them again',
);
check(
  'multi-structure-executor-integration',
  contents.entry.includes('[SW:PLAYCANVAS:MULTI_STRUCTURE_EXECUTOR_INTEGRATION]')
    && contents.entry.includes('const result = authority.requestAbility(slot, source)')
    && contents.entry.includes('if (result.accepted) {')
    && contents.entry.includes('structureDebris.triggerAbility(slot, forceInput)')
    && contents.entry.indexOf('structureDebris.triggerAbility(slot, forceInput)') > contents.entry.indexOf('const result = authority.requestAbility(slot, source)')
    && contents.entry.includes('structurePresentation.sync(snapshot.structures, transform)')
    && contents.entry.includes('structureDebris.sync(snapshot.structures, forceInput)'),
  'structure presentation is polled from authority and ability impulses occur only downstream of accepted executor results',
);
check(
  'multi-structure-normal-render-integration',
  contents.entry.includes('structureDebris.update(forceInput, deltaSeconds)')
    && contents.entry.includes('structureDebris.reset(snapshot.structures, transform)')
    && contents.entry.includes('getStructurePresentationTelemetry(): MultiStructurePresentationTelemetry')
    && contents.entry.includes('getStructureDebrisTelemetry(): StructureDebrisTelemetry'),
  'normal render updates, reset, and runtime telemetry all include multi-structure presentation',
);
check(
  'multi-structure-safe-animal-boundary',
  !contents.multiStructure.includes('Cow 17')
    && !contents.multiStructure.includes("'cow'")
    && !contents.authorityBridge.includes("id: 'cow-17'"),
  'multi-structure registry cannot target Cow 17',
);

check(
  'one-stick-chase-camera-contract',
  contents.chaseCamera.includes('[SW:PLAYCANVAS:ONE_STICK_CHASE_CAMERA]')
    && contents.entry.includes('new OneStickChaseCamera')
    && contents.entry.includes('chaseCamera.update(renderTornado.x, renderTornado.z, deltaSeconds)')
    && contents.chaseCamera.includes('setTravelIntent(worldX: number, worldZ: number, active: boolean)')
    && contents.chaseCamera.includes('turnRateRadiansPerSecond')
    && contents.chaseCamera.includes('headingDeadZoneRadians')
    && contents.chaseCamera.includes('movementThreshold')
    && contents.chaseCamera.includes('intentMagnitudeThreshold'),
  'camera heading remains an explicit damped state with immediate one-stick travel intent and observed-travel fallback',
);
check(
  'chase-camera-turn-rate-bounded',
  contents.entry.includes('CHASE_CAMERA_TURN_RATE_RADIANS = 1.05')
    && contents.entry.includes('CHASE_CAMERA_HEADING_DEAD_ZONE_RADIANS = Math.PI * 10 / 180')
    && contents.entry.includes('CHASE_CAMERA_INTENT_MAGNITUDE_THRESHOLD = 0.12')
    && contents.chaseCamera.includes('OWNER_TRAILING_TURN_SCALE = 0.9'),
  'owner-approved 10% trailing response remains frozen',
);
check(
  'chase-camera-map-baseline-plus-owner-trailing-polish',
  contents.entry.includes('INITIAL_CAMERA_OFFSET_X = 30')
    && contents.entry.includes('INITIAL_CAMERA_OFFSET_Z = 36')
    && contents.entry.includes('CHASE_CAMERA_HEIGHT = 28')
    && contents.entry.includes('CHASE_CAMERA_LOOK_Y = 3.6')
    && contents.entry.includes('CHASE_CAMERA_TURN_RATE_RADIANS = 1.05')
    && contents.entry.includes('CHASE_CAMERA_HEADING_DEAD_ZONE_RADIANS = Math.PI * 10 / 180')
    && contents.entry.includes('CHASE_CAMERA_MOVEMENT_THRESHOLD = 0.28')
    && contents.entry.includes('CHASE_CAMERA_INTENT_MAGNITUDE_THRESHOLD = 0.12')
    && contents.chaseCamera.includes('[SW:PLAYCANVAS:OWNER_TRAILING_POLISH]')
    && contents.chaseCamera.includes('OWNER_TRAILING_TURN_SCALE = 0.9')
    && contents.chaseCamera.includes('turnRateRadiansPerSecond * OWNER_TRAILING_TURN_SCALE * safeDelta'),
  'camera/map baseline is preserved during destruction expansion',
);
check(
  'chase-camera-intent-wiring',
  contents.entry.includes('chaseCamera.setTravelIntent(target.x, target.z, active)')
    && contents.entry.includes('mapScreenInput(screen.x, screen.y)')
    && contents.entry.includes('mapScreenInput(0, 0)'),
  'visible controls publish travel intent directly to the chase camera and clear it on release/blur',
);
check('camera-relative-input-contract', contents.entry.includes('chaseCameraAuthorityInput') && contents.entry.includes('chaseCamera.screenToWorldDirection') && contents.entry.includes('transform.unmapDirection'), 'screen-space movement uses current chase-camera basis and is transformed back into accepted authority world axes');
check('keyboard-camera-relative', contents.entry.includes("pressed.has('KeyW')") && contents.entry.includes('applyDirectionalInput()') && contents.entry.includes('authority.setJoystick(authorityVector.x, authorityVector.z, active)'), 'keyboard remains camera-relative and authority-backed');
check('touch-camera-relative', contents.entry.includes('touchVector = Object.freeze') && contents.entry.includes('applyDirectionalInput()'), 'touch stick uses the same chase-camera-relative movement path');
check('camera-reset-contract', contents.entry.includes('chaseCamera.reset(renderTornado.x, renderTornado.z)'), 'run reset restores a deterministic chase-camera heading');

check('ability-buttons-present', ['primary', 'secondary', 'tertiary'].every((slot) => contents.html.includes(`data-ability="${slot}"`)), 'Pull/Gust/Zap controls are present');
check('scoring-hud-present', contents.html.includes('hud-score') && contents.html.includes('hud-combo') && contents.html.includes('hud-time'), 'time, score, and combo HUD is present');
check('destruction-visual-driven-by-authority', contents.entry.includes('applyBarnVisual(scene, snapshot, stormPhysics.isRoofControlled())') && contents.scene.includes('mooBrew'), 'visible Moo-Brew barn state remains authority driven while detached roof ownership can transfer to physics');
check('cow-safe-telemetry', contents.authorityBridge.includes('safe: true') && contents.entry.includes('Cow 17 SAFE'), 'Cow 17 remains explicitly safe in playable slice');
check('vehicle-present', contents.scene.includes('addVehicle'), 'bounded scene includes a vehicle');
check('electrical-target-present', contents.scene.includes('addElectricalTarget'), 'bounded scene includes an electrical target');

check(
  'storm-force-field-anchor',
  contents.stormForceField.includes('[SW:PLAYCANVAS:STORM_FORCE_FIELD]')
    && contents.stormForceField.includes('[SW:PLAYCANVAS:STORM_FORCE_FIELD:END]')
    && contents.entry.includes('new StormForceField(scene.stormPhysicsBodies)'),
  'custom PlayCanvas storm force field is an explicit renderer-side subsystem',
);
check(
  'storm-force-field-game-owned-components',
  contents.stormForceField.includes('const suction =')
    && contents.stormForceField.includes('const swirl =')
    && contents.stormForceField.includes('const lift =')
    && contents.stormForceField.includes('definition.mass')
    && contents.stormForceField.includes('pullBoost')
    && contents.stormForceField.includes('applyGustImpulse'),
  'force law explicitly owns suction, swirl, lift, mass response, Pull amplification, and Gust impulse',
);
check(
  'storm-force-accepted-pull-timing',
  contents.stormForceField.includes('const anticipateDuration = 0.110')
    && contents.stormForceField.includes('const bendDuration = 0.260')
    && contents.stormForceField.includes('const holdDuration = 0.240')
    && contents.stormForceField.includes('const recoverDuration = 0.860')
    && contents.stormForceField.includes('Math.exp(-3.4 * t) * Math.cos(t * Math.PI * 3.8)')
    && contents.stormForceField.includes('2.2 + falloff * 5.8')
    && contents.stormForceField.includes('0.6 + falloff * 1.1'),
  'Pull response carries the physically accepted anticipation, recovery, inward travel, and orbit reference',
);
check(
  'storm-force-accepted-gust-timing',
  contents.stormForceField.includes('const bendDuration = 0.180')
    && contents.stormForceField.includes('const holdDuration = 0.100')
    && contents.stormForceField.includes('const recoverDuration = 0.680')
    && contents.stormForceField.includes('Math.exp(-3.6 * t) * Math.cos(t * Math.PI * 4.0)')
    && contents.stormForceField.includes('1.5 + falloff * 4.5'),
  'Gust response carries the physically accepted tree recovery and light-prop shove reference',
);
check(
  'storm-force-real-executor-integration',
  contents.entry.includes('[SW:PLAYCANVAS:STORM_FORCE_EXECUTOR_INTEGRATION]')
    && contents.entry.includes('const result = authority.requestAbility(slot, source)')
    && contents.entry.includes('if (result.accepted) {')
    && contents.entry.includes('stormPhysics.triggerAbility(slot, forceInput)')
    && contents.entry.indexOf('stormPhysics.triggerAbility(slot, forceInput)') > contents.entry.indexOf('const result = authority.requestAbility(slot, source)'),
  'PlayCanvas ability physics runs only downstream of the accepted executor result',
);
check(
  'storm-force-normal-render-integration',
  contents.entry.includes('stormPhysics.syncBarnState(forceInput)')
    && contents.entry.includes('stormPhysics.update(forceInput, deltaSeconds)')
    && contents.entry.includes('stormPhysics.reset()')
    && contents.entry.includes('stormPhysics.dispose()'),
  'authoritative barn state, normal render updates, reset, and dispose all call the force subsystem',
);
check(
  'storm-force-telemetry-contract',
  contents.entry.includes('getStormPhysicsTelemetry(): StormPhysicsTelemetry')
    && contents.entry.includes('publishStormPhysicsTelemetry')
    && contents.stormForceField.includes('acceptedPullCount')
    && contents.stormForceField.includes('acceptedGustCount')
    && contents.stormForceField.includes('debrisActivationCount')
    && contents.stormForceField.includes('maxRegisteredBodyCount')
    && contents.stormForceField.includes('resetCount')
    && contents.stormForceField.includes('disposeCount'),
  'runtime exposes bounded executor, body, debris, reset, and cleanup telemetry',
);
check(
  'storm-reactive-scene-bodies',
  contents.scene.includes('[SW:PLAYCANVAS:STORM_REACTIVE_SCENE_BODIES]')
    && contents.scene.includes("kind: 'tree'")
    && contents.scene.includes("kind: 'light-prop'")
    && contents.scene.includes("kind: 'barn-debris'")
    && contents.scene.includes("kind: 'barn-roof'")
    && contents.scene.includes('stormPhysicsBodies: Object.freeze([...stormPhysicsBodies])'),
  'bounded Prairie scene contains representative trees, light props, barn debris, and the authoritative roof',
);
check(
  'storm-reactive-safe-animal-exclusion',
  contents.scene.includes('Cow 17 is intentionally excluded')
    && !contents.scene.includes("id: 'cow-17'")
    && !contents.stormForceField.includes("kind: 'cow'"),
  'Cow 17 is not registered as a destructive storm-force body',
);

check(
  'tornado-funnel-upright',
  contents.scene.includes('[SW:PLAYCANVAS:FUNNEL_ORIENTATION]')
    && contents.scene.includes('[1.3, 4.5, 1.3]')
    && contents.scene.includes('[5.8, 2.4, 5.8]')
    && contents.scene.indexOf('[1.3, 4.5, 1.3]') < contents.scene.indexOf('[5.8, 2.4, 5.8]')
    && contents.scene.includes('rotation: [180, 0, 0]'),
  'funnel is narrow at ground contact, broad aloft, and cone points face downward',
);
check('expanded-terrain-footprint', contents.scene.includes("name: 'terrain-slab'") && contents.scene.includes('scale: [190, 0.8, 190]'), 'terrain footprint stays 190x190');
check('connected-road-junctions-contract', contents.scene.includes('const roadAxes = [-45, 0, 45];') && contents.scene.includes('name: `road-ns-${x}`') && contents.scene.includes('name: `road-ew-${z}`'), 'authored road network retains 9 connected junctions');
check('distinct-landmark-blocks-contract', contents.scene.includes('oak-gable-house') && contents.scene.includes('grain-silo-mill') && contents.scene.includes('county-water-tower') && contents.scene.includes('moo-brew-corner-shop'), 'world retains at least 4 orientation landmarks');

check('browser-version-export-check', contents.browserQa.includes('engine-version-exported'), 'browser QA asserts exported engine version');
check('browser-revision-export-check', contents.browserQa.includes('engine-revision-exported'), 'browser QA asserts exported engine revision');
check('browser-visible-control-check', contents.browserQa.includes('joystick-up-moves-screen-forward') && contents.browserQa.includes('keyboard-right-moves-screen-right'), 'browser QA exercises visible movement directions');
check(
  'render-consumed-authority-telemetry-contract',
  contents.entry.includes('targetTornado = transform.map(snapshot.storm.x, snapshot.storm.z)')
    && contents.entry.includes('dataset.swPlaycanvasStormX = snapshot.storm.x.toFixed(3)')
    && contents.entry.includes('dataset.swPlaycanvasStormZ = snapshot.storm.z.toFixed(3)')
    && contents.browserQa.includes('[SW:PLAYCANVAS:RENDER_CONSUMED_AUTHORITY_TELEMETRY]')
    && contents.browserQa.includes('data.swPlaycanvasStormX')
    && contents.browserQa.includes('data.swPlaycanvasStormZ')
    && contents.browserQa.includes('renderConsumedAuthorityDistance(beforeJoystickUp, afterJoystickUp)'),
  'speed-parity QA reads the authority snapshot consumed by syncSnapshot/targetTornado',
);
check(
  'browser-visible-authority-scale-parity',
  contents.browserQa.includes('[SW:PLAYCANVAS:VISIBLE_AUTHORITY_SCALE_PARITY]')
    && contents.browserQa.includes('SEALED_VISIBLE_AUTHORITY_SCALE = 0.7717')
    && contents.browserQa.includes('joystickVisibleAuthorityScale')
    && contents.browserQa.includes("name: 'visible-storm-speed-parity'"),
  'browser speed-parity gate remains sealed',
);
check(
  'browser-camera-turn-frame-step-regression',
  contents.browserQa.includes('[SW:PLAYCANVAS:CAMERA_TURN_STEP_REGRESSION]')
    && contents.browserQa.includes('CAMERA_TURN_FRAME_SAMPLE_COUNT = 24')
    && contents.browserQa.includes('CAMERA_MAX_HEADING_STEP_RADIANS = 0.13')
    && contents.browserQa.includes('sampleCameraHeadings()')
    && contents.browserQa.includes('headingStepMetrics(keyboardHeadingSamples)')
    && contents.browserQa.includes('keyboardHeadingStepMetrics.maxStep <= CAMERA_MAX_HEADING_STEP_RADIANS')
    && contents.browserQa.includes('keyboardHeadingStepMetrics.turningStepCount >= 3'),
  'gradual-turn browser gate still bounds each rendered camera heading step',
);
check(
  'browser-chase-camera-check',
  contents.browserQa.includes('camera-stays-stable-on-forward-input')
    && contents.browserQa.includes('camera-turns-gradually-behind-keyboard-motion')
    && contents.browserQa.includes('camera-distance-stable-joystick')
    && contents.browserQa.includes('camera-distance-stable-keyboard'),
  'browser QA retains camera baseline gates',
);
check(
  'browser-visible-storm-physics-check',
  contents.browserQa.includes('[SW:PLAYCANVAS:VISIBLE_STORM_PHYSICS_REGRESSION]')
    && contents.browserQa.includes("clickVisibleAbility('primary')")
    && contents.browserQa.includes("clickVisibleAbility('secondary')")
    && contents.browserQa.includes("name: 'pull-trees-react-inward'")
    && contents.browserQa.includes("name: 'pull-light-props-orbit'")
    && contents.browserQa.includes("name: 'gust-trees-react-outward'")
    && contents.browserQa.includes("name: 'gust-light-props-move-outward'"),
  'browser QA drives visible Pull/Gust controls and observes actual force telemetry',
);
check(
  'browser-debris-and-reset-check',
  contents.browserQa.includes("name: 'authoritative-damage-activates-debris'")
    && contents.browserQa.includes("name: 'storm-field-moves-detached-debris'")
    && contents.browserQa.includes("name: 'physics-reset-clears-active-bodies'")
    && contents.browserQa.includes("name: 'dispose-physics-telemetry-cleared'"),
  'browser QA proves authoritative debris activation plus reset/dispose cleanup',
);
check(
  'browser-no-force-helper-bypass',
  !contents.browserQa.includes('stormPhysics.triggerAbility')
    && !contents.browserQa.includes('new StormForceField')
    && !contents.browserQa.includes('structureDebris.triggerAbility'),
  'browser QA cannot invoke either force subsystem directly',
);

check('separate-output', contents.vite.includes("outDir: '../playcanvas-slice-dist'"), 'slice cannot overwrite accepted build output');
check('qa-data-contract', contents.entry.includes('swPlaycanvasSliceReady'), 'browser QA readiness is observable');
check('dispose-contract', contents.entry.includes('app.destroy()') && contents.entry.includes('__SW_PLAYCANVAS_SLICE__ = undefined') && contents.entry.includes('authority.dispose()') && contents.entry.includes('stormPhysics.dispose()'), 'renderer, authority, and physics cleanup are explicit');
check('dispose-browser-qa', contents.workflow.includes('qa-playcanvas-slice.mjs') && contents.browserQa.includes('dispose-canvas-removed'), 'browser QA proves disposal');
check('road-clearance-contract', contents.constants.includes('ROAD_CLEARANCE = ROAD_TOP_Y - TERRAIN_TOP_Y'), 'road clearance is derived');
check('tornado-clearance-contract', contents.constants.includes('TORNADO_GROUND_CLEARANCE = TORNADO_BASE_Y - ROAD_TOP_Y'), 'tornado clearance is derived from road top');
check('workflow-no-android-claim', !/assembleDebug|signed release APK/i.test(contents.workflow), 'browser workflow makes no Android build claim');
check('workflow-browser-qa', contents.workflow.includes('qa-playcanvas-slice.mjs'), 'real browser lane is blocking');
check('workflow-builds-authority', contents.workflow.includes('SEVERE_WEATHER_WWW_DIR=playcanvas-slice/public/authority'), 'CI builds accepted authority into PlayCanvas bundle');
check('html-playable-label', contents.html.includes('PLAYCANVAS PLAYABLE SLICE'), 'preview states its playable bounded purpose');
check('strict-tsconfig', contents.tsconfig.includes('playcanvas-slice/src/**/*.ts'), 'slice TypeScript is isolated and strict');

const numeric = {
  terrainTop: Number(contents.constants.match(/TERRAIN_TOP_Y = ([\d.-]+);/)?.[1]),
  roadTop: Number(contents.constants.match(/ROAD_TOP_Y = ([\d.-]+);/)?.[1]),
  tornadoBase: Number(contents.constants.match(/TORNADO_BASE_Y = ([\d.-]+);/)?.[1]),
};
check('road-above-terrain', numeric.roadTop > numeric.terrainTop, JSON.stringify(numeric));
check('tornado-above-road', numeric.tornadoBase > numeric.roadTop, JSON.stringify(numeric));

const failed = checks.filter((item) => !item.passed);
const report = { passed: failed.length === 0, checks, failedChecks: failed.map((item) => item.name) };
await writeFile('playcanvas-slice-static-report.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failed.length > 0) process.exit(1);
