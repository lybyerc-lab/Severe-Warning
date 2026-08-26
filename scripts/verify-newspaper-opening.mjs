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
const cinematicContractPath = path.join(projectRoot, 'src', 'presentation', 'cinematics', 'opening-cinematic-contracts.ts');
const cinematicImplPath = path.join(projectRoot, 'src', 'presentation', 'cinematics', 'moo-brew-opening-cinematic.ts');
const newspaperContractPath = path.join(projectRoot, 'src', 'ui', 'newspaper', 'newspaper-contracts.ts');
const newspaperImplPath = path.join(projectRoot, 'src', 'ui', 'newspaper', 'newspaper-presentation-system.ts');

assert(fs.existsSync(cinematicContractPath), 'opening-cinematic-contracts.ts exists');
assert(fs.existsSync(cinematicImplPath), 'moo-brew-opening-cinematic.ts exists');
assert(fs.existsSync(newspaperContractPath), 'newspaper-contracts.ts exists');
assert(fs.existsSync(newspaperImplPath), 'newspaper-presentation-system.ts exists');

const html = fs.readFileSync(htmlPath, 'utf8');
assert(html.includes('SW_UI_001_NEWSPAPER_PRESENTATION_V1'), 'HTML contains SW_UI_001_NEWSPAPER_PRESENTATION_V1');
assert(html.includes('SW_CIN_003_PLAYABLE_OPENING_V1'), 'HTML contains SW_CIN_003_PLAYABLE_OPENING_V1');
assert(html.includes('getNewspaperPresentationQaState'), 'HTML exposes getNewspaperPresentationQaState()');
assert(html.includes('getOpeningCinematicQaState'), 'HTML exposes getOpeningCinematicQaState()');
assert(html.includes('__SW_CINEMATIC_QA__'), 'HTML exposes __SW_CINEMATIC_QA__');
assert(html.includes('MooBrewOpeningCinematicGroup'), 'HTML contains MooBrewOpeningCinematicGroup');
assert(html.includes('buildArticulatedBipedalCow17'), 'HTML contains buildArticulatedBipedalCow17');

console.log(`\nNewspaper & Opening Cinematic verification: ${passedChecks}/${totalChecks} checks passed.`);
if (passedChecks !== totalChecks) {
  process.exit(1);
}
