import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const cliPath = path.join(projectRoot, 'tools', 'meshy', 'sw-meshy-image-to-3d.mjs');
const prepPath = path.join(projectRoot, 'tools', 'meshy', 'prepare-meshy-reference.py');
const requestPath = path.join(projectRoot, 'tools', 'meshy', 'live-requests', 'cow17-meshy-v1.json');
const workflowPath = path.join(projectRoot, '.github', 'workflows', 'sw-art-003-meshy-image-to-3d.yml');

const files = {
  cli: await readFile(cliPath, 'utf8'),
  prep: await readFile(prepPath, 'utf8'),
  request: await readFile(requestPath, 'utf8'),
  workflow: await readFile(workflowPath, 'utf8'),
  gitignore: await readFile(path.join(projectRoot, '.gitignore'), 'utf8'),
};
const request = JSON.parse(files.request);
const checks = [];
const check = (name, passed, detail = '') => checks.push({ name, passed: Boolean(passed), detail });

check('cli-marker', files.cli.includes('SW_ART_003_MESHY_CLI_V1'));
check('prep-marker', files.prep.includes('SW_ART_003_MESHY_REFERENCE_PREP_V1'));
check('meshy-api-only', files.cli.includes('https://api.meshy.ai/openapi/v1/image-to-3d'));
check('secret-env-only', files.cli.includes('process.env.MESHY_API_KEY') && files.workflow.includes('MESHY_API_KEY: ${{ secrets.Meshy_API }}'));
check('exact-github-secret-name', files.workflow.includes('secrets.Meshy_API'));
check('rerun-spend-lock', files.workflow.includes('GITHUB_RUN_ATTEMPT') && files.workflow.includes('must not be rerun'));
check('generated-output-ignored', files.gitignore.includes('art-source/generated/meshy/'));
check('no-runtime-territory', !/runtime\/|MechanicsLab|modern\/src|android\//.test([files.cli, files.prep, files.request].join('\n')));
check('request-version', request.version === 'SW_MESHY_LIVE_REQUEST_V1', request.version);
check('candidate-only', request.productionAuthority === 'candidate only', request.productionAuthority);
check('exact-source-run', request.source?.runId === 31895535943, String(request.source?.runId));
check('exact-source-artifact', request.source?.artifactId === 9249708267, String(request.source?.artifactId));
check('exact-source-sha', request.source?.expectedSourceSha256 === 'f8352f3817db96ff5cd4faf19f03452dd2666e624278e1c63d135518421d6aef');
check('exact-crop-box', JSON.stringify(request.source?.crop) === JSON.stringify({
  left: 690,
  top: 180,
  right: 1270,
  bottom: 1335,
  expectedWidth: 580,
  expectedHeight: 1155,
  expectedPixelSha256: 'e9439cd683da0a1e22cf11987d86cf0749aa139705efebba1caa9ecac6c723e8',
}));
check('smart-topology-t2', request.meshy?.modelType === 'smart-topology' && request.meshy?.aiModel === 'meshy-t2');
check('mobile-face-bound', Number.isInteger(request.meshy?.targetPolycount) && request.meshy.targetPolycount <= 12000, String(request.meshy?.targetPolycount));
check('texture-bound', request.meshy?.shouldTexture === true && request.meshy?.textureResolution === '2k' && request.meshy?.enablePbr === false);
check('glb-only', JSON.stringify(request.meshy?.targetFormats) === JSON.stringify(['glb']));
check('one-task-only', request.costGuard?.authorizedTasks === 1, String(request.costGuard?.authorizedTasks));
check('credit-ceiling', Number.isInteger(request.costGuard?.maxCredits) && request.costGuard.maxCredits <= 15, String(request.costGuard?.maxCredits));
check('data-uri-transport', files.cli.includes('base64-data-uri') && files.cli.includes('image.toString(\'base64\')'));
check('glb-magic-validation', files.cli.includes("!== 'glTF'") && files.cli.includes('readUInt32LE(4)'));
const receiptStart = files.cli.indexOf('const receipt = {');
const receiptEnd = files.cli.indexOf("await writeFile(path.join(outputDir, 'sw-art-003-receipt.json')", receiptStart);
const receiptBlock = receiptStart >= 0 && receiptEnd > receiptStart ? files.cli.slice(receiptStart, receiptEnd) : '';
check('receipt-omits-api-key', receiptBlock.length > 0 && !receiptBlock.includes('apiKey') && !receiptBlock.includes('MESHY_API_KEY') && !/MESHY_API_KEY/.test(files.request));

const embeddedKeys = [files.cli, files.prep, files.request, files.workflow].join('\n').match(/msy_[0-9A-Za-z_-]{20,}/g) || [];
check('no-embedded-meshy-key', embeddedKeys.length === 0, embeddedKeys.join(', '));

let cliCheck = null;
try {
  execFileSync(process.execPath, ['--check', cliPath], { cwd: projectRoot, stdio: 'pipe' });
  cliCheck = 'pass';
  check('node-cli-syntax', true);
} catch (error) {
  cliCheck = error.stderr?.toString() || error.message;
  check('node-cli-syntax', false, cliCheck);
}

const failedChecks = checks.filter((entry) => !entry.passed);
const report = {
  version: 'SW_ART_003_STATIC_V1',
  passed: failedChecks.length === 0,
  checks,
  failedChecks,
  evidence: { cliCheck, requestId: request.id, embeddedKeys },
};
await writeFile(path.join(projectRoot, 'sw-art-003-static-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
if (!report.passed) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
console.log(`SW-ART-003 static verification passed ${checks.length}/${checks.length}; request=${request.id}.`);
