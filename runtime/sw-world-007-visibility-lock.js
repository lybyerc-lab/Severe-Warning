// ============================================================================
// [SW:WORLD:007_VISIBILITY_LOCK]
// Keeps rejected legacy Supercell/Derecho presentation suppressed after runtime
// storm selection or other legacy visibility refreshes. Presentation-only.
// ============================================================================
const SW_WORLD_007_VISIBILITY_LOCK_MARKER = 'SW_WORLD_007_VISIBILITY_LOCK_V1';

const swWorld007VisibilityState = {
  marker: SW_WORLD_007_VISIBILITY_LOCK_MARKER,
  frames: 0,
  hiddenSupercellChildren: 0,
  hiddenDerechoChildren: 0,
  hiddenNamedPrimitiveGroups: 0,
  qaOverlaysHidden: 0,
};

function swWorld007VisibilityHideParentChildren(parent, keepRoot) {
  if (!parent) return 0;
  let hidden = 0;
  for (const child of parent.children || []) {
    if (child === keepRoot || child?.userData?.swWorld007AtmosphericCorrection) continue;
    if (child.visible !== false) hidden += 1;
    child.visible = false;
  }
  return hidden;
}

function swWorld007VisibilityHidePrimitiveGroups(root) {
  if (!root) return 0;
  let hidden = 0;
  for (const groupName of [
    'SWWorld007SupercellAnvilGroup',
    'SWWorld007SupercellMammatus',
    'SWWorld007SupercellMesoCore',
    'SWWorld007SupercellWallCloud',
    'SWWorld007SupercellInflowCollar',
    'SWWorld007SupercellPuffOrbits',
    'SWWorld007SupercellHailShaft',
    'SWWorld007DerechoShelfArcGroup',
    'SWWorld007DerechoRollClouds',
    'SWWorld007DerechoMicroburstStreaks',
    'SWWorld007DerechoOutflowDust',
  ]) {
    const node = root.getObjectByName?.(groupName);
    if (!node) continue;
    if (node.visible !== false) hidden += 1;
    node.visible = false;
  }
  return hidden;
}

function swWorld007VisibilityLockFrame() {
  swWorld007VisibilityState.frames += 1;
  if (typeof supercellGroup !== 'undefined' && supercellGroup) {
    swWorld007VisibilityState.hiddenSupercellChildren += swWorld007VisibilityHideParentChildren(
      supercellGroup,
      swWorld007SupercellVisualRoot
    );
  }
  if (typeof derechoGroup !== 'undefined' && derechoGroup) {
    swWorld007VisibilityState.hiddenDerechoChildren += swWorld007VisibilityHideParentChildren(
      derechoGroup,
      swWorld007DerechoVisualRoot
    );
  }
  swWorld007VisibilityState.hiddenNamedPrimitiveGroups += swWorld007VisibilityHidePrimitiveGroups(swWorld007SupercellVisualRoot);
  swWorld007VisibilityState.hiddenNamedPrimitiveGroups += swWorld007VisibilityHidePrimitiveGroups(swWorld007DerechoVisualRoot);
}

function swWorld007VisibilityHideQaCowCamChrome() {
  if (typeof document === 'undefined') return 0;
  let hidden = 0;
  const nodes = Array.from(document.querySelectorAll('body *'));
  for (const node of nodes) {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.tagName)) continue;
    const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
    if (!/COW[- ]?CAM/i.test(text)) continue;
    const childMatches = Array.from(node.children || []).some((child) => /COW[- ]?CAM/i.test((child.textContent || '').replace(/\s+/g, ' ')));
    if (childMatches) continue;
    node.style.setProperty('display', 'none', 'important');
    node.setAttribute('aria-hidden', 'true');
    hidden += 1;
  }
  swWorld007VisibilityState.qaOverlaysHidden += hidden;
  return hidden;
}

const swWorld007VisibilityPrevUpdate = swWorld007UpdateSecondaryStormVisuals;
swWorld007UpdateSecondaryStormVisuals = function swWorld007UpdateSecondaryStormVisualsVisibilityLocked(timeNow) {
  swWorld007VisibilityPrevUpdate(timeNow);
  swWorld007VisibilityLockFrame();
};

swWorld007VisibilityLockFrame();

if (globalThis.__SW_WORLD_007_QA__?.selectStorm) {
  const swWorld007VisibilityPrevQaSelect = globalThis.__SW_WORLD_007_QA__.selectStorm.bind(globalThis.__SW_WORLD_007_QA__);
  globalThis.__SW_WORLD_007_QA__.selectStorm = function swWorld007QaSelectStormVisibilityLocked(type) {
    swWorld007VisibilityPrevQaSelect(type);
    swWorld007VisibilityLockFrame();
    swWorld007VisibilityHideQaCowCamChrome();
  };
}

globalThis.getSwWorld007VisibilityLockState = function getSwWorld007VisibilityLockState() {
  return Object.freeze({ ...swWorld007VisibilityState });
};
// [SW:WORLD:007_VISIBILITY_LOCK:END]
