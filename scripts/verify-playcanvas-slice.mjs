import { readFile, writeFile } from 'node:fs/promises';

const files = {
  entry: 'playcanvas-slice/src/main.ts',
  chaseCamera: 'playcanvas-slice/src/chase-camera.ts',
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
check('no-threejs-import', !/from\s+['"]three['"]|THREE\./.test(contents.entry), 'visible PlayCanvas slice does not import or drive Three.js');
check('engine-version-pinned', contents.constants.includes("PLAYCANVAS_VERSION = '2.21.3'"), 'runtime version is exact');
check('vendor-version-pinned', contents.fetcher.includes("const version = '2.21.3'"), 'vendor URL version is exact');
check('vendor-size-gate', contents.fetcher.includes('engine.byteLength < 1_000_000'), 'truncated engine payload fails');
check('optional-checksum-gate', contents.fetcher.includes('PLAYCANVAS_EXPECTED_SHA256'), 'workflow can hard-pin discovered SHA-256');
check('module-version-contract', contents.engineTypes.includes('readonly version: string;'), 'loaded module exposes engine version');
check('module-revision-contract', contents.engineTypes.includes('readonly revision: string;'), 'loaded module exposes engine revision');
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
check('visible-presentation-authority-separation', contents.entry.includes('PlayCanvasAuthorityClient') && contents.entry.includes('gameplayAuthority: \'PLAYCANVAS_AUTHORITY_V1\''), 'visible renderer declares legacy gameplay authority explicitly');
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
  'camera heading is an explicit damped state with immediate one-stick travel intent and observed-travel fallback',
);
check(
  'chase-camera-turn-rate-bounded',
  contents.entry.includes('CHASE_CAMERA_TURN_RATE_RADIANS = 1.05')
    && contents.entry.includes('CHASE_CAMERA_HEADING_DEAD_ZONE_RADIANS = Math.PI * 10 / 180')
    && contents.entry.includes('CHASE_CAMERA_INTENT_MAGNITUDE_THRESHOLD = 0.12')
    && contents.chaseCamera.includes('OWNER_TRAILING_TURN_SCALE = 0.9'),
  'intent-driven chase camera keeps the sealed base rate and applies the owner-approved 10% trailing response polish',
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
  'larger-map baseline is preserved except for the explicit owner-approved 10% camera-only turn catch-up reduction',
);
check(
  'chase-camera-intent-wiring',
  contents.entry.includes('chaseCamera.setTravelIntent(target.x, target.z, active)')
    && contents.entry.includes('mapScreenInput(screen.x, screen.y)')
    && contents.entry.includes('mapScreenInput(0, 0)'),
  'visible controls publish travel intent directly to the chase camera and clear it on release/blur',
);
check('camera-relative-input-contract', contents.entry.includes('chaseCameraAuthorityInput') && contents.entry.includes('chaseCamera.screenToWorldDirection') && contents.entry.includes('transform.unmapDirection'), 'screen-space movement uses current chase-camera basis and is transformed back into accepted authority world axes');
check('keyboard-camera-relative', contents.entry.includes("pressed.has('KeyW')") && contents.entry.includes('applyDirectionalInput()') && contents.entry.includes('authority.setJoystick(authorityVector.x, authorityVector.z, active)'), 'keyboard is interpreted as screen-space movement and sent through accepted movement authority');
check('touch-camera-relative', contents.entry.includes('touchVector = Object.freeze') && contents.entry.includes('applyDirectionalInput()'), 'touch stick uses the same chase-camera-relative movement path');
check('camera-reset-contract', contents.entry.includes('chaseCamera.reset(renderTornado.x, renderTornado.z)'), 'run reset restores a deterministic chase-camera heading');
check('ability-buttons-present', ['primary', 'secondary', 'tertiary'].every((slot) => contents.html.includes(`data-ability="${slot}"`)), 'Pull/Gust/Zap controls are present');
check('scoring-hud-present', contents.html.includes('hud-score') && contents.html.includes('hud-combo') && contents.html.includes('hud-time'), 'time, score, and combo HUD is present');
check('destruction-visual-driven-by-authority', contents.entry.includes('applyBarnVisual(scene, snapshot)') && contents.scene.includes('mooBrew'), 'visible destruction stage follows authority snapshot');
check('cow-safe-telemetry', contents.authorityBridge.includes('safe: true') && contents.entry.includes('Cow 17 SAFE'), 'Cow 17 remains explicitly safe in playable slice');
check('vehicle-present', contents.scene.includes('addVehicle'), 'bounded scene includes a vehicle');
check('electrical-target-present', contents.scene.includes('addElectricalTarget'), 'bounded scene includes an electrical target');
check(
  'tornado-funnel-upright',
  contents.scene.includes('[SW:PLAYCANVAS:FUNNEL_ORIENTATION]')
    && contents.scene.includes('[1.3, 4.5, 1.3]')
    && contents.scene.includes('[5.8, 2.4, 5.8]')
    && contents.scene.indexOf('[1.3, 4.5, 1.3]') < contents.scene.indexOf('[5.8, 2.4, 5.8]')
    && contents.scene.includes('rotation: [180, 0, 0]'),
  'funnel is narrow at ground contact, broad aloft, and cone points face downward',
);
check(
  'expanded-terrain-footprint',
  contents.scene.includes("name: 'terrain-slab'") && contents.scene.includes('scale: [190, 0.8, 190]'),
  'terrain footprint is expanded to at least 180x180 PlayCanvas world units',
);
check(
  'connected-road-junctions-contract',
  contents.scene.includes('const roadAxes = [-45, 0, 45];') && contents.scene.includes('name: `road-ns-${x}`') && contents.scene.includes('name: `road-ew-${z}`'),
  'authored road network contains a 3x3 grid providing 9 connected junctions',
);
check(
  'distinct-landmark-blocks-contract',
  contents.scene.includes('oak-gable-house') && contents.scene.includes('grain-silo-mill') && contents.scene.includes('county-water-tower') && contents.scene.includes('moo-brew-corner-shop'),
  'world contains at least 4 distinct landmark blocks for visual orientation',
);
check('browser-version-export-check', contents.browserQa.includes('engine-version-exported'), 'browser QA asserts exported engine version');
check('browser-revision-export-check', contents.browserQa.includes('engine-revision-exported'), 'browser QA asserts exported engine revision');
check('browser-visible-control-check', contents.browserQa.includes('joystick-up-moves-screen-forward') && contents.browserQa.includes('keyboard-right-moves-screen-right'), 'browser QA exercises visible movement directions');
check(
  'browser-chase-camera-check',
  contents.browserQa.includes('camera-stays-stable-on-forward-input')
    && contents.browserQa.includes('camera-turns-gradually-behind-keyboard-motion')
    && contents.browserQa.includes('camera-distance-stable-joystick')
    && contents.browserQa.includes('camera-distance-stable-keyboard'),
  'browser QA proves forward stability, gradual chase rotation, and stable follow distance',
);
check('separate-output', contents.vite.includes("outDir: '../playcanvas-slice-dist'"), 'slice cannot overwrite accepted build output');
check('qa-data-contract', contents.entry.includes('swPlaycanvasSliceReady'), 'browser QA readiness is observable');
check('dispose-contract', contents.entry.includes('app.destroy()') && contents.entry.includes('__SW_PLAYCANVAS_SLICE__ = undefined') && contents.entry.includes('authority.dispose()'), 'renderer and authority-frame cleanup are explicit');
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
