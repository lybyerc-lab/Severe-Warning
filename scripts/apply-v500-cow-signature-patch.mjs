import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');

let html = await readFile(sourcePath, 'utf8');

const marker = 'V500_BOVINE_SIGNATURE_V1';
const requiredMarkers = [
  marker,
  '[SW:WORLD:BOVINE_SIGNATURE]',
  '[SW:LAW:SAFE-ANIMALS]',
  'severe_weather_bovine_v1',
  'BOVINE SITUATION REPORT',
  'COW-CAM ACTIVATED',
  'Cow injuries: 0',
  'Moo Brew accepts no responsibility for atmospheric cattle',
  'getBovineQaState',
  'triggerCowCamQa'
];

if (html.includes(marker)) {
  requiredMarkers.forEach(required => {
    if (!html.includes(required)) throw new Error(`V5 bovine signature patch is incomplete: missing ${required}`);
  });
  console.log(`V5 bovine signature system already present in ${sourcePath}`);
  process.exit(0);
}

function replaceExact(before, after, label) {
  const count = html.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one source match, found ${count}`);
  html = html.replace(before, after);
}

replaceExact(
  '</head>',
  String.raw`<!-- V500_BOVINE_SIGNATURE_V1: Cow 17, Cow-Cam, flight telemetry, and Moo Brew broadcast comedy. -->
<style id="v500BovineSignatureStyles">
  .bovine-report {
    margin-top: 7px;
    padding: 8px 10px;
    border: 1px solid rgba(250, 204, 21, 0.62);
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(66, 32, 6, 0.9), rgba(15, 23, 42, 0.96));
    color: #f8fafc;
    text-align: left;
    box-shadow: inset 0 0 22px rgba(250, 204, 21, 0.08);
  }
  .bovine-report h3 {
    margin: 0 0 5px;
    color: #fde047;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    letter-spacing: 0.08em;
    text-align: center;
  }
  .bovine-report-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px 12px;
    font-size: 10px;
    line-height: 1.25;
  }
  .bovine-report-grid b { color: #ffffff; }
  .bovine-status-line {
    margin-top: 5px;
    padding-top: 5px;
    border-top: 1px solid rgba(148, 163, 184, 0.25);
    color: #bbf7d0;
    font-size: 9px;
    font-weight: 900;
    text-align: center;
  }
  .moo-brew-disclaimer {
    margin-top: 3px;
    color: #fdba74;
    font-size: 8px;
    text-align: center;
  }
  #cowCamOverlay {
    position: fixed;
    inset: 0;
    z-index: 82;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 0 0 max(72px, calc(env(safe-area-inset-bottom) + 54px));
    pointer-events: none;
    opacity: 0;
    transition: opacity 140ms ease;
  }
  #cowCamOverlay.active { opacity: 1; }
  .cow-cam-frame {
    min-width: min(440px, 82vw);
    padding: 8px 18px 7px;
    border: 2px solid #fde047;
    border-radius: 11px;
    background: rgba(8, 15, 27, 0.9);
    color: #ffffff;
    text-align: center;
    box-shadow: 0 0 28px rgba(250, 204, 21, 0.42);
    transform: translateY(12px) scale(0.96);
    transition: transform 170ms ease;
  }
  #cowCamOverlay.active .cow-cam-frame { transform: translateY(0) scale(1); }
  .cow-cam-title {
    color: #fde047;
    font: 900 22px/1 'Outfit', sans-serif;
    letter-spacing: 0.08em;
  }
  .cow-cam-detail { margin-top: 3px; font: 800 10px/1.2 'Inter', sans-serif; letter-spacing: 0.05em; }
  .cow-cam-sponsor { margin-top: 4px; color: #fdba74; font: 800 8px/1 'Inter', sans-serif; }
  body.cow-cam-active canvas { filter: saturate(1.18) contrast(1.08); }

  @media (max-width: 850px), (max-height: 720px), (orientation: landscape) and (pointer: coarse) {
    .bovine-report { margin-top: 4px; padding: 5px 8px; border-radius: 8px; }
    .bovine-report h3 { margin-bottom: 3px; font-size: 10.5px; }
    .bovine-report-grid { gap: 1px 8px; font-size: 8.5px; line-height: 1.15; }
    .bovine-status-line { margin-top: 3px; padding-top: 3px; font-size: 8px; }
    .moo-brew-disclaimer { margin-top: 2px; font-size: 7px; }
    #cowCamOverlay { align-items: center; padding: 0 8px; }
    .cow-cam-frame { min-width: min(360px, 70vw); padding: 6px 12px; }
    .cow-cam-title { font-size: 17px; }
  }
</style>
</head>`,
  'bovine signature stylesheet'
);

replaceExact(
  `    <div class="campaign-result" id="campaignOutcome">HEARTLAND TOUR RESULTS PENDING</div>`,
  `    <section class="bovine-report" id="bovineReport" aria-label="Bovine Situation Report">
      <h3>BOVINE SITUATION REPORT</h3>
      <div class="bovine-report-grid">
        <div>Cows relocated: <b id="resCowsRelocated">0</b></div>
        <div>Combined airtime: <b id="resCowAirtime">0.0s</b></div>
        <div>Longest unauthorized flight: <b id="resCowDistance">0 yd</b></div>
        <div>Hay bales landed upon: <b id="resHayLandings">0</b></div>
      </div>
      <div class="bovine-status-line">Cow injuries: 0 &nbsp;•&nbsp; Cow dignity: Under review</div>
      <div class="moo-brew-disclaimer">Moo Brew accepts no responsibility for atmospheric cattle.</div>
    </section>
    <div class="campaign-result" id="campaignOutcome">HEARTLAND TOUR RESULTS PENDING</div>`,
  'bovine results report'
);

replaceExact(
  `<div id="joystickZone">
  <div id="joystickThumb"></div>
</div>

<!-- End-of-Run Results Overlay Screen -->`,
  `<div id="joystickZone">
  <div id="joystickThumb"></div>
</div>

<div id="cowCamOverlay" role="status" aria-live="polite">
  <div class="cow-cam-frame">
    <div class="cow-cam-title">COW-CAM ACTIVATED</div>
    <div class="cow-cam-detail" id="cowCamDetail">COW 17 • ALTITUDE OFFICIALLY UNNECESSARY</div>
    <div class="cow-cam-sponsor">THIS AIRBORNE LIVESTOCK UPDATE BROUGHT TO YOU BY MOO BREW</div>
  </div>
</div>

<!-- End-of-Run Results Overlay Screen -->`,
  'Cow-Cam broadcast overlay'
);

replaceExact(
  `const animals = [];
const chaserVans = [];
const comedyProps = [];`,
  `const animals = [];
const chaserVans = [];
const comedyProps = [];

// ============================================================================
// [SW:WORLD:BOVINE_SIGNATURE]
// V500_BOVINE_SIGNATURE_V1
// Purpose: Turn invincible cattle into a persistent slapstick broadcast system.
// [SW:LAW:SAFE-ANIMALS] Cows are witnesses and physics comedy, never targets.
// ============================================================================
const BOVINE_STORAGE_KEY = 'severe_weather_bovine_v1';
const BOVINE_CALLOUTS = [
  'MOOmentum!',
  'Udder Chaos!',
  'Pasture Blaster!',
  'Bovine Airspace Violation!',
  'Beef on the Wind!',
  'Unscheduled Cattle Transfer!',
  'The Steaks Are High!'
];
const bovineHayBales = [];
const bovinePartMaterials = new Map();
let bovineCareer = loadBovineCareer();
let bovineRound = createBovineRoundState();
let bovineCowCam = { active: false, timer: 0, triggered: false, cow: null };

function createBovineRoundState() {
  return {
    relocatedIds: new Set(),
    cowsRelocated: 0,
    combinedAirtime: 0,
    longestFlight: 0,
    hayLandings: 0,
    launches: 0,
    cow17Flights: 0,
    cow17MaxAltitude: 0,
    cow17Seen: false,
    persisted: false
  };
}

function normalizeBovineCareer(value) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    schema: 1,
    totalRelocations: Math.max(0, Number(source.totalRelocations) || 0),
    totalAirtime: Math.max(0, Number(source.totalAirtime) || 0),
    longestFlight: Math.max(0, Number(source.longestFlight) || 0),
    hayLandings: Math.max(0, Number(source.hayLandings) || 0),
    cow17Flights: Math.max(0, Number(source.cow17Flights) || 0),
    cow17Stops: source.cow17Stops && typeof source.cow17Stops === 'object' ? source.cow17Stops : {}
  };
}

function loadBovineCareer() {
  try { return normalizeBovineCareer(JSON.parse(localStorage.getItem(BOVINE_STORAGE_KEY) || '{}')); }
  catch (_) { return normalizeBovineCareer({}); }
}

function saveBovineCareer() {
  try { localStorage.setItem(BOVINE_STORAGE_KEY, JSON.stringify(bovineCareer)); } catch (_) {}
}

function resetBovineSignature() {
  bovineRound = createBovineRoundState();
  bovineCowCam = { active: false, timer: 0, triggered: false, cow: null };
  document.body.classList.remove('cow-cam-active');
  const overlay = getCachedEl('cowCamOverlay');
  if (overlay) overlay.classList.remove('active');
  while (bovineHayBales.length) {
    const bale = bovineHayBales.pop();
    scene.remove(bale.mesh);
  }
}

function bovineStopId() {
  try { return getActiveCampaignLevel().id; } catch (_) { return 'lincoln-county'; }
}

function bovineSpawnPoint(index) {
  if (index !== 0) return { x: (Math.random() - 0.5) * 420, z: (Math.random() - 0.5) * 420 };
  const cow17Stops = [
    { x: 34, z: -28 },
    { x: -46, z: 52 },
    { x: 62, z: 68 },
    { x: -38, z: 96 }
  ];
  return cow17Stops[Math.max(0, Math.min(3, Number(selectedCampaignIndex) || 0))];
}

function addCowPart(parent, geometry, color, x, y, z, material = null) {
  if (!material && !bovinePartMaterials.has(color)) {
    bovinePartMaterials.set(color, new THREE.MeshStandardMaterial({ color, roughness: 0.72 }));
  }
  const mesh = new THREE.Mesh(geometry, material || bovinePartMaterials.get(color));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function decorateBovineMesh(cowMesh, id) {
  addCowPart(cowMesh, new THREE.BoxGeometry(0.95, 0.95, 1.0), '#f8fafc', 0, 0.22, 1.18);
  addCowPart(cowMesh, new THREE.BoxGeometry(0.55, 0.38, 0.25), '#f3a6b8', 0, 0.02, 1.72);
  addCowPart(cowMesh, new THREE.BoxGeometry(0.75, 0.35, 0.12), '#18181b', -0.2, 0.42, -0.82);
  if (id === 17) {
    [-0.72, 0.72].forEach(x => [-0.48, 0.48].forEach(z => {
      addCowPart(cowMesh, new THREE.BoxGeometry(0.28, 0.95, 0.28), '#d6d3d1', x, -1.05, z);
    }));
    addCowPart(cowMesh, new THREE.BoxGeometry(0.48, 0.28, 0.1), '#18181b', 0.62, -0.18, 0.3);
    const tag = addCowPart(
      cowMesh,
      new THREE.BoxGeometry(0.08, 0.46, 0.62),
      '#fde047',
      0.52,
      0.44,
      1.35,
      createSignMaterial('17', '#ca8a04', '#111827')
    );
    tag.rotation.y = Math.PI / 2;
    cowMesh.userData.cow17 = true;
  }
}

function configureBovineAnimal(cowMesh, index, x, z, groundY) {
  const id = index === 0 ? 17 : (index < 17 ? index : index + 1);
  decorateBovineMesh(cowMesh, id);
  return {
    id,
    mesh: cowMesh,
    x,
    z,
    groundY,
    airborne: false,
    altitude: 0.8,
    orbitAngle: (index * 2.399963229728653) % (Math.PI * 2),
    flightTime: 0,
    flightDistance: 0,
    flightMaxAltitude: 0,
    previousX: x,
    previousZ: z,
    exceptionalCallout: false,
    flightCounted: false
  };
}

function spawnBovineHayBales() {
  const positions = [[38, -6], [-52, 74], [78, 96], [-96, -70]];
  positions.forEach(([x, z], index) => {
    const group = new THREE.Group();
    const bale = addCowPart(group, new THREE.CylinderGeometry(2.4, 2.4, 3.4, 12), '#d6a52f', 0, 1.9, 0);
    bale.rotation.z = Math.PI / 2;
    addCowPart(group, new THREE.TorusGeometry(2.44, 0.08, 5, 18), '#6b4b16', -0.75, 1.9, 0, null).rotation.y = Math.PI / 2;
    addCowPart(group, new THREE.TorusGeometry(2.44, 0.08, 5, 18), '#6b4b16', 0.75, 1.9, 0, null).rotation.y = Math.PI / 2;
    group.position.set(x, terrainHeightAt(x, z), z);
    group.rotation.y = index * 0.7;
    scene.add(group);
    bovineHayBales.push({ mesh: group, x, z, landed: false });
  });
}

function beginBovineFlight(cow) {
  cow.airborne = true;
  cow.flightTime = 0;
  cow.flightDistance = 0;
  cow.flightMaxAltitude = cow.altitude;
  cow.previousX = cow.x;
  cow.previousZ = cow.z;
  cow.exceptionalCallout = false;
  cow.flightCounted = false;
  bovineRound.launches++;
  bovineRound.relocatedIds.add(cow.id);
  bovineRound.cowsRelocated = bovineRound.relocatedIds.size;
  if (cow.id === 17) bovineRound.cow17Seen = true;
  playSound('moo'); // The audio router keeps the rejected synthetic clip silent until a real moo ships.
  const callout = BOVINE_CALLOUTS[(bovineRound.launches - 1) % BOVINE_CALLOUTS.length];
  showGagToast(callout);
  if (cow.id === 17) {
    publishMediaHeadline('WE ARE ONCE AGAIN TRACKING COW 17. ALTITUDE: UNNECESSARY.', 4.2);
  } else if (bovineRound.launches % 3 === 0) {
    publishMediaHeadline(\`\${callout.toUpperCase()} AIRBORNE LIVESTOCK UPDATE BY MOO BREW.\`, 3.4);
  }
}

function activateCowCam(cow, forced = false) {
  if (!cow || bovineCowCam.active || (bovineCowCam.triggered && !forced)) return false;
  if (!forced && cow.id !== 17) return false;
  bovineCowCam.active = true;
  bovineCowCam.timer = 1.85;
  bovineCowCam.triggered = true;
  bovineCowCam.cow = cow;
  const detail = getCachedEl('cowCamDetail');
  if (detail) detail.textContent = \`COW \${cow.id} • \${Math.round(cow.altitude)}m • DIGNITY STATUS PENDING\`;
  const overlay = getCachedEl('cowCamOverlay');
  if (overlay) overlay.classList.add('active');
  document.body.classList.add('cow-cam-active');
  publishMediaHeadline(\`COW-CAM: COW \${cow.id} IS APPROACHING THE COUNTY LINE. MOO BREW HAS THE PICTURES.\`, 4.2);
  playSound('moo');
  return true;
}

function finishCowCam() {
  bovineCowCam.active = false;
  bovineCowCam.timer = 0;
  bovineCowCam.cow = null;
  const overlay = getCachedEl('cowCamOverlay');
  if (overlay) overlay.classList.remove('active');
  document.body.classList.remove('cow-cam-active');
}

function landBovineFlight(cow) {
  cow.altitude = 0.8;
  cow.airborne = false;
  bovineRound.longestFlight = Math.max(bovineRound.longestFlight, cow.flightDistance);
  if (cow.id === 17) {
    bovineRound.cow17Flights++;
    bovineRound.cow17MaxAltitude = Math.max(bovineRound.cow17MaxAltitude, cow.flightMaxAltitude);
    cow.flightCounted = true;
  }
  const hay = bovineHayBales.find(bale => !bale.landed && Math.hypot(cow.x - bale.x, cow.z - bale.z) < 22);
  if (hay) {
    hay.landed = true;
    bovineRound.hayLandings++;
    showGagToast(\`COW \${cow.id} STICKS THE HAY-BALE LANDING!\`);
    publishMediaHeadline(\`PASTURE BLASTER: COW \${cow.id} HAS LANDED. MOO BREW SCORES IT A 10.\`, 3.8);
  }
}

function updateBovineSignature(dt) {
  if (bovineCowCam.active) {
    bovineCowCam.timer -= dt;
    if (bovineCowCam.timer <= 0) finishCowCam();
  }
  const cowMotionScale = bovineCowCam.active ? 0.32 : 1;
  animals.forEach(cow => {
    const dist = Math.hypot(cow.x - storm.pos.x, cow.z - storm.pos.z);
    if (dist < storm.radius * 1.8) {
      if (!cow.airborne) beginBovineFlight(cow);
      cow.flightTime += dt;
      bovineRound.combinedAirtime += dt;
      cow.orbitAngle += 5.4 * dt * cowMotionScale;
      cow.altitude = Math.min(20, cow.altitude + 21 * dt * cowMotionScale);
      cow.x = storm.pos.x + Math.cos(cow.orbitAngle) * (9 + cow.altitude * 0.35);
      cow.z = storm.pos.z + Math.sin(cow.orbitAngle) * (9 + cow.altitude * 0.35);
      cow.flightDistance += Math.hypot(cow.x - cow.previousX, cow.z - cow.previousZ);
      cow.previousX = cow.x;
      cow.previousZ = cow.z;
      cow.flightMaxAltitude = Math.max(cow.flightMaxAltitude, cow.altitude);
      bovineRound.longestFlight = Math.max(bovineRound.longestFlight, cow.flightDistance);
      if (cow.id === 17) bovineRound.cow17MaxAltitude = Math.max(bovineRound.cow17MaxAltitude, cow.altitude);
      cow.groundY = terrainHeightAt(cow.x, cow.z);
      cow.mesh.position.set(cow.x, cow.groundY + cow.altitude, cow.z);
      cow.mesh.rotation.x += 1.35 * dt * cowMotionScale;
      cow.mesh.rotation.y += 5.2 * dt * cowMotionScale;
      if (!cow.exceptionalCallout && cow.altitude >= 11) {
        cow.exceptionalCallout = true;
        showGagToast(cow.id === 17 ? 'BOVINE AIRSPACE VIOLATION: COW 17!' : 'BEEF ON THE WIND!');
      }
      const cowCamCycle = (bovineCareer.cow17Flights + (Number(selectedCampaignIndex) || 0)) % 3 === 0;
      if (cow.id === 17 && cow.altitude >= 13 && cowCamCycle && !bovineCowCam.triggered) activateCowCam(cow);
    } else if (cow.airborne) {
      cow.flightTime += dt;
      bovineRound.combinedAirtime += dt;
      cow.altitude -= 27 * dt * cowMotionScale;
      cow.groundY = terrainHeightAt(cow.x, cow.z);
      cow.mesh.position.y = cow.groundY + Math.max(0.8, cow.altitude);
      cow.mesh.rotation.x += 0.65 * dt * cowMotionScale;
      if (cow.altitude <= 0.8) landBovineFlight(cow);
    }
  });
}

function finalizeBovineRun() {
  if (!bovineRound.persisted) {
    const activeCow17 = animals.find(cow => cow.id === 17 && cow.airborne && !cow.flightCounted);
    if (activeCow17) {
      bovineRound.cow17Flights++;
      activeCow17.flightCounted = true;
    }
    bovineCareer.totalRelocations += bovineRound.cowsRelocated;
    bovineCareer.totalAirtime += bovineRound.combinedAirtime;
    bovineCareer.longestFlight = Math.max(bovineCareer.longestFlight, bovineRound.longestFlight);
    bovineCareer.hayLandings += bovineRound.hayLandings;
    bovineCareer.cow17Flights += bovineRound.cow17Flights;
    if (bovineRound.cow17Seen) bovineCareer.cow17Stops[bovineStopId()] = true;
    saveBovineCareer();
    bovineRound.persisted = true;
  }
  setUI('resCowsRelocated', bovineRound.cowsRelocated);
  setUI('resCowAirtime', \`\${bovineRound.combinedAirtime.toFixed(1)}s\`);
  setUI('resCowDistance', \`\${Math.round(bovineRound.longestFlight * 1.09361)} yd\`);
  setUI('resHayLandings', bovineRound.hayLandings);
  finishCowCam();
}

globalThis.getBovineQaState = function getBovineQaState() {
  const cow17 = animals.find(cow => cow.id === 17);
  return {
    marker: 'V500_BOVINE_SIGNATURE_V1',
    invariant: 'Cow injuries: 0',
    storageKey: BOVINE_STORAGE_KEY,
    cow17: cow17 ? { id: cow17.id, airborne: cow17.airborne, altitude: cow17.altitude, x: cow17.x, z: cow17.z, tagged: cow17.mesh.userData.cow17 === true } : null,
    round: {
      cowsRelocated: bovineRound.cowsRelocated,
      combinedAirtime: bovineRound.combinedAirtime,
      longestFlight: bovineRound.longestFlight,
      hayLandings: bovineRound.hayLandings,
      cow17Seen: bovineRound.cow17Seen
    },
    career: JSON.parse(JSON.stringify(bovineCareer)),
    cowCam: { active: bovineCowCam.active, triggered: bovineCowCam.triggered },
    hayBales: bovineHayBales.length
  };
};

globalThis.triggerCowCamQa = function triggerCowCamQa() {
  const cow17 = animals.find(cow => cow.id === 17);
  if (!cow17) return false;
  cow17.airborne = true;
  cow17.altitude = Math.max(14, cow17.altitude);
  cow17.mesh.position.y = cow17.groundY + cow17.altitude;
  bovineRound.relocatedIds.add(17);
  bovineRound.cowsRelocated = bovineRound.relocatedIds.size;
  bovineRound.cow17Seen = true;
  return activateCowCam(cow17, true);
};

function runBovineQaScenario() {
  if (urlParams.get('cowcam') === '1') globalThis.triggerCowCamQa();
  if (urlParams.get('bovinereport') === '1') {
    bovineRound.relocatedIds = new Set([17, 3, 5, 8, 11, 14, 19]);
    bovineRound.cowsRelocated = 7;
    bovineRound.combinedAirtime = 42.8;
    bovineRound.longestFlight = 352.97;
    bovineRound.hayLandings = 3;
    bovineRound.cow17Seen = true;
    finalizeBovineRun();
    getCachedEl('resultsOverlay')?.classList.add('active');
  }
}
if (urlParams.get('cowcam') === '1' || urlParams.get('bovinereport') === '1') {
  setTimeout(runBovineQaScenario, 650);
}
// [SW:WORLD:BOVINE_SIGNATURE:END]`,
  'bovine signature runtime'
);

replaceExact(
  `    const stationMat = createSignMaterial(\`LIVE 8|NEWS\`, '#1d4ed8');`,
  `    const stationMat = createSignMaterial(\`MOO BREW|LIVE NEWS\`, '#7c2d12', '#fff7ed');`,
  'Moo Brew news van sponsor panel'
);

replaceExact(
  `    addPropPart(group, new THREE.BoxGeometry(5.3, 1.2, 0.35), color, 0, 5.2, 0, { material: createSignMaterial('MUG SHOTS', '#c2410c') });`,
  `    addPropPart(group, new THREE.BoxGeometry(5.3, 1.2, 0.35), color, 0, 5.2, 0, { material: createSignMaterial('MOO BREW|COFFEE', '#7c2d12', '#fff7ed') });
    [-1.15, 0, 1.15].forEach(x => {
      addPropPart(group, new THREE.CylinderGeometry(0.35, 0.28, 0.9, 10), '#fff7ed', x, 1.0, 1.75);
      addPropPart(group, new THREE.CylinderGeometry(0.37, 0.37, 0.08, 10), '#7c2d12', x, 1.48, 1.75);
    });`,
  'Moo Brew kiosk and collectible cup dressing'
);

replaceExact(
  `{ kind: 'coffee', x: -45, z: -105, stage: 2, tags: ['main','sign'], gag: 'MAIN STREET JUST ORDERED COFFEE TO GO.' },`,
  `{ kind: 'coffee', x: -45, z: -105, stage: 2, tags: ['main','sign','moo-brew'], gag: 'MOO BREW EXPRESS: COFFEE TO GO. EXTREMELY TO GO.' },`,
  'Moo Brew comedy prop identity'
);

replaceExact(
  `  const cowGeo = new THREE.BoxGeometry(2.3, 1.6, 1.6);
  const cowMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.75 });
  for (let i = 0; i < 38; i++) {
    const cowMesh = new THREE.Mesh(cowGeo, cowMat);
    const x = (Math.random() - 0.5) * 420;
    const z = (Math.random() - 0.5) * 420;
    const groundY = terrainHeightAt(x, z);
    cowMesh.position.set(x, groundY + 0.8, z);
    cowMesh.castShadow = true;
    scene.add(cowMesh);
    animals.push({ mesh: cowMesh, x, z, groundY, airborne: false, altitude: 0.8, orbitAngle: Math.random() * Math.PI * 2 });
  }`,
  `  resetBovineSignature();
  spawnBovineHayBales();
  const cowGeo = new THREE.BoxGeometry(2.3, 1.6, 1.6);
  const cowMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.75 });
  for (let i = 0; i < 38; i++) {
    const cowMesh = new THREE.Mesh(cowGeo, cowMat);
    const spawn = bovineSpawnPoint(i);
    const x = spawn.x;
    const z = spawn.z;
    const groundY = terrainHeightAt(x, z);
    cowMesh.position.set(x, groundY + 0.8, z);
    cowMesh.castShadow = true;
    scene.add(cowMesh);
    animals.push(configureBovineAnimal(cowMesh, i, x, z, groundY));
  }`,
  'Cow 17 and bovine spawn telemetry'
);

replaceExact(
  `{ role: 'news', x: 42, z: -58, callSign: 'LIVE 8' },`,
  `{ role: 'news', x: 42, z: -58, callSign: 'MOO BREW LIVE' },`,
  'Moo Brew flagship news van'
);

replaceExact(
  `  updateHighScore(currentStorm, destructionScore);
  completeCampaignRun(grade, destructionScore, doneCount);`,
  `  finalizeBovineRun();
  updateHighScore(currentStorm, destructionScore);
  completeCampaignRun(grade, destructionScore, doneCount);`,
  'bovine results finalization'
);

replaceExact(
  `  selectStormClass(currentStorm);
  updateEFRating();
  renderObjectives();
}`,
  `  selectStormClass(currentStorm);
  updateEFRating();
  renderObjectives();
  if (urlParams.get('cowcam') === '1' || urlParams.get('bovinereport') === '1') {
    setTimeout(runBovineQaScenario, 180);
  }
}`,
  'bovine QA scenario after player-start reset'
);

replaceExact(
  `  camera.position.x = THREE.MathUtils.lerp(camera.position.x, camTargetX, 0.08);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, storm.pos.y + currentCamY, 0.08);
  camera.position.z = THREE.MathUtils.lerp(camera.position.z, camTargetZ, 0.08);
  camera.lookAt(storm.pos.x + (moveX * 8), storm.pos.y + 1.5, storm.pos.z + (moveZ * 8));`,
  `  if (bovineCowCam.active && bovineCowCam.cow && bovineCowCam.cow.mesh) {
    const cow = bovineCowCam.cow;
    const cinematicX = cow.x + 23;
    const cinematicY = cow.groundY + cow.altitude + 17;
    const cinematicZ = cow.z + 27;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, cinematicX, 0.11);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, cinematicY, 0.11);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, cinematicZ, 0.11);
    camera.lookAt(cow.x, cow.groundY + cow.altitude, cow.z);
  } else {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, camTargetX, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, storm.pos.y + currentCamY, 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, camTargetZ, 0.08);
    camera.lookAt(storm.pos.x + (moveX * 8), storm.pos.y + 1.5, storm.pos.z + (moveZ * 8));
  }`,
  'Cow-Cam cinematic camera blend'
);

replaceExact(
  `  animals.forEach(a => {
    const dist = Math.hypot(a.x - storm.pos.x, a.z - storm.pos.z);
    if (dist < storm.radius * 1.8) {
      if (!a.airborne) {
        a.airborne = true;
        playSound('moo');
      }
      a.orbitAngle += 0.09;
      a.altitude = Math.min(20, a.altitude + 0.35);
      a.x = storm.pos.x + Math.cos(a.orbitAngle) * (9 + a.altitude * 0.35);
      a.z = storm.pos.z + Math.sin(a.orbitAngle) * (9 + a.altitude * 0.35);
      a.groundY = terrainHeightAt(a.x, a.z);
      a.mesh.position.set(a.x, a.groundY + a.altitude, a.z);
      a.mesh.rotation.y += 0.2;
    } else if (a.airborne) {
      a.altitude -= 0.45;
      a.groundY = terrainHeightAt(a.x, a.z);
      a.mesh.position.y = a.groundY + a.altitude;
      if (a.altitude <= 0.8) { a.altitude = 0.8; a.airborne = false; }
    }
  });`,
  `  updateBovineSignature(dt);`,
  'frame-rate-independent bovine flight loop'
);

requiredMarkers.forEach(required => {
  if (!html.includes(required)) throw new Error(`V5 bovine signature verification failed: missing ${required}`);
});

await writeFile(sourcePath, html, 'utf8');
console.log(`Applied V5 bovine signature system to ${sourcePath}`);
