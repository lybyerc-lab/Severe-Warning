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
const contractsPath = path.join(projectRoot, 'src', 'ui', 'shop', 'shop-contracts.ts');
const systemPath = path.join(projectRoot, 'src', 'ui', 'shop', 'shop-system.ts');
const testPath = path.join(projectRoot, 'src', 'ui', 'shop', 'shop-system.test.ts');

assert(fs.existsSync(contractsPath), 'shop-contracts.ts exists');
assert(fs.existsSync(systemPath), 'shop-system.ts exists');
assert(fs.existsSync(testPath), 'shop-system.test.ts exists');

const html = fs.readFileSync(htmlPath, 'utf8');
assert(html.includes('SW_UI_002_SHOP_MODAL_V1'), 'HTML contains SW_UI_002_SHOP_MODAL_V1 marker');
assert(html.includes('openSwShopModal'), 'HTML defines openSwShopModal()');
assert(html.includes('closeSwShopModal'), 'HTML defines closeSwShopModal()');
assert(html.includes('getShopQaState'), 'HTML exposes getShopQaState()');
assert(html.includes('__SW_SHOP_QA__'), 'HTML exposes __SW_SHOP_QA__');
assert(html.includes('swShopModal'), 'HTML contains #swShopModal element');
assert(html.includes('applyFunnelSkinMaterials'), 'HTML applies live funnel skin materials');

console.log(`\nShop System verification: ${passedChecks}/${totalChecks} checks passed.`);
if (passedChecks !== totalChecks) {
  process.exit(1);
}
