const CACHE_NAME = 'uchords-cache-data';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './scripts/init.js',
  './scripts/playlists.js',
  './scripts/songs.js',
  './scripts/storage.js',
  './scripts/utils.js',
  './scripts/viewer.js',
  './assets/images/icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
