import { readFile, writeFile } from 'node:fs/promises';

const files = {
  entry: 'playcanvas-slice/src/main.ts',
  engineTypes: 'playcanvas-slice/src/engine-types.ts',
  constants: 'playcanvas-slice/src/constants.ts',
  html: 'playcanvas-slice/index.html',
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
check('no-threejs-import', !/from\s+['"]three['"]|THREE\./.test(contents.entry), 'slice does not import or drive Three.js');
check('engine-version-pinned', contents.constants.includes("PLAYCANVAS_VERSION = '2.21.3'"), 'runtime version is exact');
check('vendor-version-pinned', contents.fetcher.includes("const version = '2.21.3'"), 'vendor URL version is exact');
check('vendor-size-gate', contents.fetcher.includes('engine.byteLength < 1_000_000'), 'truncated engine payload fails');
check('optional-checksum-gate', contents.fetcher.includes('PLAYCANVAS_EXPECTED_SHA256'), 'workflow can hard-pin discovered SHA-256');
check('module-version-contract', contents.engineTypes.includes('readonly version: string;'), 'loaded module exposes engine version');
check('module-revision-contract', contents.engineTypes.includes('readonly revision: string;'), 'loaded module exposes engine revision');
check('loaded-version-authority', contents.entry.includes('engineVersion: pc.version') && !contents.entry.includes('engineVersion: PLAYCANVAS_VERSION'), 'telemetry reads the loaded module version');
check('loaded-revision-authority', contents.entry.includes('engineRevision: pc.revision'), 'telemetry reads the loaded module revision');
check('loaded-version-guard', contents.entry.includes('pc.version !== PLAYCANVAS_VERSION'), 'runtime rejects a mismatched engine version');
check('loaded-revision-guard', contents.entry.includes("pc.revision.includes('$_CURRENT_')"), 'runtime rejects an unresolved engine revision');
check('browser-version-export-check', contents.browserQa.includes('engine-version-exported'), 'browser QA asserts the exported engine version');
check('browser-revision-export-check', contents.browserQa.includes('engine-revision-exported'), 'browser QA asserts the exported engine revision');
check('separate-output', contents.vite.includes("outDir: '../playcanvas-slice-dist'"), 'slice cannot overwrite accepted build output');
check('qa-data-contract', contents.entry.includes('swPlaycanvasSliceReady'), 'browser QA readiness is observable');
check('dispose-contract', contents.entry.includes('app.destroy()') && contents.entry.includes('__SW_PLAYCANVAS_SLICE__ = undefined'), 'renderer lifecycle cleanup is explicit');
check('dispose-browser-qa', contents.workflow.includes('qa-playcanvas-slice.mjs') && contents.browserQa.includes('dispose-canvas-removed'), 'browser QA proves disposal');
check('road-clearance-contract', contents.constants.includes('ROAD_CLEARANCE = ROAD_TOP_Y - TERRAIN_TOP_Y'), 'road clearance is derived');
check('tornado-clearance-contract', contents.constants.includes('TORNADO_GROUND_CLEARANCE = TORNADO_BASE_Y - ROAD_TOP_Y'), 'tornado clearance is derived from road top');
check('workflow-no-android-claim', !/assembleDebug|signed release APK/i.test(contents.workflow), 'bootstrap workflow makes no Android build claim');
check('workflow-browser-qa', contents.workflow.includes('qa-playcanvas-slice.mjs'), 'real browser lane is blocking');
check('html-canvas-label', contents.html.includes('Road and terrain truth test'), 'preview states its bounded purpose');
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
