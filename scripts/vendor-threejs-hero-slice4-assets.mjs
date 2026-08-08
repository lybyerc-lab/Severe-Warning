import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = path.join(projectRoot, 'assets', 'production', 'vfx', 'kenney');
const upstreamCommit = 'ab7086639ee73be31abd87feb21bf1402d4e8144';
const upstreamRepository = 'Calinou/kenney-particle-pack';

const assets = [
  {
    id: 'kenney.dirt-01',
    upstreamPath: 'addons/kenney_particle_pack/dirt_01.png',
    blobSha: '3bf82433236c8a0e5452563dccafd0ca4ec82a31',
    outputName: 'dirt_01.png',
    intendedUse: 'tornado ground grit and dust skirt',
  },
  {
    id: 'kenney.smoke-03',
    upstreamPath: 'addons/kenney_particle_pack/smoke_03.png',
    blobSha: '34cad39231026b6617f25e03e99c0b860258d010',
    outputName: 'smoke_03.png',
    intendedUse: 'tornado condensation shell and vapor wisps',
  },
  {
    id: 'kenney.trace-03',
    upstreamPath: 'addons/kenney_particle_pack/trace_03.png',
    blobSha: 'dcd8c6c39b522e207ee972bff30d064c60f20c07',
    outputName: 'trace_03.png',
    intendedUse: 'rain and gust streak cards',
  },
];

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`, 'utf8');
  return createHash('sha1').update(header).update(buffer).digest('hex');
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

async function fetchPinnedAsset(asset) {
  const localPath = path.join(outputDir, asset.outputName);
  try {
    const existing = await readFile(localPath);
    if (gitBlobSha(existing) === asset.blobSha) return existing;
  } catch (_) {
    // No pre-vendored candidate file. Continue to exact pinned upstream fetch.
  }

  const encodedPath = asset.upstreamPath.split('/').map(encodeURIComponent).join('/');
  const url = `https://raw.githubusercontent.com/${upstreamRepository}/${upstreamCommit}/${encodedPath}`;
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': 'severe-weather-hero-slice4-vendor/1.0' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      const actualBlob = gitBlobSha(buffer);
      if (actualBlob !== asset.blobSha) {
        throw new Error(`${asset.id} upstream blob mismatch: expected ${asset.blobSha}, received ${actualBlob}`);
      }
      return buffer;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }
  throw lastError || new Error(`Unable to vendor ${asset.id}.`);
}

await mkdir(outputDir, { recursive: true });
const evidence = [];
for (const asset of assets) {
  const buffer = await fetchPinnedAsset(asset);
  const actualBlob = gitBlobSha(buffer);
  if (actualBlob !== asset.blobSha) throw new Error(`${asset.id} local blob verification failed.`);
  const outputPath = path.join(outputDir, asset.outputName);
  await writeFile(outputPath, buffer);
  evidence.push({
    id: asset.id,
    upstreamRepository,
    upstreamCommit,
    upstreamPath: asset.upstreamPath,
    upstreamBlobSha: asset.blobSha,
    license: 'CC0-1.0',
    licenseEvidencePath: 'LICENSE.txt',
    intendedUse: asset.intendedUse,
    localPath: path.relative(projectRoot, outputPath).replaceAll('\\', '/'),
    bytes: buffer.length,
    sha256: sha256(buffer),
  });
}

const checksumEvidence = {
  version: 'THREEJS_HERO_SLICE4_VFX_VENDOR_V1',
  generatedAt: new Date().toISOString(),
  reviewStatus: 'hero-slice4-candidate-not-production-approved',
  runtimeNetworkRequired: false,
  upstreamRepository,
  upstreamCommit,
  files: evidence,
};
await writeFile(path.join(outputDir, 'checksums.json'), `${JSON.stringify(checksumEvidence, null, 2)}\n`, 'utf8');
console.log(`Vendored and verified ${evidence.length} pinned CC0 Hero Slice 4 VFX files into assets/production/vfx/kenney.`);
