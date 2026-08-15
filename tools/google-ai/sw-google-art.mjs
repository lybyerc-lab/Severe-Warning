#!/usr/bin/env node

// [SW:ART:GOOGLE_AI_CLI]
// SW_ART_001_GOOGLE_AI_CLI_V1
// Tooling only. This file must never be imported by the game/runtime bundle.

import { readFile, mkdir, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..', '..');
const briefsDir = path.join(scriptDir, 'briefs');
const defaultOutputRoot = path.join(projectRoot, 'art-source', 'generated', 'google-ai');
const interactionsUrl = 'https://generativelanguage.googleapis.com/v1beta/interactions';

function usage() {
  console.log(`Severe Weather Warning Google AI art CLI\n\nUsage:\n  node tools/google-ai/sw-google-art.mjs list\n  node tools/google-ai/sw-google-art.mjs image --brief <id|path> [--reference file.png] [--model model] [--output file.jpg] [--dry-run]\n  node tools/google-ai/sw-google-art.mjs video --brief <id|path> [--reference frame.png] [--model model] [--output file] [--dry-run]\n\nEnvironment:\n  GEMINI_API_KEY  Required only for non-dry-run generation. Never commit it.\n`);
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = { references: [] };
  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (token === '--dry-run') {
      options.dryRun = true;
      continue;
    }
    if (token === '--reference') {
      const value = rest[++i];
      if (!value) throw new Error('--reference requires a file path');
      options.references.push(value);
      continue;
    }
    if (token.startsWith('--')) {
      const value = rest[++i];
      if (!value || value.startsWith('--')) throw new Error(`${token} requires a value`);
      options[token.slice(2)] = value;
      continue;
    }
    throw new Error(`Unexpected argument: ${token}`);
  }
  return { command, options };
}

async function listBriefs() {
  const files = (await readdir(briefsDir)).filter((name) => name.endsWith('.json')).sort();
  for (const file of files) {
    const brief = JSON.parse(await readFile(path.join(briefsDir, file), 'utf8'));
    console.log(`${brief.id}\t${brief.purpose}`);
  }
}

async function loadBrief(value) {
  if (!value) throw new Error('--brief is required');
  const directPath = path.resolve(process.cwd(), value);
  const briefPath = value.includes('/') || value.includes('\\') || value.endsWith('.json')
    ? directPath
    : path.join(briefsDir, `${value}.json`);
  const brief = JSON.parse(await readFile(briefPath, 'utf8'));
  if (!brief.id || !brief.prompt) throw new Error(`Brief ${briefPath} must contain id and prompt`);
  return { brief, briefPath };
}

function mimeTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  throw new Error(`Unsupported reference image type: ${ext || '(none)'}`);
}

async function loadReferences(referencePaths) {
  const references = [];
  for (const inputPath of referencePaths) {
    const absolutePath = path.resolve(process.cwd(), inputPath);
    const bytes = await readFile(absolutePath);
    references.push({
      sourcePath: absolutePath,
      input: {
        type: 'image',
        mime_type: mimeTypeFor(absolutePath),
        data: bytes.toString('base64'),
      },
      byteLength: bytes.byteLength,
    });
  }
  return references;
}

function findMediaBlock(value, targetType) {
  if (!value || typeof value !== 'object') return null;
  if (value.type === targetType && typeof value.data === 'string') return value;
  for (const child of Object.values(value)) {
    if (Array.isArray(child)) {
      for (const item of child) {
        const found = findMediaBlock(item, targetType);
        if (found) return found;
      }
    } else if (child && typeof child === 'object') {
      const found = findMediaBlock(child, targetType);
      if (found) return found;
    }
  }
  return null;
}

function extensionForMime(mimeType, command) {
  if (mimeType === 'image/png') return '.png';
  if (mimeType === 'image/jpeg') return '.jpg';
  if (mimeType === 'image/webp') return '.webp';
  if (mimeType === 'video/mp4') return '.mp4';
  return command === 'video' ? '.mp4' : '.jpg';
}

function timestampSlug() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z').replace('T', '-');
}

function publicRequestSummary({ command, model, brief, references, responseFormat, outputPath }) {
  return {
    task: 'SW-ART-001',
    command,
    model,
    briefId: brief.id,
    purpose: brief.purpose,
    prompt: brief.prompt,
    responseFormat,
    references: references.map((entry) => ({
      file: path.relative(projectRoot, entry.sourcePath),
      mimeType: entry.input.mime_type,
      bytes: entry.byteLength,
    })),
    outputPath: path.relative(projectRoot, outputPath),
    productionAuthority: brief.productionAuthority || 'none; generated source/reference only',
  };
}

async function requestInteraction({ apiKey, body }) {
  const response = await fetch(interactionsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`Gemini API returned non-JSON HTTP ${response.status}: ${text.slice(0, 500)}`);
  }
  if (!response.ok) {
    const message = payload?.error?.message || JSON.stringify(payload);
    throw new Error(`Gemini API HTTP ${response.status}: ${message}`);
  }
  return payload;
}

async function runGeneration(command, options) {
  if (command !== 'image' && command !== 'video') throw new Error(`Unknown command: ${command || '(missing)'}`);

  const { brief, briefPath } = await loadBrief(options.brief);
  const references = await loadReferences(options.references);
  const model = options.model || (command === 'video'
    ? brief.videoModel || 'gemini-omni-flash-preview'
    : brief.model || 'gemini-3.1-flash-image');
  const aspectRatio = options.aspect || brief.aspectRatio || '16:9';
  const imageSize = options.size || brief.imageSize || '2K';
  const responseFormat = command === 'video'
    ? { type: 'video', aspect_ratio: aspectRatio }
    : { type: 'image', mime_type: 'image/jpeg', aspect_ratio: aspectRatio, image_size: imageSize };

  const input = [
    ...references.map((entry) => entry.input),
    { type: 'text', text: brief.prompt },
  ];
  const body = { model, input, response_format: responseFormat };
  if (command === 'video' && references.length > 0) {
    body.generation_config = { video_config: { task: 'image_to_video' } };
  }

  const requestedOutput = options.output ? path.resolve(process.cwd(), options.output) : null;
  if (command === 'image' && requestedOutput) {
    const outputExt = path.extname(requestedOutput).toLowerCase();
    if (outputExt !== '.jpg' && outputExt !== '.jpeg') {
      throw new Error('Gemini image output must use a .jpg or .jpeg path because the current Interactions image response contract is image/jpeg.');
    }
  }
  const provisionalExt = command === 'video' ? '.mp4' : '.jpg';
  const provisionalOutput = requestedOutput || path.join(defaultOutputRoot, brief.id, `${timestampSlug()}${provisionalExt}`);
  const summary = publicRequestSummary({ command, model, brief, references, responseFormat, outputPath: provisionalOutput });

  if (options.dryRun) {
    console.log(JSON.stringify({ dryRun: true, briefPath: path.relative(projectRoot, briefPath), ...summary }, null, 2));
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Create the key in Google AI Studio, set it in your local environment, and never paste it into chat or commit it.');
  }

  const interaction = await requestInteraction({ apiKey, body });
  const mediaType = command === 'video' ? 'video' : 'image';
  const media = findMediaBlock(interaction, mediaType);
  if (!media?.data) throw new Error(`Gemini response contained no ${mediaType} data`);

  const finalOutput = requestedOutput || provisionalOutput.replace(provisionalExt, extensionForMime(media.mime_type, command));
  await mkdir(path.dirname(finalOutput), { recursive: true });
  await writeFile(finalOutput, Buffer.from(media.data, 'base64'));

  const manifestPath = `${finalOutput}.json`;
  const manifest = {
    version: 'SW_GOOGLE_AI_GENERATION_V1',
    generatedAt: new Date().toISOString(),
    interactionId: interaction.id || null,
    responseStatus: interaction.status || null,
    responseModel: interaction.model || model,
    ...publicRequestSummary({ command, model, brief, references, responseFormat, outputPath: finalOutput }),
    briefPath: path.relative(projectRoot, briefPath),
    googleDriveArchive: brief.googleDriveArchive || null,
  };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Generated ${mediaType}: ${finalOutput}`);
  console.log(`Manifest: ${manifestPath}`);
  if (brief.googleDriveArchive) console.log(`Archive target: ${brief.googleDriveArchive}`);
}

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));
  if (!command || command === 'help' || command === '--help') {
    usage();
    return;
  }
  if (command === 'list') {
    await listBriefs();
    return;
  }
  await runGeneration(command, options);
}

main().catch((error) => {
  console.error(`[SW-ART-001] ${error.message}`);
  process.exitCode = 1;
});
