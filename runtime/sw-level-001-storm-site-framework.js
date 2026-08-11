// ============================================================================
// [SW:WORLD:STORM_SITE_FRAMEWORK]
// SW-LEVEL-001 keeps authored site data and its world launch seam outside the
// county campaign. Sites use the accepted target/destruction executor.
// ============================================================================
const STORM_SITE_MARKER = 'SW_LEVEL_001_STORM_SITE_FRAMEWORK_V1';
const STORM_SITE_HOME_ID = 'heartland-home';

const STORM_SITE_REGISTRY = Object.freeze({
  [STORM_SITE_HOME_ID]: Object.freeze({
    id: STORM_SITE_HOME_ID,
    displayName: 'Lincoln County',
    route: { kind: 'campaign-home', mapNode: 'heartland' },
    launch: { mode: 'accepted-campaign' },
  }),
  'county-fair': Object.freeze({
    id: 'county-fair',
    displayName: 'County Fair After Dark',
    newspaperFlavor: 'MIDWAY INSURANCE DESK OPENS EARLY',
    region: 'Heartland fairground',
    scale: 'focused-destination',
    launch: { mode: 'storm-site', durationAuthority: 'accepted-campaign' },
    layout: { moduleSet: ['midway', 'grandstand', 'ride-row', 'food-court'], bounds: { width: 300, depth: 270 } },
    landmarks: ['Ferris wheel', 'Grandstand', 'Tilt-a-Whirl'],
    targetFamilies: ['rides', 'midway stalls', 'food stands', 'ticket booths'],
    objectiveMode: 'pure-destruction',
    secretFeats: [{ id: 'fair-wheel-flight', signal: 'signature-destruction', label: 'Send the Ferris wheel into a frequent-flyer program.' }],
    rewards: { owner: 'future-progression', rule: 'none-in-this-pass' },
    rankThresholds: { owner: 'accepted-scoring', rule: 'unchanged' },
    replayVariants: ['harvest-night', 'sponsor-swap'],
    results: { headline: 'COUNTY FAIR BECOMES A COUNTY AIRFARE.' },
    performance: { maxDestructibleTargets: 34, maxDecorativeMeshes: 42 },
  }),
  'coastal-boardwalk': Object.freeze({
    id: 'coastal-boardwalk',
    displayName: 'Gullwind Boardwalk & Pier',
    newspaperFlavor: 'PIER ADMISSION NOW INCLUDES A LIFE VEST',
    region: 'Atlantic amusement coast',
    scale: 'focused-destination',
    launch: { mode: 'storm-site', durationAuthority: 'accepted-campaign' },
    layout: { moduleSet: ['boardwalk', 'pier', 'arcade-strip', 'marina'], bounds: { width: 320, depth: 260 } },
    landmarks: ['Pier coaster', 'Neon arcade', 'Marina launch ramp'],
    targetFamilies: ['arcades', 'pier rides', 'beach kiosks', 'boats'],
    objectiveMode: 'bounded-authored-pool',
    secretFeats: [{ id: 'boat-launch-signal', signal: 'boat-launch', label: 'Launch a marina boat. Waterspout progression remains future-owned.' }],
    rewards: { owner: 'future-progression', rule: 'boat-launch-signal-only' },
    rankThresholds: { owner: 'accepted-scoring', rule: 'unchanged' },
    replayVariants: ['neon-tide', 'storm-surge-sponsors'],
    results: { headline: 'GULLWIND PIER RELOCATES TO INTERNATIONAL WATERS.' },
    performance: { maxDestructibleTargets: 36, maxDecorativeMeshes: 46 },
  }),
});

let stormSiteSelection = STORM_SITE_HOME_ID;
let stormSiteRoot = null;
let stormSiteTargets = [];
let stormSiteLaunches = 0;
let stormSiteRuntimeTicks = 0;
let stormSiteActiveVariant = null;
let stormSiteSignatureState = { fairWheelDestroyed: false, boatLaunchSignal: false };

function stormSiteDefinition(siteId) {
  return STORM_SITE_REGISTRY[siteId] || STORM_SITE_REGISTRY[STORM_SITE_HOME_ID];
}

function stormSiteIsActive() {
  return stormSiteSelection !== STORM_SITE_HOME_ID;
}

function disposeStormSiteWorld() {
  if (stormSiteRoot?.parent) stormSiteRoot.parent.remove(stormSiteRoot);
  stormSiteRoot = null;
  stormSiteTargets = [];
  stormSiteActiveVariant = null;
  stormSiteSignatureState = { fairWheelDestroyed: false, boatLaunchSignal: false };
}

function clearAcceptedWorldForStormSite() {
  targets.forEach(target => scene.remove(target.meshData.group));
  landmarks.forEach(target => scene.remove(target.meshData.group));
  substations.forEach(target => scene.remove(target.meshData.group));
  comedyProps.forEach(target => scene.remove(target.meshData.group));
  chainSetpieces.forEach(target => scene.remove(target.meshData.group));
  animals.forEach(animal => scene.remove(animal.mesh));
  targets.length = 0; landmarks.length = 0; substations.length = 0;
  comedyProps.length = 0; chainSetpieces.length = 0; animals.length = 0;
  if (typeof disposeMooRoot === 'function') disposeMooRoot();
  townDressGroup.visible = false;
  if (productionSliceRoot) productionSliceRoot.visible = false;
}

function restoreAcceptedWorldVisibility() {
  townDressGroup.visible = true;
  if (productionSliceRoot) productionSliceRoot.visible = true;
}

function restoreAcceptedCampaignWorld() {
  // init3DWorld has already rebuilt the accepted campaign arrays before this
  // hook runs.  Removing the former Site root and clearing its private state
  // here makes Heartland a real restoration, rather than merely changing the
  // selected menu value while its prior Site telemetry survives.
  disposeStormSiteWorld();
  restoreAcceptedWorldVisibility();
}

function stormSitePresentationSnapshot() {
  return globalThis.__SW_PRESENTATION_IDENTITY_BRIDGE__?.getSnapshot?.().intro || null;
}

function dismissHeartlandOpeningForStormSite() {
  // A Storm Site is already a deliberate playable destination.  It must not
  // inherit Heartland's Cow 17/newspaper opening over its first playable
  // frame.  Use the presentation layer's own cleanup bridge, and preserve the
  // Heartland "first view" flag so normal campaign presentation remains its
  // authority on a later home launch.
  const bridge = globalThis.__SW_PRESENTATION_IDENTITY_BRIDGE__;
  if (!bridge?.hideIntro || !stormSitePresentationSnapshot()?.active) return false;
  let introSeen = null;
  try { introSeen = sessionStorage.getItem('severe_weather_moo_brew_intro_seen'); } catch (_) {}
  bridge.hideIntro();
  try {
    if (introSeen === null) sessionStorage.removeItem('severe_weather_moo_brew_intro_seen');
    else sessionStorage.setItem('severe_weather_moo_brew_intro_seen', introSeen);
  } catch (_) {}
  return true;
}

function addStormSitePart(parent, geometry, color, x, y, z, options = {}) {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: options.roughness ?? 0.78, emissive: options.emissive || '#000000', emissiveIntensity: options.emissiveIntensity || 0 }));
  mesh.position.set(x, y, z);
  if (options.rotation) mesh.rotation.set(options.rotation.x || 0, options.rotation.y || 0, options.rotation.z || 0);
  mesh.castShadow = productionQualityConfig().shadows;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function createStormSiteTarget(definition) {
  const group = new THREE.Group();
  const damageParts = [];
  const base = addStormSitePart(group, new THREE.BoxGeometry(definition.width, definition.height, definition.depth), definition.color, 0, definition.height / 2, 0);
  damageParts.push(base);
  const roof = addStormSitePart(group, new THREE.BoxGeometry(definition.width + 0.9, 0.55, definition.depth + 0.9), definition.roof || '#253041', 0, definition.height + 0.28, 0);
  damageParts.push(roof);
  if (definition.sign) {
    const sign = new THREE.Mesh(new THREE.BoxGeometry(Math.min(definition.width * 0.8, 10), 1.35, 0.22), createSignMaterial(definition.sign, definition.signColor || '#7c2d12', '#fff7ed'));
    sign.position.set(0, definition.height * 0.66, -definition.depth / 2 - 0.15);
    group.add(sign); damageParts.push(sign);
  }
  if (definition.kind === 'ferris') {
    const wheel = addStormSitePart(group, new THREE.TorusGeometry(10, 0.6, 8, 32), '#f6c453', 0, 16, 0, { rotation: { y: Math.PI / 2 }, emissive: '#5d3600', emissiveIntensity: 0.22 });
    wheel.rotation.y = Math.PI / 2; damageParts.push(wheel);
    [-4.8, 4.8].forEach(x => damageParts.push(addStormSitePart(group, new THREE.BoxGeometry(0.7, 17, 0.7), '#334155', x, 8.5, 0, { rotation: { z: x < 0 ? -0.38 : 0.38 } })));
  }
  if (definition.kind === 'boat') {
    const hull = addStormSitePart(group, new THREE.BoxGeometry(11, 2.3, 3.6), '#dbeafe', 0, 2.6, 0, { roughness: 0.42 });
    const cabin = addStormSitePart(group, new THREE.BoxGeometry(3.8, 2.2, 2.6), '#2563eb', -1, 4.5, 0, { roughness: 0.4 });
    damageParts.push(hull, cabin);
  }
  group.position.set(definition.x, terrainHeightAt(definition.x, definition.z), definition.z);
  scene.add(group);
  const target = {
    id: definition.id, x: definition.x, z: definition.z,
    health: definition.health || 140, maxHealth: definition.health || 140,
    stage: 'Intact', damageStage: 0, destroyed: false,
    meshData: { group, base, roof, color: definition.color, damageParts, footprint: Math.max(definition.width, definition.depth), points: definition.points || 110 },
    isTree: false, isCommercial: true, color: definition.color, points: definition.points || 110,
    blockId: `storm-site-${stormSiteSelection}`, blockName: definition.label, district: 3,
    stormSiteSignature: definition.signature || null,
  };
  targets.push(target); stormSiteTargets.push(target);
  return target;
}

function addStormSiteSign(text, x, z, color) {
  const sign = new THREE.Mesh(new THREE.BoxGeometry(20, 4.5, 0.35), createSignMaterial(text, color, '#fff7ed'));
  sign.position.set(x, terrainHeightAt(x, z) + 7, z);
  stormSiteRoot.add(sign);
}

function addStormSitePad(color, width, depth) {
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), new THREE.MeshStandardMaterial({ color, roughness: 0.94 }));
  pad.rotation.x = -Math.PI / 2; pad.position.y = 0.42; pad.receiveShadow = true; stormSiteRoot.add(pad);
}

function addStormSiteWater() {
  const water = new THREE.Mesh(new THREE.PlaneGeometry(170, 300), new THREE.MeshStandardMaterial({ color: '#164e63', roughness: 0.28, metalness: 0.22, transparent: true, opacity: 0.9 }));
  water.rotation.x = -Math.PI / 2; water.position.set(122, terrainHeightAt(122, 0) + 0.45, 0); stormSiteRoot.add(water);
}

function stormSiteVariant(site) {
  const variants = site.replayVariants || [];
  return variants[(stormSiteLaunches - 1) % Math.max(1, variants.length)] || 'default';
}

function buildCountyFairSite(site) {
  addStormSitePad('#5a5133', 300, 270);
  addStormSiteSign('COUNTY FAIR|MIDWAY AFTER DARK', -8, -116, '#6b214c');
  createStormSiteTarget({ id: 'fair-ferris', kind: 'ferris', signature: 'fair-wheel-flight', label: 'FERRIS WHEEL', x: 20, z: 22, width: 7, height: 2.2, depth: 7, color: '#7c3aed', health: 280, points: 420, sign: 'COUNTY FAIR' });
  createStormSiteTarget({ id: 'fair-grandstand', label: 'GRANDSTAND', x: -92, z: 42, width: 42, height: 13, depth: 20, color: '#7f1d1d', health: 270, points: 340, sign: 'GRANDSTAND' });
  const labels = ['FUNNEL CAKES', 'CORN DOGS', 'TILT-A-WHIRL', 'PRIZE BOOTH', 'HAYWIRE', 'TICKET TENT', 'RING TOSS', 'LEMONADE'];
  labels.forEach((label, index) => createStormSiteTarget({ id: `fair-midway-${index}`, label, x: -104 + (index % 4) * 66, z: -52 + Math.floor(index / 4) * 112, width: 14, height: index % 3 === 0 ? 9 : 6, depth: 11, color: ['#ef4444', '#f59e0b', '#2563eb', '#16a34a'][index % 4], health: 120, points: 155, sign: label }));
  const fill = stormSiteActiveVariant === 'harvest-night' ? ['PUMPKIN DROP', 'HARVEST BARN', 'CIDER TENT'] : ['SPONSOR TENT', 'MOO BREW', 'COUNTY BANK'];
  fill.forEach((label, index) => createStormSiteTarget({ id: `fair-variant-${index}`, label, x: 102 - index * 42, z: 88, width: 12, height: 6, depth: 10, color: '#a855f7', health: 110, points: 130, sign: label }));
}

function buildCoastalBoardwalkSite(site) {
  addStormSitePad('#a8794f', 250, 260); addStormSiteWater();
  addStormSiteSign('GULLWIND|BOARDWALK & PIER', -28, -112, '#075985');
  const pierMat = new THREE.MeshStandardMaterial({ color: '#7c5a3d', roughness: 0.94 });
  for (let index = 0; index < 13; index++) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(122, 0.55, 9), pierMat);
    plank.position.set(42, terrainHeightAt(42, -66 + index * 11) + 0.9, -66 + index * 11); stormSiteRoot.add(plank);
  }
  createStormSiteTarget({ id: 'pier-coaster', kind: 'ferris', signature: 'pier-coaster-collapse', label: 'PIER COASTER', x: 30, z: 58, width: 8, height: 2.3, depth: 8, color: '#e11d48', health: 300, points: 440, sign: 'GULLWIND COASTER' });
  createStormSiteTarget({ id: 'pier-boat', kind: 'boat', signature: 'boat-launch-signal', label: 'MARINA BOAT', x: 102, z: -12, width: 11, height: 2.2, depth: 4, color: '#f8fafc', health: 130, points: 210, sign: 'LAUNCH RAMP' });
  const labels = ['NEON ARCADE', 'SALTWATER TAFFY', 'LIFE GUARD', 'CRAB SHACK', 'SKEE BALL', 'SEAFOOD SHACK', 'BEACH RENTALS', 'PIER PHOTO'];
  labels.forEach((label, index) => createStormSiteTarget({ id: `pier-strip-${index}`, label, x: -104 + (index % 4) * 53, z: -48 + Math.floor(index / 4) * 108, width: 12, height: index % 2 ? 8 : 10, depth: 10, color: ['#0ea5e9', '#f97316', '#ec4899', '#14b8a6'][index % 4], health: 130, points: 160, sign: label }));
  const fill = stormSiteActiveVariant === 'neon-tide' ? ['NIGHT ARCADE', 'GLOW GOLF', 'FIREWORK BARGE'] : ['STORM SURGE', 'BOARDWALK FM', 'MARINA MUGS'];
  fill.forEach((label, index) => createStormSiteTarget({ id: `pier-variant-${index}`, label, x: 90 - index * 43, z: 104, width: 12, height: 7, depth: 9, color: '#1d4ed8', health: 110, points: 135, sign: label }));
}

function buildStormSiteWorld() {
  const site = stormSiteDefinition(stormSiteSelection);
  if (site.id === STORM_SITE_HOME_ID) { restoreAcceptedCampaignWorld(); return; }
  disposeStormSiteWorld(); clearAcceptedWorldForStormSite();
  stormSiteRoot = new THREE.Group(); stormSiteRoot.name = `StormSite:${site.id}`; scene.add(stormSiteRoot);
  stormSiteLaunches++;
  stormSiteActiveVariant = stormSiteVariant(site);
  if (site.id === 'county-fair') buildCountyFairSite(site); else buildCoastalBoardwalkSite(site);
  publishMediaHeadline(`${site.displayName.toUpperCase()} — ${site.newspaperFlavor}: ${stormSiteActiveVariant.replaceAll('-', ' ').toUpperCase()}.`, 4.2);
  showGagToast(`${site.displayName.toUpperCase()}: SAME PLACE, DIFFERENT STORM DAY.`);
}

function updateStormSiteExecutor() {
  stormSiteRuntimeTicks++;
  if (!stormSiteIsActive()) return;
  stormSiteTargets.forEach(target => {
    if (!target.destroyed || !target.stormSiteSignature) return;
    if (target.stormSiteSignature === 'fair-wheel-flight') stormSiteSignatureState.fairWheelDestroyed = true;
    if (target.stormSiteSignature === 'boat-launch-signal') stormSiteSignatureState.boatLaunchSignal = true;
  });
}

function ensureStormSiteUi() {
  if (document.getElementById('stormSiteFrameworkStyles')) return;
  const style = document.createElement('style'); style.id = 'stormSiteFrameworkStyles';
  style.textContent = '.storm-site-card{border-color:#7dd3fc!important;background:linear-gradient(145deg,#0c4a6e,#172554)!important}.storm-site-card h3{color:#fef3c7}'; document.head.appendChild(style);
  const grid = document.querySelector('.storm-select-grid');
  if (!grid) return;
  ['county-fair', 'coastal-boardwalk'].forEach(siteId => {
    const site = stormSiteDefinition(siteId); const card = document.createElement('div');
    card.className = 'storm-card storm-site-card'; card.id = `stormSiteCard-${siteId}`; card.tabIndex = 0;
    card.innerHTML = `<div style="font-size:24px;">${siteId === 'county-fair' ? '🎡' : '🌊'}</div><h3>${site.displayName}</h3><p>${site.region}. ${site.objectiveMode.replaceAll('-', ' ')}.</p><div class="hi-score">UNLEASH STORM</div>`;
    card.onclick = () => startStormSiteFromMenu(siteId); grid.appendChild(card);
  });
}

function startStormSiteFromMenu(siteId) {
  if (!STORM_SITE_REGISTRY[siteId] || siteId === STORM_SITE_HOME_ID) return false;
  stormSiteSelection = siteId;
  dismissHeartlandOpeningForStormSite();
  return stormSiteBaseStartRunFromMenu();
}

const stormSiteBaseInit3DWorld = init3DWorld;
init3DWorld = function stormSiteAwareInit3DWorld(...args) {
  const result = stormSiteBaseInit3DWorld.apply(this, args);
  buildStormSiteWorld();
  return result;
};

const stormSiteBaseStartRunFromMenu = startRunFromMenu;
startRunFromMenu = function stormSiteHomeStartRun(...args) {
  stormSiteSelection = STORM_SITE_HOME_ID;
  return stormSiteBaseStartRunFromMenu.apply(this, args);
};

const stormSiteBaseV510Update = globalThis.__SW_V510_UPDATE__;
globalThis.__SW_V510_UPDATE__ = function stormSiteExecutorUpdate(dt, now, isMoving) {
  const result = stormSiteBaseV510Update(dt, now, isMoving);
  updateStormSiteExecutor(dt, now, isMoving);
  return result;
};

globalThis.getStormSiteQaState = function getStormSiteQaState() {
  const site = stormSiteDefinition(stormSiteSelection);
  const intro = stormSitePresentationSnapshot();
  return {
    marker: STORM_SITE_MARKER, executorTicks: stormSiteRuntimeTicks, selectedSiteId: site.id,
    launchContract: site.launch, activeVariant: stormSiteActiveVariant,
    targetCount: stormSiteTargets.length, decorativeMeshCount: stormSiteRoot ? stormSiteRoot.children.length : 0,
    stormSiteWorldAttached: Boolean(stormSiteRoot?.parent),
    acceptedCampaignTargetCount: targets.length,
    acceptedCampaignDecorativeCount: landmarks.length + substations.length + comedyProps.length + chainSetpieces.length + animals.length,
    bounds: site.layout?.bounds || null,
    acceptedRunState: { runTimeRemaining: Math.round(runTimeRemaining), currentStage, currentStorm },
    signature: { ...stormSiteSignatureState }, registryIds: Object.keys(STORM_SITE_REGISTRY),
    campaignHomeSelected: stormSiteSelection === STORM_SITE_HOME_ID,
    mooProtected: typeof getMooLevelQaState === 'function' ? getMooLevelQaState().normalCampaignMode : false,
    boatLaunchSignalOnly: site.id !== 'coastal-boardwalk' || site.rewards.rule === 'boat-launch-signal-only',
    presentationIntroActive: Boolean(intro?.active),
    presentationIntroPhase: intro?.phase || null,
  };
};

globalThis.__SW_STORM_SITE_QA__ = {
  launch(siteId) { return startStormSiteFromMenu(siteId); },
  destroySignature(signature) {
    const target = stormSiteTargets.find(entry => entry.stormSiteSignature === (signature || (stormSiteSelection === 'coastal-boardwalk' ? 'boat-launch-signal' : 'fair-wheel-flight')));
    if (target) damageTarget(target, target.maxHealth, 'storm-site-qa');
    return Boolean(target);
  },
  returnHome() { stormSiteSelection = STORM_SITE_HOME_ID; return stormSiteBaseStartRunFromMenu(); },
};

ensureStormSiteUi();
