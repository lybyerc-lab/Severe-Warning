// ============================================================================
// [SW:VISUAL:HERO_SLICE6]
// THREEJS_VISUAL_HERO_SLICE6_V1
//
// Stage 2A presentation-only pass: world identity + storm silhouette.
// This layer may reshape visual-only storm geometry, add authored streetscape
// dressing, and grade presentation. Gameplay authority remains frozen.
// SW-WORLD-004: the default storm is a ragged condensation-column/wedge,
// with a connected dark core and directional lower circulation. It deliberately
// avoids a clean cone silhouette and billboard/square effect primitives.
// ============================================================================
const THREEJS_VISUAL_HERO_SLICE6_VERSION = 'THREEJS_VISUAL_HERO_SLICE6_V1';

const swVisualHeroSlice6State = {
  installed: false,
  worldGeneration: 0,
  stormShellCount: 0,
  stormEdgeWispCount: 0,
  stormGroundBurstCount: 0,
  stormCondensationStreakCount: 0,
  stormGroundPullCount: 0,
  buildingIdentityCount: 0,
  transitionCount: 0,
  fenceInstanceCount: 0,
  vegetationInstanceCount: 0,
  legacyStormRingCount: 0,
  visibleLegacyStormRingCount: 0,
  silhouetteProfile: 'ragged-wedge-storm-v4-mesh-ribbons',
  worldProfile: 'authored-main-street-v1',
  lastError: null,
};

let swVisualHeroSlice6StormRoot = null;
let swVisualHeroSlice6WorldRoot = null;
let swVisualHeroSlice6AttachedGroups = [];

function swVisualHeroSlice6Hash(value) {
  const text = String(value || '');
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function swVisualHeroSlice6DisposeStorm() {
  if (swVisualHeroSlice6StormRoot) swVisualDisposeObject(swVisualHeroSlice6StormRoot);
  swVisualHeroSlice6StormRoot = null;
  swVisualHeroSlice6State.stormShellCount = 0;
  swVisualHeroSlice6State.stormEdgeWispCount = 0;
  swVisualHeroSlice6State.stormGroundBurstCount = 0;
  swVisualHeroSlice6State.stormCondensationStreakCount = 0;
  swVisualHeroSlice6State.stormGroundPullCount = 0;
}

function swVisualHeroSlice6DisposeWorld() {
  swVisualHeroSlice6AttachedGroups.forEach((group) => swVisualDisposeObject(group));
  swVisualHeroSlice6AttachedGroups = [];
  if (swVisualHeroSlice6WorldRoot) swVisualDisposeObject(swVisualHeroSlice6WorldRoot);
  swVisualHeroSlice6WorldRoot = null;
  swVisualHeroSlice6State.buildingIdentityCount = 0;
  swVisualHeroSlice6State.transitionCount = 0;
  swVisualHeroSlice6State.fenceInstanceCount = 0;
  swVisualHeroSlice6State.vegetationInstanceCount = 0;
}

function swVisualHeroSlice6Material(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: Number.isFinite(options.roughness) ? options.roughness : 0.86,
    metalness: Number.isFinite(options.metalness) ? options.metalness : 0.02,
    emissive: options.emissive || '#000000',
    emissiveIntensity: Number.isFinite(options.emissiveIntensity) ? options.emissiveIntensity : 0,
    transparent: Boolean(options.transparent),
    opacity: Number.isFinite(options.opacity) ? options.opacity : 1,
    side: options.side || THREE.FrontSide,
  });
}

function swVisualHeroSlice6MaterialList(material) {
  if (!material) return [];
  return Array.isArray(material) ? material : [material];
}

function swVisualHeroSlice6WarpedFunnelGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, phase) {
  const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, true);
  const position = geometry.getAttribute('position');
  for (let index = 0; index < position.count; index += 1) {
    const sourceX = position.getX(index);
    const sourceY = position.getY(index);
    const sourceZ = position.getZ(index);
    const angle = Math.atan2(sourceZ, sourceX);
    const radius = Math.hypot(sourceX, sourceZ);
    const heightMix = THREE.MathUtils.clamp((sourceY + height * 0.5) / Math.max(0.001, height), 0, 1);
    const shoulder = Math.exp(-Math.pow((heightMix - 0.72) / 0.22, 2)) * 0.24;
    const neck = Math.exp(-Math.pow((heightMix - 0.28) / 0.16, 2)) * 0.10;
    const corrugation = 1
      + shoulder - neck
      + Math.sin(angle * 3.0 + heightMix * 2.8 + phase) * 0.255
      + Math.sin(angle * 5.0 - heightMix * 5.4 + phase * 1.7) * 0.142
      + Math.cos(angle * 2.0 + heightMix * 7.2 - phase) * 0.094
      + Math.sin(angle * 7.0 + heightMix * 11.0 + phase * 0.6) * 0.072;
    const bendStrength = 0.62 + heightMix * 3.35;
    const bendX = Math.sin(heightMix * 3.4 + phase) * bendStrength;
    const bendZ = Math.cos(heightMix * 2.7 + phase * 1.3) * bendStrength * 0.78;
    position.setXYZ(
      index,
      Math.cos(angle) * radius * corrugation + bendX,
      sourceY,
      Math.sin(angle) * radius * corrugation + bendZ,
    );
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.userData.swSlice6Warped = true;
  geometry.userData.swSlice6RaggedProfile = true;
  return geometry;
}

function swVisualHeroSlice6CondensationStreakGeometry(spec) {
  const segments = 12;
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let index = 0; index <= segments; index += 1) {
    const mix = index / segments;
    const y = spec.bottomY + mix * spec.height;
    const angle = spec.angle + mix * spec.twist + Math.sin(mix * 4.2 + spec.phase) * 0.18;
    const lowerBulge = Math.exp(-Math.pow((mix - 0.06) / 0.22, 2)) * (1.15 + Math.sin(spec.angle * 2.5 + spec.phase * 1.4) * 0.75);
    const radius = THREE.MathUtils.lerp(spec.bottomRadius, spec.topRadius, mix)
      + lowerBulge
      + Math.sin(mix * 9.0 + spec.phase) * 0.8;
    const lowerWobbleX = Math.sin(mix * 12.0 + spec.phase * 2.1) * (1.0 - mix) * 0.85;
    const lowerWobbleZ = Math.cos(mix * 10.0 + spec.phase * 1.8) * (1.0 - mix) * 0.65;
    const centerX = Math.cos(angle) * radius + Math.sin(mix * 4.5 + spec.phase) * spec.shear + lowerWobbleX;
    const centerZ = Math.sin(angle) * radius + Math.cos(mix * 3.6 + spec.phase * 1.7) * spec.shear * 0.66 + lowerWobbleZ;
    const lowerFlare = Math.exp(-mix * 3.8) * (0.85 + Math.cos(spec.angle * 3.0 + spec.phase) * 0.40);
    const width = (THREE.MathUtils.lerp(spec.bottomWidth, spec.topWidth, mix) + lowerFlare)
      * (0.86 + Math.sin(mix * 7.0 + spec.phase) * 0.16 + Math.sin(mix * 14.0 - spec.phase) * 0.10);
    const sideX = Math.cos(angle + Math.PI * 0.5) * width;
    const sideZ = Math.sin(angle + Math.PI * 0.5) * width;
    positions.push(centerX - sideX, y, centerZ - sideZ, centerX + sideX, y, centerZ + sideZ);
    uvs.push(0, mix, 1, mix);
  }
  for (let index = 0; index < segments; index += 1) {
    const left = index * 2;
    indices.push(left, left + 1, left + 3, left, left + 3, left + 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.userData.swSlice6VerticalStreak = true;
  return geometry;
}

function swVisualHeroSlice6GroundShearGeometry(spec) {
  const segments = 8;
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let index = 0; index <= segments; index += 1) {
    const mix = index / segments;
    const radius = THREE.MathUtils.lerp(spec.innerRadius, spec.outerRadius, mix);
    const drift = Math.sin(mix * Math.PI * 1.7 + spec.phase) * spec.drift;
    const turbulence = Math.sin(mix * Math.PI * 2.6 + spec.phase) * 0.55;
    const width = THREE.MathUtils.lerp(spec.innerWidth, spec.outerWidth, mix)
      * (0.82 + Math.sin(mix * 9.0 + spec.phase) * 0.22);
    const x = radius + drift + turbulence * 0.4;
    const y = 0.14 + Math.sin(mix * Math.PI + spec.phase) * spec.lift + Math.pow(mix, 0.75) * 0.48;
    positions.push(x, y, -width, x, y + (1 - mix) * 0.42 + 0.08, width);
    uvs.push(0, mix, 1, mix);
  }
  for (let index = 0; index < segments; index += 1) {
    const left = index * 2;
    indices.push(left, left + 1, left + 3, left, left + 3, left + 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.userData.swSlice6GroundShear = true;
  return geometry;
}

function swVisualHeroSlice6SuppressInheritedRoundStormSprites() {
  swVisualHeroSlice4StormRoot?.children?.forEach((object) => {
    if (object.name?.startsWith('SWVisualSlice4VolumeShell') || object.name?.startsWith('SWVisualSlice4VolumeWisp') || object.name?.startsWith('SWVisualSlice4GroundSkirt') || object.name?.startsWith('SWVisualSlice4RainTrace')) {
      object.visible = false;
    }
  });
  scene?.traverse?.((object) => {
    if (object.name?.startsWith('SWVisualStormDust')) object.visible = false;
  });
  scene?.getObjectByName?.('V510ProductionTornadoLayers')?.traverse?.((object) => {
    if (object.isMesh && object.geometry?.type === 'DodecahedronGeometry') object.visible = false;
    if (object.isInstancedMesh && object.geometry?.type === 'BoxGeometry') object.visible = false;
  });
  if (typeof particleSystem !== 'undefined') particleSystem.visible = false;
  if (typeof dustBowlGroup !== 'undefined') dustBowlGroup.visible = false;
}

function swVisualHeroSlice6BuildStormSilhouette() {
  swVisualHeroSlice6DisposeStorm();
  if (!swVisualRoot) return false;
  swVisualHeroSlice6SuppressInheritedRoundStormSprites();

  const mobile = typeof isMobileDevice !== 'undefined' && isMobileDevice;
  const radialSegments = mobile ? 14 : 18;
  swVisualHeroSlice6StormRoot = new THREE.Group();
  swVisualHeroSlice6StormRoot.name = 'SWVisualHeroSlice6StormSilhouette';
  swVisualHeroSlice6StormRoot.userData.swPresentationOnly = true;
  swVisualRoot.add(swVisualHeroSlice6StormRoot);

  const shellSpecs = [
    { top: 25.0, bottom: 5.6, height: 39.0, y: 19.5, opacity: 0.42, color: '#26373d', spin: 0.075, phase: 0.25 },
    { top: 18.8, bottom: 3.0, height: 35.5, y: 17.5, opacity: 0.34, color: '#172a30', spin: -0.11, phase: 1.55 },
    { top: 13.5, bottom: 1.85, height: 31.5, y: 15.8, opacity: 0.28, color: '#3a5052', spin: 0.14, phase: 2.85 },
  ];
  shellSpecs.forEach((spec, index) => {
    const geometry = swVisualHeroSlice6WarpedFunnelGeometry(
      spec.top,
      spec.bottom,
      spec.height,
      radialSegments,
      9,
      spec.phase,
    );
    const material = new THREE.MeshBasicMaterial({
      color: spec.color,
      transparent: true,
      opacity: spec.opacity,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      fog: true,
    });
    const shell = new THREE.Mesh(geometry, material);
    shell.name = `SWVisualSlice6StormShell${index + 1}`;
    shell.position.y = spec.y;
    shell.userData.spin = spec.spin;
    shell.userData.phase = spec.phase;
    shell.userData.baseOpacity = spec.opacity;
    shell.userData.warped = true;
    shell.userData.structuralAnchor = true;
    shell.visible = false;
    shell.renderOrder = 7 + index;
    swVisualHeroSlice6StormRoot.add(shell);
  });
  swVisualHeroSlice6State.stormShellCount = shellSpecs.length;

  const streakCount = mobile ? 11 : 13;
  const streakColors = ['#3b3831', '#233338', '#4a4338', '#1c282c'];
  for (let index = 0; index < streakCount; index += 1) {
    const phase = index * 0.83;
    const material = new THREE.MeshBasicMaterial({
      color: streakColors[index % streakColors.length],
      transparent: true,
      opacity: 0.66 + (index % 3) * 0.04,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: true,
    });
    const streak = new THREE.Mesh(swVisualHeroSlice6CondensationStreakGeometry({
      bottomY: 0.8 + (index % 2) * 0.55,
      height: 31.5 + (index % 3) * 1.7,
      angle: (index / streakCount) * Math.PI * 2 + 0.32,
      twist: (index % 2 ? -1 : 1) * (0.94 + (index % 4) * 0.16),
      bottomRadius: 1.25 + (index % 3) * 0.60,
      topRadius: 7.8 + (index % 4) * 1.6,
      bottomWidth: 0.85 + (index % 2) * 0.28,
      topWidth: 3.2 + (index % 4) * 0.68,
      shear: 1.45 + (index % 3) * 0.34,
      phase,
    }), material);
    streak.name = `SWVisualSlice6CondensationStreak${index + 1}`;
    streak.userData.spin = (index % 2 ? -1 : 1) * (0.09 + (index % 4) * 0.018);
    streak.userData.phase = phase;
    streak.userData.swPresentationOnly = true;
    streak.renderOrder = 11 + index;
    swVisualHeroSlice6StormRoot.add(streak);
  }
  swVisualHeroSlice6State.stormCondensationStreakCount = streakCount;

  const wispCount = mobile ? 6 : 9;
  for (let index = 0; index < wispCount; index += 1) {
    const height = 5.0 + (index / Math.max(1, wispCount - 1)) * 30;
    const seed = swVisualHeroSlice6Hash(`storm-wisp-${index}`);
    const angle = (index / wispCount) * Math.PI * 2 + ((seed % 41) / 41) * 0.8;
    const radius = 3.6 + height * 0.43 + (seed % 5) * 0.72;
    const ribbonHeight = 8.5 + (seed % 4) * 1.6;
    const material = new THREE.MeshBasicMaterial({
      color: index % 4 === 0 ? '#635c52' : '#3d4b4e',
      transparent: true,
      opacity: 0.28 + (index % 3) * 0.024,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: true,
    });
    const wisp = new THREE.Mesh(swVisualHeroSlice6CondensationStreakGeometry({
      bottomY: -ribbonHeight * 0.5,
      height: ribbonHeight,
      angle: 0.14 + (seed % 5) * 0.09,
      twist: (index % 2 ? -1 : 1) * (0.48 + (seed % 3) * 0.13),
      bottomRadius: 0.8,
      topRadius: 2.4 + (seed % 4) * 0.36,
      bottomWidth: 0.28,
      topWidth: 0.72 + (seed % 3) * 0.12,
      shear: 0.55 + (seed % 3) * 0.12,
      phase: index * 0.71,
    }), material);
    wisp.name = `SWVisualSlice6EdgeWisp${index + 1}`;
    wisp.userData.height = height;
    wisp.userData.angle = angle;
    wisp.userData.radius = radius;
    wisp.userData.spin = (index % 2 ? -1 : 1) * (0.31 + (index % 5) * 0.035);
    wisp.userData.phase = index * 0.71;
    wisp.userData.widthToHeight = (0.72 + (seed % 3) * 0.12) / ribbonHeight;
    wisp.userData.swPresentationOnly = true;
    swVisualHeroSlice6StormRoot.add(wisp);
  }
  swVisualHeroSlice6State.stormEdgeWispCount = wispCount;

  const burstCount = mobile ? 6 : 8;
  const burstColors = ['#483e32', '#3a342b', '#615444'];
  for (let index = 0; index < burstCount; index += 1) {
    const seed = swVisualHeroSlice6Hash(`ground-burst-${index}`);
    const angle = (index / burstCount) * Math.PI * 2 + ((seed % 29) / 29) * 0.92;
    const radius = 5.2 + (seed % 7) * 1.35;
    const material = new THREE.MeshBasicMaterial({
      color: burstColors[index % burstColors.length],
      transparent: true,
      opacity: 0.32 + (index % 3) * 0.025,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: true,
    });
    const pull = new THREE.Mesh(swVisualHeroSlice6GroundShearGeometry({
      innerRadius: 1.6 + (seed % 3) * 0.35,
      outerRadius: radius,
      innerWidth: 0.38,
      outerWidth: 1.25 + (seed % 4) * 0.20,
      drift: 0.95 + (seed % 3) * 0.20,
      lift: 0.48 + (seed % 3) * 0.10,
      phase: index * 0.83,
    }), material);
    pull.name = `SWVisualSlice6GroundPull${index + 1}`;
    pull.userData.angle = angle;
    pull.userData.radius = radius;
    pull.userData.spin = 0.24 + (index % 4) * 0.045;
    pull.userData.phase = index * 0.83;
    pull.userData.swPresentationOnly = true;
    swVisualHeroSlice6StormRoot.add(pull);
  }
  swVisualHeroSlice6State.stormGroundBurstCount = burstCount;
  swVisualHeroSlice6State.stormGroundPullCount = burstCount;
  // A QA refresh can rebuild presentation roots after the normal frame hook.
  // Suppress inherited rings here as well so the rebuilt default view never
  // spends even one frame exposing target-like circles at ground contact.
  swVisualHeroSlice6TuneInheritedStorm(0);
  return true;
}

function swVisualHeroSlice6TuneInheritedStorm(seconds) {
  const neonSelected = typeof swVisualHeroSlice5IsNeonSelected === 'function'
    ? swVisualHeroSlice5IsNeonSelected()
    : (typeof neonFunnelUnlocked !== 'undefined' && neonFunnelUnlocked === true);

  if (swVisualHeroSlice4StormRoot?.children) {
    swVisualHeroSlice4StormRoot.children.forEach((object, index) => {
      if (object.name?.startsWith('SWVisualSlice4VolumeShell') && object.material) {
        const base = Number(object.userData.baseOpacity || 0.14);
        object.material.opacity = base * (0.43 + Math.sin(seconds * 1.1 + index) * 0.025);
        object.visible = false;
      }
      if (object.name?.startsWith('SWVisualSlice4VolumeWisp') || object.name?.startsWith('SWVisualSlice4GroundSkirt') || object.name?.startsWith('SWVisualSlice4RainTrace')) {
        // Slice 4's round smoke cards are superseded by Slice 6's connected
        // streak mesh and directional ground pull. They must not read as
        // detached attack bubbles beneath the recovered default storm.
        object.visible = false;
      }
    });
  }

  if (!neonSelected) {
    if (typeof funnelMat !== 'undefined' && funnelMat?.color) {
      funnelMat.color.set('#1e3036');
      funnelMat.opacity = 0.035;
      funnelMat.emissive?.set?.('#0a1114');
      if ('emissiveIntensity' in funnelMat) funnelMat.emissiveIntensity = 0.05;
      funnelMat.needsUpdate = true;
    }
    if (typeof outerFunnelMat !== 'undefined' && outerFunnelMat?.color) {
      outerFunnelMat.color.set('#3b5156');
      outerFunnelMat.opacity = 0.01;
      outerFunnelMat.needsUpdate = true;
    }
  }

  // The accepted tornado mesh remains the authority.  These are only the
  // inherited presentation primitives that made the default funnel read as a
  // clean cone with target-like ground rings.
  const middleVortex = scene?.getObjectByName?.('ProductionMiddleVortex');
  if (middleVortex?.material) {
    middleVortex.material.opacity = 0.018;
    middleVortex.material.color?.set?.('#26383d');
    middleVortex.material.needsUpdate = true;
  }
  const darkCore = scene?.getObjectByName?.('ProductionDarkCore');
  if (darkCore?.material) {
    darkCore.material.opacity = 0.12;
    darkCore.material.color?.set?.('#1b2b31');
    darkCore.material.needsUpdate = true;
  }

  let stormRingCount = 0;
  let stormBoxDebrisCount = 0;
  let stormPointEffectCount = 0;
  if (scene?.traverse && storm?.pos) {
    const stormOrigin = new THREE.Vector3(storm.pos.x, storm.pos.y, storm.pos.z);
    const worldPosition = new THREE.Vector3();
    scene.traverse((object) => {
      const geometryType = String(object?.geometry?.type || '');
      if (geometryType !== 'RingGeometry' && geometryType !== 'TorusGeometry') return;
      object.getWorldPosition?.(worldPosition);
      if (worldPosition.distanceToSquared(stormOrigin) > 18 * 18) return;
      object.visible = false;
      stormRingCount += 1;
    });
    scene.getObjectByName?.('V510ProductionTornadoLayers')?.traverse?.((object) => {
      if (object.isInstancedMesh && object.geometry?.type === 'BoxGeometry') {
        object.visible = false;
        stormBoxDebrisCount += 1;
      }
    });
    if (typeof particleSystem !== 'undefined') {
      particleSystem.visible = false;
      stormPointEffectCount = 1;
    }
  }
  swVisualHeroSlice6State.legacyStormRingCount = stormRingCount;
  swVisualHeroSlice6State.legacyStormBoxDebrisCount = stormBoxDebrisCount;
  swVisualHeroSlice6State.legacyStormPointEffectCount = stormPointEffectCount;
  swVisualHeroSlice6State.visibleLegacyStormRingCount = 0;
}

function swVisualHeroSlice6UpdateStorm(dt, now) {
  if (!swVisualHeroSlice6StormRoot || !storm?.pos) return false;
  const seconds = Number(now || 0) * 0.001;
  const scale = Math.max(0.92, Number(typeof funnelScale !== 'undefined' ? funnelScale : 1) || 1);
  swVisualHeroSlice6StormRoot.position.copy(storm.pos);
  swVisualHeroSlice6StormRoot.scale.setScalar(scale);

  swVisualHeroSlice6StormRoot.children.forEach((object, index) => {
    if (object.name.startsWith('SWVisualSlice6StormShell')) {
      const phase = Number(object.userData.phase || 0);
      object.rotation.y += Math.max(0, Number(dt || 0)) * Number(object.userData.spin || 0.1);
      object.position.x = Math.sin(seconds * 0.72 + phase) * (0.30 + index * 0.18);
      object.position.z = Math.cos(seconds * 0.61 + phase * 1.2) * (0.22 + index * 0.14);
      object.scale.set(
        1 + Math.sin(seconds * 1.3 + phase) * 0.045,
        1,
        1 + Math.cos(seconds * 1.05 + phase) * 0.032,
      );
      object.material.opacity = Number(object.userData.baseOpacity || 0.07)
        * (0.90 + Math.sin(seconds * 1.45 + index) * 0.10);
      return;
    }
    if (object.name.startsWith('SWVisualSlice6CondensationStreak')) {
      object.rotation.y += Math.max(0, Number(dt || 0)) * Number(object.userData.spin || 0.1);
      object.material.opacity = (0.64 + (index % 3) * 0.045)
        * (0.88 + Math.sin(seconds * 1.25 + Number(object.userData.phase || 0)) * 0.10);
      return;
    }
    if (object.name.startsWith('SWVisualSlice6EdgeWisp')) {
      const phase = Number(object.userData.phase || 0);
      const angle = Number(object.userData.angle || 0) + seconds * Number(object.userData.spin || 0.3);
      const height = Number(object.userData.height || 8);
      const radius = Number(object.userData.radius || 8) * (0.94 + Math.sin(seconds * 1.1 + phase) * 0.06);
      object.position.set(
        Math.cos(angle) * radius + Math.sin(height * 0.18 + seconds * 0.45) * 1.2,
        height + Math.sin(seconds * 1.6 + phase) * 0.65,
        Math.sin(angle) * radius + Math.cos(height * 0.15 + seconds * 0.38) * 0.9,
      );
      object.rotation.y = angle + Math.sin(seconds * 0.7 + phase) * 0.16;
      object.material.opacity = (0.26 + (index % 3) * 0.024)
        * (0.86 + Math.sin(seconds * 1.35 + phase) * 0.12);
      return;
    }
    if (object.name.startsWith('SWVisualSlice6GroundPull')) {
      const phase = Number(object.userData.phase || 0);
      const angle = Number(object.userData.angle || 0) + seconds * Number(object.userData.spin || 0.24);
      const radius = Number(object.userData.radius || 7) * (0.88 + Math.sin(seconds * 1.5 + phase) * 0.12);
      object.position.set(0, Math.sin(seconds * 2.0 + phase) * 0.24, 0);
      object.rotation.y = angle;
      object.material.opacity = (0.27 + (index % 3) * 0.022)
        * (0.88 + Math.sin(seconds * 1.8 + phase) * 0.10);
    }
  });

  swVisualHeroSlice6TuneInheritedStorm(seconds);
  return true;
}

function swVisualHeroSlice6AddBuildingIdentity(target, ordinal) {
  const targetGroup = target?.meshData?.group;
  const base = target?.meshData?.base;
  const parameters = base?.geometry?.parameters || null;
  if (!targetGroup || !parameters) return false;

  const width = Number(parameters.width || 0);
  const height = Number(parameters.height || 0);
  const depth = Number(parameters.depth || 0);
  if (width < 4.5 || height < 2.8 || depth < 2.2) return false;

  const seed = swVisualHeroSlice6Hash(`${target.blockId || ''}|${target.kind || ''}|${ordinal}`);
  const variant = seed % 4;
  const palette = [
    ['#75564b', '#c3ab83', '#38464b'],
    ['#56636a', '#c2b49a', '#303a3e'],
    ['#6c5944', '#b7a681', '#3b4042'],
    ['#62505b', '#c4b39d', '#37444a'],
  ][variant];
  const shellMat = swVisualHeroSlice6Material(palette[0], { roughness: 0.88 });
  const trimMat = swVisualHeroSlice6Material(palette[1], { roughness: 0.78 });
  const roofMat = swVisualHeroSlice6Material(palette[2], { roughness: 0.72, metalness: 0.06 });
  const glassMat = swVisualHeroSlice6Material('#2b454d', {
    roughness: 0.3,
    metalness: 0.08,
    emissive: '#0e1d21',
    emissiveIntensity: 0.035,
    transparent: true,
    opacity: 0.82,
  });

  const group = new THREE.Group();
  group.name = `SWVisualSlice6BuildingIdentity${ordinal + 1}`;
  group.userData.swPresentationOnly = true;
  const frontZ = -(depth * 0.5 + 0.22);
  const roofY = height * 0.5 + 0.2;

  if (variant === 0) {
    const center = new THREE.Mesh(new THREE.BoxGeometry(width * 0.46, 0.82, 0.44), shellMat);
    center.position.set(0, roofY + 0.22, frontZ);
    group.add(center);
    [-1, 1].forEach((direction) => {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(width * 0.24, 0.48, 0.4), roofMat);
      wing.position.set(direction * width * 0.34, roofY + 0.05, frontZ + 0.02);
      group.add(wing);
    });
  } else if (variant === 1) {
    [-1, 1].forEach((direction) => {
      const roof = new THREE.Mesh(new THREE.BoxGeometry(width * 0.54, 0.34, Math.max(1.6, depth * 0.82)), roofMat);
      roof.position.set(direction * width * 0.235, roofY + 0.25, 0);
      roof.rotation.z = direction * 0.30;
      group.add(roof);
    });
  } else if (variant === 2) {
    for (let index = -1; index <= 1; index += 1) {
      const cap = new THREE.Mesh(new THREE.BoxGeometry(width * 0.28, 0.32 + (index + 1) * 0.12, depth * 0.62), roofMat);
      cap.position.set(index * width * 0.28, roofY + (index + 1) * 0.12, 0.1);
      group.add(cap);
    }
  } else {
    const parapet = new THREE.Mesh(new THREE.BoxGeometry(width * 0.92, 0.46, 0.42), trimMat);
    parapet.position.set(0, roofY + 0.04, frontZ);
    group.add(parapet);
    const awning = new THREE.Mesh(new THREE.BoxGeometry(width * 0.54, 0.18, 1.35), shellMat);
    awning.position.set(0, Math.min(height * 0.18, 2.7), frontZ - 0.74);
    awning.rotation.x = -0.08;
    group.add(awning);
  }

  const sign = new THREE.Mesh(new THREE.BoxGeometry(Math.min(width * 0.42, 4.8), 0.56, 0.18), trimMat);
  sign.position.set((variant % 2 ? -1 : 1) * width * 0.12, Math.min(height * 0.28, height * 0.5 - 0.72), frontZ - 0.28);
  group.add(sign);

  const serviceWindow = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(1.9, width * 0.18), Math.min(1.7, height * 0.26)), glassMat);
  serviceWindow.position.set(-width * 0.29, Math.min(height * 0.12, 1.7), frontZ - 0.18);
  group.add(serviceWindow);

  group.traverse((object) => {
    if (!object?.isMesh) return;
    object.castShadow = Boolean(productionQualityConfig?.().shadows);
    object.receiveShadow = true;
  });
  targetGroup.add(group);
  swVisualHeroSlice6AttachedGroups.push(group);
  return true;
}

function swVisualHeroSlice6AddTransitionPlane(width, depth, x, z, color, opacity, name) {
  const plane = swVisualConformedPlane(width, depth, x, z, 0.135, color, 0.99, opacity);
  plane.name = name;
  plane.userData.swPresentationOnly = true;
  swVisualHeroSlice6WorldRoot.add(plane);
  swVisualHeroSlice6State.transitionCount += 1;
  return plane;
}

function swVisualHeroSlice6SetInstance(mesh, index, x, y, z, sx = 1, sy = 1, sz = 1, ry = 0) {
  const matrix = new THREE.Matrix4();
  matrix.compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)),
    new THREE.Vector3(sx, sy, sz),
  );
  mesh.setMatrixAt(index, matrix);
}

function swVisualHeroSlice6BuildFarmEdge(hartFarm) {
  if (!hartFarm || !swVisualHeroSlice6WorldRoot) return false;
  const baseX = Number(hartFarm.x) + 8.5;
  const baseZ = Number(hartFarm.z) + 37;
  const postCount = 13;
  const postGeometry = new THREE.BoxGeometry(0.22, 1.8, 0.22);
  const postMaterial = swVisualHeroSlice6Material('#5f503d', { roughness: 0.94 });
  const posts = new THREE.InstancedMesh(postGeometry, postMaterial, postCount);
  posts.name = 'SWVisualSlice6FarmFencePosts';
  for (let index = 0; index < postCount; index += 1) {
    const z = baseZ - 30 + index * 5.0;
    const y = (typeof terrainHeightAt === 'function' ? terrainHeightAt(baseX, z) : 0) + 0.9;
    swVisualHeroSlice6SetInstance(posts, index, baseX, y, z);
  }
  posts.instanceMatrix.needsUpdate = true;
  posts.castShadow = false;
  posts.receiveShadow = true;
  swVisualHeroSlice6WorldRoot.add(posts);
  swVisualHeroSlice6State.fenceInstanceCount = postCount;

  [0.72, 1.28].forEach((railY, railIndex) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 60), postMaterial.clone());
    const centerY = (typeof terrainHeightAt === 'function' ? terrainHeightAt(baseX, baseZ) : 0) + railY;
    rail.name = `SWVisualSlice6FarmFenceRail${railIndex + 1}`;
    rail.position.set(baseX, centerY, baseZ);
    rail.castShadow = false;
    rail.receiveShadow = true;
    swVisualHeroSlice6WorldRoot.add(rail);
  });

  swVisualHeroSlice6AddTransitionPlane(4.2, 72, baseX + 3.1, baseZ, '#3f5142', 0.76, 'SWVisualSlice6FarmDitch');
  swVisualHeroSlice6AddTransitionPlane(3.0, 72, baseX - 3.3, baseZ, '#70634c', 0.72, 'SWVisualSlice6FarmShoulder');
  return true;
}

function swVisualHeroSlice6BuildVegetationPocket(storefront) {
  if (!storefront || !swVisualHeroSlice6WorldRoot) return false;
  const mobile = typeof isMobileDevice !== 'undefined' && isMobileDevice;
  const count = mobile ? 10 : 16;
  const geometry = new THREE.ConeGeometry(0.55, 1.5, 5);
  const material = swVisualHeroSlice6Material('#415846', { roughness: 0.98 });
  const clumps = new THREE.InstancedMesh(geometry, material, count);
  clumps.name = 'SWVisualSlice6RoadsideClumps';
  const x0 = Number(storefront.x);
  const z0 = Number(storefront.z);
  for (let index = 0; index < count; index += 1) {
    const side = index % 2 === 0 ? -1 : 1;
    const x = x0 + side * (29 + (index % 4) * 2.2);
    const z = z0 + 14 + Math.floor(index / 2) * 3.1;
    const y = (typeof terrainHeightAt === 'function' ? terrainHeightAt(x, z) : 0) + 0.65;
    const scale = 0.72 + (index % 3) * 0.18;
    swVisualHeroSlice6SetInstance(clumps, index, x, y, z, scale, scale, scale, index * 0.57);
  }
  clumps.instanceMatrix.needsUpdate = true;
  clumps.castShadow = false;
  clumps.receiveShadow = true;
  swVisualHeroSlice6WorldRoot.add(clumps);
  swVisualHeroSlice6State.vegetationInstanceCount = count;
  return true;
}

function swVisualHeroSlice6BuildWorldIdentity() {
  swVisualHeroSlice6DisposeWorld();
  if (!swVisualRoot) return false;
  swVisualHeroSlice6WorldRoot = new THREE.Group();
  swVisualHeroSlice6WorldRoot.name = 'SWVisualHeroSlice6WorldIdentity';
  swVisualHeroSlice6WorldRoot.userData.swPresentationOnly = true;
  swVisualRoot.add(swVisualHeroSlice6WorldRoot);

  const applied = globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getAppliedTargets?.() || [];
  const storefront = applied.find((entry) => entry.assetId === 'structure.storefront.v1') || null;
  const hartFarm = swVisualGetHartFarmPresentationAnchor?.() || null;
  const targetList = typeof targets !== 'undefined' && Array.isArray(targets) ? targets : [];

  if (storefront) {
    const x = Number(storefront.x);
    const z = Number(storefront.z);
    swVisualHeroSlice6AddTransitionPlane(60, 8.5, x, z + 24.6, '#3f4745', 0.88, 'SWVisualSlice6ServiceAlley');
    swVisualHeroSlice6AddTransitionPlane(19, 13, x - 35, z + 5, '#4b4a43', 0.82, 'SWVisualSlice6WestParkingPocket');
    swVisualHeroSlice6AddTransitionPlane(19, 13, x + 35, z + 5, '#4b4a43', 0.82, 'SWVisualSlice6EastParkingPocket');
    swVisualHeroSlice6AddTransitionPlane(54, 3.4, x, z - 21.2, '#5d584f', 0.82, 'SWVisualSlice6MainStreetShoulder');

    const candidates = targetList
      .filter((target) => target?.meshData?.group && target?.meshData?.base && !Boolean(target.destroyed) && !Boolean(target.isTree))
      .filter((target) => target.meshData.group.name !== 'structure.storefront.v1' && target.meshData.group.name !== 'HartFarmSignatureBarn')
      .map((target) => ({
        target,
        distance: Math.hypot(Number(target.x) - x, Number(target.z) - z),
      }))
      .filter((entry) => entry.distance >= 18 && entry.distance <= 104)
      .sort((a, b) => a.distance - b.distance);

    const limit = typeof isMobileDevice !== 'undefined' && isMobileDevice ? 5 : 7;
    let count = 0;
    candidates.slice(0, limit).forEach((entry, index) => {
      if (swVisualHeroSlice6AddBuildingIdentity(entry.target, index)) count += 1;
    });
    swVisualHeroSlice6State.buildingIdentityCount = count;
    swVisualHeroSlice6BuildVegetationPocket(storefront);
  }

  if (hartFarm) swVisualHeroSlice6BuildFarmEdge(hartFarm);
  return true;
}

function swVisualHeroSlice6ApplyWorldGrade() {
  const stage = THREE.MathUtils.clamp(Number(typeof currentStage !== 'undefined' ? currentStage : 1) || 1, 1, 3);
  const exposure = stage === 1 ? 0.92 : (stage === 2 ? 0.86 : 0.80);
  renderer.toneMappingExposure = exposure;

  const fogHex = stage === 1 ? '#566367' : (stage === 2 ? '#46565b' : '#35464c');
  scene.fog?.color?.set?.(fogHex);

  if (swVisualSkyDome?.material?.uniforms) {
    swVisualSkyDome.material.uniforms.topColor?.value?.set?.(stage === 1 ? '#172d3d' : '#102535');
    swVisualSkyDome.material.uniforms.horizonColor?.value?.set?.(stage === 1 ? '#68777a' : '#536367');
    swVisualSkyDome.material.uniforms.lowColor?.value?.set?.(stage === 1 ? '#293936' : '#203231');
  }
  if (swVisualRimLight) swVisualRimLight.intensity = stage === 1 ? 0.24 : (stage === 2 ? 0.29 : 0.34);
  return true;
}

function swVisualHeroSlice6RefreshWorld() {
  try {
    swVisualHeroSlice6BuildWorldIdentity();
    const buildStorm = () => swVisualHeroSlice6BuildStormSilhouette();
    if (typeof swVisualHeroSlice4EnsureTextures === 'function') {
      Promise.resolve(swVisualHeroSlice4EnsureTextures()).then(buildStorm).catch((error) => {
        swVisualHeroSlice6State.lastError = String(error?.message || error);
      });
    } else {
      buildStorm();
    }
    swVisualHeroSlice6ApplyWorldGrade();
    swVisualHeroSlice6State.installed = true;
    return true;
  } catch (error) {
    swVisualHeroSlice6State.lastError = String(error?.message || error);
    return false;
  }
}

function swVisualHeroSlice6Update(dt, now) {
  try {
    swVisualHeroSlice6ApplyWorldGrade();
    if (!swVisualHeroSlice6StormRoot && swVisualHeroSlice4Textures?.smoke && swVisualHeroSlice4Textures?.dirt) {
      swVisualHeroSlice6BuildStormSilhouette();
    }
    swVisualHeroSlice6UpdateStorm(dt, now);
    return true;
  } catch (error) {
    swVisualHeroSlice6State.lastError = String(error?.message || error);
    return false;
  }
}

const swVisualHeroSlice6RefreshBase = swVisualRefreshHeroSlice;
swVisualRefreshHeroSlice = function swVisualRefreshHeroSliceWithSlice6Identity(...args) {
  const result = swVisualHeroSlice6RefreshBase.apply(this, args);
  swVisualHeroSlice6RefreshWorld();
  return result;
};

const swVisualHeroSlice6UpdateBase = swVisualUpdate;
swVisualUpdate = function swVisualUpdateWithHeroSlice6Identity(dt, now) {
  const result = swVisualHeroSlice6UpdateBase(dt, now);
  swVisualHeroSlice6Update(dt, now);
  return result;
};

const swVisualHeroSlice6SnapshotBase = swVisualSnapshot;
swVisualSnapshot = function swVisualSnapshotWithHeroSlice6() {
  const base = swVisualHeroSlice6SnapshotBase();
  return Object.freeze({
    ...base,
    heroSlice6Version: THREEJS_VISUAL_HERO_SLICE6_VERSION,
    stormSilhouette: Object.freeze({
      rootPresent: Boolean(swVisualHeroSlice6StormRoot?.parent),
      shellCount: swVisualHeroSlice6State.stormShellCount,
      edgeWispCount: swVisualHeroSlice6State.stormEdgeWispCount,
      groundBurstCount: swVisualHeroSlice6State.stormGroundBurstCount,
      condensationStreakCount: swVisualHeroSlice6State.stormCondensationStreakCount,
      groundPullCount: swVisualHeroSlice6State.stormGroundPullCount,
      legacyStormRingCount: swVisualHeroSlice6State.legacyStormRingCount,
      visibleLegacyStormRingCount: swVisualHeroSlice6State.visibleLegacyStormRingCount,
      profile: swVisualHeroSlice6State.silhouetteProfile,
      presentationOnly: true,
    }),
    worldIdentity: Object.freeze({
      rootPresent: Boolean(swVisualHeroSlice6WorldRoot?.parent),
      buildingIdentityCount: swVisualHeroSlice6State.buildingIdentityCount,
      transitionCount: swVisualHeroSlice6State.transitionCount,
      fenceInstanceCount: swVisualHeroSlice6State.fenceInstanceCount,
      vegetationInstanceCount: swVisualHeroSlice6State.vegetationInstanceCount,
      profile: swVisualHeroSlice6State.worldProfile,
      presentationOnly: true,
    }),
    worldGrade: Object.freeze({
      exposure: Number(renderer.toneMappingExposure),
      fogColor: scene.fog?.color?.getHexString ? `#${scene.fog.color.getHexString()}` : null,
    }),
    heroSlice6LastError: swVisualHeroSlice6State.lastError,
  });
};

const swVisualHeroSlice6PrepareQaViewBase = globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.prepareQaView;
function swVisualHeroSlice6PrepareQaView(mode = 'storefront') {
  if (!['slice6-storm', 'slice6-storm-main-street', 'slice6-ground-contact', 'slice6-street', 'slice6-farm-edge'].includes(mode)) {
    return swVisualHeroSlice6PrepareQaViewBase?.(mode) ?? false;
  }

  swVisualHeroSlice6RefreshWorld();
  swVisualFoundationState.qaMode = mode;
  if (typeof globalThis.__SW_PHASE2_CLOCK_BRIDGE__?.pause === 'function') globalThis.__SW_PHASE2_CLOCK_BRIDGE__.pause();
  globalThis.productionQaPrepared = true;
  document.getElementById('mainMenu')?.classList.add('hidden');

  if (mode === 'slice6-storm') {
    if (!storm?.pos) return false;
    camera.position.set(storm.pos.x + 52, storm.pos.y + 27, storm.pos.z + 46);
    camera.lookAt(storm.pos.x, storm.pos.y + 13, storm.pos.z);
  } else if (mode === 'slice6-storm-main-street') {
    if (!storm?.pos) return false;
    camera.position.set(storm.pos.x + 68, storm.pos.y + 22, storm.pos.z + 78);
    camera.lookAt(storm.pos.x, storm.pos.y + 12, storm.pos.z);
  } else if (mode === 'slice6-ground-contact') {
    if (!storm?.pos) return false;
    camera.position.set(storm.pos.x + 27, storm.pos.y + 7.5, storm.pos.z + 25);
    camera.lookAt(storm.pos.x, storm.pos.y + 5.0, storm.pos.z);
  } else if (mode === 'slice6-street') {
    const applied = globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getAppliedTargets?.() || [];
    const storefront = applied.find((entry) => entry.assetId === 'structure.storefront.v1') || null;
    if (!storefront) return false;
    const x = Number(storefront.x);
    const z = Number(storefront.z);
    const y = typeof terrainHeightAt === 'function' ? terrainHeightAt(x, z) : 0;
    camera.position.set(x + 44, y + 20, z + 39);
    camera.lookAt(x, y + 5.4, z + 2);
  } else {
    const hartFarm = swVisualGetHartFarmPresentationAnchor?.() || null;
    if (!hartFarm) return false;
    const x = Number(hartFarm.x);
    const z = Number(hartFarm.z);
    const y = typeof terrainHeightAt === 'function' ? terrainHeightAt(x, z) : 0;
    camera.position.set(x + 34, y + 16, z + 58);
    camera.lookAt(x + 9, y + 3.2, z + 35);
  }

  swVisualUpdate(0, 1000);
  renderer.render(scene, camera);
  return true;
}

const swVisualHeroSlice6BuildLivingCountyBase = buildLivingCounty;
buildLivingCounty = function buildLivingCountyWithHeroSlice6IdentityReset(...args) {
  swVisualHeroSlice6State.worldGeneration += 1;
  swVisualHeroSlice6DisposeStorm();
  swVisualHeroSlice6DisposeWorld();
  const result = swVisualHeroSlice6BuildLivingCountyBase.apply(this, args);
  Promise.resolve().then(() => Promise.resolve()).then(() => swVisualHeroSlice6RefreshWorld());
  return result;
};

const swVisualHeroSlice6BridgeBase = globalThis.__SW_THREEJS_VISUAL_FOUNDATION__;
globalThis.__SW_THREEJS_VISUAL_FOUNDATION__ = Object.freeze({
  ...swVisualHeroSlice6BridgeBase,
  update: swVisualUpdate,
  refreshHeroSlice: swVisualRefreshHeroSlice,
  getSnapshot: swVisualSnapshot,
  prepareQaView: swVisualHeroSlice6PrepareQaView,
  refreshHeroSlice6: swVisualHeroSlice6RefreshWorld,
  heroSlice6Version: THREEJS_VISUAL_HERO_SLICE6_VERSION,
});

Promise.resolve().then(() => swVisualHeroSlice6RefreshWorld());
// [SW:VISUAL:HERO_SLICE6:END]
