// ============================================================================
// [SW:WORLD:007_SECONDARY_EXCLUSIVE]
// Secondary-storm presentation exclusivity. Prevents the accepted Tornado
// funnel/body from leaking underneath Supercell or Derecho presentation.
// Presentation only; storm selection/mechanics remain authoritative elsewhere.
// ============================================================================
const SW_WORLD_007_SECONDARY_EXCLUSIVE_MARKER = 'SW_WORLD_007_SECONDARY_EXCLUSIVE_V1';

const swWorld007SecondaryExclusiveState = {
  marker: SW_WORLD_007_SECONDARY_EXCLUSIVE_MARKER,
  frames: 0,
  tornadoLeakFramesSuppressed: 0,
  qaCaptureMode: false,
  qaOverlaysHidden: 0,
};

function swWorld007SecondaryExclusiveHideTornadoLeak() {
  const activeType = typeof swWorld007ResolveStormType === 'function' ? swWorld007ResolveStormType() : null;
  if (activeType !== 'supercell' && activeType !== 'derecho') return;

  let suppressed = false;
  if (typeof tornadoGroup !== 'undefined' && tornadoGroup?.visible) {
    tornadoGroup.visible = false;
    suppressed = true;
  }
  if (typeof funnelMesh !== 'undefined' && funnelMesh?.visible) {
    funnelMesh.visible = false;
    suppressed = true;
  }
  if (typeof outerFunnelMesh !== 'undefined' && outerFunnelMesh?.visible) {
    outerFunnelMesh.visible = false;
    suppressed = true;
  }
  if (suppressed) swWorld007SecondaryExclusiveState.tornadoLeakFramesSuppressed += 1;
}

function swWorld007SecondaryExclusiveHideQaOverlays() {
  if (!swWorld007SecondaryExclusiveState.qaCaptureMode || typeof document === 'undefined') return;
  const nodes = Array.from(document.querySelectorAll('body *'));
  for (const node of nodes) {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.tagName)) continue;
    const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
    if (!/COW[- ]?CAM|COW 17.*DIGNITY STATUS|LIVE CAMERA:/i.test(text)) continue;
    const childMatches = Array.from(node.children || []).some((child) => /COW[- ]?CAM|COW 17.*DIGNITY STATUS|LIVE CAMERA:/i.test((child.textContent || '').replace(/\s+/g, ' ')));
    if (childMatches) continue;
    if (node.style.display !== 'none') swWorld007SecondaryExclusiveState.qaOverlaysHidden += 1;
    node.style.setProperty('display', 'none', 'important');
    node.setAttribute('aria-hidden', 'true');
  }
}

const swWorld007SecondaryExclusivePrevUpdate = swWorld007UpdateSecondaryStormVisuals;
swWorld007UpdateSecondaryStormVisuals = function swWorld007UpdateSecondaryStormVisualsExclusive(timeNow) {
  swWorld007SecondaryExclusivePrevUpdate(timeNow);
  swWorld007SecondaryExclusiveState.frames += 1;
  swWorld007SecondaryExclusiveHideTornadoLeak();
  swWorld007SecondaryExclusiveHideQaOverlays();
};

if (globalThis.__SW_WORLD_007_QA__?.selectStorm) {
  const swWorld007SecondaryExclusivePrevQaSelect = globalThis.__SW_WORLD_007_QA__.selectStorm.bind(globalThis.__SW_WORLD_007_QA__);
  globalThis.__SW_WORLD_007_QA__.selectStorm = function swWorld007QaSelectStormExclusive(type) {
    swWorld007SecondaryExclusiveState.qaCaptureMode = true;
    swWorld007SecondaryExclusivePrevQaSelect(type);
    swWorld007SecondaryExclusiveHideTornadoLeak();
    swWorld007SecondaryExclusiveHideQaOverlays();
  };
}

swWorld007SecondaryExclusiveHideTornadoLeak();

globalThis.getSwWorld007SecondaryExclusiveState = function getSwWorld007SecondaryExclusiveState() {
  return Object.freeze({ ...swWorld007SecondaryExclusiveState });
};
// [SW:WORLD:007_SECONDARY_EXCLUSIVE:END]
