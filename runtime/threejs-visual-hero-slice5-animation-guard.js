// ============================================================================
// [SW:VISUAL:HERO_SLICE5:ANIMATION_GUARD]
// Keep decorative field/sign/ring/pedestal objects out of the bovine idle loop.
// ============================================================================
swVisualHeroSlice5UpdateCowLevel = function swVisualHeroSlice5UpdateCowLevelGuarded(now) {
  if (!swVisualHeroSlice5CowLevelRoot) return false;
  const seconds = Number(now || 0) * 0.001;
  const centerX = Number(swVisualHeroSlice5CowLevelRoot.userData.centerX || 0);
  const centerZ = Number(swVisualHeroSlice5CowLevelRoot.userData.centerZ || 0);
  const stormDistance = storm?.pos ? Math.hypot(Number(storm.pos.x) - centerX, Number(storm.pos.z) - centerZ) : Infinity;
  const active = stormDistance <= 78;
  swVisualHeroSlice5State.cowLevelActive = active;

  swVisualHeroSlice5CowLevelRoot.children.forEach((object, index) => {
    const isBovine = /^SWVisualSlice5Cow(?:\d+|Champion)$/.test(String(object.name || ''));
    if (!isBovine) return;
    const phase = Number(object.userData.phase || index * 0.5);
    const baseY = Number(object.userData.baseY || 0);
    const baseRotation = Number(object.userData.baseRotation || 0);
    object.position.y = baseY + Math.sin(seconds * (active ? 3.2 : 1.6) + phase) * (active ? 0.18 : 0.06);
    if (object.userData.isChampion) {
      object.rotation.y = baseRotation + seconds * (active ? 1.05 : 0.28);
    } else {
      object.rotation.y = baseRotation + Math.sin(seconds * 1.4 + phase) * (active ? 0.16 : 0.045);
    }
  });

  if (swVisualHeroSlice5CowLevelRing?.material?.color) {
    const hue = (0.24 + seconds * (active ? 0.18 : 0.035)) % 1;
    swVisualHeroSlice5CowLevelRing.material.color.setHSL(hue, 0.95, 0.58);
    swVisualHeroSlice5CowLevelRing.material.opacity = active ? 0.62 : 0.28;
  }
  if (swVisualHeroSlice5CowLevelSign?.material) {
    swVisualHeroSlice5CowLevelSign.material.opacity = active ? 1 : 0.88;
  }
  return true;
};
// [SW:VISUAL:HERO_SLICE5:ANIMATION_GUARD:END]
