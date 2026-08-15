#!/usr/bin/env node
// [SW:ART:008:STATIC_VERIFIER]

import { access, readFile, writeFile } from 'node:fs/promises';

const files = {
  client: 'tools/meshy/sw-meshy-rig.mjs',
  request: 'tools/meshy/live-requests/cow17-rig-motion-v1.json',
  workflow: '.github/workflows/sw-art-008-cow17-rig-motion.yml',
};

const expected = {
  base: '963a8a3a037bc738c22ae575cfc475e91061086c',
  inputTask: '01a0073a-779e-768e-9f0f-46f4e27347a5',
  sourceRun: 31908595053,
  sourceArtifact: 9253031593,
  sourceGlbSha: '7e5bdc2ecf0799c7759ed2d4bc1f6dd3b49ecaf21b4ba4a5308e3a8a9e03bd90',
  vertices: 109775,
  triangles: 199162,
};

const checks = [];
function check(name, condition, detail = '') {
  checks.push({ name, pass: Boolean(condition), detail });
  if (!condition) throw new Error(`${name}${detail ? `: ${detail}` : ''}`);
}

for (const file of Object.values(files)) await access(file);
const client = await readFile(files.client, 'utf8');
const workflow = await readFile(files.workflow, 'utf8');
const requestText = await readFile(files.request, 'utf8');
const request = JSON.parse(requestText);

check('client marker', client.includes('SW_ART_008_MESHY_RIG_CLI_V1'));
check('rigging endpoint', client.includes('https://api.meshy.ai/openapi/v1/rigging'));
check('no image-to-3d endpoint', !client.includes('/image-to-3d'));
check('no retexture endpoint', !client.includes('/retexture'));
check('input task payload', client.includes('input_task_id'));
check('no model URL payload', !client.includes('model_url:'));
check('height payload', client.includes('height_meters'));
check('one POST path', (client.match(/method: 'POST'/g) || []).length === 1);
check('rigged GLB output', client.includes('rigged_character_glb_url'));
check('walking GLB output', client.includes('walking_glb_url'));
check('running GLB output', client.includes('running_glb_url'));
check('rigged skin validation', client.includes('Rigged character GLB contains no skin'));
check('walking animation validation', client.includes('Walking GLB must contain skin and animation data'));
check('running animation validation', client.includes('Running GLB must contain skin and animation data'));

check('request version', request.version === 'SW_MESHY_RIG_LIVE_REQUEST_V1');
check('candidate authority', request.productionAuthority === 'candidate only');
check('exact textured input task', request.source?.retextureTaskId === expected.inputTask);
check('exact source run', request.source?.runId === expected.sourceRun);
check('exact source artifact', request.source?.artifactId === expected.sourceArtifact);
check('exact source GLB hash', request.source?.glbSha256 === expected.sourceGlbSha);
check('source vertices', request.source?.vertices === expected.vertices);
check('source triangles', request.source?.triangles === expected.triangles);
check('under 300k rigging ceiling', request.source?.triangles < 300000);
check('rigging endpoint request', request.meshy?.endpoint === 'rigging');
check('height 1.7m', request.meshy?.heightMeters === 1.7);
check('basic movement required', request.meshy?.requireBasicAnimations === true);
check('one rig task', request.costGuard?.authorizedTasks === 1);
check('five credit ceiling', request.costGuard?.maxCredits === 5);

check('workflow branch', workflow.includes('agent/sw-art-008-cow17-rig-motion'));
check('workflow path trigger', workflow.includes('tools/meshy/live-requests/cow17-rig-motion-v1.json'));
check('workflow exact base', workflow.includes(expected.base));
check('workflow exact input task', workflow.includes(expected.inputTask));
check('workflow rerun block', workflow.includes('GITHUB_RUN_ATTEMPT'));
check('workflow secret mapping', workflow.includes('MESHY_API_KEY: ${{ secrets.Meshy_API }}'));
check('workflow dry run before live', workflow.indexOf('Exercise no-credit rigging dry run') < workflow.indexOf('Rig Cow 17 and obtain baseline movement'));
check('preserve texture recovery verifier', workflow.includes('verify-sw-art-007-cow17-texture-recovery.mjs'));
check('preserve Three.js asset verifier', workflow.includes('verify-threejs-asset-pipeline.mjs'));
check('tooling only no runtime import', !client.includes("from '../../src") && !workflow.includes('src/game'));

const report = {
  version: 'SW_ART_008_STATIC_REPORT_V1',
  total: checks.length,
  passed: checks.filter((entry) => entry.pass).length,
  failed: checks.filter((entry) => !entry.pass).length,
  checks,
};
await writeFile('sw-art-008-static-report.json', `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`SW-ART-008 static verifier PASS: ${report.passed}/${report.total}`);
