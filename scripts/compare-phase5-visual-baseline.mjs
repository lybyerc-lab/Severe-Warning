import { readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(scriptDir, 'compare-phase5-visual-baseline-v6.mjs');
const generatedPath = path.join(scriptDir, '.compare-phase5-visual-baseline-v7-generated.mjs');
let source = await readFile(sourcePath, 'utf8');

const startAnchor = "replaceExact(\n  `function installQaFrameController(seed) {";
const endAnchor = "\n\nreplaceExact(\n  \"const fixedTimestamps";
const start = source.indexOf(startAnchor);
const end = source.indexOf(endAnchor, start);
if (start < 0 || end < 0) {
  throw new Error(`constant boot random patch anchors missing: start=${start}, end=${end}`);
}

const replacement = `replaceExact(
  \`function installQaFrameController(seed) {
  let randomState = seed >>> 0;
  Math.random = () => {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    return randomState / 0x100000000;
  };\`,
  \`function installQaFrameController(seed) {
  Math.random = () => 0.5;\`,
  'constant boot random independent of extra initialization calls',
);`;

source = `${source.slice(0, start)}${replacement}${source.slice(end)}`;
source = source.replace(
  "version: 'PHASE5_DUAL_BUILD_VISUAL_BASELINE_V6'",
  "version: 'PHASE5_DUAL_BUILD_VISUAL_BASELINE_V7'",
);
source = source.replace(
  "comparisonSource: 'Playwright canvas PNG after callsite-seeded boot, production-slice rebuild, static scenario normalization, and explicit render'",
  "comparisonSource: 'Playwright canvas PNG after constant-random boot, seeded production-slice rebuild, static scenario normalization, and explicit render'",
);

await writeFile(generatedPath, source, 'utf8');
try {
  await import(`${pathToFileURL(generatedPath).href}?v=${Date.now()}`);
} finally {
  await rm(generatedPath, { force: true });
}
