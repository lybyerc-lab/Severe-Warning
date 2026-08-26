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
const adapterPath = path.join(projectRoot, 'src', 'legacy', 'legacy-runtime-adapter.ts');
const audioContractsPath = path.join(projectRoot, 'src', 'audio', 'audio-contracts.ts');
const audioSystemPath = path.join(projectRoot, 'src', 'audio', 'audio-system.ts');
const trafficContractsPath = path.join(projectRoot, 'src', 'gameplay', 'traffic', 'traffic-contracts.ts');
const trafficSystemPath = path.join(projectRoot, 'src', 'gameplay', 'traffic', 'traffic-system.ts');
const sourceMapPath = path.join(projectRoot, 'Docs', 'PHASE7_AUDIO_TRAFFIC_SOURCE_MAP.md');
const wavPath = path.join(projectRoot, 'assets', 'audio', 'storm-feel-sprite.wav');
const manifestPath = path.join(projectRoot, 'assets', 'audio', 'storm-feel-manifest.json');

// 1. Files existence
assert(fs.existsSync(audioContractsPath), 'audio-contracts.ts exists');
assert(fs.existsSync(audioSystemPath), 'audio-system.ts exists');
assert(fs.existsSync(trafficContractsPath), 'traffic-contracts.ts exists');
assert(fs.existsSync(trafficSystemPath), 'traffic-system.ts exists');
assert(fs.existsSync(sourceMapPath), 'PHASE7_AUDIO_TRAFFIC_SOURCE_MAP.md exists');
assert(fs.existsSync(wavPath), 'storm-feel-sprite.wav exists');
assert(fs.existsSync(manifestPath), 'storm-feel-manifest.json exists');

// 2. HTML Markers
const htmlContent = fs.readFileSync(htmlPath, 'utf8');
assert(htmlContent.includes('MODERNIZATION_PHASE7_AUDIO_TRAFFIC_V1'), 'HTML contains MODERNIZATION_PHASE7_AUDIO_TRAFFIC_V1');
assert(htmlContent.includes('[SW:ARCH:PHASE7_AUDIO_TRAFFIC_BRIDGE]'), 'HTML contains Phase 7 bridge anchor');
assert(htmlContent.includes('[SW:SOURCE:modernization-phase7-audio-traffic.js]'), 'HTML contains Phase 7 source marker');
assert(htmlContent.includes('__SW_PHASE7_AUDIO_TRAFFIC_BRIDGE__'), 'HTML assigns global __SW_PHASE7_AUDIO_TRAFFIC_BRIDGE__');
assert(htmlContent.includes('news-van') && htmlContent.includes('storm-chaser-vehicle'), 'HTML references news-van and storm-chaser-vehicle');

// 3. Adapter Bridge Wiring
const adapterContent = fs.readFileSync(adapterPath, 'utf8');
assert(adapterContent.includes('attachAudioTraffic'), 'LegacyRuntimeAdapter has attachAudioTraffic()');
assert(adapterContent.includes('hasAudioTrafficBridge'), 'LegacyRuntimeAdapter reports hasAudioTrafficBridge');
assert(adapterContent.includes('runAudioTrafficContractProbe'), 'LegacyRuntimeAdapter has runAudioTrafficContractProbe()');
assert(adapterContent.includes('getAudioTrafficBridgeSnapshot'), 'LegacyRuntimeAdapter has getAudioTrafficBridgeSnapshot()');

// 4. Contracts & First Law Invariant
const trafficContractContent = fs.readFileSync(trafficContractsPath, 'utf8');
assert(trafficContractContent.includes('VehicleModelType'), 'traffic-contracts exports VehicleModelType');
assert(trafficContractContent.includes("'town-car' | 'pickup-truck' | 'news-van' | 'storm-chaser-vehicle'"), 'VehicleModelType includes all 4 authored vehicles');
assert(trafficContractContent.includes('isProtected: boolean'), 'TrafficVehicleState enforces First Law protection flag');

const audioContractContent = fs.readFileSync(audioContractsPath, 'utf8');
assert(audioContractContent.includes('SoundCueDefinition'), 'audio-contracts exports SoundCueDefinition');
assert(audioContractContent.includes('AudioMixSettings'), 'audio-contracts exports AudioMixSettings');
assert(audioContractContent.includes('AudioSystemContract'), 'audio-contracts exports AudioSystemContract');

console.log(`\nPhase 7 audio & traffic verification: ${passedChecks}/${totalChecks} checks passed.`);
if (passedChecks !== totalChecks) {
  process.exit(1);
}
