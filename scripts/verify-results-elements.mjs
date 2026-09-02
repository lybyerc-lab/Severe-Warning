// [SW:QA:PHANTOM_IDS] Every element the results screen writes to must exist.
//
// WHY THIS EXISTS
// ---------------
// Two bugs of the same shape have shipped in this project, both invisible for
// the whole life of the feature, because `document.getElementById('x')?.…` on a
// missing id is not an error -- it is a silent no-op:
//
//   * `#resEfRating` -- read by the newspaper's rating line and never present,
//     so every paper ever printed reported EF-0, including EF-5 runs graded S+.
//   * `#newspaperMoolahEarned` -- written by updateHudMoolah since the economy
//     shipped and never present, so every run banked its payout in silence and
//     then offered the player a shop button for money they were never shown.
//
// Neither had a failing test, a console error, or a visible symptom other than
// a number that was quietly wrong. The only reliable way to catch the class is
// to compare, statically, what the code writes against what the document has.
//
// It checks the results/newspaper path specifically rather than the whole file:
// that is where both bugs lived, it is written once and read at the end of every
// run, and a whole-file sweep would drown in ids that are legitimately created
// and destroyed at runtime.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '.');
const htmlPath = path.join(root, 'MechanicsLab', 'SevereWeather_Warning.html');

if (!fs.existsSync(htmlPath)) {
  console.error(`verify-results-elements: no source at ${path.relative(root, htmlPath)}`);
  process.exit(1);
}
const html = fs.readFileSync(htmlPath, 'utf8');

/** Ids the document actually defines, from static markup or injected strings. */
const definedIds = new Set();
for (const match of html.matchAll(/\bid\s*=\s*["']([\w-]+)["']/g)) definedIds.add(match[1]);
for (const match of html.matchAll(/\.id\s*=\s*['"]([\w-]+)['"]/g)) definedIds.add(match[1]);

/** Grab one function body by brace matching, so nested blocks do not end it. */
function functionBody(source, signature) {
  const start = source.indexOf(signature);
  if (start < 0) return null;
  const open = source.indexOf('{', start);
  if (open < 0) return null;
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) return source.slice(open + 1, i);
    }
  }
  return null;
}

// The functions that assemble the end-of-run screen.
const WATCHED = [
  'function finishRun(',
  'function refreshNewspaperResults(',
  'function decorateNewspaperResults(',
  'function updateHudMoolah(',
  'function finalizeBovineRun('
];

const missing = [];
const scanned = [];
let writeSites = 0;

for (const signature of WATCHED) {
  const body = functionBody(html, signature);
  if (body === null) {
    missing.push(`${signature.replace('function ', '').replace('(', '')} is not in the source -- this check is watching a function that no longer exists`);
    continue;
  }
  scanned.push(signature);
  const ids = new Set();
  for (const match of body.matchAll(/getElementById\(\s*['"]([\w-]+)['"]\s*\)/g)) ids.add(match[1]);
  for (const match of body.matchAll(/\bsetUI\(\s*['"]([\w-]+)['"]/g)) ids.add(match[1]);
  writeSites += ids.size;
  for (const id of ids) {
    if (!definedIds.has(id)) {
      missing.push(`#${id} is written by ${signature.replace('function ', '').replace('(', '')}() but no element with that id exists`);
    }
  }
}

// A regex that silently matched nothing would pass forever. Prove it read the
// document and the functions before trusting a clean result.
if (definedIds.size < 50) missing.push(`self-check: only ${definedIds.size} ids found in the document, so the id scan is not working`);
if (writeSites < 15) missing.push(`self-check: only ${writeSites} element writes found across the results path, so the body scan is not working`);

console.log(`  scanned ${scanned.length} results functions, ${writeSites} element writes, against ${definedIds.size} defined ids`);
if (missing.length) {
  console.error('\nResults-element verification FAILED:');
  for (const line of missing) console.error(`  - ${line}`);
  console.error('\nA write to a missing id is silent. Add the element, or stop writing to it.');
  process.exit(1);
}
console.log('\nResults-element verification: every id the results screen writes to exists.');
