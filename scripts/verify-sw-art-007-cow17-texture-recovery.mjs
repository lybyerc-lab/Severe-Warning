#!/usr/bin/env node
// [SW:ART:007:TEXTURE_RECOVERY_VERIFIER]

import { access, readFile, writeFile } from 'node:fs/promises';

const files = {
  client: 'tools/meshy/sw-meshy-retexture-recover.mjs',
  request: 'tools/meshy/recovery-requests/cow17-texture-v1.json',
  workflow: '.github/workflows/sw-art-007-cow17-texture-recovery.yml',
};

const expected = {
  recoveryBase: 'c9b49bc3d06e0a8851d422033708fc026b320229',
  taskId: '01a0073a-779e-768e-9f0f-46f4e27347a5',
  credits: 10,
  baselineVertices: 99575,
  baselineTriangles: 199162,
  riggingMaxTriangles: 300000,
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

check('recovery marker', client.includes('SW_ART_007_MESHY_RETEXTURE_RECOVERY_V1'));
check('retexture GET endpoint', client.includes('https://api.meshy.ai/openapi/v1/retexture'));
check('no POST method', !client.includes("method: 'POST'") && !client.includes('method: "POST"'));
check('no task-create body', !client.includes('body: JSON.stringify'));
check('GET-only receipt', client.includes("recoveryMethod: 'GET-only'") && client.includes('createsMeshyTask: false'));
check('exact recovered task hard guard', client.includes(expected.taskId));
check('SUCCEEDED guard', client.includes("task.status !== 'SUCCEEDED'"));
check('credit equality guard', client.includes('task.consumed_credits !== request.expectedConsumedCredits'));
check('GLB inspection', client.includes('inspectGlb'));
check('PBR texture recovery', client.includes("['metallic', 'metallic']") && client.includes("['roughness', 'roughness']") && client.includes("['normal', 'normal']"));
check('rig and animation exclusion', client.includes('Texture recovery must not contain rig or animation data yet'));
check('rigging triangle gate', client.includes('request.riggingGate.maxTriangles'));

check('request version', request.version === 'SW_MESHY_RETEXTURE_RECOVERY_REQUEST_V1');
check('candidate authority', request.productionAuthority === 'candidate only');
check('exact recovered task', request.retextureTaskId === expected.taskId);
check('exact prior spend', request.expectedConsumedCredits === expected.credits);
check('baseline vertices recorded', request.baseline?.vertices === expected.baselineVertices);
check('baseline triangles recorded', request.baseline?.triangles === expected.baselineTriangles);
check('rigging max triangles', request.riggingGate?.maxTriangles === expected.riggingMaxTriangles);
check('recovered output safe', request.output?.dir === 'art-source/generated/meshy/cow17-textured-v1-recovered');

check('workflow branch', workflow.includes('agent/sw-art-007-cow17-texture'));
check('workflow recovery path trigger', workflow.includes('tools/meshy/recovery-requests/cow17-texture-v1.json'));
check('workflow exact recovery base', workflow.includes(expected.recoveryBase));
check('workflow exact task', workflow.includes(expected.taskId));
check('workflow rerun block', workflow.includes('GITHUB_RUN_ATTEMPT'));
check('workflow secret mapping', workflow.includes('MESHY_API_KEY: ${{ secrets.Meshy_API }}'));
check('workflow no paid client', !workflow.includes('sw-meshy-retexture.mjs --request'));
check('workflow recovery client', workflow.includes('sw-meshy-retexture-recover.mjs'));
check('workflow dry run before GET', workflow.indexOf('Prove GET-only recovery plan') < workflow.indexOf('Recover already-paid Cow 17 texture task'));
check('preserve original SW-ART-007 verifier', workflow.includes('verify-sw-art-007-cow17-texture.mjs'));
check('preserve Three.js asset verifier', workflow.includes('verify-threejs-asset-pipeline.mjs'));

const report = {
  version: 'SW_ART_007_TEXTURE_RECOVERY_STATIC_REPORT_V1',
  total: checks.length,
  passed: checks.filter((entry) => entry.pass).length,
  failed: checks.filter((entry) => !entry.pass).length,
  checks,
};
await writeFile('sw-art-007-recovery-static-report.json', `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`SW-ART-007 texture recovery verifier PASS: ${report.passed}/${report.total}`);
