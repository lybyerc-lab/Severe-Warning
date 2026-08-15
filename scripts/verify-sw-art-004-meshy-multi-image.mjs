import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const cli = await readFile(path.join(projectRoot, 'tools/meshy/sw-meshy-multi-image-to-3d.mjs'), 'utf8');
const prep = await readFile(path.join(projectRoot, 'tools/meshy/prepare-meshy-multiview.py'), 'utf8');
const request = JSON.parse(await readFile(path.join(projectRoot, 'tools/meshy/live-requests/cow17-multi-image-v1.json'), 'utf8'));

const checks = [];
const check = (name, passed, detail = '') => checks.push({ name, passed: Boolean(passed), detail });
const order = ['three-quarter', 'front', 'side', 'back'];
const expected = {
  front: [70, 150, 670, 1340, 600, 1190, '7966304e984db7146f8146638aa5a2269b12c04e516182697ea88ba2f55ad2c8'],
  'three-quarter': [690, 150, 1320, 1340, 630, 1190, '388babd28cc459d32c126511cf61212af7f39a8012b24a288b2fe2c37d209e5c'],
  side: [1305, 150, 1825, 1340, 520, 1190, '21c470a058ac902fcef87eb4321ff56547e814f3b3aab61397ecc7e60a5c0213'],
  back: [1845, 150, 2355, 1340, 510, 1190, '4bf8fdf3645fdbfff86ce79f1d9566b496ea7de4c14f7f5ec60f7d173eb0b72e'],
};

check('cli-marker', cli.includes('SW_ART_004_MESHY_MULTI_IMAGE_CLI_V1'));
check('prep-marker', prep.includes('SW_ART_004_MESHY_MULTIVIEW_PREP_V1'));
check('multi-image-endpoint', cli.includes('https://api.meshy.ai/openapi/v1/multi-image-to-3d'));
check('env-secret-only', cli.includes('process.env.MESHY_API_KEY') && !/Bearer\s+[A-Za-z0-9_-]{20,}/.test(cli));
check('no-runtime-import', !/MechanicsLab|modern\/src|runtime\/|android\//.test(cli + prep));
check('request-version', request.version === 'SW_MESHY_MULTI_LIVE_REQUEST_V1', request.version);
check('candidate-only', request.productionAuthority === 'candidate only', request.productionAuthority);
check('exact-archived-source', request.source?.runId === 31895535943 && request.source?.artifactId === 9249708267 && request.source?.expectedSourceSha256 === 'f8352f3817db96ff5cd4faf19f03452dd2666e624278e1c63d135518421d6aef');
check('four-view-order', JSON.stringify(request.source?.viewOrder) === JSON.stringify(order), JSON.stringify(request.source?.viewOrder));
check('meshy-6', request.meshy?.aiModel === 'meshy-6', request.meshy?.aiModel);
check('multi-image-request', request.meshy?.endpoint === 'multi-image-to-3d', request.meshy?.endpoint);
check('geometry-only', request.meshy?.shouldTexture === false);
check('image-enhancement-off', request.meshy?.imageEnhancement === false);
check('source-pose', request.meshy?.poseMode === '');
check('symmetry-auto', request.meshy?.symmetryMode === 'auto');
check('glb-only', JSON.stringify(request.meshy?.targetFormats) === JSON.stringify(['glb']));
check('single-task', request.costGuard?.authorizedTasks === 1, String(request.costGuard?.authorizedTasks));
check('credit-ceiling-20', Number.isInteger(request.costGuard?.maxCredits) && request.costGuard.maxCredits <= 20, String(request.costGuard?.maxCredits));
check('generated-output-safe', typeof request.output?.dir === 'string' && request.output.dir.startsWith('art-source/generated/meshy/') && !request.output.dir.includes('..'));
check('payload-four-data-uris', cli.includes('if (dataUris.length !== 4)') && cli.includes('image_urls: dataUris'));
check('dry-run-before-key', cli.indexOf('if (args.dryRun)') < cli.indexOf('process.env.MESHY_API_KEY'));
check('consumed-credit-enforced', cli.includes('task.consumed_credits > request.costGuard.maxCredits'));
check('glb-header-enforced', cli.includes("toString('ascii') !== 'glTF'") && cli.includes('glbVersion !== 2'));

for (const name of order) {
  const spec = request.source?.views?.[name] || {};
  const e = expected[name];
  check(`view-${name}-crop`, [spec.left, spec.top, spec.right, spec.bottom, spec.expectedWidth, spec.expectedHeight, spec.expectedPixelSha256].every((value, index) => value === e[index]), JSON.stringify(spec));
  check(`view-${name}-png`, typeof spec.filename === 'string' && spec.filename.endsWith('.png') && !/[\\/]/.test(spec.filename), spec.filename);
}

const combined = JSON.stringify(request) + '\n' + cli + '\n' + prep;
check('no-embedded-meshy-secret', !/msy_[A-Za-z0-9_-]{20,}/i.test(combined));

const failedChecks = checks.filter((entry) => !entry.passed);
const report = {
  version: 'SW_ART_004_STATIC_V1',
  passed: failedChecks.length === 0,
  checks,
  failedChecks,
  evidence: { request: request.id, viewOrder: order, maxCredits: request.costGuard?.maxCredits },
};
await writeFile(path.join(projectRoot, 'sw-art-004-static-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
if (!report.passed) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
console.log(`SW-ART-004 static verification passed ${checks.length}/${checks.length}; request=${request.id}.`);
