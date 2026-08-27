import { execSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const inventoryPath = path.join(projectRoot, 'FILE_INVENTORY.txt');

const output = execSync('git ls-files --cached --others --exclude-standard', {
  cwd: projectRoot,
  encoding: 'utf8'
});

const files = output
  .split(/\r?\n/)
  .map(f => f.trim())
  .filter(Boolean)
  .sort();

const content = files.join('\n') + '\n';
await writeFile(inventoryPath, content, { encoding: 'utf8' });
console.log(Successfully synchronized FILE_INVENTORY.txt with  tracked files (UTF-8, Ordinal sort).);
