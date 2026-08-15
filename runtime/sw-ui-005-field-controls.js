// ============================================================================
// [SW:UI:005_FIELD_CONTROLS]
// Desktop-only presentation adapter for the existing key guide. Preserves the
// original control spans, IDs, bindings, and district status while replacing
// developer-documentation framing with a compact product-native field strip.
// ============================================================================
const SW_UI_005_MARKER = 'SW_UI_005_FIELD_CONTROLS_V1';

const swUi005State = {
  marker: SW_UI_005_MARKER,
  applyCount: 0,
  desktopActive: false,
  originalLabelsCaptured: false,
  fieldHeaderPresent: false,
};

function swUi005Guide() {
  return document.querySelector('.key-guide');
}

function swUi005Rows(guide) {
  return guide ? Array.from(guide.children).filter((node) => !node.classList.contains('sw-field-controls-header')) : [];
}

function swUi005InstallStyles() {
  if (document.getElementById('swUi005FieldControlStyles')) return;
  const style = document.createElement('style');
  style.id = 'swUi005FieldControlStyles';
  style.textContent = String.raw`
    .sw-field-controls-header { display: none; }

    @media (min-width: 900px) {
      .panel.key-guide.sw-field-controls {
        min-width: 0 !important;
        max-width: min(560px, 48vw) !important;
        padding: 7px 10px !important;
        border-color: rgba(216, 199, 159, 0.68) !important;
        background:
          linear-gradient(90deg, rgba(14, 25, 37, 0.96), rgba(22, 38, 52, 0.90)) !important;
        box-shadow: inset 3px 0 0 rgba(180, 83, 9, 0.88), 0 4px 16px rgba(0, 0, 0, 0.24) !important;
        display: grid !important;
        grid-template-columns: auto minmax(0, 1fr) !important;
        column-gap: 9px !important;
        row-gap: 2px !important;
        align-items: baseline !important;
        color: #e8edf3 !important;
        font-size: 9px !important;
        line-height: 1.22 !important;
      }

      .panel.key-guide.sw-field-controls .sw-field-controls-header {
        display: block;
        grid-row: 1 / span 3;
        align-self: stretch;
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        padding: 2px 5px 2px 2px;
        border-left: 1px solid rgba(242, 234, 215, 0.28);
        color: #d8c79f;
        font: 900 8px/1 Inter, sans-serif;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        white-space: nowrap;
      }

      .panel.key-guide.sw-field-controls > div:not(.sw-field-controls-header) {
        grid-column: 2;
        margin: 0 !important;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .panel.key-guide.sw-field-controls > div:not(.sw-field-controls-header) > b:first-child {
        display: inline-block;
        min-width: 78px;
        color: #d8c79f !important;
        font: 900 8px/1.1 Inter, sans-serif !important;
        letter-spacing: 0.09em;
        text-transform: uppercase;
      }

      .panel.key-guide.sw-field-controls #verbSpace,
      .panel.key-guide.sw-field-controls #verbQ,
      .panel.key-guide.sw-field-controls #verbE {
        color: #f8fafc !important;
        font-weight: 800 !important;
      }

      .panel.key-guide.sw-field-controls #stageStatusTag {
        color: #f1c27d !important;
        font-weight: 900 !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function swUi005EnsureHeader(guide) {
  let header = guide.querySelector(':scope > .sw-field-controls-header');
  if (!header) {
    header = document.createElement('div');
    header.className = 'sw-field-controls-header';
    header.textContent = 'FIELD CONTROLS';
    header.setAttribute('aria-hidden', 'true');
    guide.prepend(header);
  }
  swUi005State.fieldHeaderPresent = true;
  return header;
}

function swUi005CaptureOriginalLabels(rows) {
  if (swUi005State.originalLabelsCaptured) return;
  rows.slice(0, 3).forEach((row) => {
    const label = row.querySelector(':scope > b:first-child');
    if (label && !label.dataset.swUi005OriginalLabel) label.dataset.swUi005OriginalLabel = label.textContent || '';
  });
  swUi005State.originalLabelsCaptured = true;
}

function swUi005SetDesktopLabels(rows) {
  const labels = ['STEER', 'ABILITIES', 'WARNING AREA'];
  rows.slice(0, 3).forEach((row, index) => {
    const label = row.querySelector(':scope > b:first-child');
    if (label) label.textContent = labels[index];
  });
}

function swUi005RestoreMobileLabels(rows) {
  rows.slice(0, 3).forEach((row) => {
    const label = row.querySelector(':scope > b:first-child');
    if (label?.dataset.swUi005OriginalLabel) label.textContent = label.dataset.swUi005OriginalLabel;
  });
}

function swUi005ApplyFieldControls() {
  if (typeof document === 'undefined') return;
  const guide = swUi005Guide();
  if (!guide) return;
  swUi005InstallStyles();
  swUi005EnsureHeader(guide);
  const rows = swUi005Rows(guide);
  swUi005CaptureOriginalLabels(rows);

  const desktop = typeof matchMedia === 'function' ? matchMedia('(min-width: 900px)').matches : innerWidth >= 900;
  swUi005State.desktopActive = desktop;
  if (desktop) {
    guide.classList.add('sw-field-controls');
    swUi005SetDesktopLabels(rows);
  } else {
    guide.classList.remove('sw-field-controls');
    swUi005RestoreMobileLabels(rows);
  }
  swUi005State.applyCount += 1;
}

swUi005ApplyFieldControls();
window.addEventListener('resize', swUi005ApplyFieldControls, { passive: true });

globalThis.__SW_UI_005_APPLY__ = swUi005ApplyFieldControls;
globalThis.getSwUi005State = function getSwUi005State() {
  const guide = swUi005Guide();
  return Object.freeze({
    ...swUi005State,
    guideFound: Boolean(guide),
    moveTruth: guide?.textContent?.includes('WASD') || false,
    pullTruth: document.getElementById('verbSpace')?.textContent || '',
    gustTruth: document.getElementById('verbQ')?.textContent || '',
    zapTruth: document.getElementById('verbE')?.textContent || '',
    districtTruth: document.getElementById('stageStatusTag')?.textContent || '',
  });
};
// [SW:UI:005_FIELD_CONTROLS:END]
