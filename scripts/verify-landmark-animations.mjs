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
const contractsPath = path.join(projectRoot, 'src', 'world', 'animations', 'landmark-animation-contracts.ts');
const implPath = path.join(projectRoot, 'src', 'world', 'animations', 'landmark-animation-system.ts');
const testPath = path.join(projectRoot, 'src', 'world', 'animations', 'landmark-animation.test.ts');

assert(fs.existsSync(contractsPath), 'landmark-animation-contracts.ts exists');
assert(fs.existsSync(implPath), 'landmark-animation-system.ts exists');
assert(fs.existsSync(testPath), 'landmark-animation.test.ts exists');

const html = fs.readFileSync(htmlPath, 'utf8');
assert(html.includes('SW_ANIM_001_LANDMARK_ANIMATIONS_V1'), 'HTML contains SW_ANIM_001_LANDMARK_ANIMATIONS_V1 marker');
assert(html.includes('updateLandmarkAnimations'), 'HTML defines updateLandmarkAnimations()');
assert(html.includes('getLandmarkAnimationQaState'), 'HTML exposes getLandmarkAnimationQaState()');
assert(html.includes('ferrisWheelMesh'), 'HTML tracks Ferris Wheel mesh for mechanical rotation');
assert(html.includes('carouselMesh'), 'HTML tracks Carousel mesh for mechanical rotation');
assert(html.includes('foundrySmokeParticles'), 'HTML contains Foundry smokestack particulate system');

console.log(`\nLandmark Animations verification: ${passedChecks}/${totalChecks} checks passed.`);
if (passedChecks !== totalChecks) {
  process.exit(1);
}
