import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');

let failures = 0;

async function walk(dir, fileList = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'www') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allFiles = await walk(projectRoot);
const testFiles = allFiles.filter(f => f.endsWith('.test.ts'));
const htmlFiles = allFiles.filter(f => f.endsWith('.html'));

// 1. Check test files
for (const file of testFiles) {
  const content = await readFile(file, 'utf8');
  const rel = path.relative(projectRoot, file);
  if (content.includes("from 'vitest'") || content.includes('from vitest')) {
    console.error(`FAIL: ${rel} imports from 'vitest'. Must use 'node:test' and 'node:assert/strict'.`);
    failures++;
  }
  if (content.includes("from 'jest'") || content.includes('from jest')) {
    console.error(`FAIL: ${rel} imports from 'jest'. Must use 'node:test' and 'node:assert/strict'.`);
    failures++;
  }
}

// 2. Check emojis in HTML and TS
const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;
for (const file of [...htmlFiles, ...testFiles]) {
  const content = await readFile(file, 'utf8');
  const rel = path.relative(projectRoot, file);
  if (emojiRegex.test(content)) {
    console.error(`FAIL: ${rel} contains surrogate-pair emoji characters. Must use clean retro typography.`);
    failures++;
  }
}

if (failures > 0) {
  console.error(`\nFAILED: ${failures} project hygiene violations found.`);
  process.exit(1);
} else {
  console.log('PASS: All test files, TypeScript imports, and typography meet strict project hygiene standards.');
}
