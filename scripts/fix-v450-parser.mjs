import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const targetPath = path.join(projectRoot, 'scripts', 'apply-v450-source-patch.mjs');
const unsafe = "return playStormClip(`material_${family}_${variant}`, {";
const safe = "return playStormClip('material_' + family + '_' + variant, {";

let source = await readFile(targetPath, 'utf8');
const unsafeCount = source.split(unsafe).length - 1;
const safeCount = source.split(safe).length - 1;

if (unsafeCount === 1) {
  source = source.replace(unsafe, safe);
  await writeFile(targetPath, source, 'utf8');
  console.log('Repaired nested v4.5.0 material-audio template literal.');
} else if (unsafeCount === 0 && safeCount === 1) {
  console.log('v4.5.0 material-audio parser fix already applied.');
} else {
  throw new Error(`Expected one unsafe or one repaired material-audio expression; found unsafe=${unsafeCount}, repaired=${safeCount}.`);
}

// This script makes the historical repair idempotent. Workflows perform their
// own explicit `node --check`, avoiding a nested child process that can be
// blocked by managed Windows environments even when the file is valid.
console.log('v4.5.0 parser repair is present; external syntax verification may proceed.');
