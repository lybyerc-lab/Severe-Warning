#!/usr/bin/env node
// [SW:ART:008:STATIC_VERIFIER]

import { readFile, writeFile } from 'node:fs/promises';

const files = {
  client: 'tools/meshy/sw-meshy-rigging.mjs',
  workflow: '.github/workflows/sw-art-008-cow17-rigging.yml',
  request: 'tools/meshy/live-requests/cow17-rigging-v1.json',
};

const [client, workflow, requestText] = await Promise.all([
  readFile(files.client, 'utf8'),
  readFile(files.workflow, 'utf8'),
  readFile(files.request, 'utf8'),
]);
const request = JSON.parse(requestText);

const checks = [];
function check(name, condition) {
  checks.push({ name, pass: Boolean(condition) });
}

check('client marker', client.includes('SW_ART_008_MESHY_RIGGING_CLI_V1'));
check('rigging endpoint', client.includes("https://api.meshy.ai/openapi/v1/rigging"));
check('exact textured task guard', client.includes('01a0073a-779e-768e-9f0f-46f4e27347a5'));
check('single task authorization', client.includes("authorizedTasks !== 1"));
check('five credit guard', client.includes("maxCredits) || request.costGuard.maxCredits !== 5"));
check('api key env only', client.includes('process.env.MESHY_API_KEY'));
check('bearer auth', client.includes('Authorization: `Bearer ${apiKey}`'));
check('dry run path', client.includes("if (args.dryRun)"));
check('rigged glb required', client.includes('rigged_character_glb_url'));
check('walking glb required', client.includes('walking_glb_url'));
check('running glb required', client.includes('running_glb_url'));
check('skin validation', client.includes("inspection.rigged.skins < 1"));
check('walking animation validation', client.includes("inspection.walking.skins < 1 || inspection.walking.animations < 1"));
check('running animation validation', client.includes("inspection.running.skins < 1 || inspection.running.animations < 1"));
check('workflow exact branch', workflow.includes('agent/sw-art-008-cow17-rigging'));
check('workflow exact live request path', workflow.includes('tools/meshy/live-requests/cow17-rigging-v1.json'));
check('workflow blocks reruns', workflow.includes("GITHUB_RUN_ATTEMPT") && workflow.includes("!= '1'"));
check('workflow uses secret', workflow.includes('secrets.Meshy_API'));
check('workflow dry run before live', workflow.indexOf('Exercise no-credit rigging dry run') < workflow.indexOf('Rig Cow 17 once'));
check('workflow uploads evidence', workflow.includes('actions/upload-artifact@v4'));
check('workflow no runtime edits', workflow.includes('sw-art-008-changed-files.txt'));
check('request version', request.version === 'SW_MESHY_RIGGING_LIVE_REQUEST_V1');
check('request candidate only', request.productionAuthority === 'candidate only');
check('request exact input task', request.meshy?.inputTaskId === '01a0073a-779e-768e-9f0f-46f4e27347a5');
check('request endpoint', request.meshy?.endpoint === 'rigging');
check('request one task', request.costGuard?.authorizedTasks === 1);
check('request five credits', request.costGuard?.maxCredits === 5);
check('request rigged file', request.output?.riggedGlb === 'cow17-rigged-v1.glb');
check('request walking file', request.output?.walkingGlb === 'cow17-walking-v1.glb');
check('request running file', request.output?.runningGlb === 'cow17-running-v1.glb');
check('request output candidate path', request.output?.dir === 'art-source/generated/meshy/cow17-rigged-v1');
check('no image generation endpoint', !client.includes('/image-to-3d'));
check('no retexture endpoint', !client.includes('/retexture'));
check('no animation API paid endpoint', !client.includes('/animations'));
check('no Gemini call', !client.includes('generativelanguage.googleapis.com'));

const failed = checks.filter((item) => !item.pass);
const report = {
  version: 'SW_ART_008_STATIC_REPORT_V1',
  total: checks.length,
  passed: checks.length - failed.length,
  failed: failed.map((item) => item.name),
  checks,
};
await writeFile('sw-art-008-static-report.json', `${JSON.stringify(report, null, 2)}\n`, 'utf8');

if (failed.length) {
  console.error(`SW-ART-008 static verifier FAILED: ${failed.map((item) => item.name).join(', ')}`);
  process.exit(1);
}
console.log(`SW-ART-008 static verifier PASS: ${checks.length}/${checks.length}`);
