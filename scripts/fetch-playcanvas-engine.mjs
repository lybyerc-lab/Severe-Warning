import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const version = '2.21.3';
const baseUrl = `https://cdn.jsdelivr.net/npm/playcanvas@${version}`;
const destination = path.resolve('playcanvas-slice/public/vendor');
const enginePath = path.join(destination, `playcanvas-${version}.min.mjs`);
const licensePath = path.join(destination, 'PLAYCANVAS_LICENSE.txt');
const reportPath = path.resolve('playcanvas-slice-engine-report.json');

async function download(url) {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) throw new Error(`Download failed: ${response.status} ${response.statusText} ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

await mkdir(destination, { recursive: true });
const [engine, license] = await Promise.all([
  download(`${baseUrl}/build/playcanvas.min.mjs`),
  download(`${baseUrl}/LICENSE`),
]);

if (engine.byteLength < 1_000_000) {
  throw new Error(`PlayCanvas engine payload is unexpectedly small: ${engine.byteLength} bytes.`);
}

const sha256 = createHash('sha256').update(engine).digest('hex');
const expectedSha256 = process.env.PLAYCANVAS_EXPECTED_SHA256?.trim();
if (expectedSha256 && sha256 !== expectedSha256) {
  throw new Error(`PlayCanvas SHA-256 mismatch. Expected ${expectedSha256}, received ${sha256}.`);
}

await writeFile(enginePath, engine);
await writeFile(licensePath, license);
await writeFile(
  reportPath,
  `${JSON.stringify({
    version,
    source: `${baseUrl}/build/playcanvas.min.mjs`,
    bytes: engine.byteLength,
    sha256,
    expectedSha256: expectedSha256 || null,
    checksumPinned: Boolean(expectedSha256),
  }, null, 2)}\n`,
);

console.log(`PlayCanvas ${version} vendor payload: ${engine.byteLength} bytes, sha256:${sha256}`);
