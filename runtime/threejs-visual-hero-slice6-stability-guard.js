// ============================================================================
// [SW:VISUAL:HERO_SLICE6:STABILITY_GUARD]
// Prevent inherited ground-skirt presentation transforms from accumulating over
// time. Slice 4 owns skirt motion; Slice 6 only restrains its opacity.
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
      }
      if (object.name?.startsWith('SWVisualSlice4GroundSkirt') && object.material) {
        const pulse = 0.72 + Math.sin(seconds * 1.9 + index * 0.8) * 0.12;
        object.material.opacity = (0.09 + (index % 3) * 0.012) * pulse;
      }
    });
  }

  if (!neonSelected) {
    if (typeof funnelMat !== 'undefined' && funnelMat?.color) {
      funnelMat.color.set('#2c383d');
      funnelMat.opacity = 0.19;
      funnelMat.emissive?.set?.('#0a1114');
      if ('emissiveIntensity' in funnelMat) funnelMat.emissiveIntensity = 0.05;
      funnelMat.needsUpdate = true;
    }
    if (typeof outerFunnelMat !== 'undefined' && outerFunnelMat?.color) {
      outerFunnelMat.color.set('#526064');
      outerFunnelMat.opacity = 0.085;
      outerFunnelMat.needsUpdate = true;
    }
  }

  const middleVortex = scene?.getObjectByName?.('ProductionMiddleVortex');
  if (middleVortex?.material) {
    middleVortex.material.opacity = 0.06;
    middleVortex.material.color?.set?.('#26383d');
    middleVortex.material.needsUpdate = true;
  }
  const darkCore = scene?.getObjectByName?.('ProductionDarkCore');
  if (darkCore?.material) {
    darkCore.material.opacity = 0.34;
    darkCore.material.color?.set?.('#1b2b31');
    darkCore.material.needsUpdate = true;
  }

  let stormRingCount = 0;
  if (scene?.traverse && storm?.pos) {
    const stormOrigin = new THREE.Vector3(storm.pos.x, storm.pos.y, storm.pos.z);
    const worldPosition = new THREE.Vector3();
    scene.traverse((object) => {
      const geometryType = String(object?.geometry?.type || '');
      if (geometryType !== 'RingGeometry' && geometryType !== 'TorusGeometry') return;
      object.getWorldPosition?.(worldPosition);
      if (worldPosition.distanceToSquared(stormOrigin) > 18 * 18) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.filter(Boolean).forEach((material) => {
        material.opacity = Math.min(Number(material.opacity || 1), 0.035);
        material.transparent = true;
        material.needsUpdate = true;
      });
      stormRingCount += 1;
    });
  }
  swVisualHeroSlice6State.legacyStormRingCount = stormRingCount;
}

swVisualHeroSlice6TuneInheritedStorm = swVisualHeroSlice6TuneInheritedStormStable;
// [SW:VISUAL:HERO_SLICE6:STABILITY_GUARD:END]
