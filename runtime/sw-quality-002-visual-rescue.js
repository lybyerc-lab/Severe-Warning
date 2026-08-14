// ============================================================================
// [SW:QUALITY:002_VISUAL_RESCUE]
// Owner-playtest visual rescue layered after SW-QUALITY-001.
// Presentation only: no scoring, progression, damage, movement, ability, or
// storm-physics authority is changed here.
// ============================================================================
const SW_QUALITY_002_MARKER = 'SW_QUALITY_002_VISUAL_RESCUE_V1';

const swQuality002State = {
  stormVolumeBuilds: 0,
  stormVolumeFrames: 0,
  siteIdentityBuilds: 0,
  siteProfile: 'heartland-home',
  cinematicFrames: 0,
  cinematicPolishedSessions: 0,
  stormSiteOpeningBypasses: 0,
  prototypeChromeHidden: 0,
};

let swQuality002StormVolumeRoot = null;
let swQuality002StormVolumeOwner = null;
let swQuality002SiteVisualRoot = null;
let swQuality002AtmosphereSaved = null;
let swQuality002CinematicWasActive = false;
let swQuality002CinematicSavedFogDensity = null;
let swQuality002CinematicLights = null;
let swQuality002CinematicHiddenChrome = [];
let swQuality002PrototypeChromeScanFrames = 0;

function swQuality002Clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function swQuality002Smooth(value) {
  const t = swQuality002Clamp01(value);
  return t * t * (3 - 2 * t);
}

function swQuality002Lerp(a, b, t) {
  return a + (b - a) * t;
}

function swQuality002InstallStyles() {
  if (document.getElementById('swQuality002Styles')) return;
  const style = document.createElement('style');
  style.id = 'swQuality002Styles';
  style.textContent = String.raw`
    /* Phone-first newspaper: preserve the identity, stop pretending the phone
       is broadsheet paper. Three columns turn six choices into two rows. */
    @media (orientation: landscape) and (max-height: 540px) and (max-width: 1100px) {
      #mainMenu { align-items:center; }
      #mainMenu .menu-card.newspaper-front-page {
        width:min(760px,calc(100vw - 18px));
        max-height:calc(100dvh - 12px);
        padding:4px 7px 6px;
        border-width:3px;
        overflow-x:hidden;
        overflow-y:auto;
      }
      #mainMenu .newspaper-front-page::before { inset:3px; }
      .newspaper-edition-rail { display:none; }
      #mainMenu .newspaper-front-page .menu-title {
        margin:1px 0 1px;
        font-size:clamp(20px,4vw,27px);
        line-height:.9;
      }
      #mainMenu .newspaper-front-page .menu-sub {
        margin-bottom:3px;
        padding:2px 5px;
        font-size:8px;
      }
      #newspaperLead { display:none; }
      #mainMenu .newspaper-front-page .storm-select-grid {
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:4px;
        margin:4px 0;
      }
      #mainMenu .newspaper-front-page .storm-card {
        min-height:48px;
        padding:4px 6px;
      }
      #mainMenu .newspaper-front-page .storm-card::before {
        margin-bottom:1px;
        font-size:7px;
        letter-spacing:.08em;
      }
      #mainMenu .newspaper-front-page .storm-card h3 {
        margin:1px 0;
        font-size:12px;
        line-height:.95;
      }
      #mainMenu .newspaper-front-page .storm-card p { display:none; }
      #mainMenu .newspaper-front-page .storm-card .hi-score {
        font-size:8px;
        line-height:1;
      }
      #mainMenu .newspaper-front-page .storm-card:hover,
      #mainMenu .newspaper-front-page .storm-card.selected {
        padding:2px 4px;
      }
      #mainMenu .newspaper-front-page .menu-options {
        margin:3px 0;
        gap:4px;
      }
      #mainMenu .newspaper-front-page .opt-btn {
        min-height:25px;
        padding:4px 7px;
        font-size:9px;
      }
      #mainMenu .newspaper-front-page .start-btn.newspaper-unleash {
        width:min(100%,360px);
        margin-top:1px;
        padding:5px 10px 6px;
        font-size:18px;
      }
      .newspaper-unleash small { display:none; }
      .newspaper-legal { display:none; }
      .campaign-map {
        margin:2px 0 3px!important;
        padding:4px 6px!important;
        border-radius:7px!important;
      }
      .campaign-map-head { margin-bottom:3px!important; }
      .campaign-map-head strong, #campaignStarTotal { font-size:8px!important; }
      #campaignMapGrid { margin:0!important; gap:3px!important; }
      .campaign-stop { min-height:36px!important; padding:3px 4px!important; border-radius:5px!important; }
      .campaign-stop strong { font-size:7.5px!important; line-height:1!important; }
      .campaign-stop small { display:none!important; }
      .campaign-stop .campaign-stars { margin-top:2px!important; font-size:7px!important; }
      #campaignBrief { display:none!important; }
      #mainMenu .newspaper-front-page .storm-site-card {
        background:rgba(255,255,255,.38)!important;
        border-color:rgba(24,34,51,.72)!important;
        color:var(--paper-ink)!important;
      }
      #mainMenu .newspaper-front-page .storm-site-card h3 { color:var(--paper-ink)!important; }
      #mainMenu .newspaper-front-page .storm-site-card .hi-score { color:var(--paper-red)!important; }
    }
  `;
  document.head.appendChild(style);
}

function swQuality002HidePrototypeChrome() {
  // A few source-owned badges are created after this layer installs. Scan the
  // first handful of rendered frames, then stop once the known prototype chrome
  // is gone. This is presentation cleanup only, never a gameplay selector.
  if (swQuality002PrototypeChromeScanFrames >= 12 && swQuality002State.prototypeChromeHidden > 0) return;
  swQuality002PrototypeChromeScanFrames += 1;
  const candidates = [...document.querySelectorAll('body *')].filter((element) => {
    if (element.dataset.swQuality002HiddenPrototypeChrome === '1') return false;
    const text = String(element.textContent || '').replace(/\s+/g, ' ').trim().toUpperCase();
    return text.includes('THREE.JS PRODUCTION SLICE') || text.startsWith('VISUALS:');
  });
  candidates.forEach((element) => {
    // Hide the smallest matching DOM surface so an ancestor containing the whole
    // game UI can never be removed because one badge lives inside it.
    const nestedMatch = [...element.children].some((child) => {
      const text = String(child.textContent || '').replace(/\s+/g, ' ').trim().toUpperCase();
      return text.includes('THREE.JS PRODUCTION SLICE') || text.startsWith('VISUALS:');
    });
    if (nestedMatch) return;
    element.style.display = 'none';
    element.dataset.swQuality002HiddenPrototypeChrome = '1';
    swQuality002State.prototypeChromeHidden += 1;
  });
}

function swQuality002MakeSmokeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 6, 64, 64, 62);
  gradient.addColorStop(0, 'rgba(255,255,255,0.98)');
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.86)');
  gradient.addColorStop(0.72, 'rgba(255,255,255,0.34)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  texture.userData.swQuality002Owned = true;
  return texture;
}

function swQuality002DisposeOwned(root) {
  if (!root) return;
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  root.traverse((node) => {
    if (node.geometry?.userData?.swQuality002Owned) geometries.add(node.geometry);
    const candidates = node.material ? (Array.isArray(node.material) ? node.material : [node.material]) : [];
    candidates.filter(Boolean).forEach((material) => {
      if (!material.userData?.swQuality002Owned) return;
      materials.add(material);
      if (material.map?.userData?.swQuality002Owned) textures.add(material.map);
    });
  });
  geometries.forEach((geometry) => geometry.dispose?.());
  materials.forEach((material) => material.dispose?.());
  textures.forEach((texture) => texture.dispose?.());
  if (root.parent) root.parent.remove(root);
}

function swQuality002EnsureStormVolume() {
  const owner = typeof swVisualHeroSlice6StormRoot !== 'undefined' ? swVisualHeroSlice6StormRoot : null;
  if (!owner) return null;
  if (swQuality002StormVolumeOwner === owner && swQuality002StormVolumeRoot?.parent === owner) return swQuality002StormVolumeRoot;

  swQuality002DisposeOwned(swQuality002StormVolumeRoot);
  swQuality002StormVolumeOwner = owner;
  const root = new THREE.Group();
  root.name = 'SWQuality002StormVolume';
  root.userData.swPresentationOnly = true;
  owner.add(root);
  swQuality002StormVolumeRoot = root;

  const texture = swQuality002MakeSmokeTexture();
  const mobile = typeof isMobileDevice !== 'undefined' && isMobileDevice;
  const count = mobile ? 18 : 26;
  const palette = ['#242d2f', '#31383a', '#443f36', '#1d292d', '#51483a'];
  for (let index = 0; index < count; index += 1) {
    const mix = index / Math.max(1, count - 1);
    const phase = index * 1.618;
    const height = 1.0 + mix * 31.5 + Math.sin(phase) * 1.1;
    const baseRadius = swQuality002Lerp(1.2, 8.8, Math.pow(mix, 0.78));
    const pivot = new THREE.Group();
    pivot.name = `SWQuality002StormOrbit${index + 1}`;
    pivot.userData.phase = phase;
    pivot.userData.baseRadius = baseRadius;
    pivot.userData.height = height;
    pivot.userData.spin = 0.62 + (index % 6) * 0.075 + mix * 0.18;
    const material = new THREE.SpriteMaterial({
      map: texture,
      color: palette[index % palette.length],
      transparent: true,
      opacity: 0.42 + (index % 4) * 0.055,
      depthWrite: false,
      fog: true,
    });
    material.userData.swQuality002Owned = true;
    const sprite = new THREE.Sprite(material);
    sprite.name = `SWQuality002StormPuff${index + 1}`;
    const size = swQuality002Lerp(4.1, 9.8, mix) * (0.88 + (index % 3) * 0.09);
    sprite.scale.set(size, size * (1.0 + mix * 0.28), 1);
    pivot.add(sprite);
    root.add(pivot);
  }

  const groundCount = mobile ? 9 : 13;
  for (let index = 0; index < groundCount; index += 1) {
    const phase = index * 0.87;
    const pivot = new THREE.Group();
    pivot.name = `SWQuality002GroundOrbit${index + 1}`;
    pivot.userData.phase = phase;
    pivot.userData.baseRadius = 3.1 + (index % 5) * 1.25;
    pivot.userData.height = 0.55 + (index % 3) * 0.22;
    pivot.userData.spin = 1.15 + (index % 4) * 0.18;
    const material = new THREE.SpriteMaterial({
      map: texture,
      color: index % 2 ? '#4b4034' : '#5a4b39',
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      fog: true,
    });
    material.userData.swQuality002Owned = true;
    const sprite = new THREE.Sprite(material);
    sprite.name = `SWQuality002GroundDust${index + 1}`;
    const size = 4.2 + (index % 4) * 0.8;
    sprite.scale.set(size * 1.35, size * 0.68, 1);
    pivot.add(sprite);
    root.add(pivot);
  }

  owner.children.forEach((object, index) => {
    if (!object.name?.startsWith('SWVisualSlice6CondensationStreak') || !object.material) return;
    const colors = ['#242b2c', '#323231', '#3f3a32', '#1d2729'];
    object.material.color?.set?.(colors[index % colors.length]);
    object.material.opacity = 0.48 + (index % 3) * 0.055;
    object.material.needsUpdate = true;
  });

  swQuality002State.stormVolumeBuilds += 1;
  return root;
}

function swQuality002UpdateStormVolume(now) {
  const root = swQuality002EnsureStormVolume();
  if (!root) return;
  const seconds = (Number(now) || performance.now()) / 1000;
  root.children.forEach((pivot, index) => {
    const phase = Number(pivot.userData.phase || index * 0.5);
    const radius = Number(pivot.userData.baseRadius || 4) * (0.88 + Math.sin(seconds * 1.1 + phase) * 0.12);
    const height = Number(pivot.userData.height || 2);
    pivot.rotation.y = seconds * Number(pivot.userData.spin || 0.8) + phase;
    const sprite = pivot.children[0];
    if (!sprite) return;
    sprite.position.set(
      radius + Math.sin(seconds * 1.8 + phase) * 0.75,
      height + Math.cos(seconds * 1.35 + phase) * (height < 2 ? 0.28 : 0.72),
      Math.sin(seconds * 0.72 + phase) * 0.38,
    );
    const baseOpacity = pivot.name.startsWith('SWQuality002GroundOrbit') ? 0.42 : 0.46;
    if (sprite.material) sprite.material.opacity = baseOpacity * (0.82 + Math.sin(seconds * 1.55 + phase) * 0.13);
  });
  swQuality002State.stormVolumeFrames += 1;
}

if (typeof swVisualHeroSlice6UpdateStorm === 'function') {
  const swQuality002BaseStormUpdate = swVisualHeroSlice6UpdateStorm;
  swVisualHeroSlice6UpdateStorm = function swQuality002StormUpdate(dt, now) {
    const result = swQuality002BaseStormUpdate.call(this, dt, now);
    swQuality002UpdateStormVolume(now);
    return result;
  };
}

function swQuality002CaptureAtmosphere() {
  if (swQuality002AtmosphereSaved) return;
  swQuality002AtmosphereSaved = {
    background: scene?.background?.clone?.() || null,
    fogColor: scene?.fog?.color?.clone?.() || null,
    fogDensity: Number(scene?.fog?.density || 0),
    ambientIntensity: Number(ambientLight?.intensity || 0),
    ambientColor: ambientLight?.color?.clone?.() || null,
    directionalIntensity: Number(dirLight?.intensity || 0),
    directionalColor: dirLight?.color?.clone?.() || null,
  };
}

function swQuality002RestoreAtmosphere() {
  if (swQuality002SiteVisualRoot) {
    swQuality002DisposeOwned(swQuality002SiteVisualRoot);
    swQuality002SiteVisualRoot = null;
  }
  if (!swQuality002AtmosphereSaved) {
    swQuality002State.siteProfile = 'heartland-home';
    return;
  }
  if (swQuality002AtmosphereSaved.background && scene?.background?.copy) scene.background.copy(swQuality002AtmosphereSaved.background);
  if (scene?.fog && swQuality002AtmosphereSaved.fogColor) scene.fog.color.copy(swQuality002AtmosphereSaved.fogColor);
  if (scene?.fog && Number.isFinite(swQuality002AtmosphereSaved.fogDensity)) scene.fog.density = swQuality002AtmosphereSaved.fogDensity;
  if (typeof ambientLight !== 'undefined') {
    ambientLight.intensity = swQuality002AtmosphereSaved.ambientIntensity;
    if (swQuality002AtmosphereSaved.ambientColor) ambientLight.color.copy(swQuality002AtmosphereSaved.ambientColor);
  }
  if (typeof dirLight !== 'undefined') {
    dirLight.intensity = swQuality002AtmosphereSaved.directionalIntensity;
    if (swQuality002AtmosphereSaved.directionalColor) dirLight.color.copy(swQuality002AtmosphereSaved.directionalColor);
  }
  swQuality002AtmosphereSaved = null;
  swQuality002State.siteProfile = 'heartland-home';
}

function swQuality002OwnedMaterial(parameters = {}) {
  const material = new THREE.MeshStandardMaterial(parameters);
  material.userData.swQuality002Owned = true;
  return material;
}

function swQuality002OwnedBasic(parameters = {}) {
  const material = new THREE.MeshBasicMaterial(parameters);
  material.userData.swQuality002Owned = true;
  return material;
}

function swQuality002AddMesh(parent, geometry, material, name, x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) {
  geometry.userData.swQuality002Owned = true;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  mesh.rotation.set(rx, ry, rz);
  mesh.receiveShadow = true;
  mesh.castShadow = Boolean(typeof productionQualityConfig === 'function' && productionQualityConfig().shadows);
  mesh.userData.swPresentationOnly = true;
  parent.add(mesh);
  return mesh;
}

function swQuality002BuildFairIdentity(root) {
  const ground = swQuality002OwnedMaterial({ color: '#342b22', roughness: 0.98 });
  swQuality002AddMesh(root, new THREE.PlaneGeometry(360, 320), ground, 'SWQuality002FairGround', 0, 0.53, 0, 1, 1, 1, -Math.PI / 2);
  const path = swQuality002OwnedMaterial({ color: '#6d5134', roughness: 0.96 });
  swQuality002AddMesh(root, new THREE.PlaneGeometry(28, 286), path, 'SWQuality002FairMidwayPath', 2, 0.56, 0, 1, 1, 1, -Math.PI / 2);

  const poleMat = swQuality002OwnedMaterial({ color: '#46372b', roughness: 0.9 });
  const bulbMat = swQuality002OwnedBasic({ color: '#ffd36a' });
  for (let row = 0; row < 2; row += 1) {
    const z = row ? 82 : -76;
    for (let index = 0; index < 10; index += 1) {
      const x = -132 + index * 29;
      swQuality002AddMesh(root, new THREE.CylinderGeometry(0.16, 0.2, 9, 8), poleMat, `SWQuality002FairPole${row}-${index}`, x, 4.8, z);
      const bulb = swQuality002AddMesh(root, new THREE.SphereGeometry(0.33, 8, 6), bulbMat, `SWQuality002FairBulb${row}-${index}`, x, 9.0, z);
      bulb.userData.swQuality002Glow = true;
    }
  }

  const tentPalette = ['#b91c1c', '#d97706', '#1d4ed8', '#15803d', '#7e22ce'];
  for (let index = 0; index < 8; index += 1) {
    const x = -115 + (index % 4) * 75;
    const z = index < 4 ? -106 : 108;
    const mat = swQuality002OwnedMaterial({ color: tentPalette[index % tentPalette.length], roughness: 0.74 });
    swQuality002AddMesh(root, new THREE.ConeGeometry(5.2, 4.5, 4), mat, `SWQuality002FairTent${index + 1}`, x, 3.1, z, 1, 1, 1, 0, Math.PI / 4);
  }

  const wheelMat = swQuality002OwnedBasic({ color: '#ffd35c', transparent: true, opacity: 0.86, side: THREE.DoubleSide });
  const wheel = swQuality002AddMesh(root, new THREE.TorusGeometry(10.9, 0.18, 8, 40), wheelMat, 'SWQuality002FairWheelAccent', 20, 16.5, 22, 1, 1, 1, 0, Math.PI / 2, 0);
  wheel.userData.swQuality002Animate = 'fair-wheel';

  const gateMat = swQuality002OwnedMaterial({ color: '#7c1d3f', roughness: 0.82 });
  swQuality002AddMesh(root, new THREE.BoxGeometry(1.1, 11, 1.1), gateMat, 'SWQuality002FairGateLeft', -18, 5.9, -132);
  swQuality002AddMesh(root, new THREE.BoxGeometry(1.1, 11, 1.1), gateMat, 'SWQuality002FairGateRight', 18, 5.9, -132);
  swQuality002AddMesh(root, new THREE.BoxGeometry(38, 2.1, 1.2), gateMat, 'SWQuality002FairGateHeader', 0, 11.2, -132);
}

function swQuality002BuildCoastalIdentity(root) {
  const ocean = swQuality002OwnedMaterial({ color: '#143d4f', roughness: 0.26, metalness: 0.26, transparent: true, opacity: 0.96 });
  swQuality002AddMesh(root, new THREE.PlaneGeometry(430, 620), ocean, 'SWQuality002CoastalOcean', 205, 0.56, 0, 1, 1, 1, -Math.PI / 2);
  const sand = swQuality002OwnedMaterial({ color: '#a98a62', roughness: 0.99 });
  swQuality002AddMesh(root, new THREE.PlaneGeometry(62, 330), sand, 'SWQuality002CoastalSand', 18, 0.58, 0, 1, 1, 1, -Math.PI / 2);

  for (let index = 0; index < 10; index += 1) {
    const foamMat = swQuality002OwnedBasic({ color: '#b7d7dc', transparent: true, opacity: 0.24, side: THREE.DoubleSide });
    const baseX = 75 + (index % 4) * 42;
    const line = swQuality002AddMesh(root, new THREE.PlaneGeometry(42 + (index % 3) * 10, 0.7), foamMat, `SWQuality002CoastalFoam${index + 1}`, baseX, 0.61, -135 + index * 29, 1, 1, 1, -Math.PI / 2);
    line.userData.swQuality002Animate = 'foam';
    line.userData.swQuality002Phase = index * 0.7;
    line.userData.swQuality002BaseX = baseX;
  }

  const railMat = swQuality002OwnedMaterial({ color: '#6f5138', roughness: 0.93 });
  for (let index = 0; index < 15; index += 1) {
    const z = -140 + index * 20;
    swQuality002AddMesh(root, new THREE.BoxGeometry(0.28, 3.4, 0.28), railMat, `SWQuality002PierPost${index + 1}`, 38, 2.0, z);
    swQuality002AddMesh(root, new THREE.BoxGeometry(0.28, 3.4, 0.28), railMat, `SWQuality002PierPostB${index + 1}`, 48, 2.0, z);
  }

  const lighthouseWhite = swQuality002OwnedMaterial({ color: '#e7e1d6', roughness: 0.82 });
  const lighthouseRed = swQuality002OwnedMaterial({ color: '#a61b1b', roughness: 0.78 });
  const beacon = swQuality002OwnedBasic({ color: '#ffd46a' });
  swQuality002AddMesh(root, new THREE.CylinderGeometry(3.3, 5.4, 24, 14), lighthouseWhite, 'SWQuality002LighthouseTower', 178, 12.5, -104);
  swQuality002AddMesh(root, new THREE.CylinderGeometry(3.7, 3.7, 3.2, 14), lighthouseRed, 'SWQuality002LighthouseCap', 178, 25.7, -104);
  swQuality002AddMesh(root, new THREE.SphereGeometry(1.25, 10, 8), beacon, 'SWQuality002LighthouseBeacon', 178, 28.0, -104);
  swQuality002AddMesh(root, new THREE.ConeGeometry(4.6, 4.0, 14), lighthouseRed, 'SWQuality002LighthouseRoof', 178, 29.8, -104);

  const mastMat = swQuality002OwnedMaterial({ color: '#d6d3c7', roughness: 0.72 });
  for (let index = 0; index < 4; index += 1) {
    const x = 105 + index * 24;
    const z = 78 - index * 38;
    swQuality002AddMesh(root, new THREE.CylinderGeometry(0.12, 0.16, 15 + index, 8), mastMat, `SWQuality002MarinaMast${index + 1}`, x, 8.2, z);
  }
}

function swQuality002ApplySiteIdentity(siteId) {
  if (typeof stormSiteRoot === 'undefined' || !stormSiteRoot || !siteId || siteId === 'heartland-home') {
    swQuality002RestoreAtmosphere();
    return false;
  }
  swQuality002CaptureAtmosphere();
  if (swQuality002SiteVisualRoot?.parent) swQuality002DisposeOwned(swQuality002SiteVisualRoot);
  const root = new THREE.Group();
  root.name = `SWQuality002SiteIdentity:${siteId}`;
  root.userData.swPresentationOnly = true;
  stormSiteRoot.add(root);
  swQuality002SiteVisualRoot = root;

  if (siteId === 'county-fair') {
    if (scene?.background?.set) scene.background.set('#141b2a');
    if (scene?.fog?.color) scene.fog.color.set('#2c3546');
    if (scene?.fog && Number.isFinite(swQuality002AtmosphereSaved?.fogDensity)) scene.fog.density = Math.max(swQuality002AtmosphereSaved.fogDensity, 0.0048);
    if (typeof ambientLight !== 'undefined') { ambientLight.intensity = 0.44; ambientLight.color.set('#7280a0'); }
    if (typeof dirLight !== 'undefined') { dirLight.intensity = 0.66; dirLight.color.set('#d8b98a'); }
    swQuality002BuildFairIdentity(root);
    swQuality002State.siteProfile = 'county-fair-after-dark';
  } else if (siteId === 'coastal-boardwalk') {
    if (scene?.background?.set) scene.background.set('#476b78');
    if (scene?.fog?.color) scene.fog.color.set('#587b87');
    if (scene?.fog && Number.isFinite(swQuality002AtmosphereSaved?.fogDensity)) scene.fog.density = Math.max(swQuality002AtmosphereSaved.fogDensity * 0.78, 0.0028);
    if (typeof ambientLight !== 'undefined') { ambientLight.intensity = 0.60; ambientLight.color.set('#8eb7c5'); }
    if (typeof dirLight !== 'undefined') { dirLight.intensity = 0.73; dirLight.color.set('#d8e8e8'); }
    swQuality002BuildCoastalIdentity(root);
    swQuality002State.siteProfile = 'gullwind-storm-coast';
  }
  swQuality002State.siteIdentityBuilds += 1;
  return true;
}

function swQuality002UpdateSiteIdentity(now) {
  if (!swQuality002SiteVisualRoot?.parent) return;
  const seconds = (Number(now) || performance.now()) / 1000;
  swQuality002SiteVisualRoot.children.forEach((object) => {
    if (object.userData?.swQuality002Animate === 'fair-wheel') {
      object.rotation.x = seconds * 0.24;
    } else if (object.userData?.swQuality002Animate === 'foam') {
      const phase = Number(object.userData.swQuality002Phase || 0);
      object.position.x = Number(object.userData.swQuality002BaseX || 0) + Math.sin(seconds * 0.55 + phase) * 0.55;
      if (object.material) object.material.opacity = 0.18 + (Math.sin(seconds * 1.1 + phase) + 1) * 0.055;
    }
  });
}

if (typeof startStormSiteFromMenu === 'function') {
  const swQuality002BaseStartStormSiteFromMenu = startStormSiteFromMenu;
  startStormSiteFromMenu = function swQuality002StartStormSiteFromMenu(siteId) {
    const result = swQuality002BaseStartStormSiteFromMenu.call(this, siteId);
    const opening = globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__;
    if (opening?.getSnapshot?.().active) {
      opening.finish('storm-site-direct');
      swQuality002State.stormSiteOpeningBypasses += 1;
    }
    globalThis.__SW_PRESENTATION_IDENTITY_BRIDGE__?.hideIntro?.();
    document.getElementById('districtOverlay')?.classList.remove('active');
    swQuality002ApplySiteIdentity(siteId);
    return result;
  };
}

if (typeof startRunFromMenu === 'function') {
  const swQuality002BaseHomeStartRunFromMenu = startRunFromMenu;
  startRunFromMenu = function swQuality002HomeStartRunFromMenu(...args) {
    swQuality002RestoreAtmosphere();
    return swQuality002BaseHomeStartRunFromMenu.apply(this, args);
  };
}

if (typeof quitToMainMenu === 'function') {
  const swQuality002BaseQuitToMainMenu = quitToMainMenu;
  quitToMainMenu = function swQuality002QuitToMainMenu(...args) {
    swQuality002RestoreAtmosphere();
    return swQuality002BaseQuitToMainMenu.apply(this, args);
  };
}

const swQuality002BaseV510Update = globalThis.__SW_V510_UPDATE__;
if (typeof swQuality002BaseV510Update === 'function') {
  globalThis.__SW_V510_UPDATE__ = function swQuality002V510Update(dt, now, isMoving) {
    const result = swQuality002BaseV510Update(dt, now, isMoving);
    swQuality002UpdateSiteIdentity(now);
    return result;
  };
}

function swQuality002ReplaceCowGeometry() {
  const replacements = [
    ['cow17-hips-mass', 'sphere'], ['cow17-torso-mass', 'sphere'], ['cow17-head-mass', 'sphere'], ['cow17-muzzle', 'sphere'],
    ['cow17-left-upper-foreleg', 'cylinder'], ['cow17-left-lower-foreleg', 'cylinder'],
    ['cow17-right-upper-foreleg', 'cylinder'], ['cow17-right-lower-foreleg', 'cylinder'],
    ['cow17-ear-left-mass', 'sphere'], ['cow17-ear-right-mass', 'sphere'],
    ['cow17-left-resting-hoof', 'sphere'],
  ];
  replacements.forEach(([name, type]) => {
    const object = scene?.getObjectByName?.(name);
    if (!object?.isMesh || object.userData.swQuality002Rounded) return;
    const geometry = type === 'cylinder'
      ? new THREE.CylinderGeometry(0.5, 0.5, 1, 14, 1, false)
      : new THREE.SphereGeometry(0.5, 16, 10);
    geometry.userData.swQuality002Owned = true;
    object.geometry = geometry;
    object.userData.swQuality002Rounded = true;
  });
}

function swQuality002EnsureCinematicBarnTrim() {
  const root = scene?.getObjectByName?.('SWCinematicPlayableOpeningPresentation');
  if (!root || root.getObjectByName('SWQuality002CinematicBarnTrim')) return;
  const trimRoot = new THREE.Group();
  trimRoot.name = 'SWQuality002CinematicBarnTrim';
  trimRoot.userData.swPresentationOnly = true;
  const sidingMat = swQuality002OwnedMaterial({ color: '#4f2724', roughness: 0.92 });
  const trimMat = swQuality002OwnedMaterial({ color: '#d9c8a4', roughness: 0.84 });
  sidingMat.userData.swCinematicOwnMaterial = true;
  trimMat.userData.swCinematicOwnMaterial = true;
  for (let index = 0; index < 8; index += 1) {
    const x = -15.2 + index * 1.25;
    swQuality002AddMesh(trimRoot, new THREE.BoxGeometry(0.08, 4.9, 0.09), sidingMat, `SWQuality002BarnSiding${index + 1}`, x, 2.8, -5.06);
  }
  swQuality002AddMesh(trimRoot, new THREE.BoxGeometry(0.22, 4.1, 0.12), trimMat, 'SWQuality002BarnDoorTrimL', -12.45, 2.0, -4.91);
  swQuality002AddMesh(trimRoot, new THREE.BoxGeometry(0.22, 4.1, 0.12), trimMat, 'SWQuality002BarnDoorTrimR', -9.15, 2.0, -4.91);
  swQuality002AddMesh(trimRoot, new THREE.BoxGeometry(3.55, 0.22, 0.12), trimMat, 'SWQuality002BarnDoorTrimTop', -10.8, 4.0, -4.91);
  swQuality002AddMesh(trimRoot, new THREE.BoxGeometry(4.0, 0.16, 0.12), trimMat, 'SWQuality002BarnDoorBraceA', -10.8, 2.0, -4.88, 1, 1, 1, 0, 0, 0.72);
  swQuality002AddMesh(trimRoot, new THREE.BoxGeometry(4.0, 0.16, 0.12), trimMat, 'SWQuality002BarnDoorBraceB', -10.8, 2.0, -4.87, 1, 1, 1, 0, 0, -0.72);
  root.add(trimRoot);
}

function swQuality002CreateCinematicLights(stage) {
  if (swQuality002CinematicLights || !stage) return;
  const warm = new THREE.PointLight('#ffd0a0', 0.95, 42, 2);
  warm.name = 'SWQuality002CinematicWarmKey';
  warm.position.set(stage.x + 7, stage.y + 9, stage.z + 10);
  const rim = new THREE.PointLight('#8eb9c9', 0.58, 46, 2);
  rim.name = 'SWQuality002CinematicCoolRim';
  rim.position.set(stage.x - 10, stage.y + 10, stage.z - 8);
  scene.add(warm, rim);
  swQuality002CinematicLights = [warm, rim];
}

function swQuality002SetCinematicChromeHidden(hidden) {
  if (hidden) {
    if (swQuality002CinematicHiddenChrome.length) return;
    const matches = [...document.querySelectorAll('body *')].filter((element) => {
      if (element.children.length) return false;
      const text = String(element.textContent || '').replace(/\s+/g, ' ').trim().toUpperCase();
      return text.includes('COW-CAM REFRESHMENT') || text.startsWith('LIVE CAMERA:');
    });
    matches.forEach((element) => {
      swQuality002CinematicHiddenChrome.push({ element, visibility: element.style.visibility, opacity: element.style.opacity });
      element.style.visibility = 'hidden';
      element.style.opacity = '0';
    });
    return;
  }
  swQuality002CinematicHiddenChrome.forEach(({ element, visibility, opacity }) => {
    element.style.visibility = visibility || '';
    element.style.opacity = opacity || '';
  });
  swQuality002CinematicHiddenChrome = [];
}

function swQuality002RemoveCinematicLights() {
  if (!swQuality002CinematicLights) return;
  swQuality002CinematicLights.forEach(light => light.parent?.remove(light));
  swQuality002CinematicLights = null;
}

function swQuality002ApplyCinematicCamera(snapshot) {
  const stageData = snapshot?.stage;
  if (!stageData) return;
  const t = Number(snapshot.elapsed || 0);
  const stage = new THREE.Vector3(stageData.x, stageData.y, stageData.z);
  const target = new THREE.Vector3();
  const position = new THREE.Vector3();
  let fov = 32;

  const paper = scene?.getObjectByName?.('SWCinematicNewspaper');
  if (paper) {
    paper.visible = t < 0.58;
    if (paper.material) paper.material.opacity = t < 0.42 ? 1 : Math.max(0, 1 - (t - 0.42) / 0.16);
  }

  if (t < 0.58) return;
  if (t < 5.9) {
    const blend = swQuality002Smooth((t - 1.2) / 4.4);
    position.set(stage.x + swQuality002Lerp(8.9, 7.2, blend), stage.y + swQuality002Lerp(6.0, 5.35, blend), stage.z + swQuality002Lerp(12.8, 10.0, blend));
    target.set(stage.x + 0.2, stage.y + swQuality002Lerp(3.9, 4.25, blend), stage.z + 0.65);
    fov = swQuality002Lerp(32, 29, blend);
  } else if (t < 8.05) {
    position.set(stage.x + 6.5, stage.y + 5.15, stage.z + 9.0);
    target.set(stage.x + 0.2, stage.y + 4.35, stage.z + 0.72);
    fov = 28;
  } else if (t < 10.05) {
    position.set(stage.x + 4.8, stage.y + 4.75, stage.z + 7.1);
    target.set(stage.x + 0.7, stage.y + 4.45, stage.z + 0.9);
    fov = 26;
  } else {
    const stormObject = scene?.getObjectByName?.('SWCinematicTouchdownProductionStorm');
    const stormPosition = stormObject?.position?.clone?.() || stage.clone().add(new THREE.Vector3(-35, 0, -35));
    const direction = stormPosition.clone().sub(stage);
    direction.y = 0;
    if (direction.lengthSq() < 0.01) direction.set(-1, 0, -1);
    direction.normalize();
    const right = new THREE.Vector3(-direction.z, 0, direction.x);
    position.copy(stage).addScaledVector(direction, -10.5).addScaledVector(right, 5.0);
    position.y = stage.y + 7.2;
    target.copy(stage).addScaledVector(direction, 27);
    target.y = stage.y + 8.2;
    fov = 40;
  }

  camera.position.copy(position);
  camera.fov = fov;
  camera.lookAt(target);
  camera.updateProjectionMatrix?.();
}

function swQuality002PolishCinematicFrame() {
  const opening = globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__;
  const snapshot = opening?.getSnapshot?.();
  const active = Boolean(snapshot?.active);

  if (active && !swQuality002CinematicWasActive) {
    swQuality002CinematicWasActive = true;
    swQuality002CinematicSavedFogDensity = Number(scene?.fog?.density || 0);
    swQuality002State.cinematicPolishedSessions += 1;
  }
  if (!active && swQuality002CinematicWasActive) {
    swQuality002CinematicWasActive = false;
    if (scene?.fog && Number.isFinite(swQuality002CinematicSavedFogDensity)) scene.fog.density = swQuality002CinematicSavedFogDensity;
    swQuality002CinematicSavedFogDensity = null;
    swQuality002RemoveCinematicLights();
    swQuality002SetCinematicChromeHidden(false);
    return;
  }
  if (!active) return;

  swQuality002SetCinematicChromeHidden(true);
  swQuality002ReplaceCowGeometry();
  swQuality002EnsureCinematicBarnTrim();
  swQuality002CreateCinematicLights(snapshot.stage);
  if (scene?.fog) scene.fog.density = Math.max(Number(swQuality002CinematicSavedFogDensity || 0), 0.0062);
  swQuality002ApplyCinematicCamera(snapshot);
  swQuality002State.cinematicFrames += 1;
}

if (typeof renderer !== 'undefined' && renderer?.render) {
  const swQuality002BaseRender = renderer.render.bind(renderer);
  renderer.render = function swQuality002Render(sceneArg, cameraArg) {
    swQuality002HidePrototypeChrome();
    swQuality002PolishCinematicFrame();
    return swQuality002BaseRender(sceneArg, cameraArg);
  };
}

swQuality002InstallStyles();
swQuality002HidePrototypeChrome();

function swQuality002StormSnapshot() {
  const root = swQuality002StormVolumeRoot;
  if (!root?.parent) return null;
  return {
    puffCount: root.children.filter(item => item.name.startsWith('SWQuality002StormOrbit')).length,
    groundDustCount: root.children.filter(item => item.name.startsWith('SWQuality002GroundOrbit')).length,
    sample: root.children.slice(0, 8).map(item => ({ name: item.name, y: Number(item.rotation.y.toFixed(3)) })),
  };
}

globalThis.getSwQuality002State = function getSwQuality002State() {
  const newspaper = document.querySelector('#mainMenu .menu-card.newspaper-front-page');
  const opening = globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.() || null;
  const cowTorso = scene?.getObjectByName?.('cow17-torso-mass');
  return Object.freeze({
    marker: SW_QUALITY_002_MARKER,
    stormVolumeBuilds: swQuality002State.stormVolumeBuilds,
    stormVolumeFrames: swQuality002State.stormVolumeFrames,
    stormVolume: swQuality002StormSnapshot(),
    siteIdentityBuilds: swQuality002State.siteIdentityBuilds,
    siteProfile: swQuality002State.siteProfile,
    stormSiteOpeningBypasses: swQuality002State.stormSiteOpeningBypasses,
    cinematicFrames: swQuality002State.cinematicFrames,
    cinematicPolishedSessions: swQuality002State.cinematicPolishedSessions,
    cinematicActive: Boolean(opening?.active),
    cowTorsoGeometry: cowTorso?.geometry?.type || null,
    prototypeChromeHidden: swQuality002State.prototypeChromeHidden,
    newspaper: newspaper ? {
      clientHeight: newspaper.clientHeight,
      scrollHeight: newspaper.scrollHeight,
      overflowY: getComputedStyle(newspaper).overflowY,
    } : null,
  });
};
// [SW:QUALITY:002_VISUAL_RESCUE:END]
