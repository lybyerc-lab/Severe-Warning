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
  '<title>Severe Weather 3D Lab v4.3.0 - Rampage Layer</title>',
  '<title>Severe Weather 3D Lab v4.3.1 - Mobile Comfort</title>',
  'document title'
);
replaceExact(
  '3D LAB v4.3.0 RAMPAGE LAYER',
  '3D LAB v4.3.1 MOBILE COMFORT',
  'NOAA build badge'
);
replaceExact(
  'ARCADE DISASTER SIMULATOR v4.3.0 RAMPAGE LAYER',
  'ARCADE DISASTER SIMULATOR v4.3.1 MOBILE COMFORT',
  'main menu build label'
);
replaceExact(
  'const enemyVehicles = [];       // Police/Fire/Guard resistance\n',
  '',
  'unused hostile vehicle declaration'
);
replaceExact(
  '#hud { padding: calc(36px + var(--safe-top)) calc(10px + var(--safe-right)) calc(8px + var(--safe-bottom)) calc(10px + var(--safe-left)); }\n    #easBanner { font-size: 10px; padding: calc(4px + var(--safe-top)) calc(10px + var(--safe-right)) 4px calc(10px + var(--safe-left)); }',
  '#hud { padding: calc(27px + var(--safe-top)) calc(10px + var(--safe-right)) calc(8px + var(--safe-bottom)) calc(10px + var(--safe-left)); }\n    #easBanner { font-size: 8px; padding: calc(2px + var(--safe-top)) calc(8px + var(--safe-right)) 2px calc(8px + var(--safe-left)); letter-spacing: 0.045em; box-shadow: 0 2px 10px rgba(153, 27, 27, 0.55); }\n    #easBanner > div:last-child { display: none; }',
  'mobile NOAA banner and HUD offsets'
);
replaceExact(
  '#joystickZone { bottom: calc(10px + var(--safe-bottom)); left: calc(10px + var(--safe-left)); width: 95px; height: 95px; }',
  '#joystickZone { bottom: calc(42px + var(--safe-bottom)); left: calc(14px + var(--safe-left)); width: 100px; height: 100px; }',
  'mobile joystick placement'
);
replaceExact(
  '#gagToast { top: 34px; font-size: 9px; }',
  '#gagToast { top: calc(27px + var(--safe-top)); font-size: 9px; }',
  'mobile toast offset'
);

if (/enemyVehicles|Police\/Fire\/Guard resistance/.test(html)) {
  throw new Error('Hostile vehicle terminology remains after v4.3.1 patch.');
}
if (!html.includes('v4.3.1') || html.includes('v4.3.0')) {
  throw new Error('Version identity did not fully advance to v4.3.1.');
}

await writeFile(sourcePath, html, 'utf8');
console.log('Applied v4.3.1 Mobile Comfort source patch.');
