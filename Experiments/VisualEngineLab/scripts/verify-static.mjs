import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'package.json', 'tsconfig.json', 'vite.config.ts', 'index.html', 'README.md',
  'src/main.ts', 'src/app/visual-lab-app.ts', 'src/contracts/visual-events.ts',
  'src/contracts/validators.ts', 'src/quality/profiles.ts', 'src/diagnostics/diagnostics-hud.ts',
  'src/world/benchmark-world.ts', 'src/storm/tornado-system.ts',
  'src/destruction/barn-destruction.ts', 'src/animals/cow-system.ts',
  'src/replay/benchmark-replay.ts', 'src/tests/contracts.test.ts', 'src/tests/replay.test.ts'
];

const failures = [];
for (const file of required) {
  const absolute = join(root, file);
  if (!existsSync(absolute) || statSync(absolute).size === 0) failures.push(`missing ${file}`);
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const sourceFiles = walk(root).filter((file) => /\.(?:ts|html|css|json|md|mjs)$/.test(file) && !file.includes('node_modules') && !file.includes(`${join(root, 'dist')}`));
const source = sourceFiles.map((file) => readFileSync(file, 'utf8')).join('\n');
const runtimeFiles = sourceFiles.filter((file) => /\.(?:ts|html|css)$/.test(file));
const runtime = runtimeFiles.map((file) => readFileSync(file, 'utf8')).join('\n');

for (const [name, marker] of [
  ['schema version', 'severe-warning.visual.v1'],
  ['all quality tiers', "['low', 'balanced', 'high', 'showcase']"],
  ['WebGL 2 gate', 'webGLVersion < 2'],
  ['explicit engine disposal', 'this.engine.dispose()'],
  ['layered tornado', 'tornado-condensation'],
  ['five destruction states', "'partial-collapse', 'wreckage'"],
  ['Cow 17', "readonly id = 17"],
  ['safe animal invariant', 'readonly safeAnimal = true'],
  ['safe landing event', "'cow.landed-safely'"],
  ['world reset event', "'world.reset'"],
  ['accelerated replay', 'this.acceleratedValue ? 6 : 1'],
  ['QA state API', '__SEVERE_WARNING_VISUAL_LAB__']
]) {
  if (!source.includes(marker)) failures.push(`missing marker: ${name}`);
}

if (/https?:\/\//i.test(runtime)) failures.push('runtime source contains an HTTP(S) URL; CDN/runtime network access is forbidden');
if (/Math\.random\s*\(/.test(runtime)) failures.push('runtime source contains Math.random; deterministic visual variation must use supplied seeds');

console.log(`Visual Lab static verification: ${failures.length ? 'FAIL' : 'PASS'}`);
console.log(`Inspected ${runtimeFiles.length} runtime files.`);
for (const file of runtimeFiles) console.log(`- ${relative(root, file).replaceAll('\\', '/')}`);
if (failures.length) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
