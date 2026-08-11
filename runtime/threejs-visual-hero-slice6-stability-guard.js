// ============================================================================
// [SW:VISUAL:HERO_SLICE6:STABILITY_GUARD]
// Prevent inherited storm presentation transforms from accumulating over time.
// WORLD-004 owns the default silhouette with irregular mesh ribbons; the
// inherited cone, round skirts, and rings must remain unavailable to render.
// ============================================================================
function swVisualHeroSlice6TuneInheritedStormStable(seconds) {
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
      if (object.name?.startsWith('SWVisualSlice4GroundSkirt')) {
        object.visible = false;
      }
      if (object.name?.startsWith('SWVisualSlice4RainTrace')) {
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

swVisualHeroSlice6TuneInheritedStorm = swVisualHeroSlice6TuneInheritedStormStable;
// [SW:VISUAL:HERO_SLICE6:STABILITY_GUARD:END]
