import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

let totalChecks = 0;
let passedChecks = 0;

function assert(condition, message) {
  totalChecks += 1;
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    passedChecks += 1;
    console.log(`PASS: ${message}`);
  }
}

const htmlPath = path.join(projectRoot, 'MechanicsLab', 'SevereWeather_Warning.html');
const contractsPath = path.join(projectRoot, 'src', 'gameplay', 'economy', 'moolah-contracts.ts');
const systemPath = path.join(projectRoot, 'src', 'gameplay', 'economy', 'moolah-system.ts');

assert(fs.existsSync(contractsPath), 'moolah-contracts.ts exists');
assert(fs.existsSync(systemPath), 'moolah-system.ts exists');

const html = fs.readFileSync(htmlPath, 'utf8');
assert(html.includes('SW_RPG_001_MOOLAH_STORM_TRIANGLE_V1'), 'HTML contains SW_RPG_001_MOOLAH_STORM_TRIANGLE_V1');
assert(html.includes('severe_weather_rpg_v1'), 'HTML contains severe_weather_rpg_v1 storage key');
assert(html.includes('sw-storm-triangle-v1'), 'HTML contains sw-storm-triangle-v1');
assert(html.includes('getSwRpgQaState'), 'HTML exposes getSwRpgQaState()');
assert(html.includes('getSwRpgBuildMetadata'), 'HTML exposes getSwRpgBuildMetadata()');
assert(html.includes('__SW_RPG_001_QA__'), 'HTML exposes __SW_RPG_001_QA__');

console.log(`\nMOO-LAH Economy verification: ${passedChecks}/${totalChecks} checks passed.`);
if (passedChecks !== totalChecks) {
  process.exit(1);
}
