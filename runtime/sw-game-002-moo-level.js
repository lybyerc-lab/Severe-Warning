// ============================================================================
// [SW:GAME:MOO_LEVEL_V1]
// Secret-level authority for SW-GAME-002. This runtime is lexically bundled
// into the accepted executor so encounter telemetry comes from live animals.
// ============================================================================
const MOO_LEVEL_STORAGE_KEY = 'severe_weather_moo_level_v1';
const MOO_LEVEL_MARKER = 'SW_GAME_002_MOO_LEVEL_V1';
const HART_FARM_ENCOUNTER = Object.freeze({ duration: 25, relocated: 6, airtime: 10, radius: 54 });
const MOO_LEVEL_OBJECTIVES = Object.freeze({ relocated: 20, airtime: 45, props: 10, duration: 90 });
const HART_FARM_ANCHOR = Object.freeze({ x: 136, z: -142 });

let mooLevelMode = 'normal';
let mooLevelRoot = null;
let hartFarmRing = [];
let mooSponsorProps = [];
let mooRuntimeTicks = 0;
let mooEncounter = null;
let mooRun = null;

function loadMooLevelProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(MOO_LEVEL_STORAGE_KEY) || '{}');
    return { mooLevelUnlocked: saved.mooLevelUnlocked === true, bestScore: Math.max(0, Number(saved.bestScore) || 0) };
  } catch (_) {
    return { mooLevelUnlocked: false, bestScore: 0 };
  }
}

let mooLevelProgress = loadMooLevelProgress();

function saveMooLevelProgress() {
  try { localStorage.setItem(MOO_LEVEL_STORAGE_KEY, JSON.stringify(mooLevelProgress)); } catch (_) {}
}

function mooAnchor() {
  if (productionBarn && Number.isFinite(productionBarn.x) && Number.isFinite(productionBarn.z)) {
    return { x: productionBarn.x + 24, z: productionBarn.z + 8 };
  }
  return HART_FARM_ANCHOR;
}

function disposeMooRoot() {
  if (mooLevelRoot && mooLevelRoot.parent) mooLevelRoot.parent.remove(mooLevelRoot);
  mooLevelRoot = null;
  hartFarmRing = [];
  mooSponsorProps = [];
}

function createMooCow(x, z, id, role) {
  const mesh = new THREE.Group();
  const hide = new THREE.MeshStandardMaterial({ color: '#fbf7ef', roughness: 0.82 });
  const spot = new THREE.MeshStandardMaterial({ color: '#201b22', roughness: 0.9 });
  const pink = new THREE.MeshStandardMaterial({ color: '#f5a6b7', roughness: 0.85 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.7, 1.85), hide);
  body.position.y = 1.45;
  const head = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.04, 0.94), hide);
  head.position.set(0, 2.08, 1.36);
  const udder = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.36, 0.76), pink);
  udder.position.set(0, 0.72, -0.12);
  mesh.add(body, head, udder);
  [-1.15, 1.15].forEach((legX) => [-0.56, 0.56].forEach((legZ) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.12, 0.38), hide);
    leg.position.set(legX, 0.56, legZ);
    mesh.add(leg);
  }));
  [[-0.75, 1.5, 0.92], [0.48, 1.5, -0.88], [1.08, 1.56, 0.44]].forEach(([px, py, pz]) => {
    const patch = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.56), spot);
    patch.position.set(px, py, pz);
    mesh.add(patch);
  });
  const groundY = terrainHeightAt(x, z);
  mesh.position.set(x, groundY + 0.8, z);
  mesh.castShadow = true;
  mesh.userData.mooLevelSafeAnimal = true;
  mesh.userData.mooRole = role;
  scene.add(mesh);
  return { id, mesh, x, z, groundY, airborne: false, altitude: 0.8, orbitAngle: id * 0.37, mooRole: role, mooStartX: x, mooStartZ: z, mooRelocated: false };
}

function addMooSign(parent, text, x, z, color = '#7c2d12') {
  const sign = new THREE.Mesh(new THREE.BoxGeometry(12, 4, 0.45), createSignMaterial(text, color, '#fff7ed'));
  sign.position.set(x, terrainHeightAt(x, z) + 5, z);
  parent.add(sign);
  return sign;
}

function createMooSponsorProp(id, x, z, label, color) {
  const group = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({ color, roughness: 0.72 });
  const trim = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.62 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(7.2, 4.8, 5.8), paint);
  base.position.y = 2.4;
  const awning = new THREE.Mesh(new THREE.BoxGeometry(8.1, 0.56, 2.15), trim);
  awning.position.set(0, 4.92, 2.15);
  group.add(base, awning);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(6.8, 1.65, 0.25), createSignMaterial(label, color, '#fff7ed'));
  sign.position.set(0, 5.95, 0);
  group.add(sign);
  group.position.set(x, terrainHeightAt(x, z), z);
  scene.add(group);
  return { id, kind: 'moo-sponsor', x, z, stage: 3, tags: ['moo-fair', 'sponsor'], gag: `${label} HAS BEEN REVIEWED BY BOVINE COMPLIANCE.`, health: 132, maxHealth: 132, destroyed: false, points: 260, meshData: { group, color, points: 260, footprint: 7 }, mooSponsor: true };
}

function setupHartFarmEncounter() {
  disposeMooRoot();
  townDressGroup.visible = true;
  const anchor = mooAnchor();
  mooLevelRoot = new THREE.Group();
  mooLevelRoot.name = 'HartFarmBovineComplianceEncounter';
  scene.add(mooLevelRoot);
  addMooSign(mooLevelRoot, 'HART FARM|BOVINE COMPLIANCE', anchor.x, anchor.z - 16, '#5f2f18');
  for (let index = 0; index < 8; index++) {
    const angle = (index / 8) * Math.PI * 2;
    const cow = createMooCow(anchor.x + Math.cos(angle) * 17, anchor.z + Math.sin(angle) * 17, 700 + index, 'hart-encounter');
    hartFarmRing.push(cow);
    animals.push(cow);
  }
  mooEncounter = { state: mooLevelProgress.mooLevelUnlocked ? 'complete' : 'armed', remaining: HART_FARM_ENCOUNTER.duration, relocated: new Set(), airtime: 0, activated: false, failedThisRun: false };
}

function clearNormalWorldForMooLevel() {
  targets.forEach((target) => scene.remove(target.meshData.group));
  landmarks.forEach((target) => scene.remove(target.meshData.group));
  substations.forEach((target) => scene.remove(target.meshData.group));
  comedyProps.forEach((target) => scene.remove(target.meshData.group));
  chainSetpieces.forEach((target) => scene.remove(target.meshData.group));
  animals.forEach((animal) => scene.remove(animal.mesh));
  targets.length = 0; landmarks.length = 0; substations.length = 0; comedyProps.length = 0; chainSetpieces.length = 0; animals.length = 0;
}

function setupMooLevelWorld() {
  disposeMooRoot();
  clearNormalWorldForMooLevel();
  townDressGroup.visible = false;
  mooLevelRoot = new THREE.Group();
  mooLevelRoot.name = 'MooCountyFairBovineScoreAttack';
  scene.add(mooLevelRoot);
  const fairPad = new THREE.Mesh(new THREE.PlaneGeometry(248, 202), new THREE.MeshStandardMaterial({ color: '#637845', roughness: 0.96 }));
  fairPad.rotation.x = -Math.PI / 2;
  fairPad.position.y = 0.52;
  fairPad.receiveShadow = true;
  mooLevelRoot.add(fairPad);
  const barn = new THREE.Group();
  const barnRed = new THREE.MeshStandardMaterial({ color: '#9d3030', roughness: 0.83 });
  const barnRoof = new THREE.MeshStandardMaterial({ color: '#34242b', roughness: 0.7 });
  const barnBody = new THREE.Mesh(new THREE.BoxGeometry(34, 18, 25), barnRed);
  barnBody.position.y = 9;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(25, 11, 4), barnRoof);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 23;
  barn.add(barnBody, roof);
  barn.position.set(-78, terrainHeightAt(-78, 18), 18);
  mooLevelRoot.add(barn);
  const wheel = new THREE.Group();
  const wheelRing = new THREE.Mesh(new THREE.TorusGeometry(17, 1.1, 8, 28), new THREE.MeshStandardMaterial({ color: '#f6c453', emissive: '#5d3600', emissiveIntensity: 0.22 }));
  wheelRing.rotation.y = Math.PI / 2;
  wheelRing.position.y = 19;
  wheel.add(wheelRing);
  [-8, 8].forEach((offset) => { const support = new THREE.Mesh(new THREE.BoxGeometry(1.2, 22, 1.2), barnRoof); support.position.set(offset, 10, 0); support.rotation.z = offset < 0 ? -0.35 : 0.35; wheel.add(support); });
  wheel.position.set(70, terrainHeightAt(70, 14), 14);
  mooLevelRoot.add(wheel);
  const fenceMat = new THREE.MeshStandardMaterial({ color: '#c79053', roughness: 0.92 });
  [-112, 112].forEach((x) => { const fence = new THREE.Mesh(new THREE.BoxGeometry(2, 2.1, 178), fenceMat); fence.position.set(x, 1.1, 0); mooLevelRoot.add(fence); });
  [-88, 88].forEach((z) => { const fence = new THREE.Mesh(new THREE.BoxGeometry(226, 2.1, 2), fenceMat); fence.position.set(0, 1.1, z); mooLevelRoot.add(fence); });
  const fairMat = new THREE.MeshStandardMaterial({ color: '#315b79', roughness: 0.78 });
  const gate = new THREE.Mesh(new THREE.BoxGeometry(34, 7, 2), fairMat);
  gate.position.set(0, terrainHeightAt(0, -70) + 5, -70);
  mooLevelRoot.add(gate);
  addMooSign(mooLevelRoot, 'MOO COUNTY FAIR|BOVINE SCORE ATTACK', 0, -70, '#5b246c');
  const ring = new THREE.Mesh(new THREE.TorusGeometry(34, 0.48, 6, 36), new THREE.MeshStandardMaterial({ color: '#f6c453', emissive: '#5d3600', emissiveIntensity: 0.3 }));
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, terrainHeightAt(0, 0) + 0.36, 0);
  mooLevelRoot.add(ring);
  for (let index = 0; index < 28; index++) {
    const angle = index * 2.3999632297;
    const radius = 24 + (index % 5) * 9;
    const cow = createMooCow(Math.cos(angle) * radius, Math.sin(angle) * radius + 6, 900 + index, 'moo-level');
    animals.push(cow);
  }
  const labels = ['MOO BREW', 'FARM BUREAU', 'UDDERLY LEGAL', 'HAYWIRE', 'DAIRY QUEEN', 'COWPOKE', 'MILK BAR', 'BARN DANCE', 'MOO MART', 'CHEESE CURD', 'FENCE CO.', 'CATTLE CALL'];
  labels.forEach((label, index) => {
    const angle = (index / labels.length) * Math.PI * 2;
    const prop = createMooSponsorProp(`moo-sponsor-${index}`, Math.cos(angle) * 70, Math.sin(angle) * 62, label, index % 2 ? '#8f3a5b' : '#315b79');
    comedyProps.push(prop);
    mooSponsorProps.push(prop);
  });
  currentStage = 3;
  runTimeRemaining = MOO_LEVEL_OBJECTIVES.duration;
  mooRun = { relocated: new Set(), airtime: 0, propCount: 0, scoreBonusMilestones: new Set(), started: true, completed: false };
  publishMediaHeadline('MOO COUNTY FAIR BOVINE SCORE ATTACK IS SANCTIONED.', 4.5);
  showGagToast('MOO LEVEL ACTIVE: THE COWS HAVE COUNSEL.');
}

function updateMooHud() {
  const meter = getCachedEl('mooMeterVal');
  if (!meter) return;
  if (mooLevelMode !== 'moo' || !mooRun) { meter.textContent = mooLevelProgress.mooLevelUnlocked ? 'MOO LEVEL UNLOCKED' : 'MOO LEVEL: FIND HART FARM'; return; }
  const multiplier = mooScoreMultiplier();
  meter.textContent = `MOO METER ${multiplier.toFixed(1)}x | COWS ${mooRun.relocated.size}/20 | AIR ${mooRun.airtime.toFixed(1)}/45`;
}

function mooScoreMultiplier() {
  if (mooLevelMode !== 'moo' || !mooRun) return 1;
  return Math.min(3, 1 + mooRun.relocated.size / 20 + mooRun.airtime / 90);
}

function renderMooObjectives() {
  if (mooLevelMode !== 'moo' || !mooRun) return false;
  const items = [
    ['RELOCATE COWS', mooRun.relocated.size, MOO_LEVEL_OBJECTIVES.relocated],
    ['COMBINED COW AIRTIME', mooRun.airtime, MOO_LEVEL_OBJECTIVES.airtime, 's'],
    ['SPONSOR PROPS', mooRun.propCount, MOO_LEVEL_OBJECTIVES.props],
  ];
  const html = `<div><b>MOO COUNTY FAIR OBJECTIVES:</b></div>${items.map(([label, value, target, suffix = '']) => {
    const done = value >= target;
    return `<div class="${done ? 'obj-item done' : 'obj-item'}">${done ? '✓' : '○'} ${label}: ${typeof value === 'number' && suffix ? value.toFixed(1) : value}/${target}${suffix}</div>`;
  }).join('')}<div style="font-size:9px;color:#f6c453;margin-top:4px;font-weight:900;">MOO METER: ${mooScoreMultiplier().toFixed(1)}x BOVINE RESPONSE</div>`;
  const el = getCachedEl('objList');
  if (el) el.innerHTML = html;
  return true;
}

function updateHartFarmEncounter(dt) {
  if (!mooEncounter || mooLevelProgress.mooLevelUnlocked || mooEncounter.failedThisRun || !runActive) return;
  const anchor = mooAnchor();
  const distance = Math.hypot(storm.pos.x - anchor.x, storm.pos.z - anchor.z);
  if (!mooEncounter.activated) {
    if (distance > HART_FARM_ENCOUNTER.radius) return;
    mooEncounter.activated = true;
    mooEncounter.state = 'active';
    mooEncounter.remaining = HART_FARM_ENCOUNTER.duration;
    publishMediaHeadline('HART FARM ACTIVATES THE BOVINE COMPLIANCE TEST.', 4.2);
    showGagToast('BOVINE COMPLIANCE TEST: RELOCATE 6 COWS + 10s AIRTIME.');
  }
  hartFarmRing.forEach((cow) => {
    if (cow.airborne) mooEncounter.airtime += dt;
    if (!cow.mooRelocated && Math.hypot(cow.x - cow.mooStartX, cow.z - cow.mooStartZ) >= 12) {
      cow.mooRelocated = true;
      mooEncounter.relocated.add(cow.id);
    }
  });
  mooEncounter.remaining = Math.max(0, mooEncounter.remaining - dt);
  setUI('districtChallenge', `BOVINE COMPLIANCE: ${mooEncounter.relocated.size}/6 COWS | ${mooEncounter.airtime.toFixed(1)}/10s AIR | ${Math.ceil(mooEncounter.remaining)}s`);
  if (mooEncounter.relocated.size >= HART_FARM_ENCOUNTER.relocated && mooEncounter.airtime >= HART_FARM_ENCOUNTER.airtime) {
    mooLevelProgress = { ...mooLevelProgress, mooLevelUnlocked: true };
    saveMooLevelProgress();
    mooEncounter.state = 'complete';
    updateMooMenuNode();
    publishMediaHeadline('SECRET LEVEL UNLOCKED: THE MOO LEVEL.', 6);
    showGagToast('SECRET LEVEL UNLOCKED: THE MOO LEVEL');
  } else if (mooEncounter.remaining <= 0) {
    mooEncounter.state = 'failed';
    mooEncounter.failedThisRun = true;
    showGagToast('COMPLIANCE REVIEW DEFERRED. HART FARM REARMS NEXT RUN.');
  }
}

function updateMooLevelRun(dt) {
  if (!mooRun || !runActive) return;
  currentStage = 3;
  setUI('stormDesc', `MOO COUNTY FAIR BOVINE SCORE ATTACK - ${Math.ceil(runTimeRemaining)}s REMAINING`);
  setUI('stageStatusTag', 'MOO COUNTY FAIR: SANCTIONED BOVINE EMERGENCY');
  setUI('districtVal', 'MOO');
  setUI('districtKicker', 'SECRET LEVEL');
  setUI('districtTitle', 'MOO COUNTY FAIR');
  setUI('districtSubtitle', 'A 90-second bovine score attack. The cows have representation.');
  setUI('districtChallengeCard', `MOO METER ${mooScoreMultiplier().toFixed(1)}x · RELOCATE 20 · 45s AIRTIME · 10 SPONSORS`);
  setUI('districtChallenge', `MOO LEVEL: ${mooRun.relocated.size}/20 COWS · ${mooRun.airtime.toFixed(1)}/45s AIR · ${mooRun.propCount}/10 SPONSORS`);
  getCachedEl('districtOverlay')?.classList.remove('active');
  animals.filter((cow) => cow.mooRole === 'moo-level').forEach((cow) => {
    if (cow.airborne) mooRun.airtime += dt;
    if (!cow.mooRelocated && Math.hypot(cow.x - cow.mooStartX, cow.z - cow.mooStartZ) >= 12) {
      cow.mooRelocated = true;
      mooRun.relocated.add(cow.id);
    }
  });
  mooRun.propCount = mooSponsorProps.filter((prop) => prop.destroyed).length;
  const milestones = [
    ['relocate', mooRun.relocated.size >= 10], ['airtime', mooRun.airtime >= 20], ['props', mooRun.propCount >= 5],
  ];
  milestones.forEach(([name, reached]) => {
    if (reached && !mooRun.scoreBonusMilestones.has(name)) {
      mooRun.scoreBonusMilestones.add(name);
      addScore(300);
      showGagToast(`MOO METER SURGE: ${name.toUpperCase()} VERIFIED.`);
    }
  });
  renderMooObjectives();
}

function updateMooMenuNode() {
  const node = getCachedEl('menuCardMooLevel');
  const label = getCachedEl('mooLevelCardLabel');
  const best = getCachedEl('mooLevelBest');
  if (!node || !label || !best) return;
  const unlocked = mooLevelProgress.mooLevelUnlocked;
  node.classList.toggle('locked', !unlocked);
  node.classList.toggle('selected', mooLevelMode === 'moo');
  label.textContent = unlocked ? 'MOO LEVEL' : 'MOO LEVEL: LOCKED';
  best.textContent = unlocked ? `BEST: ${mooLevelProgress.bestScore}` : 'FIND HART FARM';
}

function ensureMooUi() {
  if (document.getElementById('mooLevelRuntimeStyles')) return;
  const style = document.createElement('style');
  style.id = 'mooLevelRuntimeStyles';
  style.textContent = '#menuCardMooLevel{border-color:#d8a64b;background:linear-gradient(145deg,#3c1d48,#172a3a)}#menuCardMooLevel.locked{filter:saturate(.38);opacity:.62}#mooMeterPanel{color:#fde68a;font:900 10px/1 Outfit,sans-serif;letter-spacing:.04em}#mooReturnButton{display:none}body.moo-level-run #mooReturnButton{display:block}';
  document.head.appendChild(style);
  const grid = document.querySelector('.storm-select-grid');
  if (grid) {
    const node = document.createElement('div');
    node.className = 'storm-card locked'; node.id = 'menuCardMooLevel'; node.tabIndex = 0;
    node.innerHTML = '<div style="font-size:24px;">🐄</div><h3 id="mooLevelCardLabel">MOO LEVEL: LOCKED</h3><p>Moo County Fair Bovine Score Attack. A serious agricultural emergency.</p><div class="hi-score" id="mooLevelBest">FIND HART FARM</div>';
    node.onclick = () => startMooLevelFromMenu();
    grid.appendChild(node);
  }
  const telemetry = document.querySelector('.telemetry');
  if (telemetry) { const panel = document.createElement('div'); panel.id = 'mooMeterPanel'; panel.innerHTML = '<b id="mooMeterVal">MOO LEVEL: FIND HART FARM</b>'; telemetry.appendChild(panel); }
  const results = document.querySelector('.results-card');
  if (results) { const button = document.createElement('button'); button.id = 'mooReturnButton'; button.className = 'retry-btn'; button.textContent = 'RETURN TO WEATHER MAP'; button.onclick = () => returnToWeatherMap(); results.appendChild(button); }
  updateMooMenuNode(); updateMooHud();
}

function startMooLevelFromMenu() {
  if (!mooLevelProgress.mooLevelUnlocked) { showGagToast('MOO LEVEL LOCKED: DISCOVER HART FARM FIRST.'); return false; }
  mooLevelMode = 'moo';
  const menu = getCachedEl('mainMenu');
  if (menu) { menu.classList.add('hidden'); menu.style.display = 'none'; }
  gameStarted = true; isPaused = false;
  resetWarningRun();
  return true;
}

function returnToWeatherMap() {
  runActive = false; gameStarted = false; isPaused = false; mooLevelMode = 'normal';
  townDressGroup.visible = true;
  document.body.classList.remove('moo-level-run');
  getCachedEl('resultsOverlay')?.classList.remove('active');
  const menu = getCachedEl('mainMenu');
  if (menu) { menu.classList.remove('hidden'); menu.style.display = 'flex'; menu.style.pointerEvents = 'auto'; }
  updateMooMenuNode(); updateMooHud();
}

const mooBaseInit3DWorld = init3DWorld;
init3DWorld = function mooAwareInit3DWorld(...args) {
  const result = mooBaseInit3DWorld.apply(this, args);
  if (mooLevelMode === 'moo') setupMooLevelWorld(); else setupHartFarmEncounter();
  document.body.classList.toggle('moo-level-run', mooLevelMode === 'moo');
  return result;
};

const mooBaseStartRunFromMenu = startRunFromMenu;
startRunFromMenu = function mooAwareStartRunFromMenu(...args) { mooLevelMode = 'normal'; return mooBaseStartRunFromMenu.apply(this, args); };

const mooBaseFinishRun = finishRun;
finishRun = function mooAwareFinishRun(...args) {
  if (mooLevelMode !== 'moo' || !mooRun) return mooBaseFinishRun.apply(this, args);
  runActive = false;
  const completed = [mooRun.relocated.size >= 20, mooRun.airtime >= 45, mooRun.propCount >= 10];
  const udderChaos = completed.every(Boolean);
  const score = Math.round(destructionScore);
  mooLevelProgress = { ...mooLevelProgress, bestScore: Math.max(mooLevelProgress.bestScore, score) };
  saveMooLevelProgress();
  mooRun.completed = true;
  setUI('resStormTitle', 'MOO COUNTY FAIR: BOVINE SCORE ATTACK');
  setUI('resGrade', udderChaos ? 'UDDER CHAOS' : (completed.filter(Boolean).length >= 2 ? 'HERD READY' : 'MOO PRACTICE'));
  setUI('resScore', score); setUI('resCombo', `${mooScoreMultiplier().toFixed(1)}x MOO METER`); setUI('resObjCount', `${completed.filter(Boolean).length}/3`);
  setUI('resLandmarks', 'FAIRGROUND SAFE'); setUI('resSubstations', 'COWS SAFE'); setUI('resChallenges', `${mooRun.relocated.size} RELOCATED`);
  setUI('resBlocks', `${mooRun.airtime.toFixed(1)}s AIRTIME`); setUI('resChains', `${mooRun.propCount} SPONSORS`); setUI('resMediaMoments', 'BOVINE BULLETIN'); setUI('resFootageBonus', udderChaos ? 'UDDER CHAOS!' : 'REPLAY FOR THE HERD'); setUI('resCosmetic', `MOO LEVEL BEST: ${mooLevelProgress.bestScore}`);
  getCachedEl('resultsOverlay')?.classList.add('active'); updateMooMenuNode();
};

const mooBaseRenderObjectives = renderObjectives;
renderObjectives = function mooAwareRenderObjectives(...args) { return renderMooObjectives() || mooBaseRenderObjectives.apply(this, args); };

const mooBaseAddScore = addScore;
addScore = function mooAwareAddScore(points) { return mooBaseAddScore(mooLevelMode === 'moo' ? Math.round(points * mooScoreMultiplier()) : points); };

const mooBaseV510Update = globalThis.__SW_V510_UPDATE__;
globalThis.__SW_V510_UPDATE__ = function mooExecutorUpdate(dt, now, isMoving) {
  const result = mooBaseV510Update(dt, now, isMoving);
  mooRuntimeTicks++;
  if (mooLevelMode === 'moo') updateMooLevelRun(dt); else updateHartFarmEncounter(dt);
  updateMooHud();
  return result;
};

globalThis.getMooLevelQaState = function getMooLevelQaState() {
  const activeCows = mooLevelMode === 'moo'
    ? animals.filter((cow) => cow.mooRole === 'moo-level')
    : hartFarmRing;
  return { marker: MOO_LEVEL_MARKER, executorTicks: mooRuntimeTicks, mode: mooLevelMode, progress: { ...mooLevelProgress }, encounter: mooEncounter ? { state: mooEncounter.state, activated: mooEncounter.activated, remaining: Number(mooEncounter.remaining.toFixed(2)), relocated: mooEncounter.relocated.size, airtime: Number(mooEncounter.airtime.toFixed(2)), failedThisRun: mooEncounter.failedThisRun } : null, mooRun: mooRun ? { relocated: mooRun.relocated.size, airtime: Number(mooRun.airtime.toFixed(2)), props: mooRun.propCount, sponsorProps: mooSponsorProps.length } : null, safeCowCount: activeCows.length, allMooCowsSafe: activeCows.every((cow) => cow.mesh.userData.mooLevelSafeAnimal === true), normalCampaignMode: mooLevelMode === 'normal' };
};

globalThis.__SW_MOO_LEVEL_QA__ = {
  beginEncounter() { mooLevelMode = 'normal'; startRunFromMenu(); const anchor = mooAnchor(); storm.pos.set(anchor.x, terrainHeightAt(anchor.x, anchor.z), anchor.z); tornadoGroup.position.copy(storm.pos); },
  expireEncounter() { if (mooEncounter) { mooEncounter.activated = true; mooEncounter.remaining = 0.01; } },
  primeEncounterSuccess() { hartFarmRing.forEach((cow, index) => { cow.airborne = true; cow.altitude = 6; cow.x = cow.mooStartX + 20 + index; cow.z = cow.mooStartZ; }); },
  beginMooLevel() { mooLevelProgress = { ...mooLevelProgress, mooLevelUnlocked: true }; saveMooLevelProgress(); startMooLevelFromMenu(); },
  primeMooObjectives() { animals.filter((cow) => cow.mooRole === 'moo-level').slice(0, 20).forEach((cow, index) => { cow.airborne = true; cow.altitude = 7; cow.x = cow.mooStartX + 18 + index; }); mooSponsorProps.slice(0, 10).forEach((prop) => { prop.health = 0; prop.destroyed = true; scene.remove(prop.meshData.group); }); },
  resetProgress() { mooLevelProgress = { mooLevelUnlocked: false, bestScore: 0 }; saveMooLevelProgress(); updateMooMenuNode(); }
};

ensureMooUi();
setupHartFarmEncounter();
if (urlParams.get('mooqa') === '1') setTimeout(() => globalThis.__SW_MOO_LEVEL_QA__.beginEncounter(), 650);
