import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = await readFile(path.join(root, 'runtime', 'sw-polish-001-quality-rescue.js'), 'utf8');
const apply = await readFile(path.join(root, 'scripts', 'apply-sw-polish-001-quality-rescue.mjs'), 'utf8');

const checks = {
  marker: runtime.includes('SW_POLISH_001_QUALITY_RESCUE_V1'),
  wholeBodyStormWrapper: runtime.includes('swPolish001WholeBodyStormMotion') && runtime.includes('SWVisualSlice6CondensationStreak') && runtime.includes('SWVisualSlice6GroundPull'),
  structuralShellLawPreserved: !/StormShell[^\n]*visible\s*=\s*true/.test(runtime),
  countyFairIdentity: runtime.includes('SWPolish001CountyFairIdentity') && runtime.includes('county-fair-warm-midway'),
  coastalIdentity: runtime.includes('SWPolish001CoastalIdentity') && runtime.includes('coastal-boardwalk-marine-horizon'),
  cinematicApiWrapped: runtime.includes('swPolish001BaseOpeningApi.frame') && runtime.includes('swPolish001UpdateCinematicPresentation'),
  naturalHandoffNotReimplemented: !runtime.includes("finish('natural')") && !runtime.includes('runActive = true'),
  newspaperReadableLandscape: runtime.includes('visibleTinyTextCount') && runtime.includes('campaign-stop') && runtime.includes('storm-card p { display:none; }'),
  ordinaryLaunchUntouched: !runtime.includes('btnStartMenu.onclick') && !runtime.includes('startRunFromMenu ='),
  stormPhysicsUntouched: !/storm\.(?:radius|speed)\s*=/.test(runtime) && !/storm\.pos\.(?:set|copy)\s*\(/.test(runtime),
  scoringUntouched: !/score\s*[+\-*/]?=/.test(runtime) && !runtime.includes('campaignProgress ='),
  applyRequiresAcceptedStack: ['THREEJS_VISUAL_HERO_SLICE6_V1','SW_CIN_003_PLAYABLE_OPENING_V1','SW_LEVEL_001_STORM_SITE_FRAMEWORK_V1','SW_UI_002_LANDSCAPE_UNLEASH_V1'].every(marker => apply.includes(marker)),
  applyBlocksAuthorityWrites: ['runActive =','storm.radius =','target.health ='].every(token => apply.includes(token)),
};

for (const [name, pass] of Object.entries(checks)) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
if (!Object.values(checks).every(Boolean)) process.exitCode = 1;
