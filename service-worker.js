// service-worker.js
const CACHE_NAME = 'uchords-cache-data';
const urlsToCache = [
  "./static/assets/images/favicon.png",
  "./static/assets/images/icon.png",
  "./static/assets/fonts/Surfer.ttf",
  "./static/assets/fonts/fonts_local.woff2",
  "./static/assets/fonts/Quicksand.ttf",
  "./static/js/main.js",
  "./static/js/screens/home.js",
  "./static/js/components/app-body/app-body.js",
  "./static/js/components/app-body/editor/editor.js",
  "./static/js/components/app-body/editor/editor-renderer.js",
  "./static/js/components/app-body/editor/editor-options/editor-options.js",
  "./static/js/components/app-body/songs/song-render.js",
  "./static/js/components/app-body/songs/song-options.js",
  "./static/js/components/app-body/songs/songs.js",
  "./static/js/components/app-body/playlists/playlist-options.js",
  "./static/js/components/app-body/playlists/playlist-render.js",
  "./static/js/components/app-body/playlists/playlists.js",
  "./static/js/components/app-header/app-header.js",
  "./static/js/components/app-storage/local-storage.js",
  "./static/js/components/app-footer/app-footer.js",
  "./static/js/components/app-utils/playlist-modal.js",
  "./static/js/components/app-utils/song-modal.js",
  "./static/js/components/app-navigation/navigation.js",
  "./static/js/components/app-navigation/router.js",
  "./static/css/global.css",
  "./static/css/app-header.css",
  "./static/css/utils.css",
  "./static/css/app-body.css"
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
