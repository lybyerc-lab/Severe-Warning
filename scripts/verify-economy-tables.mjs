// [SW:GAMEPLAY:ECONOMY_RUNWAY] Keep the two shop tables from drifting apart.
//
// WHY THIS EXISTS, AND WHAT IT CAUGHT
// -----------------------------------
// The shop is described twice: SW_RPG_UPGRADES / SW_RPG_SKINS in the gameplay
// source, which is what the page actually renders and charges, and
// MOOLAH_UPGRADES / MOOLAH_SKINS in src/gameplay/economy/moolah-system.ts, which
// is what the unit tests exercise. On 2026-08-29 they were found to disagree:
// the page shipped four upgrades and the tested table carried three, with no
// TWIN TWISTER in it at all. The tested half was not the shipped half, and
// nothing anywhere noticed -- which is worse than having no second table, because
// it looks like coverage.
//
// The right long-term answer is one table. Until the page can import one, this
// fails the build whenever the two disagree on a key, a price or an effect.
//
// It is deliberately a build check rather than a unit test: a unit test cannot
// read the gameplay HTML, and the drift lives precisely in the gap between the
// two files.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '.');
const htmlPath = path.join(root, 'MechanicsLab', 'SevereWeather_Warning.html');
const tsPath = path.join(root, 'src', 'gameplay', 'economy', 'moolah-system.ts');

const failures = [];
const notes = [];

function readOrFail(file) {
  if (!fs.existsSync(file)) {
    failures.push(`missing file: ${path.relative(root, file)}`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

const html = readOrFail(htmlPath);
const ts = readOrFail(tsPath);

/** Pull `key: value` pairs out of one object literal entry, whatever the layout. */
function fields(body) {
  const out = {};
  for (const match of body.matchAll(/(\w+)\s*:\s*(-?[\d.]+|'[^']*'|"[^"]*")/g)) {
    const raw = match[2];
    out[match[1]] = /^['"]/.test(raw) ? raw.slice(1, -1) : Number(raw);
  }
  return out;
}

/** Every entry of a frozen object literal, keyed by its own `key:` field. */
function parseTable(source, declaration) {
  const start = source.indexOf(declaration);
  if (start < 0) return null;
  // Walk braces from the opening one so nested objects end in the right place.
  const open = source.indexOf('{', start);
  let depth = 0;
  let end = -1;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end < 0) return null;
  const body = source.slice(open + 1, end);
  const entries = {};
  for (const match of body.matchAll(/\{[^{}]*\}/g)) {
    const parsed = fields(match[0]);
    if (parsed.key) entries[parsed.key] = parsed;
  }
  return entries;
}

const pairs = [
  { what: 'upgrades', page: 'const SW_RPG_UPGRADES', module: 'export const MOOLAH_UPGRADES', compare: ['cost', 'base', 'upgraded', 'unit', 'label'] },
  { what: 'skins', page: 'const SW_RPG_SKINS', module: 'export const MOOLAH_SKINS', compare: ['cost', 'label'] }
];

for (const pair of pairs) {
  const pageTable = parseTable(html, pair.page);
  const moduleTable = parseTable(ts, pair.module);
  if (!pageTable || !moduleTable) {
    failures.push(`${pair.what}: could not read ${!pageTable ? pair.page : pair.module}`);
    continue;
  }

  const pageKeys = Object.keys(pageTable).sort();
  const moduleKeys = Object.keys(moduleTable).sort();
  for (const key of pageKeys) {
    if (!moduleKeys.includes(key)) failures.push(`${pair.what}: '${key}' is in the page but not in moolah-system.ts`);
  }
  for (const key of moduleKeys) {
    if (!pageKeys.includes(key)) failures.push(`${pair.what}: '${key}' is in moolah-system.ts but not in the page`);
  }

  for (const key of pageKeys.filter(k => moduleKeys.includes(k))) {
    for (const field of pair.compare) {
      const a = pageTable[key][field];
      const b = moduleTable[key][field];
      if (a === undefined && b === undefined) continue;
      if (a !== b) failures.push(`${pair.what}: '${key}.${field}' is ${JSON.stringify(a)} in the page and ${JSON.stringify(b)} in moolah-system.ts`);
    }
  }
  notes.push(`${pair.what}: ${pageKeys.length} entries agree on ${pair.compare.join(', ')}`);
}

// A parser that silently matched nothing would pass this check forever, so prove
// it read something first.
const upgrades = parseTable(html, 'const SW_RPG_UPGRADES');
if (!upgrades || Object.keys(upgrades).length < 3) {
  failures.push('self-check: the page upgrade table parsed as fewer than 3 entries, so this check is not reading what it thinks');
}

for (const note of notes) console.log(`  ${note}`);
if (failures.length) {
  console.error('\nEconomy table verification FAILED:');
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error('\nThe shop is described in two places. Make them agree, or delete one.');
  process.exit(1);
}
console.log(`\nEconomy table verification: the page and moolah-system.ts agree.`);
