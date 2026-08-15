#!/usr/bin/env node
// [SW:ART:007:STATIC_VERIFIER]

import { access, readFile, writeFile } from 'node:fs/promises';

const files = {
  client: 'tools/meshy/sw-meshy-retexture.mjs',
  request: 'tools/meshy/live-requests/cow17-texture-v1.json',
  workflow: '.github/workflows/sw-art-007-cow17-texture.yml',
};

const expected = {
  base: '4329f5ce1f30947cb4160af66b7774f09adb0299',
  geometryTask: '01a0072a-a5bc-767d-aace-5ec692250b13',
  styleRun: 31906670874,
  styleArtifact: 9252535475,
  styleSha: '58384a916ba6ca0b4ea18c4a434c57bc64e8a8c956a3ab065208ecc066df47fb',
  vertices: 99575,
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

check('client marker', client.includes('SW_ART_007_MESHY_RETEXTURE_CLI_V1'));
check('retexture endpoint', client.includes("https://api.meshy.ai/openapi/v1/retexture"));
check('no image-to-3d endpoint', !client.includes('/image-to-3d'));
check('input task payload', client.includes('input_task_id'));
check('image style payload', client.includes('image_style_url'));
check('original UV payload', client.includes('enable_original_uv'));
check('PBR payload', client.includes('enable_pbr'));
check('2K payload', client.includes('texture_resolution'));
check('remove lighting payload', client.includes('remove_lighting'));
check('GLB inspection', client.includes('inspectGlb'));
check('geometry vertex guard', client.includes('Retexture changed vertex count'));
check('geometry triangle guard', client.includes('Retexture changed triangle count'));
check('rig exclusion guard', client.includes('SW-ART-007 must not add rig or animation data'));
check('PBR texture downloads', client.includes("['metallic', 'metallic']") && client.includes("['roughness', 'roughness']") && client.includes("['normal', 'normal']"));
check('request version', request.version === 'SW_MESHY_RETEXTURE_LIVE_REQUEST_V1');
check('candidate authority', request.productionAuthority === 'candidate only');
check('exact geometry task', request.geometrySource?.meshyTaskId === expected.geometryTask);
check('exact expected vertices', request.geometrySource?.expectedVertices === expected.vertices);
check('exact expected triangles', request.geometrySource?.expectedTriangles === expected.triangles);
check('exact style run', request.styleSource?.runId === expected.styleRun);
check('exact style artifact', request.styleSource?.artifactId === expected.styleArtifact);
check('exact style SHA', request.styleSource?.expectedSha256 === expected.styleSha);
check('Meshy 6', request.meshy?.aiModel === 'meshy-6');
check('preserve original UV', request.meshy?.enableOriginalUv === true);
check('PBR enabled', request.meshy?.enablePbr === true);
check('2K texture', request.meshy?.textureResolution === '2k');
check('lighting removal', request.meshy?.removeLighting === true);
check('GLB only', JSON.stringify(request.meshy?.targetFormats) === JSON.stringify(['glb']));
check('one task', request.costGuard?.authorizedTasks === 1);
check('10 credit ceiling', request.costGuard?.maxCredits === 10);
check('workflow branch', workflow.includes('agent/sw-art-007-cow17-texture'));
check('workflow path trigger', workflow.includes('tools/meshy/live-requests/cow17-texture-v1.json'));
check('workflow exact base', workflow.includes(expected.base));
check('workflow rerun block', workflow.includes('GITHUB_RUN_ATTEMPT'));
check('workflow secret mapping', workflow.includes('MESHY_API_KEY: ${{ secrets.Meshy_API }}'));
check('workflow exact style artifact', workflow.includes(String(expected.styleArtifact)) || workflow.includes('source_artifact_id'));
check('workflow dry run before live', workflow.indexOf('Exercise no-credit Retexture dry run') < workflow.indexOf('Texture accepted Cow 17 geometry'));
check('preserve old Meshy verifier', workflow.includes('verify-sw-art-006-refined-face-meshy.mjs'));
check('preserve Three.js asset verifier', workflow.includes('verify-threejs-asset-pipeline.mjs'));
check('tooling only no runtime import', !client.includes("from '../../src") && !workflow.includes('src/game'));

const report = {
  version: 'SW_ART_007_STATIC_REPORT_V1',
  total: checks.length,
  passed: checks.filter((entry) => entry.pass).length,
  failed: checks.filter((entry) => !entry.pass).length,
  checks,
};
await writeFile('sw-art-007-static-report.json', `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`SW-ART-007 static verifier PASS: ${report.passed}/${report.total}`);
