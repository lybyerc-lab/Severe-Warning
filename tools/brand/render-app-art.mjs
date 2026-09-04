// [SW:BRAND:APP_ART] Rasterize the icon and splash from tools/brand/brand-art.mjs
// into every density Android asks for. Chromium is the rasterizer because it is
// already a dependency of the QA lanes and it renders SVG the same way the game
// itself is rendered. Run: node tools/brand/render-app-art.mjs
import { chromium } from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { iconForegroundSvg, iconLegacySvg, splashSvg } from './brand-art.mjs';

const RES = 'android/app/src/main/res';
const browser = await chromium.launch({
  executablePath: process.env.QA_PLAY_BROWSER || undefined,
  headless: true
});
const context = await browser.newContext({ deviceScaleFactor: 1 });

// A fresh page per shot. Reusing one page across ~30 renders -- churning the
// viewport and replacing the document each time -- made headless Chromium hang
// in `screenshot` roughly one render in ten, and not on the same one twice, so
// the flake was in the reuse rather than in any particular drawing.
async function renderOnce(svg, width, height) {
  const page = await context.newPage();
  try {
    await page.setViewportSize({ width, height });
    await page.setContent(
      `<style>html,body{margin:0;padding:0;background:transparent}svg{display:block}</style>${svg}`,
      { waitUntil: 'load' }
    );
    // Fonts have to be settled before the shot or the splash lettering renders
    // at a fallback metric and the densities disagree with each other.
    await page.evaluate(() => document.fonts.ready.then(() => true));
    return await page.screenshot({ omitBackground: true, type: 'png', timeout: 20000 });
  } finally {
    await page.close();
  }
}

async function render(svg, width, height, outPath) {
  let buffer = null;
  for (let attempt = 1; attempt <= 3 && !buffer; attempt += 1) {
    try {
      buffer = await renderOnce(svg, width, height);
    } catch (error) {
      if (attempt === 3) throw error;
      console.warn(`  retrying ${outPath} (attempt ${attempt} failed: ${String(error).split('\n')[0]})`);
    }
  }
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, buffer);
  return buffer.length;
}

function sized(svg, width, height) {
  return svg
    .replace(/width="[^"]*"/, `width="${width}"`)
    .replace(/height="[^"]*"/, `height="${height}"`);
}

const written = [];

// Adaptive-icon foreground: 108dp canvas at each density.
for (const [density, size] of [['mdpi', 108], ['hdpi', 162], ['xhdpi', 216], ['xxhdpi', 324], ['xxxhdpi', 432]]) {
  const out = `${RES}/mipmap-${density}/ic_launcher_foreground.png`;
  written.push([out, size, await render(sized(iconForegroundSvg(), size, size), size, size, out)]);
}

// Legacy square and round icons, for launchers below API 26.
for (const [density, size] of [['mdpi', 48], ['hdpi', 72], ['xhdpi', 96], ['xxhdpi', 144], ['xxxhdpi', 192]]) {
  for (const round of [false, true]) {
    const name = round ? 'ic_launcher_round.png' : 'ic_launcher.png';
    const out = `${RES}/mipmap-${density}/${name}`;
    written.push([out, size, await render(sized(iconLegacySvg({ round }), size, size), size, size, out)]);
  }
}

// Splash, at the exact dimensions Capacitor's generator produced, so nothing
// downstream has to be told the sizes changed.
const SPLASHES = [
  ['drawable-land-mdpi', 480, 320], ['drawable-land-hdpi', 800, 480],
  ['drawable-land-xhdpi', 1280, 720], ['drawable-land-xxhdpi', 1600, 960],
  ['drawable-land-xxxhdpi', 1920, 1280],
  ['drawable-port-mdpi', 320, 480], ['drawable-port-hdpi', 480, 800],
  ['drawable-port-xhdpi', 720, 1280], ['drawable-port-xxhdpi', 960, 1600],
  ['drawable-port-xxxhdpi', 1280, 1920],
  ['drawable', 480, 320]
];
for (const [dir, width, height] of SPLASHES) {
  const out = `${RES}/${dir}/splash.png`;
  written.push([out, `${width}x${height}`, await render(splashSvg(width, height), width, height, out)]);
}

await browser.close();
for (const [out, size, bytes] of written) console.log(`  ${String(size).padEnd(9)} ${out} (${bytes} bytes)`);
console.log(`\nRendered ${written.length} files.`);
