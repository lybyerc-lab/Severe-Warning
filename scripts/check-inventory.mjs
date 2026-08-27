import { execSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const inventoryPath = path.join(projectRoot, 'FILE_INVENTORY.txt');

const output = execSync('git ls-files --cached --others --exclude-standard', {
  cwd: projectRoot,
  encoding: 'utf8'
});

const expectedFiles = output
  .split(/\r?\n/)
  .map(f => f.trim())
  .filter(Boolean)
  .sort();

let raw = '';
try {
  raw = await readFile(inventoryPath, 'utf8');
} catch (e) {
  console.error(FAIL: FILE_INVENTORY.txt not found: );
  process.exit(1);
}

if (raw.charCodeAt(0) === 0xFEFF) {
  raw = raw.slice(1);
}

const currentFiles = raw
  .split(/\r?\n/)
  .map(f => f.trim())
  .filter(Boolean);

let mismatch = false;
if (expectedFiles.length !== currentFiles.length) {
  console.error(FAIL: File count mismatch: expected , got );
  mismatch = true;
} else {
  for (let i = 0; i < expectedFiles.length; i++) {
    if (expectedFiles[i] !== currentFiles[i]) {
      console.error(FAIL: Mismatch at line : expected ", got );
 mismatch = true;
 break;
 }
 }
}

if (mismatch) {
 console.error('Run pnpm run inventory:update or 
ode scripts/update-inventory.mjs to synchronize.');
 process.exit(1);
}

console.log(PASS: FILE_INVENTORY.txt is 100% synchronized ( files).);
