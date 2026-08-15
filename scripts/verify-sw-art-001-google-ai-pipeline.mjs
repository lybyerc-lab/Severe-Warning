import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const cliPath = path.join(projectRoot, 'tools', 'google-ai', 'sw-google-art.mjs');
const briefDir = path.join(projectRoot, 'tools', 'google-ai', 'briefs');
const briefNames = ['cow17', 'heartland-farm', 'heartland-house', 'tornado-visual-dev', 'moo-brew-touchdown-previz'];

const files = {
  cli: await readFile(cliPath, 'utf8'),
  readme: await readFile(path.join(projectRoot, 'tools', 'google-ai', 'README.md'), 'utf8'),
  gitignore: await readFile(path.join(projectRoot, '.gitignore'), 'utf8'),
  assetPipelineMap: await readFile(path.join(projectRoot, 'Docs', 'THREEJS_ASSET_PIPELINE_SOURCE_MAP.md'), 'utf8'),
};

const briefs = Object.fromEntries(await Promise.all(briefNames.map(async (name) => [
  name,
  JSON.parse(await readFile(path.join(briefDir, `${name}.json`), 'utf8')),
])));

const checks = [];
const check = (name, passed, detail = '') => checks.push({ name, passed: Boolean(passed), detail });

check('cli-marker', files.cli.includes('SW_ART_001_GOOGLE_AI_CLI_V1'));
check('interactions-api-only', files.cli.includes('https://generativelanguage.googleapis.com/v1beta/interactions'));
check('env-key-only', files.cli.includes('process.env.GEMINI_API_KEY') && !files.cli.includes('const apiKey = \'AIza'));
check('no-game-runtime-import', !/from\s+["\'](?:\.\.\/)+runtime\//.test(files.cli) && !/MechanicsLab|modern\/src|android\//.test(files.cli));
check('generated-output-ignored', files.gitignore.includes('art-source/generated/google-ai/'));
check('dotenv-files-ignored', files.gitignore.includes('.env') && files.gitignore.includes('.env.*'));
check('drive-archive-documented', files.readme.includes('12cD0PRhA3uNffQDQHywdblqIpZ-fZ55U') && files.readme.includes('1Q6ti32Q16KBwVmhMlLphac8Vmi8izJ7m'));
check('asset-pipeline-remains-presentation-only', files.assetPipelineMap.includes('GLB/glTF remains the preferred authored 3D direction') && files.assetPipelineMap.includes('does not redefine the target\'s gameplay fields'));
check('image-default-current', files.cli.includes("'gemini-3.1-flash-image'"));
check('video-default-current', files.cli.includes("'gemini-omni-flash-preview'"));
check('model-override-supported', files.cli.includes('options.model ||'));
check('dry-run-does-not-require-key', files.cli.indexOf('if (options.dryRun)') < files.cli.indexOf('const apiKey = process.env.GEMINI_API_KEY'));
check('manifest-does-not-record-key', !/manifest\s*=\s*\{[\s\S]{0,2000}apiKey/i.test(files.cli));

const combinedSource = [files.cli, files.readme, ...Object.values(briefs).map((brief) => JSON.stringify(brief))].join('\n');
const embeddedGoogleKeys = combinedSource.match(/AIza[0-9A-Za-z_-]{25,}/g) || [];
check('no-embedded-google-api-key', embeddedGoogleKeys.length === 0, embeddedGoogleKeys.join(', '));

for (const [name, brief] of Object.entries(briefs)) {
  check(`brief-${name}-version`, brief.version === 'SW_ART_BRIEF_V1', brief.version);
  check(`brief-${name}-id`, brief.id === name, brief.id);
  check(`brief-${name}-prompt`, typeof brief.prompt === 'string' && brief.prompt.length >= 200, String(brief.prompt?.length || 0));
  check(`brief-${name}-authority`, typeof brief.productionAuthority === 'string' && /reference|previsualization/i.test(brief.productionAuthority), brief.productionAuthority);
  check(`brief-${name}-drive-target`, typeof brief.googleDriveArchive === 'string' && brief.googleDriveArchive.startsWith('https://drive.google.com/drive/folders/'));
}

function runDry(command, brief) {
  const stdout = execFileSync(process.execPath, [cliPath, command, '--brief', brief, '--dry-run'], {
    cwd: projectRoot,
    encoding: 'utf8',
    env: { ...process.env, GEMINI_API_KEY: '' },
  });
  return JSON.parse(stdout);
}

let imageDry = null;
let videoDry = null;
try {
  imageDry = runDry('image', 'cow17');
  check('image-dry-run-executes', imageDry.dryRun === true && imageDry.command === 'image' && imageDry.briefId === 'cow17');
  check('image-dry-run-no-secret', !JSON.stringify(imageDry).includes('GEMINI_API_KEY') && !/AIza/.test(JSON.stringify(imageDry)));
} catch (error) {
  check('image-dry-run-executes', false, error.message);
}

try {
  videoDry = runDry('video', 'moo-brew-touchdown-previz');
  check('video-dry-run-executes', videoDry.dryRun === true && videoDry.command === 'video' && videoDry.briefId === 'moo-brew-touchdown-previz');
  check('video-dry-run-previsualization-only', /previsualization/i.test(videoDry.productionAuthority));
} catch (error) {
  check('video-dry-run-executes', false, error.message);
}

const failedChecks = checks.filter((entry) => !entry.passed);
const report = {
  version: 'SW_ART_001_STATIC_V1',
  passed: failedChecks.length === 0,
  checks,
  failedChecks,
  evidence: {
    briefIds: Object.keys(briefs),
    embeddedGoogleKeys,
    imageDry,
    videoDry,
  },
};

await writeFile(path.join(projectRoot, 'sw-art-001-static-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
if (!report.passed) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
console.log(`SW-ART-001 static verification passed ${checks.length}/${checks.length}; briefs=${Object.keys(briefs).length}.`);
