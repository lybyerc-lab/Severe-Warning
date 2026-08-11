import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wwwDir = path.resolve(process.env.SEVERE_WEATHER_PROTOTYPE_WWW_DIR || path.join(projectRoot, 'www'));
const requiredFiles = ['index.html', 'build-info.json', 'modern/modern-shell.js', 'runtime/v510-runtime.js'];

for (const relativePath of requiredFiles) {
  const filePath = path.join(wwwDir, relativePath);
  await access(filePath);
  if (!(await stat(filePath)).isFile()) throw new Error(`Prototype web verification requires file: ${relativePath}`);
}

const [indexHtml, buildInfoText] = await Promise.all([
  readFile(path.join(wwwDir, 'index.html'), 'utf8'),
  readFile(path.join(wwwDir, 'build-info.json'), 'utf8'),
]);
const buildInfo = JSON.parse(buildInfoText);
if (buildInfo.renderer !== 'Three.js r128') throw new Error(`Prototype web renderer mismatch: ${buildInfo.renderer}`);
if (!indexHtml.includes('V510_THREEJS_PRODUCTION_SLICE_V1')) throw new Error('Prototype web bundle is missing the production-slice marker.');
if (!indexHtml.includes('./modern/modern-shell.js')) throw new Error('Prototype web bundle is missing the modern shell entrypoint.');
console.log(`Prototype web verification: PASS (${buildInfo.renderer}, ${wwwDir})`);
