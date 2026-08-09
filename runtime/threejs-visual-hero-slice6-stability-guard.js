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
}

swVisualHeroSlice6TuneInheritedStorm = swVisualHeroSlice6TuneInheritedStormStable;
// [SW:VISUAL:HERO_SLICE6:STABILITY_GUARD:END]
