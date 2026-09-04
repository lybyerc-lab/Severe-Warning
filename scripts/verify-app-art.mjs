// [SW:BRAND:APP_ART] The launcher icon and splash were the stock Capacitor logo
// -- a blue X on white -- for the whole life of this project, and nothing
// noticed, because nothing was looking. This looks.
//
// It reads the actual pixels rather than trusting a filename: sizes from the
// PNG header, the adaptive foreground's painted extent against Android's crop
// circle, and the flat field of the splash. No image library is available here,
// so the decoder below is the small honest one for what Chromium writes:
// 8-bit RGBA, non-interlaced.

import { readFileSync, existsSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

const RES = 'android/app/src/main/res';
const failures = [];
const passes = [];

function check(name, condition, detail) {
  if (condition) passes.push(`${name}${detail ? ` (${detail})` : ''}`);
  else failures.push(`${name}${detail ? `: ${detail}` : ''}`);
}

function readPng(file) {
  const buffer = readFileSync(file);
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error(`${file} is not a PNG`);
  let offset = 8;
  let header = null;
  const idat = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      header = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        depth: data[8],
        colorType: data[9],
        interlace: data[12]
      };
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
    offset += 12 + length;
  }
  return { header, idat: Buffer.concat(idat) };
}

// Undo PNG's per-scanline filters. Only what Chromium emits is handled; anything
// else throws rather than returning quietly wrong pixels.
function decodeRgba(file) {
  const { header, idat } = readPng(file);
  // Chromium writes RGBA for anything with transparency and drops to RGB when a
  // picture is fully opaque, so the splash and the icons arrive as different
  // colour types from the same renderer.
  const channels = header.colorType === 6 ? 4 : (header.colorType === 2 ? 3 : 0);
  if (header.depth !== 8 || channels === 0 || header.interlace !== 0) {
    throw new Error(`${file}: expected 8-bit RGB or RGBA non-interlaced, got depth ${header.depth} colorType ${header.colorType} interlace ${header.interlace}`);
  }
  const { width, height } = header;
  const raw = inflateSync(idat);
  const stride = width * channels;
  const out = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    for (let x = 0; x < stride; x += 1) {
      const a = x >= channels ? out[y * stride + x - channels] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = x >= channels && y > 0 ? out[(y - 1) * stride + x - channels] : 0;
      let value = line[x];
      if (filter === 1) value += a;
      else if (filter === 2) value += b;
      else if (filter === 3) value += Math.floor((a + b) / 2);
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        value += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      } else if (filter !== 0) {
        throw new Error(`${file}: unsupported scanline filter ${filter}`);
      }
      out[y * stride + x] = value & 0xff;
    }
  }
  return { width, height, channels, pixels: out };
}

// --- 1. every density exists at the size Android asks for --------------------
const EXPECTED = [
  ['mipmap-mdpi/ic_launcher_foreground.png', 108, 108],
  ['mipmap-hdpi/ic_launcher_foreground.png', 162, 162],
  ['mipmap-xhdpi/ic_launcher_foreground.png', 216, 216],
  ['mipmap-xxhdpi/ic_launcher_foreground.png', 324, 324],
  ['mipmap-xxxhdpi/ic_launcher_foreground.png', 432, 432],
  ['mipmap-mdpi/ic_launcher.png', 48, 48],
  ['mipmap-hdpi/ic_launcher.png', 72, 72],
  ['mipmap-xhdpi/ic_launcher.png', 96, 96],
  ['mipmap-xxhdpi/ic_launcher.png', 144, 144],
  ['mipmap-xxxhdpi/ic_launcher.png', 192, 192],
  ['mipmap-mdpi/ic_launcher_round.png', 48, 48],
  ['mipmap-hdpi/ic_launcher_round.png', 72, 72],
  ['mipmap-xhdpi/ic_launcher_round.png', 96, 96],
  ['mipmap-xxhdpi/ic_launcher_round.png', 144, 144],
  ['mipmap-xxxhdpi/ic_launcher_round.png', 192, 192],
  ['drawable-land-mdpi/splash.png', 480, 320],
  ['drawable-land-hdpi/splash.png', 800, 480],
  ['drawable-land-xhdpi/splash.png', 1280, 720],
  ['drawable-land-xxhdpi/splash.png', 1600, 960],
  ['drawable-land-xxxhdpi/splash.png', 1920, 1280],
  ['drawable-port-mdpi/splash.png', 320, 480],
  ['drawable-port-hdpi/splash.png', 480, 800],
  ['drawable-port-xhdpi/splash.png', 720, 1280],
  ['drawable-port-xxhdpi/splash.png', 960, 1600],
  ['drawable-port-xxxhdpi/splash.png', 1280, 1920],
  ['drawable/splash.png', 480, 320]
];
let sizeMismatches = 0;
for (const [relative, width, height] of EXPECTED) {
  const file = `${RES}/${relative}`;
  if (!existsSync(file)) {
    failures.push(`missing app art: ${relative}`);
    sizeMismatches += 1;
    continue;
  }
  const { header } = readPng(file);
  if (header.width !== width || header.height !== height) {
    failures.push(`${relative} is ${header.width}x${header.height}, expected ${width}x${height}`);
    sizeMismatches += 1;
  }
}
check('every icon and splash density is present at its exact size', sizeMismatches === 0, `${EXPECTED.length} files`);

// --- 2. the adaptive foreground survives Android's crop ----------------------
// A launcher masks an adaptive icon to a circle of about 66% of the canvas and
// some crop tighter. A mark that paints outside it loses its edges on exactly
// the devices nobody tests on.
{
  const file = `${RES}/mipmap-xxxhdpi/ic_launcher_foreground.png`;
  const { width, height, channels, pixels } = decodeRgba(file);
  if (channels !== 4) failures.push('the adaptive foreground has no alpha channel; it must be transparent outside the mark');
  const cx = width / 2;
  const cy = height / 2;
  let painted = 0;
  let maxRadius = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (channels !== 4 || pixels[(y * width + x) * 4 + 3] > 24) {
        painted += 1;
        const radius = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) / (width / 2);
        if (radius > maxRadius) maxRadius = radius;
      }
    }
  }
  check('the adaptive foreground paints something at all', painted > width * height * 0.02, `${painted} px`);
  check(
    'the adaptive foreground stays inside the 66% crop circle',
    maxRadius <= 0.66,
    `reaches ${(maxRadius * 100).toFixed(1)}% of the radius`
  );
}

// --- 3. none of it is the stock Capacitor art any more -----------------------
{
  const background = readFileSync(`${RES}/values/ic_launcher_background.xml`, 'utf8');
  const colour = (background.match(/<color name="ic_launcher_background">\s*(#[0-9a-fA-F]{6,8})/) || [])[1] || '';
  check(
    'the adaptive background is not the stock white card',
    colour.toUpperCase() !== '#FFFFFF' && colour.length > 0,
    colour || 'no colour found'
  );
  for (const stock of ['drawable/ic_launcher_background.xml', 'drawable-v24/ic_launcher_foreground.xml']) {
    check(`stock Capacitor art is gone: ${stock}`, !existsSync(`${RES}/${stock}`));
  }
  // The stock splash was a white field with a small logo in the middle. The
  // corners are the cheapest place to tell what field the art sits on, and a
  // white one means the placeholder is back.
  const splash = decodeRgba(`${RES}/drawable-land-mdpi/splash.png`);
  const corner = [splash.pixels[0], splash.pixels[1], splash.pixels[2]];
  check(
    'the splash is not a white field',
    !corner.every((channel) => channel > 232),
    `corner rgb(${corner.join(', ')})`
  );
}

for (const line of passes) console.log(`  PASS ${line}`);
for (const line of failures) console.error(`  FAIL ${line}`);
console.log(`\nApp art verification: ${passes.length}/${passes.length + failures.length} checks passed.`);
if (failures.length > 0) process.exit(1);
