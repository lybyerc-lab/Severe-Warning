import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const files = {
  runtime: await readFile(path.join(projectRoot, 'runtime', 'threejs-asset-pipeline.js'), 'utf8'),
  patch: await readFile(path.join(projectRoot, 'scripts', 'apply-threejs-asset-pipeline.mjs'), 'utf8'),
  asset: await readFile(path.join(projectRoot, 'assets', 'production', 'structures', 'storefront-v1.json'), 'utf8'),
  packageJson: await readFile(path.join(projectRoot, 'package.json'), 'utf8'),
  buildWeb: await readFile(path.join(projectRoot, 'scripts', 'build-web.mjs'), 'utf8'),
};

const checks = [];
function check(name, passed, detail = '') {
  checks.push({ name, passed: Boolean(passed), detail });
}

const asset = JSON.parse(files.asset);
const pkg = JSON.parse(files.packageJson);
const parts = Array.isArray(asset.parts) ? asset.parts : [];
const tags = new Set(parts.flatMap((part) => Array.isArray(part.tags) ? part.tags : []));

check('runtime-version', files.runtime.includes("THREEJS_ASSET_PIPELINE_V1"));
check('runtime-anchor', files.runtime.includes('[SW:RENDER:THREEJS_ASSET_PIPELINE]'));
check('bridge-exported', files.runtime.includes('__SW_THREEJS_ASSET_PIPELINE__'));
check('accepted-world-wrapper', files.runtime.includes('swAssetOriginalBuildLivingCounty = buildLivingCounty') && files.runtime.includes('buildLivingCountyWithAuthoredPresentation'));
check('presentation-only-swap', files.runtime.includes('target.meshData = authored'));
check('intact-only-swap', files.runtime.includes('target.destroyed') && files.runtime.includes('target.damageStage') && files.runtime.includes('target.health') && files.runtime.includes('target.maxHealth'));
check('fallback-retained', files.runtime.includes('target.__swPresentationFallback = fallbackMeshData'));
check('stale-generation-guard', files.runtime.includes('skipped-stale-generation'));
check('local-asset-only', files.runtime.includes("url: './assets/production/structures/storefront-v1.json'") && !/https?:\/\//.test(files.runtime));

const protectedAssignments = [...files.runtime.matchAll(/target\.(health|maxHealth|points|damageStage|destroyed|x|z|kind|materialFamily|hasGlass)\s*=/g)].map((match) => match[0]);
check('no-gameplay-target-mutations', protectedAssignments.length === 0, protectedAssignments.join(', '));
check('no-score-clock-ability-mutations', !/(score\s*=|combo\s*=|remainingSeconds\s*=|usePull\(|useGust\(|useZap\(|triggerPull\(|triggerGust\(|triggerZap\()/i.test(files.runtime));

check('asset-version', asset.version === 'SW_STRUCTURE_ASSET_V1', asset.version);
check('asset-id', asset.id === 'structure.storefront.v1', asset.id);
check('asset-archetype', asset.archetype === 'shop', asset.archetype);
check('asset-anatomy-count', parts.length >= 10, String(parts.length));
check('asset-base-tag', tags.has('base'));
check('asset-roof-tag', tags.has('roof'));
check('asset-wall-tag', tags.has('wall'));
check('asset-interior-tag', tags.has('interior'));
check('asset-trim-tag', tags.has('trim'));
check('asset-glass-tag', tags.has('glass'));
check('asset-damage-tags', parts.filter((part) => part.tags?.includes('damage')).length >= 10);

check('patch-requires-identity', files.patch.includes('PRESENTATION_IDENTITY_MOO_BREW_V1') && files.patch.includes('CITY_FABRIC_DESTRUCTION_V1'));
check('patch-before-world-init', files.patch.includes('MAIN ANIMATION LOOP WITH 3-STAGE ESCALATION'));
check('package-patch-command', pkg.scripts?.['patch:asset-pipeline'] === 'node scripts/apply-threejs-asset-pipeline.mjs', pkg.scripts?.['patch:asset-pipeline'] || 'missing');
check('package-verify-command', pkg.scripts?.['verify:asset-pipeline'] === 'node scripts/verify-threejs-asset-pipeline.mjs', pkg.scripts?.['verify:asset-pipeline'] || 'missing');
check('package-qa-command', pkg.scripts?.['qa:asset-pipeline'] === 'node scripts/qa-threejs-asset-pipeline.mjs', pkg.scripts?.['qa:asset-pipeline'] || 'missing');
check('build-copies-production-assets', files.buildWeb.includes('sourceProductionAssetsDir') && files.buildWeb.includes('outputProductionAssets'));

const failedChecks = checks.filter((entry) => !entry.passed);
const report = {
  version: 'THREEJS_ASSET_PIPELINE_STATIC_V1',
  passed: failedChecks.length === 0,
  checks,
  failedChecks,
  evidence: {
    assetId: asset.id,
    assetPartCount: parts.length,
    taggedDamageParts: parts.filter((part) => part.tags?.includes('damage')).length,
    protectedAssignments,
  },
};

await writeFile(path.join(projectRoot, 'threejs-asset-pipeline-static-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
if (!report.passed) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
console.log(`Three.js asset pipeline static verification passed ${checks.length}/${checks.length}; authored parts=${parts.length}.`);
