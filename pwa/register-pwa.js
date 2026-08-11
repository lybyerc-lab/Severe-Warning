const productName = 'Severe Weather Warning';
const pwaState = window.__SEVERE_WEATHER_PWA__ = {
  status: 'unsupported',
  sourceIdentity: null,
  serviceWorkerScope: null
};

function applySourceIdentity(identity) {
  pwaState.sourceIdentity = identity;
  document.documentElement.dataset.severeWeatherBuild = identity;
  document.title = `${productName} · ${identity}`;
}

async function loadSourceIdentity() {
  const response = await fetch('./qa-build.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`qa-build.json returned ${response.status}`);
  const build = await response.json();
  if (!build.shortSha || !build.runNumber) throw new Error('qa-build.json is missing deterministic build identity');
  return `QA #${build.runNumber} · ${build.shortSha}`;
}

async function loadFallbackIdentity() {
  const response = await fetch('./build-info.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`build-info.json returned ${response.status}`);
  const build = await response.json();
  if (!build.version || !build.sourceSha256) throw new Error('build-info.json is missing deterministic source identity');
  return `v${build.version} · ${build.sourceSha256.slice(0, 7)}`;
}

async function identifySource() {
  try {
    applySourceIdentity(await loadSourceIdentity());
  } catch {
    try {
      applySourceIdentity(await loadFallbackIdentity());
    } catch {
      applySourceIdentity('source identity unavailable');
    }
  }
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;

  pwaState.status = 'registering';
  const registration = await navigator.serviceWorker.register('./service-worker.js', {
    scope: './',
    updateViaCache: 'none'
  });
  await registration.update();
  pwaState.status = 'registered';
  pwaState.serviceWorkerScope = registration.scope;
}

void identifySource();
window.addEventListener('load', () => {
  void registerServiceWorker().catch(error => {
    pwaState.status = 'registration-failed';
    pwaState.error = String(error.message || error);
  });
});
