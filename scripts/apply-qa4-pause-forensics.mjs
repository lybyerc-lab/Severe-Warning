import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');

let html = await readFile(sourcePath, 'utf8');

function replaceExact(before, after, label) {
  const count = html.split(before).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: expected exactly one source match, found ${count}`);
  }
  html = html.replace(before, after);
}

replaceExact(
  '  /* [SW:UI:QA4_INPUT_ISOLATION_V1:END] */',
  String.raw`  /* [SW:UI:QA4_INPUT_ISOLATION_V1:END] */
  /* [SW:UI:QA4_PAUSE_FORENSICS_V1] */
  #qa4ForensicTrace { position: fixed; left: max(10px, env(safe-area-inset-left)); right: max(10px, env(safe-area-inset-right)); top: calc(max(10px, env(safe-area-inset-top)) + 58px); z-index: 100002; max-height: min(56vh, 520px); overflow: auto; border: 2px solid rgba(248,113,113,0.95); border-radius: 14px; padding: 10px; background: rgba(15,23,42,0.98); color: #fee2e2; box-shadow: 0 16px 48px rgba(0,0,0,0.7); font: 700 10px/1.35 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; white-space: pre-wrap; overflow-wrap: anywhere; }
  #qa4ForensicTrace[hidden] { display: none; }
  #qa4ForensicTrace strong { color: #fca5a5; font-size: 12px; }
  #qa4ForensicTrace .qa4-forensic-actions { display: flex; gap: 7px; margin-top: 8px; }
  #qa4ForensicTrace button { min-height: 34px; border: 1px solid rgba(248,113,113,0.75); border-radius: 8px; padding: 7px 9px; background: #450a0a; color: #fee2e2; font: 900 10px/1 Inter, sans-serif; }
  /* [SW:UI:QA4_PAUSE_FORENSICS_V1:END] */`,
  'QA4 forensic CSS'
);

replaceExact(
  `  <div id="visualLabEvents">No QA4 events yet.</div>
</section>`,
  `  <div id="visualLabEvents">No QA4 events yet.</div>
</section>
<section id="qa4ForensicTrace" hidden aria-live="assertive">
  <strong>QA4 PAUSE FORENSICS</strong>
  <div id="qa4ForensicText">No trace captured.</div>
  <div class="qa4-forensic-actions">
    <button id="qa4ForensicCopy" type="button">COPY TRACE</button>
    <button id="qa4ForensicContinue" type="button">CLEAR PAUSE + CONTINUE</button>
    <button id="qa4ForensicHide" type="button">HIDE</button>
  </div>
</section>`,
  'QA4 forensic markup'
);

replaceExact(
  `function togglePauseMenu() {
  // QA4_RUN_LOCK_V1: the deterministic run owns pause state for its full duration.`,
  `function togglePauseMenu() {
  if (window.__SW_QA_FORENSICS__) window.__SW_QA_FORENSICS__.capturePauseRequest();
  // QA4_RUN_LOCK_V1: the deterministic run owns pause state for its full duration.`,
  'pause request capture hook'
);

replaceExact(
  `      qa4Record('step', label);
      action();`,
  `      if (window.__SW_QA_FORENSICS__) window.__SW_QA_FORENSICS__.markStep(label);
      qa4Record('step', label);
      action();
      if (window.__SW_QA_FORENSICS__) window.__SW_QA_FORENSICS__.markStep(label + ' complete');`,
  'scheduled step trace hook'
);

replaceExact(
  `  window.__SW_QA_TEST_LOCK__ = true;
  window.__SW_QA_BLOCKED_PAUSE_COUNT__ = 0;`,
  `  window.__SW_QA_TEST_LOCK__ = true;
  window.__SW_QA_BLOCKED_PAUSE_COUNT__ = 0;
  if (window.__SW_QA_FORENSICS__) window.__SW_QA_FORENSICS__.startRun();`,
  'QA4 run entry trace hook'
);

replaceExact(
  `// ============================================================================
// [SW:QA:INPUT_ISOLATION]
// Purpose: Keep mobile QA taps from becoming gameplay or pause inputs.
// ============================================================================`,
  String.raw`// ============================================================================
// [SW:QA:PAUSE_FORENSICS]
// Purpose: Capture the exact event and code path that activates the pause UI.
// This is diagnostic-only and does not change normal gameplay input behavior.
// ============================================================================
const QA4_FORENSIC_STORAGE_KEY = 'severe_weather_qa4_pause_trace_v1';
const qa4Forensics = {
  events: [],
  snapshots: [],
  runEntries: 0,
  currentStep: 'none',
  lastSnapshot: null,
  observer: null,

  describeElement(element) {
    if (!element) return 'none';
    const id = element.id ? '#' + element.id : '';
    const classes = element.classList && element.classList.length
      ? '.' + Array.from(element.classList).slice(0, 3).join('.')
      : '';
    return String(element.tagName || element.nodeName || 'node').toLowerCase() + id + classes;
  },

  recordInput(event) {
    const point = event.changedTouches && event.changedTouches[0]
      ? event.changedTouches[0]
      : event;
    const x = Number.isFinite(point.clientX) ? Math.round(point.clientX) : null;
    const y = Number.isFinite(point.clientY) ? Math.round(point.clientY) : null;
    const topElement = x !== null && y !== null ? document.elementFromPoint(x, y) : null;
    this.events.push({
      atMs: Math.round(performance.now()),
      type: event.type,
      target: this.describeElement(event.target),
      top: this.describeElement(topElement),
      x,
      y,
      defaultPrevented: event.defaultPrevented,
      trusted: event.isTrusted
    });
    if (this.events.length > 16) this.events.shift();
  },

  markStep(label) {
    this.currentStep = label;
  },

  startRun() {
    this.runEntries += 1;
    this.currentStep = 'run-handler-entered';
    this.snapshots = [];
    this.lastSnapshot = null;
    const trace = getCachedEl('qa4ForensicTrace');
    if (trace) trace.hidden = true;
  },

  capturePauseRequest() {
    this.snapshot('togglePauseMenu-called', {
      stack: new Error('pause request').stack || 'stack unavailable'
    });
  },

  snapshot(reason, extra = {}) {
    const overlay = getCachedEl('pauseOverlay');
    const activeElement = document.activeElement;
    const snapshot = {
      version: 'QA4_PAUSE_FORENSICS_V1',
      reason,
      atMs: Math.round(performance.now()),
      qaRunning: Boolean(typeof qa4State !== 'undefined' && qa4State.running),
      runEntries: this.runEntries,
      currentStep: this.currentStep,
      testLock: window.__SW_QA_TEST_LOCK__ === true,
      shieldRemainingMs: Math.max(0, Math.round((window.__SW_QA_INPUT_SHIELD_UNTIL__ || 0) - performance.now())),
      blockedPauseAttempts: window.__SW_QA_BLOCKED_PAUSE_COUNT__ || 0,
      isPaused: typeof isPaused === 'boolean' ? isPaused : null,
      runActive: typeof runActive === 'boolean' ? runActive : null,
      overlayActive: Boolean(overlay && overlay.classList.contains('active')),
      activeElement: this.describeElement(activeElement),
      recentEvents: this.events.slice(-8),
      ...extra
    };
    this.snapshots.push(snapshot);
    if (this.snapshots.length > 12) this.snapshots.shift();
    this.lastSnapshot = snapshot;
    window.__SW_QA_PAUSE_TRACE__ = snapshot;
    try { localStorage.setItem(QA4_FORENSIC_STORAGE_KEY, JSON.stringify(snapshot)); } catch (error) {}
    this.render(snapshot);
    return snapshot;
  },

  render(snapshot) {
    const trace = getCachedEl('qa4ForensicTrace');
    const text = getCachedEl('qa4ForensicText');
    if (!trace || !text || !snapshot) return;
    const stack = String(snapshot.stack || '').split('\n').slice(0, 7).join('\n');
    const events = snapshot.recentEvents.length
      ? snapshot.recentEvents.map(event => event.type + ' ' + event.target + ' top=' + event.top + ' @' + event.x + ',' + event.y + ' trusted=' + event.trusted).join('\n')
      : 'none';
    text.textContent = [
      'reason=' + snapshot.reason,
      'qaRunning=' + snapshot.qaRunning + ' runEntries=' + snapshot.runEntries,
      'step=' + snapshot.currentStep,
      'testLock=' + snapshot.testLock + ' shieldMs=' + snapshot.shieldRemainingMs,
      'blockedPauseAttempts=' + snapshot.blockedPauseAttempts,
      'isPaused=' + snapshot.isPaused + ' runActive=' + snapshot.runActive + ' overlayActive=' + snapshot.overlayActive,
      'activeElement=' + snapshot.activeElement,
      'events:\n' + events,
      stack ? 'stack:\n' + stack : 'stack=none'
    ].join('\n');
    trace.hidden = false;
  },

  install() {
    if (this.observer) return;
    for (const type of ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'click']) {
      document.addEventListener(type, event => this.recordInput(event), true);
    }
    const overlay = getCachedEl('pauseOverlay');
    if (overlay) {
      this.observer = new MutationObserver(() => {
        if (overlay.classList.contains('active')) {
          this.snapshot('pause-overlay-became-active');
        }
      });
      this.observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
    }
    getCachedEl('qa4ForensicCopy')?.addEventListener('click', async event => {
      event.preventDefault();
      event.stopPropagation();
      const payload = this.lastSnapshot || { message: 'No trace captured.' };
      try { await navigator.clipboard.writeText(JSON.stringify(payload, null, 2)); } catch (error) {}
    });
    getCachedEl('qa4ForensicContinue')?.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      isPaused = false;
      runActive = true;
      overlay?.classList.remove('active');
      getCachedEl('qa4ForensicTrace').hidden = true;
      this.currentStep = this.currentStep + ' / continued';
    });
    getCachedEl('qa4ForensicHide')?.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      getCachedEl('qa4ForensicTrace').hidden = true;
    });
  }
};
window.__SW_QA_FORENSICS__ = qa4Forensics;
queueMicrotask(() => qa4Forensics.install());
// [SW:QA:PAUSE_FORENSICS:END]

// ============================================================================
// [SW:QA:INPUT_ISOLATION]
// Purpose: Keep mobile QA taps from becoming gameplay or pause inputs.
// ============================================================================`,
  'QA4 pause forensic runtime'
);

replaceExact(
  `  if (qa4Mode === 'true' || qa4Mode === 'run' || window.location.hash === '#qa4') {`,
  `  if (qa4Mode === 'true' || qa4Mode === 'run' || qa4Mode === 'forensic' || window.location.hash === '#qa4') {`,
  'forensic query panel activation'
);

replaceExact(
  `  if (qa4Mode === 'run') window.setTimeout(runQa4DeterministicTest, 500);`,
  `  if (qa4Mode === 'run' || qa4Mode === 'forensic') window.setTimeout(runQa4DeterministicTest, 800);`,
  'forensic no-touch autorun'
);

for (const marker of [
  '[SW:UI:QA4_PAUSE_FORENSICS_V1]',
  '[SW:QA:PAUSE_FORENSICS]',
  'QA4_PAUSE_FORENSICS_V1',
  '__SW_QA_PAUSE_TRACE__',
  "qa4Mode === 'forensic'",
  "snapshot('pause-overlay-became-active')"
]) {
  if (!html.includes(marker)) throw new Error(`QA4 pause forensics verification failed: missing ${marker}`);
}

await writeFile(sourcePath, html, 'utf8');
console.log(`Applied QA4 pause forensics to ${sourcePath}`);
