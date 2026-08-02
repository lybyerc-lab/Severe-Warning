import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = path.join(projectRoot, 'www');
const indexPath = path.join(outputDir, 'index.html');

const runNumber = process.env.GITHUB_RUN_NUMBER || 'local';
const commitSha = process.env.GITHUB_SHA || 'local';
const shortSha = commitSha.slice(0, 7);
const branchName = process.env.GITHUB_REF_NAME || 'local';
const builtAt = new Date().toISOString();
const buildTrainStage = 'QA Stage 4';

const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

let html = await readFile(indexPath, 'utf8');
if (!/<body(?:\s[^>]*)?>/i.test(html)) {
  throw new Error('Unable to find the document body for the QA build stamp.');
}

const style = `
<!-- QA_BUILD_STAMP -->
<style id="qaBuildStampStyle">
  #qaBuildStamp {
    position: fixed;
    top: calc(env(safe-area-inset-top, 0px) + 28px);
    right: calc(env(safe-area-inset-right, 0px) + 8px);
    z-index: 99999;
    pointer-events: none;
    padding: 3px 6px;
    border: 1px solid rgba(56, 189, 248, 0.68);
    border-radius: 999px;
    background: rgba(3, 7, 18, 0.78);
    color: #bae6fd;
    font: 800 8px/1.1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    letter-spacing: 0.04em;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(4px);
    opacity: 0.92;
  }
</style>`;

const badge = `<div id="qaBuildStamp" aria-hidden="true">${escapeHtml(buildTrainStage)} · QA #${escapeHtml(runNumber)} · ${escapeHtml(shortSha)}</div>`;
html = html.replace('</head>', `${style}\n</head>`);
html = html.replace(/<body(\s[^>]*)?>/i, match => `${match}\n${badge}`);

await writeFile(indexPath, html, 'utf8');
await writeFile(path.join(outputDir, '404.html'), html, 'utf8');
await writeFile(path.join(outputDir, '.nojekyll'), '', 'utf8');
await writeFile(
  path.join(outputDir, 'qa-build.json'),
  `${JSON.stringify({
    channel: 'qa',
    buildTrainStage,
    runNumber,
    commitSha,
    shortSha,
    branchName,
    builtAt
  }, null, 2)}\n`,
  'utf8'
);

console.log(`Stamped ${buildTrainStage} GitHub Pages QA build #${runNumber} at ${shortSha}.`);
