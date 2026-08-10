import { createHash } from 'node:crypto';
import { access, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

function fail(message) {
  throw new Error(`QA candidate contract: ${message}`);
}

function parseArgs(argv) {
  const [command, ...tokens] = argv;
  if (!command || !['create', 'validate'].includes(command)) {
    fail('usage: node scripts/qa-candidate-contract.mjs <create|validate> [options]');
  }
  const values = { command, requireFile: [], requireMarker: [], requireEvidence: [], requireReport: [] };
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.startsWith('--')) fail(`unexpected argument ${token}`);
    const key = token.slice(2);
    const value = tokens[index + 1];
    if (!value || value.startsWith('--')) fail(`missing value for --${key}`);
    index += 1;
    const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (['requireFile', 'requireMarker', 'requireEvidence', 'requireReport'].includes(camelKey)) values[camelKey].push(value);
    else values[camelKey] = value;
  }
  return values;
}

function splitRequirement(value, label) {
  const separator = '::';
  const index = value.indexOf(separator);
  if (index < 1 || index === value.length - separator.length) fail(`${label} must use path::value syntax`);
  return { path: value.slice(0, index), value: value.slice(index + separator.length) };
}

function asRelativePath(value, label) {
  const normalized = value.replaceAll('\\', '/');
  if (!normalized || path.posix.isAbsolute(normalized) || normalized.split('/').includes('..')) fail(`${label} must be a safe relative path: ${value}`);
  return normalized;
}

async function isFile(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function hashTree(root) {
  const entries = [];
  async function visit(relative = '') {
    const directory = path.join(root, relative);
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const childRelative = path.posix.join(relative.replaceAll('\\', '/'), entry.name);
      if (entry.isDirectory()) await visit(childRelative);
      else if (entry.isFile()) {
        const contents = await readFile(path.join(root, childRelative));
        entries.push(`${childRelative}\0${createHash('sha256').update(contents).digest('hex')}`);
      }
    }
  }
  await visit();
  entries.sort();
  return createHash('sha256').update(entries.join('\n')).digest('hex');
}

async function validateContract(manifest, root, expectedSource, expectedWorkflowRunId) {
  const errors = [];
  const requireValue = (condition, detail) => { if (!condition) errors.push(detail); };
  requireValue(manifest?.version === 'SEVERE_WEATHER_QA_CANDIDATE_V1', 'unsupported or missing version');
  requireValue(typeof manifest?.source?.commit === 'string' && /^[0-9a-f]{40}$/i.test(manifest.source.commit), 'missing valid source.commit');
  requireValue(typeof manifest?.source?.branch === 'string' && manifest.source.branch.length > 0, 'missing source.branch');
  requireValue(typeof manifest?.renderer === 'string' && manifest.renderer.length > 0, 'missing renderer');
  requireValue(typeof manifest?.acceptance === 'string' && manifest.acceptance.length > 0, 'missing acceptance vocabulary');
  if (expectedSource) requireValue(manifest?.source?.commit === expectedSource, `source mismatch: expected ${expectedSource}, received ${manifest?.source?.commit || 'missing'}`);
  if (expectedWorkflowRunId) requireValue(String(manifest?.source?.workflowRunId) === expectedWorkflowRunId, `workflow run ID mismatch: expected ${expectedWorkflowRunId}, received ${manifest?.source?.workflowRunId || 'missing'}`);
  const webRoot = asRelativePath(manifest?.web?.root || '', 'web.root');
  const webPath = path.join(root, webRoot);
  requireValue(await isFile(path.join(webPath, 'index.html')), `missing web entry ${webRoot}/index.html`);
  if (errors.length === 0) {
    const actualTreeHash = await hashTree(webPath);
    requireValue(actualTreeHash === manifest.web.treeSha256, `web tree digest mismatch: expected ${manifest.web.treeSha256}, received ${actualTreeHash}`);
  }
  for (const relativePath of manifest.requiredFiles || []) {
    const safePath = asRelativePath(relativePath, 'required file');
    requireValue(await isFile(path.join(root, safePath)), `missing required file ${safePath}`);
  }
  for (const entry of manifest.requiredMarkers || []) {
    const safePath = asRelativePath(entry.path || '', 'marker path');
    try {
      const contents = await readFile(path.join(root, safePath), 'utf8');
      requireValue(contents.includes(entry.value), `missing required marker in ${safePath}: ${entry.value}`);
    } catch {
      errors.push(`unable to read marker file ${safePath}`);
    }
  }
  for (const relativePath of manifest.requiredEvidence || []) {
    const safePath = asRelativePath(relativePath, 'required evidence');
    requireValue(await isFile(path.join(root, safePath)), `missing required evidence ${safePath}`);
  }
  for (const report of manifest.requiredReports || []) {
    const safePath = asRelativePath(report.path || '', 'report path');
    try {
      const parsed = JSON.parse(await readFile(path.join(root, safePath), 'utf8'));
      requireValue(parsed.passed === true, `required report did not pass ${safePath}`);
    } catch (error) {
      errors.push(`unable to validate required report ${safePath}: ${error.message}`);
    }
  }
  if (errors.length > 0) fail(errors.join('; '));
}

const options = parseArgs(process.argv.slice(2));
const root = path.resolve(options.root || '.');
const manifestPath = path.resolve(root, options.manifest || 'qa-candidate.json');

if (options.command === 'create') {
  for (const required of ['sourceCommit', 'sourceBranch', 'renderer', 'acceptance', 'webRoot']) {
    if (!options[required]) fail(`--${required.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)} is required when creating a contract`);
  }
  if (!/^[0-9a-f]{40}$/i.test(options.sourceCommit)) fail('--source-commit must be a 40-character SHA');
  const webRoot = asRelativePath(options.webRoot, 'web root');
  const manifest = {
    version: 'SEVERE_WEATHER_QA_CANDIDATE_V1',
    source: { commit: options.sourceCommit, branch: options.sourceBranch, workflowRunId: options.workflowRunId || 'local' },
    renderer: options.renderer,
    acceptance: options.acceptance,
    web: { root: webRoot, treeSha256: await hashTree(path.join(root, webRoot)) },
    requiredFiles: options.requireFile.map(value => asRelativePath(value, 'required file')),
    requiredMarkers: options.requireMarker.map(value => splitRequirement(value, 'required marker')),
    requiredEvidence: options.requireEvidence.map(value => asRelativePath(value, 'required evidence')),
    requiredReports: options.requireReport.map(value => ({ path: asRelativePath(value, 'required report') })),
  };
  await validateContract(manifest, root, options.expectedSource, options.expectedWorkflowRunId);
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Created validated QA candidate contract: ${manifestPath}`);
} else {
  await access(manifestPath);
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  await validateContract(manifest, root, options.expectedSource, options.expectedWorkflowRunId);
  console.log(`Validated QA candidate contract: ${manifestPath}`);
}
