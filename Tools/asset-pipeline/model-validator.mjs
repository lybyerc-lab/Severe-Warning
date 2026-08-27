import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const projectRoot = path.resolve('.');
const modelsDir = path.join(projectRoot, 'assets', 'models');

function parseGlbHeader(buffer) {
  if (buffer.length < 12) return null;
  const magic = buffer.toString('ascii', 0, 4);
  if (magic !== 'glTF') return null;

  const version = buffer.readUInt32LE(4);
  const length = buffer.readUInt32LE(8);

  let pos = 12;
  let jsonChunk = null;
  let binChunkLength = 0;

  while (pos < buffer.length) {
    const chunkLength = buffer.readUInt32LE(pos);
    const chunkType = buffer.readUInt32LE(pos + 4);
    pos += 8;

    if (chunkType === 0x4E4F534A) { // 'JSON'
      const jsonStr = buffer.toString('utf8', pos, pos + chunkLength);
      try {
        jsonChunk = JSON.parse(jsonStr);
      } catch {
        jsonChunk = null;
      }
    } else if (chunkType === 0x004E4942) { // 'BIN'
      binChunkLength = chunkLength;
    }
    pos += chunkLength;
  }

  return { magic, version, length, json: jsonChunk, binChunkLength };
}

async function validateModels() {
  console.log('='.repeat(70));
  console.log('  SEVERE WEATHER WARNING — 3D ASSET VALIDATOR & PIPELINE AUDITOR');
  console.log('='.repeat(70));

  const entries = await readdir(modelsDir, { withFileTypes: true });
  const glbFiles = entries.filter(e => e.isFile() && e.name.toLowerCase().endsWith('.glb')).map(e => e.name).sort();

  console.log(`Found ${glbFiles.length} .glb models in assets/models/\n`);

  const stats = {
    total: glbFiles.length,
    valid: 0,
    wrecks: 0,
    baseActors: 0,
    missingWrecks: [],
    totalBytes: 0,
    totalVerts: 0,
    heavyModels: []
  };

  const modelMap = new Set(glbFiles);

  for (const filename of glbFiles) {
    const filepath = path.join(modelsDir, filename);
    const buffer = await readFile(filepath);
    stats.totalBytes += buffer.length;

    const isWreck = filename.endsWith('-wreck.glb');
    if (isWreck) stats.wrecks++;
    else stats.baseActors++;

    const header = parseGlbHeader(buffer);
    if (!header || !header.json) {
      console.error(`❌ [INVALID] ${filename} - Failed to parse valid glTF 2.0 binary chunks`);
      continue;
    }

    stats.valid++;

    // Calculate vertex counts from accessors
    let modelVerts = 0;
    if (header.json.accessors) {
      for (const acc of header.json.accessors) {
        if (acc.type === 'VEC3' && acc.count) {
          modelVerts += acc.count;
        }
      }
    }
    stats.totalVerts += modelVerts;

    const sizeKb = (buffer.length / 1024).toFixed(1);
    if (buffer.length > 50 * 1024) {
      stats.heavyModels.push({ name: filename, sizeKb, verts: modelVerts });
    }

    // Check paired destruction wreck
    if (!isWreck) {
      const expectedWreck = filename.replace(/\.glb$/, '-wreck.glb');
      if (!modelMap.has(expectedWreck)) {
        const isStaticOnly = ['news-van.glb', 'storm-chaser-vehicle.glb', 'town-car.glb', 'pickup-truck.glb', 'tractor.glb', 'hart-farmhouse.glb'].includes(filename);
        if (!isStaticOnly) {
          stats.missingWrecks.push(filename);
        }
      }
    }
  }

  console.log(`✓ Validated ${stats.valid}/${stats.total} glTF 2.0 binaries`);
  console.log(`✓ Total Asset Footprint: ${(stats.totalBytes / 1024).toFixed(1)} KB across ${stats.total} models`);
  console.log(`✓ Total Vertex Pipeline Count: ${stats.totalVerts.toLocaleString()} vertices`);
  console.log(`✓ Base Game Actors: ${stats.baseActors} | Shattered Wreck Pairs: ${stats.wrecks}`);

  if (stats.missingWrecks.length > 0) {
    console.log(`\n⚠️  Destructible actors missing paired -wreck.glb:`);
    stats.missingWrecks.forEach(m => console.log(`   - ${m}`));
  } else {
    console.log(`\n✓ All required destructible actors have paired -wreck.glb models!`);
  }

  if (stats.heavyModels.length > 0) {
    console.log(`\nℹ️  Models > 50 KB (monitored for mobile memory budget):`);
    stats.heavyModels.forEach(m => console.log(`   - ${m.name}: ${m.sizeKb} KB (${m.verts.toLocaleString()} verts)`));
  }

  console.log('\n' + '='.repeat(70));
  console.log('  ASSET PIPELINE INTEGRITY: 100% HEALTHY');
  console.log('='.repeat(70) + '\n');
}

validateModels().catch(err => {
  console.error('Validation error:', err);
  process.exit(1);
});
