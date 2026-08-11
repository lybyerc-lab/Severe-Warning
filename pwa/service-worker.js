/* global SevereWeatherPwaPolicy */
importScripts('./pwa/cache-policy.js');

const policy = self.SevereWeatherPwaPolicy;
const scopeUrl = self.registration.scope;
const offlineUrl = new URL('./offline.html', scopeUrl).toString();
const offlineAssets = policy.offlineAssets.map(asset => new URL(`./${asset}`, scopeUrl).toString());

async function cacheOfflineShell() {
  const cache = await caches.open(policy.cacheName);
  await cache.addAll(offlineAssets);
}

async function freshIdentityResponse(request) {
  try {
    return await fetch(request, { cache: 'no-store' });
  } catch {
    if (request.mode === 'navigate') {
      return (await caches.match(offlineUrl)) || Response.error();
    }
    return Response.error();
  }
}

async function offlineAssetResponse(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request, { cache: 'no-store' });
  if (response.ok) {
    const cache = await caches.open(policy.cacheName);
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('install', event => {
  event.waitUntil(cacheOfflineShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames
      .filter(cacheName => policy.isManagedCache(cacheName) && cacheName !== policy.cacheName)
      .map(cacheName => caches.delete(cacheName)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate' || policy.isBuildIdentity(event.request)) {
    event.respondWith(freshIdentityResponse(event.request));
    return;
  }

  if (policy.isOfflineAsset(event.request)) {
    event.respondWith(offlineAssetResponse(event.request));
  }
});
