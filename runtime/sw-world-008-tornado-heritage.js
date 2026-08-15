// ============================================================================
// [SW:WORLD:008_TORNADO_HERITAGE]
// Recover the strongest July Tornado presentation already present underneath
// the accepted game: dense serpentine core, vapor sheath, helical debris, and
// touchdown dust. Presentation only. No gameplay/camera/ability authority.
// ============================================================================
const SW_WORLD_008_TORNADO_HERITAGE_MARKER = 'SW_WORLD_008_TORNADO_HERITAGE_V1';

const swWorld008TornadoHeritageState = {
  marker: SW_WORLD_008_TORNADO_HERITAGE_MARKER,
  frames: 0,
  tornadoFrames: 0,
  secondaryFrames: 0,
  restoredCoreFrames: 0,
  restoredDebrisFrames: 0,
  restoredDustFrames: 0,
  ribbonFramesDemoted: 0,
  lastActiveStorm: null,
  lastError: null,
};

function swWorld008ActiveStorm() {
  if (typeof currentStorm !== 'undefined' && currentStorm) return String(currentStorm);
  if (typeof globalThis.getSwWorld007State === 'function') return String(globalThis.getSwWorld007State()?.activeStorm || '');
  return '';
}

function swWorld008SetMaterialOpacity(material, opacity) {
  if (!material) return;
  material.transparent = true;
  material.opacity = opacity;
  material.depthWrite = false;
  material.needsUpdate = true;
}

function swWorld008StyleLegacyTornado() {
  if (typeof funnelMesh !== 'undefined' && funnelMesh) {
    funnelMesh.visible = true;
    funnelMesh.scale.set(0.68, 1.0, 0.68);
    if (typeof funnelMat !== 'undefined' && funnelMat) {
      funnelMat.color?.set?.('#304348');
      funnelMat.roughness = 0.82;
      funnelMat.metalness = 0.0;
      funnelMat.emissive?.set?.('#071012');
      if ('emissiveIntensity' in funnelMat) funnelMat.emissiveIntensity = 0.015;
      swWorld008SetMaterialOpacity(funnelMat, 0.66);
      // The historical serpentine mesh is the Tornado body again. Let its near
      // surface occlude its far surface so it reads as dense condensation rather
      // than another stack of transparent planes.
      funnelMat.depthWrite = true;
      if (typeof THREE !== 'undefined') funnelMat.side = THREE.FrontSide;
      funnelMat.needsUpdate = true;
    }
    swWorld008TornadoHeritageState.restoredCoreFrames += 1;
  }

  if (typeof outerFunnelMesh !== 'undefined' && outerFunnelMesh) {
    outerFunnelMesh.visible = true;
    outerFunnelMesh.scale.set(0.65, 1.0, 0.65);
    if (typeof outerFunnelMat !== 'undefined' && outerFunnelMat) {
      outerFunnelMat.color?.set?.('#718184');
      swWorld008SetMaterialOpacity(outerFunnelMat, 0.12);
    }
  }

  // The old canopy was useful as a parent-cloud connection but too dominant in
  // the current phone view. Keep it compact and subordinate to the funnel.
  if (typeof mesoCloudGroup !== 'undefined' && mesoCloudGroup) {
    mesoCloudGroup.visible = true;
    mesoCloudGroup.scale.set(0.62, 0.45, 0.62);
    if (typeof mesoCloudMat !== 'undefined' && mesoCloudMat) {
      mesoCloudMat.color?.set?.('#1c2b30');
      mesoCloudMat.roughness = 0.92;
      swWorld008SetMaterialOpacity(mesoCloudMat, 0.25);
    }
  }

  // The 1,000-point helix is already simulated by the accepted legacy loop even
  // while invisible. Showing it adds one draw call, not another particle solver.
  if (typeof particleSystem !== 'undefined' && particleSystem) {
    particleSystem.visible = true;
    particleSystem.scale.set(0.68, 1.0, 0.68);
    if (typeof particleMat !== 'undefined' && particleMat) {
      particleMat.vertexColors = false;
      particleMat.color?.set?.('#806e5b');
      particleMat.size = (typeof isMobileDevice !== 'undefined' && isMobileDevice) ? 0.48 : 0.64;
      swWorld008SetMaterialOpacity(particleMat, 0.50);
    }
    swWorld008TornadoHeritageState.restoredDebrisFrames += 1;
  }

  if (typeof dustBowlGroup !== 'undefined' && dustBowlGroup) {
    dustBowlGroup.visible = true;
    dustBowlGroup.scale.set(0.58, 0.36, 0.58);
    if (typeof dustMat !== 'undefined' && dustMat) {
      dustMat.color?.set?.('#51463a');
      dustMat.roughness = 1.0;
      swWorld008SetMaterialOpacity(dustMat, 0.12);
    }
    swWorld008TornadoHeritageState.restoredDustFrames += 1;
  }
}

function swWorld008DemoteRibbonReplacement() {
  if (typeof swVisualHeroSlice6StormRoot === 'undefined' || !swVisualHeroSlice6StormRoot) return;
  swVisualHeroSlice6StormRoot.visible = true;
  let demoted = false;
  swVisualHeroSlice6StormRoot.children.forEach((object) => {
    if (!object?.material) return;
    if (object.name?.startsWith('SWVisualSlice6StormShell')) {
      object.visible = false;
      return;
    }
    if (object.name?.startsWith('SWVisualSlice6CondensationStreak')) {
      // These triangular sheets caused the owner-visible polygon/ribbon read.
      // Keep their objects intact for accepted hierarchy/QA compatibility but
      // remove them from the player-facing silhouette.
      object.visible = false;
      swWorld008SetMaterialOpacity(object.material, 0.03);
      demoted = true;
      return;
    }
    if (object.name?.startsWith('SWVisualSlice6EdgeWisp')) {
      object.visible = true;
      swWorld008SetMaterialOpacity(object.material, 0.045);
      demoted = true;
      return;
    }
    if (object.name?.startsWith('SWVisualSlice6GroundPull')) {
      object.visible = true;
      swWorld008SetMaterialOpacity(object.material, 0.06);
      demoted = true;
    }
  });
  if (demoted) swWorld008TornadoHeritageState.ribbonFramesDemoted += 1;
}

function swWorld008SuppressForSecondary() {
  if (typeof tornadoGroup !== 'undefined' && tornadoGroup) tornadoGroup.visible = false;
  if (typeof funnelMesh !== 'undefined' && funnelMesh) funnelMesh.visible = false;
  if (typeof outerFunnelMesh !== 'undefined' && outerFunnelMesh) outerFunnelMesh.visible = false;
  if (typeof particleSystem !== 'undefined' && particleSystem) particleSystem.visible = false;
  if (typeof dustBowlGroup !== 'undefined' && dustBowlGroup) dustBowlGroup.visible = false;
  if (typeof swVisualHeroSlice6StormRoot !== 'undefined' && swVisualHeroSlice6StormRoot) swVisualHeroSlice6StormRoot.visible = false;
}

function swWorld008SyncTornadoHeritage() {
  try {
    const activeStorm = swWorld008ActiveStorm();
    swWorld008TornadoHeritageState.frames += 1;
    swWorld008TornadoHeritageState.lastActiveStorm = activeStorm;
    const tornadoActive = activeStorm === 'tornado' || activeStorm === '';
    if (!tornadoActive) {
      swWorld008TornadoHeritageState.secondaryFrames += 1;
      swWorld008SuppressForSecondary();
      return true;
    }

    swWorld008TornadoHeritageState.tornadoFrames += 1;
    if (typeof tornadoGroup !== 'undefined' && tornadoGroup) tornadoGroup.visible = true;
    swWorld008StyleLegacyTornado();
    swWorld008DemoteRibbonReplacement();
    return true;
  } catch (error) {
    swWorld008TornadoHeritageState.lastError = String(error?.message || error);
    return false;
  }
}

// The foundation frame hook reads this bridge every frame. WORLD-008 wraps the
// accepted update and then applies its presentation correction last, after
// Slice 6 has performed the opacity/visibility suppression that caused the
// owner-observed regression.
const swWorld008VisualBridgeBase = globalThis.__SW_THREEJS_VISUAL_FOUNDATION__;
const swWorld008VisualUpdateBase = swWorld008VisualBridgeBase?.update;
const swWorld008PrepareQaBase = swWorld008VisualBridgeBase?.prepareQaView;

function swWorld008VisualUpdate(dt, now) {
  const result = typeof swWorld008VisualUpdateBase === 'function'
    ? swWorld008VisualUpdateBase(dt, now)
    : true;
  swWorld008SyncTornadoHeritage();
  return result;
}

function swWorld008PrepareQaView(mode) {
  const result = typeof swWorld008PrepareQaBase === 'function'
    ? swWorld008PrepareQaBase(mode)
    : false;
  swWorld008SyncTornadoHeritage();
  if (typeof renderer !== 'undefined' && typeof scene !== 'undefined' && typeof camera !== 'undefined') renderer.render(scene, camera);
  return result;
}

if (swWorld008VisualBridgeBase) {
  globalThis.__SW_THREEJS_VISUAL_FOUNDATION__ = Object.freeze({
    ...swWorld008VisualBridgeBase,
    update: swWorld008VisualUpdate,
    prepareQaView: swWorld008PrepareQaView,
    tornadoHeritageVersion: SW_WORLD_008_TORNADO_HERITAGE_MARKER,
  });
}

globalThis.getSwWorld008TornadoHeritageState = function getSwWorld008TornadoHeritageState() {
  const ribbon = { streaks: 0, visibleStreaks: 0, wisps: 0, groundPulls: 0, maxOpacity: 0 };
  if (typeof swVisualHeroSlice6StormRoot !== 'undefined' && swVisualHeroSlice6StormRoot) {
    swVisualHeroSlice6StormRoot.children.forEach((object) => {
      if (object.name?.startsWith('SWVisualSlice6CondensationStreak')) {
        ribbon.streaks += 1;
        if (object.visible) ribbon.visibleStreaks += 1;
      }
      if (object.name?.startsWith('SWVisualSlice6EdgeWisp')) ribbon.wisps += 1;
      if (object.name?.startsWith('SWVisualSlice6GroundPull')) ribbon.groundPulls += 1;
      if (object.material && Number.isFinite(object.material.opacity)) ribbon.maxOpacity = Math.max(ribbon.maxOpacity, object.material.opacity);
    });
  }
  return Object.freeze({
    ...swWorld008TornadoHeritageState,
    legacy: Object.freeze({
      tornadoGroupVisible: typeof tornadoGroup !== 'undefined' && Boolean(tornadoGroup?.visible),
      funnelVisible: typeof funnelMesh !== 'undefined' && Boolean(funnelMesh?.visible),
      funnelOpacity: typeof funnelMat !== 'undefined' ? Number(funnelMat?.opacity || 0) : null,
      funnelDepthWrite: typeof funnelMat !== 'undefined' ? Boolean(funnelMat?.depthWrite) : null,
      outerVisible: typeof outerFunnelMesh !== 'undefined' && Boolean(outerFunnelMesh?.visible),
      outerOpacity: typeof outerFunnelMat !== 'undefined' ? Number(outerFunnelMat?.opacity || 0) : null,
      debrisVisible: typeof particleSystem !== 'undefined' && Boolean(particleSystem?.visible),
      debrisOpacity: typeof particleMat !== 'undefined' ? Number(particleMat?.opacity || 0) : null,
      dustVisible: typeof dustBowlGroup !== 'undefined' && Boolean(dustBowlGroup?.visible),
      canopyVisible: typeof mesoCloudGroup !== 'undefined' && Boolean(mesoCloudGroup?.visible),
      canopyScaleX: typeof mesoCloudGroup !== 'undefined' ? Number(mesoCloudGroup?.scale?.x || 0) : null,
    }),
    ribbon: Object.freeze(ribbon),
    presentationOnly: true,
  });
};

swWorld008SyncTornadoHeritage();
// [SW:WORLD:008_TORNADO_HERITAGE:END]
