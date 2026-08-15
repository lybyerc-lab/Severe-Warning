#!/usr/bin/env node
// [SW:ART:006:STATIC_VERIFIER]

import fs from 'node:fs';

const workflowPath = '.github/workflows/sw-art-006-cow17-refined-face-meshy.yml';
const cliPath = 'tools/meshy/sw-meshy-standard-image-to-3d.mjs';
const requestPath = 'tools/meshy/live-requests/cow17-refined-face-meshy6-v1.json';
const workflow = fs.readFileSync(workflowPath, 'utf8');
const cli = fs.readFileSync(cliPath, 'utf8');
const request = JSON.parse(fs.readFileSync(requestPath, 'utf8'));

const checks = [];
function check(name, condition) {
  checks.push({ name, pass: Boolean(condition) });
  if (!condition) throw new Error(`SW-ART-006 static check failed: ${name}`);
}

check('request version', request.version === 'SW_MESHY_REFINED_LIVE_REQUEST_V1');
check('candidate-only authority', request.productionAuthority === 'candidate only');
check('exact Gemini source run', request.source?.runId === 31906670874);
check('exact Gemini source artifact', request.source?.artifactId === 9252535475);
check('exact Gemini artifact name', request.source?.artifactName === 'sw-art-005-cow17-face-refine-v1');
check('exact refined source path', request.source?.path === 'art-source/generated/google-ai/cow17/cow17-face-refine-v1.jpg');
check('exact refined source sha', request.source?.expectedSourceSha256 === '58384a916ba6ca0b4ea18c4a434c57bc64e8a8c956a3ab065208ecc066df47fb');
check('image-to-3d endpoint', request.meshy?.endpoint === 'image-to-3d');
check('standard high-detail mode', request.meshy?.modelType === 'standard');
check('Meshy 6 model', request.meshy?.aiModel === 'meshy-6');
check('geometry only', request.meshy?.shouldTexture === false);
check('no remesh', request.meshy?.shouldRemesh === false);
check('no image enhancement', request.meshy?.imageEnhancement === false);
check('source pose preserved', request.meshy?.poseMode === '');
check('GLB only', JSON.stringify(request.meshy?.targetFormats) === JSON.stringify(['glb']));
check('one authorized task', request.costGuard?.authorizedTasks === 1);
check('20-credit ceiling', request.costGuard?.maxCredits === 20);
check('safe Meshy output dir', /^art-source\/generated\/meshy\/[a-z0-9-]+$/.test(request.output?.dir || ''));
check('workflow exact branch', workflow.includes('agent/sw-art-006-cow17-refined-face-meshy'));
check('workflow exact request trigger', workflow.includes('tools/meshy/live-requests/cow17-refined-face-meshy6-v1.json'));
check('workflow rerun block', workflow.includes("GITHUB_RUN_ATTEMPT") && workflow.includes("!= '1'"));
check('workflow secret mapping', workflow.includes('MESHY_API_KEY: ${{ secrets.Meshy_API }}'));
check('workflow exact source artifact recovery', workflow.includes('31906670874') && workflow.includes('9252535475'));
check('workflow dry run before live run', workflow.indexOf('Exercise no-credit Meshy 6 dry run') < workflow.indexOf('Generate one refined-face Meshy 6 candidate'));
check('CLI official endpoint', cli.includes("https://api.meshy.ai/openapi/v1/image-to-3d"));
check('CLI validates standard mode', cli.includes("request.meshy?.modelType !== 'standard'"));
check('CLI validates meshy-6', cli.includes("request.meshy?.aiModel !== 'meshy-6'"));
check('CLI preserves refined appearance', cli.includes("request.meshy?.imageEnhancement !== false"));
check('CLI verifies source SHA before POST', cli.includes('Refined source SHA mismatch'));
check('CLI checks reported credits', cli.includes('task.consumed_credits > request.costGuard.maxCredits'));
check('CLI validates GLB 2.0', cli.includes("toString('ascii') !== 'glTF'") && cli.includes('glbVersion !== 2'));
check('CLI never imports runtime code', !cli.includes("from '../src") && !cli.includes("from '../../src"));

const report = {
  version: 'SW_ART_006_STATIC_REPORT_V1',
  passed: checks.length,
  total: checks.length,
  checks,
};
fs.writeFileSync('sw-art-006-static-report.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(`SW-ART-006 static verifier PASS: ${checks.length}/${checks.length}`);
