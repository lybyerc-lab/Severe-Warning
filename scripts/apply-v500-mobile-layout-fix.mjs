import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');

let html = await readFile(sourcePath, 'utf8');

const marker = 'V500_MOBILE_LAYOUT_FIX_V1';
const requiredMarkers = [
  marker,
  'qa-tools-enabled',
  'setQaToolsVisible',
  'box-sizing: border-box',
  'max-height: calc(100dvh'
];

if (html.includes(marker)) {
  requiredMarkers.forEach(required => {
    if (!html.includes(required)) throw new Error(`V5 mobile layout fix is incomplete: missing ${required}`);
  });
  console.log(`V5 mobile layout fix already present in ${sourcePath}`);
  process.exit(0);
}

function replaceExact(before, after, label) {
  const count = html.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one source match, found ${count}`);
  html = html.replace(before, after);
}

replaceExact(
  '</head>',
  String.raw`<!-- V500_MOBILE_LAYOUT_FIX_V1: S26-class landscape results containment and opt-in QA tools. -->
<style id="v500MobileLayoutFix">
  .results-card { box-sizing: border-box; }

  /* QA labs remain in the build, but normal players should never have debug
     controls covering Pull, Gust, or Zap. Append ?qa=1 to expose them. */
  html:not(.qa-tools-enabled) #visualLabToggle,
  html:not(.qa-tools-enabled) #audioLabToggle,
  html:not(.qa-tools-enabled) #visualLabPanel,
  html:not(.qa-tools-enabled) #audioLabPanel { display: none !important; }

  @media (max-width: 850px), (max-height: 540px) {
    #resultsOverlay {
      align-items: flex-start;
      box-sizing: border-box;
      overflow-x: hidden;
      overflow-y: auto;
      padding: max(6px, env(safe-area-inset-top)) max(6px, env(safe-area-inset-right)) max(6px, env(safe-area-inset-bottom)) max(6px, env(safe-area-inset-left));
    }
    .results-card {
      width: min(430px, 100%);
      max-height: calc(100vh - 12px);
      max-height: calc(100dvh - max(12px, env(safe-area-inset-top)) - max(12px, env(safe-area-inset-bottom)));
      overflow-y: auto;
      overscroll-behavior: contain;
      padding: 6px 10px 8px;
      border-radius: 14px;
    }
    .results-card h2 { font-size: 16px; line-height: 1.05; }
    .grade-stamp { margin: 1px 0; font-size: 25px; line-height: 1; }
    .results-stats { margin: 4px 0; padding: 6px 8px; font-size: 9px; line-height: 1.25; }
    .stage-breakdown { margin-top: 3px; padding-top: 3px; }
    .campaign-result { margin-top: 4px; padding: 5px 7px; font-size: 9px; line-height: 1.2; }
    .results-actions { gap: 5px; margin-top: 5px; }
    .results-actions .retry-btn { flex: 1 1 105px; min-height: 32px; padding: 7px 4px; font-size: 10px; line-height: 1.05; }
  }
</style>
</head>`,
  'mobile layout stylesheet'
);

replaceExact(
  '</body>',
  String.raw`<script>
// [SW:UI:QA_VISIBILITY] Diagnostic labs are opt-in in player-facing builds.
(function configureQaToolVisibility() {
  const params = new URLSearchParams(globalThis.location?.search || '');
  const requested = String(params.get('qa') || '').toLowerCase();
  const enabled = requested === '1' || requested === 'true' || params.get('bot') === 'true';
  globalThis.setQaToolsVisible = function setQaToolsVisible(visible = true) {
    document.documentElement.classList.toggle('qa-tools-enabled', Boolean(visible));
    return document.documentElement.classList.contains('qa-tools-enabled');
  };
  globalThis.setQaToolsVisible(enabled);
})();
</script>
</body>`,
  'QA tool visibility bootstrap'
);

requiredMarkers.forEach(required => {
  if (!html.includes(required)) throw new Error(`V5 mobile layout fix verification failed: missing ${required}`);
});

await writeFile(sourcePath, html, 'utf8');
console.log(`Applied V5 mobile layout fix to ${sourcePath}`);
