(() => {
  const cachePrefix = 'severe-weather-warning-shell-';
  const cacheVersion = 'v1';
  const identityFiles = new Set(['index.html', '404.html', 'qa-build.json', 'build-info.json']);
  const offlineAssetSuffixes = new Set(['offline.html', 'pwa/icons/severe-weather-warning.svg']);

  const pathnameFor = value => {
    if (typeof value === 'string') return new URL(value, 'https://severe-weather-warning.invalid/').pathname;
    return new URL(value.url).pathname;
  };
  const fileNameFor = value => pathnameFor(value).split('/').filter(Boolean).at(-1) || '';

  self.SevereWeatherPwaPolicy = Object.freeze({
    cachePrefix,
    cacheVersion,
    cacheName: `${cachePrefix}${cacheVersion}`,
    offlineAssets: [...offlineAssetSuffixes],
    isBuildIdentity(value) {
      return identityFiles.has(fileNameFor(value));
    },
    isOfflineAsset(value) {
      const pathname = pathnameFor(value).replace(/^\/+/, '');
      return [...offlineAssetSuffixes].some(asset => pathname === asset || pathname.endsWith(`/${asset}`));
    },
    isManagedCache(name) {
      return String(name).startsWith(cachePrefix);
    }
  });
})();
