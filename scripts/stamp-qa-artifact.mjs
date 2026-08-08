import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ============================================================================
// [SW:QA_PAGES:EXACT_ARTIFACT_STAMP]
// Re-stamps an already-built, sealed QA artifact with its true source identity.
// This deliberately avoids GITHUB_SHA because Pages publishes from the `qa`
// branch while the playable candidate comes from a separately sealed CI run.
// ============================================================================

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const candidatePath = process.env.SEVERE_WEATHER_QA_CANDIDATE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_QA_CANDIDATE_PATH)
  : path.join(projectRoot, 'qa-candidate.json');
const outputDir = process.env.SEVERE_WEATHER_QA_WWW_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_QA_WWW_DIR)
  : path.join(projectRoot, 'www');
const indexPath = path.join(outputDir, 'index.html');

const candidate = JSON.parse(await readFile(candidatePath, 'utf8'));
if (candidate.version !== 'SW_QA_PAGES_CANDIDATE_V1') {
  throw new Error(`Unexpected QA candidate pointer version: ${candidate.version}`);
}
if (!/^[0-9a-f]{40}$/.test(String(candidate.sourceCommit || ''))) {
  throw new Error(`Invalid QA candidate source commit: ${candidate.sourceCommit}`);
}

const shortSha = candidate.sourceCommit.slice(0, 7);
const publishedAt = new Date().toISOString();
const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

let html = await readFile(indexPath, 'utf8');
if (!/<body(?:\s[^>]*)?>/i.test(html)) {
  throw new Error('Unable to find the document body for the exact-artifact QA stamp.');
}

// Remove the build-time PR merge-ref stamp before adding the source-commit stamp.
html = html.replace(/\s*<!-- QA_BUILD_STAMP -->\s*<style id="qaBuildStampStyle">[\s\S]*?<\/style>/gi, '');
html = html.replace(/\s*<div id="qaBuildStamp"[^>]*>[\s\S]*?<\/div>/gi, '');

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
const badgeText = `QA · ${candidate.label} #${candidate.workflowRunNumber} · ${shortSha}`;
const badge = `<div id="qaBuildStamp" aria-hidden="true">${escapeHtml(badgeText)}</div>`;
html = html.replace('</head>', `${style}\n</head>`);
html = html.replace(/<body(\s[^>]*)?>/i, (match) => `${match}\n${badge}`);

const metadata = {
  channel: 'qa',
  candidateVersion: candidate.version,
  label: candidate.label,
  pagesRoot: candidate.pagesRoot,
  renderer: candidate.renderer,
  sourceBranch: candidate.sourceBranch,
  commitSha: candidate.sourceCommit,
  shortSha,
  workflowRunId: candidate.workflowRunId,
  workflowRunNumber: candidate.workflowRunNumber,
  artifactName: candidate.artifactName,
  artifactId: candidate.artifactId,
  artifactDigest: candidate.artifactDigest,
  acceptance: candidate.acceptance,
  publishedAt,
};

await writeFile(indexPath, html, 'utf8');
await writeFile(path.join(outputDir, '404.html'), html, 'utf8');
await writeFile(path.join(outputDir, '.nojekyll'), '', 'utf8');
await writeFile(path.join(outputDir, 'qa-build.json'), `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');

console.log(`Stamped exact QA artifact ${candidate.artifactName} at source ${candidate.sourceCommit}.`);
// [SW:QA_PAGES:EXACT_ARTIFACT_STAMP:END]
