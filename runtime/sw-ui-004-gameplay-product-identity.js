// ============================================================================
// [SW:UI:004_GAMEPLAY_PRODUCT_IDENTITY]
// Presentation-only adapter that removes internal lab/prototype labels from
// player-visible gameplay while preserving all controls and gameplay truth.
// ============================================================================
const SW_UI_004_MARKER = 'SW_UI_004_GAMEPLAY_PRODUCT_IDENTITY_V1';

const swUi004State = {
  marker: SW_UI_004_MARKER,
  applyCount: 0,
  titleReplacements: 0,
  warningReplacements: 0,
  hiddenDevChrome: 0,
  lastAppliedAt: 0,
};

let swUi004Applying = false;
let swUi004ApplyQueued = false;

function swUi004ElementVisible(element) {
  if (!element || !element.isConnected) return false;
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return style.display !== 'none'
    && style.visibility !== 'hidden'
    && Number(style.opacity || 1) > 0
    && rect.width > 0
    && rect.height > 0;
}

function swUi004ReplaceTextNodes(root, matcher, replacement, counterKey) {
  if (!root || typeof document === 'undefined') return 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let count = 0;
  let node = walker.nextNode();
  while (node) {
    const parent = node.parentElement;
    if (parent && !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) {
      const before = node.nodeValue || '';
      const after = before.replace(matcher, replacement);
      if (after !== before) {
        node.nodeValue = after;
        count += 1;
      }
    }
    node = walker.nextNode();
  }
  if (counterKey && count > 0) swUi004State[counterKey] += count;
  return count;
}

function swUi004HideDevChrome() {
  const candidates = Array.from(document.querySelectorAll('body *'));
  let hidden = 0;
  for (const element of candidates) {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(element.tagName)) continue;
    const text = (element.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) continue;

    const isBuildBadge = /\b3D\s+LAB\b.*\bPRODUCTION\s+SLICE\b/i.test(text)
      || /\bTHREE\.JS\s+PRODUCTION\s+SLICE\b/i.test(text);
    if (!isBuildBadge) continue;

    // Hide the deepest matching node so a parent container containing gameplay
    // controls is never accidentally removed.
    const childAlsoMatches = Array.from(element.children || []).some((child) => {
      const childText = (child.textContent || '').replace(/\s+/g, ' ').trim();
      return /\b3D\s+LAB\b.*\bPRODUCTION\s+SLICE\b/i.test(childText)
        || /\bTHREE\.JS\s+PRODUCTION\s+SLICE\b/i.test(childText);
    });
    if (childAlsoMatches) continue;

    if (element.dataset.swUi004DevchromeHidden !== '1') {
      element.dataset.swUi004DevchromeHidden = '1';
      element.setAttribute('aria-hidden', 'true');
      element.style.setProperty('display', 'none', 'important');
      hidden += 1;
    }
  }
  swUi004State.hiddenDevChrome += hidden;
  return hidden;
}

function swUi004ApplyProductIdentity() {
  if (swUi004Applying || typeof document === 'undefined' || !document.body) return;
  swUi004Applying = true;
  try {
    swUi004ReplaceTextNodes(document.body, /SEVERE\s+WEATHER\s+3D/gi, 'SEVERE WEATHER WARNING', 'titleReplacements');
    swUi004ReplaceTextNodes(document.body, /(NOAA\s+EAS\s+STAGE\s+\d+\s+WARNING:\s*)3D\s+/gi, '$1', 'warningReplacements');
    swUi004HideDevChrome();
    swUi004State.applyCount += 1;
    swUi004State.lastAppliedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
  } finally {
    swUi004Applying = false;
  }
}

function swUi004QueueApply() {
  if (swUi004ApplyQueued) return;
  swUi004ApplyQueued = true;
  queueMicrotask(() => {
    swUi004ApplyQueued = false;
    swUi004ApplyProductIdentity();
  });
}

swUi004ApplyProductIdentity();

if (typeof MutationObserver !== 'undefined' && document.body) {
  const swUi004Observer = new MutationObserver(() => swUi004QueueApply());
  swUi004Observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
  });
  globalThis.__SW_UI_004_OBSERVER__ = swUi004Observer;
}

globalThis.__SW_UI_004_APPLY__ = swUi004ApplyProductIdentity;
globalThis.getSwUi004State = function getSwUi004State() {
  return Object.freeze({ ...swUi004State });
};
globalThis.__SW_UI_004_ELEMENT_VISIBLE__ = swUi004ElementVisible;
// [SW:UI:004_GAMEPLAY_PRODUCT_IDENTITY:END]
