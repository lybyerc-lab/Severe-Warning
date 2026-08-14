// ============================================================================
// [SW:POLISH:001_QUALITY_RESCUE]
// Player-facing Stage 2B quality correction.
// Presentation only: storm readability, authored Site identity, cinematic finish,
// and constrained-landscape newspaper readability. Gameplay authority stays put.
// ============================================================================
const SW_POLISH_001_MARKER = 'SW_POLISH_001_QUALITY_RESCUE_V1';
const swPolish001State = {
  stormUpdates: 0,
  stormHelixCount: 0,
  fairBuilds: 0,
  coastalBuilds: 0,
  siteOpeningBypasses: 0,
  cinematicFrames: 0,
  cinematicActive: false,
  environmentProfile: 'heartland-home',
};

function swPolish001Number(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function swPolish001Material(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.82,
    metalness: options.metalness ?? 0.03,
    emissive: options.emissive || '#000000',
    emissiveIntensity: options.emissiveIntensity || 0,
    transparent: Boolean(options.transparent),
    opacity: options.opacity ?? 1,
    depthWrite: options.depthWrite ?? true,
  });
}

function swPolish001BasicMaterial(color, options = {}) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: Boolean(options.transparent),
    opacity: options.opacity ?? 1,
    depthWrite: options.depthWrite ?? true,
    side: options.side || THREE.FrontSide,
  });
}

function swPolish001Part(parent, geometry, material, position, options = {}) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position[0], position[1], position[2]);
  if (options.rotation) mesh.rotation.set(options.rotation[0] || 0, options.rotation[1] || 0, options.rotation[2] || 0);
  if (options.scale) mesh.scale.set(options.scale[0] || 1, options.scale[1] || 1, options.scale[2] || 1);
  mesh.castShadow = options.castShadow !== false;
  mesh.receiveShadow = options.receiveShadow !== false;
  mesh.userData.swPolish001Environment = options.profile || null;
  parent.add(mesh);
  return mesh;
}

// ----------------------------------------------------------------------------
// Tornado: make visible circulation legible through the entire condensation body.
// The accepted warped silhouette stays intact and hidden structural shells stay
// hidden. Visible ribbons, wisps, helix veils, and ground pull supply motion.
// ----------------------------------------------------------------------------
function swPolish001EnsureStormHelixVeils(root) {
  if (!root || root.getObjectByName('SWPolish001StormHelix1')) return;
  const colors = ['#202d31', '#4b453d', '#2f3d40', '#5b5145', '#263438'];
  for (let index = 0; index < 5; index += 1) {
    const direction = index % 2 === 0 ? 1 : -1;
    const phase = index * 1.21 + 0.35;
    const material = new THREE.MeshBasicMaterial({
      color: colors[index],
      transparent: true,
      opacity: 0.14 + (index % 3) * 0.025,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: true,
    });
    const veil = new THREE.Mesh(swVisualHeroSlice6CondensationStreakGeometry({
      bottomY: 0.45 + (index % 2) * 0.45,
      height: 33.5 + (index % 3) * 1.2,
      angle: phase,
      twist: direction * (2.75 + index * 0.27),
      bottomRadius: 1.0 + (index % 3) * 0.38,
      topRadius: 8.5 + (index % 3) * 1.25,
      bottomWidth: 0.52 + (index % 2) * 0.18,
      topWidth: 1.45 + (index % 3) * 0.32,
      shear: 0.85 + (index % 3) * 0.22,
      phase,
    }), material);
    veil.name = `SWPolish001StormHelix${index + 1}`;
    veil.userData.phase = phase;
    veil.userData.spin = direction * (0.48 + index * 0.055);
    veil.userData.baseOpacity = material.opacity;
    veil.userData.swPresentationOnly = true;
    veil.renderOrder = 10 + index;
    root.add(veil);
  }
  swPolish001State.stormHelixCount = 5;
}

const swPolish001BaseSlice6UpdateStorm = swVisualHeroSlice6UpdateStorm;
swVisualHeroSlice6UpdateStorm = function swPolish001WholeBodyStormMotion(dt, seconds) {
  const result = swPolish001BaseSlice6UpdateStorm.apply(this, arguments);
  const root = swVisualHeroSlice6StormRoot;
  if (!root) return result;

  swPolish001EnsureStormHelixVeils(root);
  const time = swPolish001Number(seconds, 0);
  const delta = Math.max(0, swPolish001Number(dt, 0));
  swPolish001State.stormUpdates += 1;
  root.rotation.y = Math.sin(time * 0.19) * 0.045;

  root.children.forEach((object, childIndex) => {
    if (object.name?.startsWith('SWVisualSlice6CondensationStreak')) {
      const match = object.name.match(/(\d+)$/);
      const streakIndex = Math.max(1, Number(match?.[1] || childIndex + 1));
      const phase = swPolish001Number(object.userData.phase, streakIndex * 0.71);
      const band = (streakIndex - 1) % 3;
      const direction = streakIndex % 2 === 0 ? -1 : 1;
      const rate = direction * (0.56 + band * 0.13 + (streakIndex % 4) * 0.035);
      const orbitAngle = phase + time * rate;
      const orbitRadius = 0.72 + band * 0.28 + (streakIndex % 4) * 0.08;
      const breathe = Math.sin(time * (1.45 + band * 0.12) + phase);

      object.position.x = Math.cos(orbitAngle) * orbitRadius;
      object.position.z = Math.sin(orbitAngle) * orbitRadius;
      object.position.y = Math.sin(time * 1.18 + phase) * (0.10 + band * 0.035);
      object.rotation.y = orbitAngle + Math.sin(time * 0.82 + phase) * 0.10;
      object.rotation.z = Math.sin(time * 1.10 + phase) * (0.026 + band * 0.008);
      object.rotation.x = Math.cos(time * 0.74 + phase) * 0.014;
      object.scale.set(1 + breathe * 0.035, 1 + Math.sin(time * 0.92 + phase) * 0.025, 1 - breathe * 0.025);
      if (object.material) object.material.opacity = Math.max(0.58, swPolish001Number(object.material.opacity, 0.66));
      return;
    }

    if (object.name?.startsWith('SWVisualSlice6EdgeWisp')) {
      const phase = swPolish001Number(object.userData.phase, childIndex * 0.5);
      const height = swPolish001Number(object.userData.height, 12);
      const radiusBase = swPolish001Number(object.userData.radius, 10);
      const spin = swPolish001Number(object.userData.spin, 0.34) * 2.15;
      const angle = swPolish001Number(object.userData.angle, 0) + time * spin;
      const radius = radiusBase * (0.93 + Math.sin(time * 1.34 + phase) * 0.07);
      const breathe = 1 + Math.sin(time * 1.7 + phase) * 0.08;
      object.position.set(
        Math.cos(angle) * radius + Math.sin(time * 0.82 + phase) * 0.65,
        height + Math.sin(time * 1.45 + phase) * 0.85,
        Math.sin(angle) * radius + Math.cos(time * 0.74 + phase) * 0.52,
      );
      object.rotation.y = angle + Math.sin(time * 0.62 + phase) * 0.13;
      object.rotation.z = Math.sin(time * 1.28 + phase) * 0.08;
      object.scale.set(breathe, 0.94 + Math.cos(time * 1.15 + phase) * 0.07, breathe);
      return;
    }

    if (object.name?.startsWith('SWPolish001StormHelix')) {
      const phase = swPolish001Number(object.userData.phase, childIndex * 0.4);
      const spin = swPolish001Number(object.userData.spin, 0.5);
      object.rotation.y = phase + time * spin;
      object.rotation.z = Math.sin(time * 0.72 + phase) * 0.025;
      object.position.x = Math.sin(time * 0.65 + phase) * 0.42;
      object.position.z = Math.cos(time * 0.58 + phase) * 0.36;
      object.scale.y = 0.97 + Math.sin(time * 0.84 + phase) * 0.035;
      if (object.material) {
        object.material.opacity = swPolish001Number(object.userData.baseOpacity, 0.16)
          * (0.88 + Math.sin(time * 1.08 + phase) * 0.12);
      }
      return;
    }

    if (object.name?.startsWith('SWVisualSlice6GroundPull')) {
      const phase = swPolish001Number(object.userData.phase, childIndex * 0.37);
      const angle = swPolish001Number(object.userData.angle, 0);
      const spin = swPolish001Number(object.userData.spin, 0.24);
      const direction = childIndex % 2 === 0 ? 1 : -1;
      object.rotation.y = angle + time * spin * 2.35 * direction;
      object.rotation.z = Math.sin(time * 1.9 + phase) * 0.035;
      return;
    }

    if (object.name?.startsWith('SWVisualSlice6GroundBurst')) {
      const phase = swPolish001Number(object.userData.phase, childIndex * 0.29);
      object.rotation.y = time * (0.35 + (childIndex % 5) * 0.04) + phase;
      object.scale.y = 0.92 + Math.sin(time * 1.65 + phase) * 0.08;
    }
  });

  // Motion is absolute-time driven so low frame rate cannot make the funnel
  // freeze or accelerate from accumulated frame error.
  void delta;
  return result;
};

// ----------------------------------------------------------------------------
// Storm Sites: add large-scale environment identity that survives a blurred read.
// All additions live under the accepted stormSiteRoot and disappear with it.
// ----------------------------------------------------------------------------
function swPolish001CreateFairEnvironment() {
  if (!stormSiteRoot) return null;
  const root = new THREE.Group();
  root.name = 'SWPolish001CountyFairIdentity';
  root.userData.swPolish001Profile = 'county-fair-warm-midway';
  stormSiteRoot.add(root);

  const soil = swPolish001Material('#5a452c', { roughness: 0.98 });
  const field = swPolish001Part(root, new THREE.PlaneGeometry(330, 76), soil, [0, 0.32, 118], { rotation: [-Math.PI / 2, 0, 0], castShadow: false, profile: 'county-fair' });
  field.receiveShadow = true;

  const siloMaterial = swPolish001Material('#756854', { roughness: 0.88, metalness: 0.18 });
  const roofMaterial = swPolish001Material('#362b27', { roughness: 0.82 });
  [-118, 122].forEach((x, index) => {
    const silo = swPolish001Part(root, new THREE.CylinderGeometry(8 + index * 1.5, 9 + index * 1.5, 34 + index * 6, 10), siloMaterial, [x, 17 + index * 3, 126], { profile: 'county-fair' });
    swPolish001Part(root, new THREE.ConeGeometry(9 + index * 1.5, 7, 10), roofMaterial, [x, 37 + index * 6, 126], { profile: 'county-fair' });
    silo.castShadow = false;
  });

  const barnMaterial = swPolish001Material('#6e2f2c', { roughness: 0.92 });
  swPolish001Part(root, new THREE.BoxGeometry(48, 15, 18), barnMaterial, [-30, 7.5, 130], { profile: 'county-fair' });
  const barnRoof = swPolish001Part(root, new THREE.ConeGeometry(32, 12, 4), roofMaterial, [-30, 19, 130], { rotation: [0, Math.PI / 4, 0], profile: 'county-fair' });
  barnRoof.scale.z = 0.52;

  const poleGeometry = new THREE.CylinderGeometry(0.22, 0.3, 13, 6);
  const poleMaterial = swPolish001Material('#3f3a34', { metalness: 0.35, roughness: 0.62 });
  const bulbGeometry = new THREE.SphereGeometry(0.34, 7, 5);
  const bulbMaterial = swPolish001BasicMaterial('#ffd166');
  for (let row = 0; row < 3; row += 1) {
    const z = -78 + row * 74;
    [-126, 126].forEach((x) => swPolish001Part(root, poleGeometry, poleMaterial, [x, 6.5, z], { profile: 'county-fair' }));
    for (let index = 0; index <= 12; index += 1) {
      const mix = index / 12;
      const x = THREE.MathUtils.lerp(-124, 124, mix);
      const sag = Math.sin(mix * Math.PI) * 2.2;
      swPolish001Part(root, bulbGeometry, bulbMaterial, [x, 12.2 - sag, z], { castShadow: false, receiveShadow: false, profile: 'county-fair' });
    }
  }

  const floodColor = '#ffb347';
  [-86, 86].forEach((x) => {
    const light = new THREE.PointLight(floodColor, 0.72, 110, 2);
    light.position.set(x, 18, -30);
    light.userData.swPolish001Environment = 'county-fair';
    root.add(light);
  });

  swPolish001State.fairBuilds += 1;
  swPolish001State.environmentProfile = 'county-fair-warm-midway';
  return root;
}

function swPolish001CreateCoastalEnvironment() {
  if (!stormSiteRoot) return null;
  const root = new THREE.Group();
  root.name = 'SWPolish001CoastalIdentity';
  root.userData.swPolish001Profile = 'coastal-boardwalk-marine-horizon';
  stormSiteRoot.add(root);

  const waterMaterial = swPolish001Material('#0c5265', { roughness: 0.22, metalness: 0.28, transparent: true, opacity: 0.94 });
  const ocean = swPolish001Part(root, new THREE.PlaneGeometry(520, 430), waterMaterial, [205, 0.18, 10], { rotation: [-Math.PI / 2, 0, 0], castShadow: false, profile: 'coastal-boardwalk' });
  ocean.receiveShadow = true;

  const sandMaterial = swPolish001Material('#b99568', { roughness: 0.98 });
  swPolish001Part(root, new THREE.PlaneGeometry(92, 320), sandMaterial, [-118, 0.38, 0], { rotation: [-Math.PI / 2, 0, 0], castShadow: false, profile: 'coastal-boardwalk' });
  const surfMaterial = swPolish001BasicMaterial('#d7f3f5', { transparent: true, opacity: 0.66, depthWrite: false });
  for (let index = 0; index < 4; index += 1) {
    const surf = swPolish001Part(root, new THREE.PlaneGeometry(6, 300), surfMaterial, [-69 + index * 8, 0.52 + index * 0.01, 0], { rotation: [-Math.PI / 2, 0, 0], castShadow: false, receiveShadow: false, profile: 'coastal-boardwalk' });
    surf.rotation.z = Math.sin(index * 1.7) * 0.035;
  }

  const lighthouseMaterial = swPolish001Material('#e8e5dc', { roughness: 0.82 });
  const lighthouseBand = swPolish001Material('#9e2f2f', { roughness: 0.78 });
  const lighthouseX = 142;
  const lighthouseZ = 118;
  swPolish001Part(root, new THREE.CylinderGeometry(4.4, 7.5, 35, 12), lighthouseMaterial, [lighthouseX, 17.5, lighthouseZ], { profile: 'coastal-boardwalk' });
  swPolish001Part(root, new THREE.CylinderGeometry(5.2, 5.2, 4.8, 12), lighthouseBand, [lighthouseX, 34, lighthouseZ], { profile: 'coastal-boardwalk' });
  swPolish001Part(root, new THREE.ConeGeometry(6.2, 6.5, 12), swPolish001Material('#263746', { roughness: 0.72 }), [lighthouseX, 40, lighthouseZ], { profile: 'coastal-boardwalk' });
  const beacon = new THREE.PointLight('#dff7ff', 1.0, 135, 2);
  beacon.position.set(lighthouseX, 37, lighthouseZ);
  beacon.userData.swPolish001Environment = 'coastal-boardwalk';
  root.add(beacon);

  const pierPoleGeometry = new THREE.CylinderGeometry(0.18, 0.24, 7, 6);
  const pierPoleMaterial = swPolish001Material('#334b55', { roughness: 0.7, metalness: 0.28 });
  const lampGeometry = new THREE.SphereGeometry(0.38, 7, 5);
  const lampMaterial = swPolish001BasicMaterial('#bcecff');
  for (let index = 0; index < 9; index += 1) {
    const z = -78 + index * 20;
    [16, 69].forEach((x) => {
      swPolish001Part(root, pierPoleGeometry, pierPoleMaterial, [x, 3.5, z], { profile: 'coastal-boardwalk' });
      swPolish001Part(root, lampGeometry, lampMaterial, [x, 7.0, z], { castShadow: false, receiveShadow: false, profile: 'coastal-boardwalk' });
    });
  }

  const hazeMaterial = swPolish001BasicMaterial('#8fc7d0', { transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide });
  swPolish001Part(root, new THREE.PlaneGeometry(480, 72), hazeMaterial, [175, 28, 150], { rotation: [0, Math.PI, 0], castShadow: false, receiveShadow: false, profile: 'coastal-boardwalk' });

  swPolish001State.coastalBuilds += 1;
  swPolish001State.environmentProfile = 'coastal-boardwalk-marine-horizon';
  return root;
}

const swPolish001BaseBuildCountyFairSite = buildCountyFairSite;
buildCountyFairSite = function swPolish001CountyFairSite(site) {
  const result = swPolish001BaseBuildCountyFairSite.apply(this, arguments);
  swPolish001CreateFairEnvironment();
  return result;
};

const swPolish001BaseBuildCoastalBoardwalkSite = buildCoastalBoardwalkSite;
buildCoastalBoardwalkSite = function swPolish001CoastalBoardwalkSite(site) {
  const result = swPolish001BaseBuildCoastalBoardwalkSite.apply(this, arguments);
  swPolish001CreateCoastalEnvironment();
  return result;
};

const swPolish001BaseRestoreAcceptedCampaignWorld = restoreAcceptedCampaignWorld;
restoreAcceptedCampaignWorld = function swPolish001RestoreAcceptedCampaignWorld() {
  const result = swPolish001BaseRestoreAcceptedCampaignWorld.apply(this, arguments);
  swPolish001State.environmentProfile = 'heartland-home';
  return result;
};

// Storm Sites already declare that Heartland's Cow 17 opener does not belong on
// their first playable frame. Integration order starts that opener after the
// Site layer's earlier dismissal hook, so finish it immediately through the
// accepted cinematic cleanup/handoff instead of leaving Cow 17 over every Site.
const swPolish001BaseStartStormSiteFromMenu = startStormSiteFromMenu;
startStormSiteFromMenu = function swPolish001StormSiteStart(siteId) {
  const started = swPolish001BaseStartStormSiteFromMenu.apply(this, arguments);
  const opening = globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__;
  if (started && siteId !== STORM_SITE_HOME_ID && opening?.getSnapshot?.()?.active) {
    opening.finish('storm-site-route');
    swPolish001State.siteOpeningBypasses += 1;
  }
  return started;
};

// ----------------------------------------------------------------------------
// Opening cinematic: preserve the accepted acting timeline and natural handoff,
// but make the primitive rig feel deliberately stylized instead of unfinished.
// ----------------------------------------------------------------------------
let swPolish001CinematicRoot = null;
let swPolish001CinematicOverlay = null;
let swPolish001CinematicParticles = null;
let swPolish001SavedExposure = null;

function swPolish001InstallCinematicOverlay() {
  if (swPolish001CinematicOverlay) return swPolish001CinematicOverlay;
  const overlay = document.createElement('div');
  overlay.id = 'swPolish001CinematicOverlay';
  overlay.innerHTML = '<div class="sw-polish-cinema-bar sw-polish-cinema-top"></div><div class="sw-polish-cinema-vignette"></div><div class="sw-polish-cinema-slug"><b>LINCOLN COUNTY</b><span>6:17 PM · PRESSURE FALLING</span></div><div class="sw-polish-cinema-bar sw-polish-cinema-bottom"></div>';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:94000;pointer-events:none;display:none;overflow:hidden;';
  document.body.appendChild(overlay);
  swPolish001CinematicOverlay = overlay;
  return overlay;
}

function swPolish001InstallStyles() {
  if (document.getElementById('swPolish001Styles')) return;
  const style = document.createElement('style');
  style.id = 'swPolish001Styles';
  style.textContent = String.raw`
    /* Build/debug identity is useful to QA metadata, not as permanent player HUD. */
    #productionSliceBadge { display:none !important; }
    body.sw-polish-001-cinematic #mooBrewBroadcastBug { display:none !important; }

    #swPolish001CinematicOverlay .sw-polish-cinema-bar { position:absolute; left:0; right:0; height:6.5vh; min-height:18px; background:#02060b; opacity:.94; }
    #swPolish001CinematicOverlay .sw-polish-cinema-top { top:0; }
    #swPolish001CinematicOverlay .sw-polish-cinema-bottom { bottom:0; }
    #swPolish001CinematicOverlay .sw-polish-cinema-vignette { position:absolute; inset:0; background:radial-gradient(circle at 50% 43%, transparent 34%, rgba(1,8,14,.14) 58%, rgba(0,3,8,.66) 100%),linear-gradient(105deg,rgba(175,91,43,.12),transparent 40%,rgba(24,74,92,.16)); }
    #swPolish001CinematicOverlay .sw-polish-cinema-slug { position:absolute; left:max(18px,env(safe-area-inset-left)); bottom:calc(7.8vh + max(10px,env(safe-area-inset-bottom))); display:flex; flex-direction:column; gap:2px; padding:7px 10px 6px; border-left:3px solid #f4bd62; background:rgba(4,12,20,.68); color:#f7efe0; font-family:Inter,sans-serif; letter-spacing:.08em; text-shadow:0 2px 8px rgba(0,0,0,.8); transition:opacity .25s ease; }
    #swPolish001CinematicOverlay .sw-polish-cinema-slug b { font-size:12px; line-height:1; }
    #swPolish001CinematicOverlay .sw-polish-cinema-slug span { color:#c9d8dc; font-size:10px; font-weight:800; line-height:1.1; }

    /* SW-LEVEL-001's original Site card used dark text inherited from the paper
       on a dark blue card. Keep Site identity, but make it readable as newsprint. */
    #mainMenu .newspaper-front-page .storm-card.storm-site-card {
      border-color:#3c5e70 !important;
      background:linear-gradient(145deg,rgba(225,238,239,.88),rgba(202,218,220,.74)) !important;
      color:var(--paper-ink) !important;
    }
    #mainMenu .newspaper-front-page .storm-card.storm-site-card h3 { color:#18354a !important; }
    #mainMenu .newspaper-front-page .storm-card.storm-site-card .hi-score { color:var(--paper-red) !important; }

    @media (orientation:landscape) and (max-height:720px) {
      #mainMenu.newspaper-menu { align-items:flex-start; padding:4px max(5px,env(safe-area-inset-right)) 4px max(5px,env(safe-area-inset-left)); }
      #mainMenu .menu-card.newspaper-front-page { width:min(980px,calc(100vw - 12px)); max-height:calc(var(--sw-ui002-visual-height,100dvh) - 8px); padding:6px 8px 8px; border-width:4px; }
      #mainMenu .newspaper-front-page::before { inset:4px; }
      #mainMenu .newspaper-front-page .newspaper-edition-rail { display:none; }
      #mainMenu .newspaper-front-page .menu-title { margin:2px 0 1px; font-size:clamp(22px,7.2vh,30px); line-height:.94; letter-spacing:-.04em; }
      #mainMenu .newspaper-front-page .menu-sub { margin:0 0 4px; padding:3px 6px; font-size:10px; line-height:1.1; letter-spacing:.09em; }
      #mainMenu .newspaper-front-page .campaign-map { margin:4px 0; padding:5px 7px; border-radius:9px; }
      #mainMenu .newspaper-front-page .campaign-map-head { margin-bottom:4px; }
      #mainMenu .newspaper-front-page .campaign-map-head strong,
      #mainMenu .newspaper-front-page #campaignStarTotal { font-size:10px; }
      #mainMenu .newspaper-front-page .campaign-map-grid { gap:4px; }
      #mainMenu .newspaper-front-page .campaign-stop { min-height:46px; padding:4px 5px; border-radius:7px; }
      #mainMenu .newspaper-front-page .campaign-stop strong { font-size:10px; line-height:1.05; }
      #mainMenu .newspaper-front-page .campaign-stop small { display:none; }
      #mainMenu .newspaper-front-page .campaign-stop .campaign-stars { margin-top:3px; font-size:10px; }
      #mainMenu .newspaper-front-page #campaignBrief { min-height:0; margin-top:4px; font-size:10px; line-height:1.15; }
      #mainMenu .newspaper-front-page .newspaper-lead { margin:4px 0; padding:4px 6px; font-size:11px; line-height:1.18; }
      #mainMenu .newspaper-front-page .storm-select-grid { grid-template-columns:repeat(4,minmax(0,1fr)); gap:5px; margin:4px 0; }
      #mainMenu .newspaper-front-page .storm-card { min-height:62px; padding:5px 6px; }
      #mainMenu .newspaper-front-page .storm-card::before { margin-bottom:3px; font-size:10px; }
      #mainMenu .newspaper-front-page .storm-card h3 { margin:1px 0 2px; font-size:14px; line-height:1; }
      #mainMenu .newspaper-front-page .storm-card p { display:none; }
      #mainMenu .newspaper-front-page .storm-card .hi-score { font-size:10px; }
      #mainMenu .newspaper-front-page .menu-options { margin:4px 0; }
      #mainMenu .newspaper-front-page .opt-btn { min-height:30px; padding:5px 7px; font-size:10px; }
      #mainMenu .newspaper-front-page .start-btn.newspaper-unleash { margin-top:2px; padding:7px 10px 8px; font-size:19px; line-height:1; }
      #mainMenu .newspaper-front-page .newspaper-unleash small { margin-bottom:2px; font-size:10px; }
      #mainMenu .newspaper-front-page .newspaper-legal { display:none; }
    }

    /* On short large-phone landscape, this is a compact front page, not a poster.
       Important choices remain readable and the launch CTA fits without scrolling. */
    @media (orientation:landscape) and (max-height:430px) {
      #mainMenu .newspaper-front-page .menu-title { margin:0; font-size:21px; }
      #mainMenu .newspaper-front-page .menu-sub { display:none; }
      #mainMenu .newspaper-front-page .campaign-map { margin:2px 0; padding:3px 5px; }
      #mainMenu .newspaper-front-page .campaign-map-head { display:none; }
      #mainMenu .newspaper-front-page #campaignBrief { display:none; }
      #mainMenu .newspaper-front-page .newspaper-lead { display:none; }
      #mainMenu .newspaper-front-page .campaign-map-grid { gap:3px; }
      #mainMenu .newspaper-front-page .campaign-stop { min-height:34px; padding:3px 4px; }
      #mainMenu .newspaper-front-page .campaign-stop strong { font-size:10px; }
      #mainMenu .newspaper-front-page .campaign-stop .campaign-stars { margin-top:1px; font-size:9.5px; }
      #mainMenu .newspaper-front-page .storm-select-grid { margin:3px 0; gap:4px; }
      #mainMenu .newspaper-front-page .storm-card,
      #mainMenu .newspaper-front-page .storm-card.selected,
      #mainMenu .newspaper-front-page .storm-card:hover { min-height:48px; padding:3px 4px; border-width:2px; }
      #mainMenu .newspaper-front-page .storm-card::before { margin-bottom:1px; font-size:9.5px; }
      #mainMenu .newspaper-front-page .storm-card h3 { font-size:12px; }
      #mainMenu .newspaper-front-page .storm-card .hi-score { margin-top:1px; font-size:9.5px; }
      #mainMenu .newspaper-front-page .storm-site-card > div:first-child { display:none; }
      #mainMenu .newspaper-front-page .menu-options { margin:2px 0; gap:4px; }
      #mainMenu .newspaper-front-page .opt-btn { min-height:25px; padding:3px 6px; font-size:9.5px; }
      #mainMenu .newspaper-front-page .start-btn.newspaper-unleash { width:min(100%,430px); margin-top:1px; padding:5px 9px 6px; font-size:17px; }
      #mainMenu .newspaper-front-page .newspaper-unleash small { display:none; }
    }
  `;
  document.head.appendChild(style);
}

function swPolish001StyleCinematicActors() {
  const cow = scene?.getObjectByName?.('Cow17CinematicRig');
  if (cow && !cow.userData.swPolish001Styled) {
    cow.userData.swPolish001Styled = true;
    cow.traverse((node) => {
      if (!node.isMesh || !node.name?.startsWith('cow17-') || !node.material?.color) return;
      const name = node.name;
      let color = '#d6cfbd';
      if (/patch|spot|eye/.test(name)) color = '#20262a';
      else if (/muzzle/.test(name)) color = '#c78082';
      else if (/horn/.test(name)) color = '#c9b985';
      else if (/hoof|contact-pad/.test(name)) color = '#27211e';
      node.material.color.set(color);
      if ('roughness' in node.material) node.material.roughness = 0.9;
      if ('metalness' in node.material) node.material.metalness = 0;
      node.material.needsUpdate = true;
    });
  }
  const barn = scene?.getObjectByName?.('SWCinematicFarmBarnBody');
  if (barn?.material?.color) barn.material.color.set('#762d2b');
  const roof = scene?.getObjectByName?.('SWCinematicBarnRoofPeel');
  if (roof?.material?.color) roof.material.color.set('#252a2c');
  return Boolean(cow?.userData?.swPolish001Styled);
}

function swPolish001EnsureCinematicRoot(snapshot) {
  if (swPolish001CinematicRoot?.parent) {
    swPolish001StyleCinematicActors();
    return swPolish001CinematicRoot;
  }
  if (!snapshot?.stage || typeof scene === 'undefined') return null;
  const root = new THREE.Group();
  root.name = 'SWPolish001CinematicLighting';
  root.userData.swPolish001Cinematic = true;
  root.position.set(snapshot.stage.x, snapshot.stage.y, snapshot.stage.z);

  if (typeof renderer !== 'undefined' && swPolish001SavedExposure === null) {
    swPolish001SavedExposure = swPolish001Number(renderer.toneMappingExposure, 1);
    renderer.toneMappingExposure = Math.min(swPolish001SavedExposure, 0.82);
  }

  const apron = swPolish001Part(root, new THREE.PlaneGeometry(86, 70), swPolish001Material('#566248', { roughness: 0.99 }), [0, 0.08, -1], {
    rotation: [-Math.PI / 2, 0, 0], castShadow: false, profile: 'cinematic-farm',
  });
  apron.name = 'SWPolish001CinematicFarmApron';

  const cropMat = swPolish001Material('#3e5133', { roughness: 0.96 });
  const stalkGeometry = new THREE.ConeGeometry(0.34, 4.2, 5);
  for (let index = 0; index < 20; index += 1) {
    const x = -38 + index * 4.0;
    const z = -30 + Math.sin(index * 1.7) * 2.4;
    swPolish001Part(root, stalkGeometry, cropMat, [x, 2.1, z], { castShadow: false, profile: 'cinematic-farm' });
  }
  const hayMaterial = swPolish001Material('#a8783f', { roughness: 0.94 });
  [[24, 1.8, -18], [29, 1.8, -11], [-28, 1.8, 15]].forEach(([x, y, z], index) => {
    swPolish001Part(root, new THREE.CylinderGeometry(1.8, 1.8, 3.6, 10), hayMaterial, [x, y, z], {
      rotation: [0, 0, Math.PI / 2 + index * 0.08], profile: 'cinematic-farm',
    });
  });

  const warmKey = new THREE.PointLight('#e19a61', 0.42, 50, 2);
  warmKey.name = 'SWPolish001WarmKey';
  warmKey.position.set(-10, 11, 9);
  const coolRim = new THREE.PointLight('#79a7bb', 0.34, 62, 2);
  coolRim.name = 'SWPolish001CoolRim';
  coolRim.position.set(12, 10, -12);
  root.add(warmKey, coolRim);

  const positions = [];
  for (let index = 0; index < 34; index += 1) {
    const angle = index * 2.3999632297;
    const radius = 4 + (index % 8) * 1.6;
    positions.push(Math.cos(angle) * radius, 1.5 + (index % 7) * 1.25, Math.sin(angle) * radius + 1.5);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color:'#d8c39a', size:0.15, transparent:true, opacity:0.28, depthWrite:false });
  const motes = new THREE.Points(geometry, material);
  motes.name = 'SWPolish001CinematicDustMotes';
  root.add(motes);
  swPolish001CinematicParticles = motes;
  scene.add(root);
  swPolish001CinematicRoot = root;
  swPolish001StyleCinematicActors();
  return root;
}

function swPolish001CleanupCinematicPresentation() {
  if (swPolish001CinematicRoot?.parent) swPolish001CinematicRoot.parent.remove(swPolish001CinematicRoot);
  if (swPolish001CinematicParticles) {
    swPolish001CinematicParticles.geometry?.dispose?.();
    swPolish001CinematicParticles.material?.dispose?.();
  }
  swPolish001CinematicRoot = null;
  swPolish001CinematicParticles = null;
  if (swPolish001CinematicOverlay) swPolish001CinematicOverlay.style.display = 'none';
  document.body.classList.remove('sw-polish-001-cinematic');
  swPolish001State.cinematicActive = false;
  if (typeof renderer !== 'undefined' && swPolish001SavedExposure !== null) {
    renderer.toneMappingExposure = swPolish001SavedExposure;
    swPolish001SavedExposure = null;
  }
  if (typeof camera !== 'undefined') camera.rotation.z = 0;
}

function swPolish001ReframeCinematic(snapshot) {
  if (!snapshot?.stage || typeof camera === 'undefined') return;
  const t = swPolish001Number(snapshot.elapsed, 0);
  const stage = snapshot.stage;
  let position = null;
  let target = null;
  let fov = null;
  if (t < 3.2) {
    position = [stage.x + 9.2, stage.y + 6.7, stage.z + 13.0];
    target = [stage.x + 0.2, stage.y + 4.0, stage.z + 0.6];
    fov = 31;
  } else if (t >= 5.8 && t < 8.15) {
    position = [stage.x + 7.8, stage.y + 6.25, stage.z + 10.8];
    target = [stage.x + 0.15, stage.y + 4.25, stage.z + 0.55];
    fov = 29;
  } else if (t >= 8.15 && t < 10.05) {
    position = [stage.x + 6.4, stage.y + 5.8, stage.z + 9.2];
    target = [stage.x + 0.65, stage.y + 4.3, stage.z + 0.82];
    fov = 27;
  }
  if (!position || !target) return;
  camera.position.set(position[0], position[1], position[2]);
  camera.fov = fov;
  camera.lookAt(target[0], target[1], target[2]);
  camera.updateProjectionMatrix?.();
}

function swPolish001ElementVisible(element) {
  if (!element) return false;
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.05 && rect.width > 0 && rect.height > 0;
}

function swPolish001UpdateCinematicPresentation(snapshot) {
  const active = Boolean(snapshot?.active);
  if (!active) {
    swPolish001CleanupCinematicPresentation();
    return;
  }
  swPolish001State.cinematicFrames += 1;
  swPolish001State.cinematicActive = true;
  document.body.classList.add('sw-polish-001-cinematic');
  const overlay = swPolish001InstallCinematicOverlay();
  overlay.style.display = 'block';
  const slug = overlay.querySelector('.sw-polish-cinema-slug');
  if (slug) slug.style.opacity = snapshot.elapsed < 2.4 ? '1' : '0';
  swPolish001EnsureCinematicRoot(snapshot);
  swPolish001StyleCinematicActors();

  const originalNewspaper = scene?.getObjectByName?.('SWCinematicNewspaper');
  if (originalNewspaper) originalNewspaper.visible = false;

  if (swPolish001CinematicParticles) {
    swPolish001CinematicParticles.rotation.y = snapshot.elapsed * 0.055;
    swPolish001CinematicParticles.position.x = Math.sin(snapshot.elapsed * 0.32) * 0.5;
  }
  swPolish001ReframeCinematic(snapshot);
  if (typeof camera !== 'undefined') {
    const lateStorm = Math.max(0, Math.min(1, (snapshot.elapsed - 9.5) / 2.7));
    camera.rotation.z = Math.sin(snapshot.elapsed * 0.72) * (0.003 + lateStorm * 0.005);
  }
}

const swPolish001BaseOpeningApi = globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__;
if (swPolish001BaseOpeningApi?.frame && swPolish001BaseOpeningApi?.getSnapshot) {
  globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__ = Object.freeze({
    ...swPolish001BaseOpeningApi,
    frame(now, dt) {
      const ownsFrame = swPolish001BaseOpeningApi.frame(now, dt);
      swPolish001UpdateCinematicPresentation(swPolish001BaseOpeningApi.getSnapshot());
      return ownsFrame;
    },
    debugSeek(seconds) {
      const result = swPolish001BaseOpeningApi.debugSeek(seconds);
      swPolish001UpdateCinematicPresentation(swPolish001BaseOpeningApi.getSnapshot());
      return result;
    },
    finish(reason) {
      const result = swPolish001BaseOpeningApi.finish(reason);
      swPolish001CleanupCinematicPresentation();
      return result;
    },
    getSnapshot() {
      const base = swPolish001BaseOpeningApi.getSnapshot();
      return Object.freeze({
        ...base,
        polish001: Object.freeze({
          overlayActive: swPolish001State.cinematicActive,
          lightCount: swPolish001CinematicRoot?.children?.filter?.(child => child.isLight)?.length || 0,
          dustMotes: swPolish001CinematicParticles?.geometry?.getAttribute?.('position')?.count || 0,
          originalNewspaperVisible: Boolean(scene?.getObjectByName?.('SWCinematicNewspaper')?.visible),
          actorStyled: Boolean(scene?.getObjectByName?.('Cow17CinematicRig')?.userData?.swPolish001Styled),
          farmApronPresent: Boolean(swPolish001CinematicRoot?.getObjectByName?.('SWPolish001CinematicFarmApron')),
          productionBadgeVisible: swPolish001ElementVisible(document.getElementById('productionSliceBadge')),
          broadcastBugVisible: swPolish001ElementVisible(document.getElementById('mooBrewBroadcastBug')),
        }),
      });
    },
  });
}

// ----------------------------------------------------------------------------
// Newspaper: install the compact readable landscape treatment immediately.
// ----------------------------------------------------------------------------
swPolish001InstallStyles();
swPolish001InstallCinematicOverlay();

function swPolish001VisibleTinyTextCount(root, threshold = 9.5) {
  if (!root) return 0;
  return [...root.querySelectorAll('*')].filter((node) => {
    if (!node.textContent?.trim() || node.children.length > 0) return false;
    const style = getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
    const rect = node.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return false;
    return parseFloat(style.fontSize || '0') < threshold;
  }).length;
}

function swPolish001StormMotionSnapshot() {
  const root = swVisualHeroSlice6StormRoot;
  const sample = (prefix) => root?.children?.find?.(child => child.name?.startsWith(prefix)) || null;
  const vector = (object) => object ? {
    name: object.name,
    x: Number(object.position.x.toFixed(3)),
    y: Number(object.position.y.toFixed(3)),
    z: Number(object.position.z.toFixed(3)),
    rx: Number(object.rotation.x.toFixed(3)),
    ry: Number(object.rotation.y.toFixed(3)),
    rz: Number(object.rotation.z.toFixed(3)),
  } : null;
  return {
    lower: vector(sample('SWVisualSlice6GroundPull')),
    body: vector(sample('SWVisualSlice6CondensationStreak')),
    upper: vector(sample('SWVisualSlice6EdgeWisp')),
    helix: vector(sample('SWPolish001StormHelix')),
    helixCount: root ? root.children.filter(child => child.name?.startsWith('SWPolish001StormHelix')).length : 0,
    hiddenStructuralShells: root ? root.children.filter(child => child.name?.startsWith('SWVisualSlice6StormShell') && child.visible === false).length : 0,
  };
}

function swPolish001SiteSnapshot() {
  const fair = stormSiteRoot?.getObjectByName?.('SWPolish001CountyFairIdentity') || null;
  const coastal = stormSiteRoot?.getObjectByName?.('SWPolish001CoastalIdentity') || null;
  const countTagged = (root) => {
    let count = 0;
    root?.traverse?.((object) => { if (object.userData?.swPolish001Environment) count += 1; });
    return count;
  };
  return {
    profile: swPolish001State.environmentProfile,
    fairAttached: Boolean(fair?.parent),
    coastalAttached: Boolean(coastal?.parent),
    fairIdentityObjects: countTagged(fair),
    coastalIdentityObjects: countTagged(coastal),
    openingBypasses: swPolish001State.siteOpeningBypasses,
    openingActive: Boolean(globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.()?.active),
  };
}

function swPolish001NewspaperSnapshot() {
  const card = document.querySelector('#mainMenu .menu-card.newspaper-front-page');
  const map = card?.querySelector('.campaign-map');
  const stormBody = card?.querySelector('.storm-card p');
  const siteTitle = card?.querySelector('.storm-site-card h3');
  const start = document.getElementById('btnStartMenu');
  const visualHeight = globalThis.visualViewport?.height || globalThis.innerHeight || 0;
  const startRect = start?.getBoundingClientRect();
  const siteStyle = siteTitle ? getComputedStyle(siteTitle) : null;
  return {
    cardExists: Boolean(card),
    cardHeight: card?.getBoundingClientRect?.().height || 0,
    cardClientHeight: card?.clientHeight || 0,
    cardScrollHeight: card?.scrollHeight || 0,
    campaignMapHeight: map?.getBoundingClientRect?.().height || 0,
    stormBodyDisplay: stormBody ? getComputedStyle(stormBody).display : null,
    siteTitleColor: siteStyle?.color || null,
    visibleTinyTextCount: swPolish001VisibleTinyTextCount(card),
    launchWithinVisualViewport: Boolean(startRect && startRect.top >= 0 && startRect.bottom <= visualHeight),
    visualHeight,
  };
}

globalThis.getSwPolish001QaState = function getSwPolish001QaState() {
  return Object.freeze({
    marker: SW_POLISH_001_MARKER,
    state: { ...swPolish001State },
    storm: swPolish001StormMotionSnapshot(),
    site: swPolish001SiteSnapshot(),
    newspaper: swPolish001NewspaperSnapshot(),
    cinematic: globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.() || null,
  });
};

globalThis.__SW_POLISH_001_QA__ = Object.freeze({
  sampleStormAt(seconds) {
    swVisualHeroSlice6UpdateStorm(0.016, Number(seconds) || 0);
    return swPolish001StormMotionSnapshot();
  },
  setStormReviewCamera() {
    const ground = typeof terrainHeightAt === 'function' ? terrainHeightAt(storm.pos.x, storm.pos.z) : 0;
    camera.position.set(storm.pos.x + 58, ground + 31, storm.pos.z + 62);
    camera.fov = 42;
    camera.lookAt(storm.pos.x, ground + 17, storm.pos.z);
    camera.updateProjectionMatrix?.();
    return true;
  },
  setSiteReviewCamera() {
    camera.position.set(205, 118, 205);
    camera.fov = 47;
    camera.lookAt(0, 8, 0);
    camera.updateProjectionMatrix?.();
    return true;
  },
  setTargetsVisible(visible) {
    targets.forEach((target) => { if (target?.meshData?.group) target.meshData.group.visible = Boolean(visible); });
    return true;
  },
});
// [SW:POLISH:001_QUALITY_RESCUE:END]
