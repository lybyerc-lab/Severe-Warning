import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');

let html = await readFile(sourcePath, 'utf8');

function replaceExact(before, after, label) {
  const count = html.split(before).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: expected exactly one source match, found ${count}`);
  }
  html = html.replace(before, after);
}

replaceExact(
  String.raw`  .rampage-banner { --rampage-color: #f97316; position: absolute; left: 50%; top: 33%; width: max-content; max-width: 88vw; transform: translate(-50%, -50%); color: var(--rampage-color); font: 1000 clamp(27px, 6.2vw, 64px)/0.9 Outfit, sans-serif; letter-spacing: 0.065em; text-align: center; -webkit-text-stroke: clamp(1px, 0.25vw, 3px) rgba(0,0,0,0.92); text-shadow: 0 4px 0 #000, 0 0 18px color-mix(in srgb, var(--rampage-color) 70%, transparent); filter: drop-shadow(0 8px 10px rgba(0,0,0,0.65)); animation: rampageBannerHit 1.18s cubic-bezier(0.16,0.84,0.24,1) forwards; }`,
  String.raw`  /* UI_POLISH_TOP_BAND_V1: major feedback celebrates the hit without covering the storm. */
  .rampage-banner { --rampage-color: #f97316; position: absolute; left: 50%; top: clamp(72px, 18vh, 94px); width: max-content; max-width: 72vw; padding: 6px 12px; transform: translate(-50%, -50%); border: 1px solid rgba(255,255,255,0.24); border-radius: 999px; background: rgba(3,7,18,0.78); box-shadow: 0 6px 18px rgba(0,0,0,0.44), 0 0 14px color-mix(in srgb, var(--rampage-color) 34%, transparent); color: var(--rampage-color); font: 1000 clamp(18px, 4vw, 38px)/1 Outfit, sans-serif; letter-spacing: 0.055em; text-align: center; white-space: nowrap; -webkit-text-stroke: 1px rgba(0,0,0,0.88); text-shadow: 0 2px 0 #000; animation: rampageBannerHit 0.86s cubic-bezier(0.16,0.84,0.24,1) forwards; }`,
  'compact top-band rampage banner'
);

replaceExact(
  String.raw`  @keyframes rampageBannerHit {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(1.65) rotate(-2deg); }
    14% { opacity: 1; transform: translate(-50%, -50%) scale(0.92) rotate(1deg); }
    32% { opacity: 1; transform: translate(-50%, -50%) scale(1.04) rotate(0deg); }
    76% { opacity: 1; transform: translate(-50%, -56%) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -76%) scale(1.08); }
  }`,
  String.raw`  @keyframes rampageBannerHit {
    0% { opacity: 0; transform: translate(-50%, -66%) scale(1.16); }
    18% { opacity: 1; transform: translate(-50%, -50%) scale(0.97); }
    38% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    72% { opacity: 1; transform: translate(-50%, -54%) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -72%) scale(1.02); }
  }`,
  'lighter rampage banner animation'
);

replaceExact(
  String.raw`  #districtOverlay { position: absolute; inset: 0; z-index: 1700; pointer-events: none; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.25s ease; background: radial-gradient(circle, rgba(15,23,42,0.15), rgba(3,7,18,0.72)); }
  #districtOverlay.active { opacity: 1; }
  .district-card { min-width: 330px; max-width: 78vw; padding: 18px 28px; border: 2px solid var(--gold); border-radius: 18px; background: rgba(3,7,18,0.92); text-align: center; box-shadow: 0 0 42px rgba(251,191,36,0.34); }
  .district-kicker { color: var(--cyan); font: 800 10px/1.2 monospace; letter-spacing: 0.16em; }
  .district-card h2 { margin: 5px 0 2px; color: var(--gold); font: 900 28px/1 Outfit, sans-serif; letter-spacing: 0.06em; }
  .district-card p { margin: 6px 0 0; color: #e2e8f0; font-size: 12px; }`,
  String.raw`  /* UI_POLISH_DISTRICT_RIBBON_V1: transitions identify the district while play remains visible. */
  #districtOverlay { position: absolute; inset: 0; z-index: 1700; pointer-events: none; display: flex; align-items: flex-start; justify-content: center; padding-top: clamp(72px, 18vh, 94px); opacity: 0; transform: translateY(-8px); transition: opacity 0.16s ease, transform 0.16s ease; background: linear-gradient(to bottom, rgba(3,7,18,0.44), rgba(3,7,18,0) 42%); contain: layout paint; }
  #districtOverlay.active { opacity: 1; transform: translateY(0); }
  .district-card { width: min(420px, 78vw); min-width: 0; max-width: 78vw; padding: 10px 18px; border: 1px solid rgba(251,191,36,0.78); border-radius: 14px; background: rgba(3,7,18,0.88); text-align: center; box-shadow: 0 6px 20px rgba(0,0,0,0.42), 0 0 16px rgba(251,191,36,0.16); }
  .district-kicker { color: var(--cyan); font: 800 9px/1.2 monospace; letter-spacing: 0.14em; }
  .district-card h2 { margin: 4px 0 1px; color: var(--gold); font: 900 clamp(19px, 3.4vw, 24px)/1 Outfit, sans-serif; letter-spacing: 0.055em; }
  .district-card p { margin: 4px 0 0; color: #e2e8f0; font-size: 10px; line-height: 1.25; }`,
  'compact district transition ribbon'
);

replaceExact(
  String.raw`  setTimeout(() => {
    if (token === districtOverlayToken) overlay.classList.remove('active');
  }, isBotMode ? 700 : 1900);`,
  String.raw`  setTimeout(() => {
    if (token === districtOverlayToken) overlay.classList.remove('active');
  }, isBotMode ? 450 : 1250);`,
  'shorter district transition dwell'
);

for (const marker of [
  'UI_POLISH_TOP_BAND_V1',
  'UI_POLISH_DISTRICT_RIBBON_V1',
  'isBotMode ? 450 : 1250'
]) {
  if (!html.includes(marker)) throw new Error(`UI polish verification failed: missing ${marker}`);
}

if (html.includes('left: 50%; top: 33%; width: max-content; max-width: 88vw')) {
  throw new Error('UI polish verification failed: legacy center-screen rampage banner remains');
}

await writeFile(sourcePath, html, 'utf8');
console.log(`Applied UI polish follow-up patch to ${sourcePath}`);
