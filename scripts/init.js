import { initImportExport } from './utils.js';
import { initPlaylists } from './playlists.js';


// ==============================
// App Loading Logic
// ==============================
window.addEventListener('load', () => {
  document.body.classList.add('app-loaded');
});

document.addEventListener('DOMContentLoaded', () => {
  initImportExport();
  initPlaylists();
// Service worker registration for PWA
  if ('serviceWorker' in navigator) { 
    navigator.serviceWorker.register('./service-worker.js') 
    .then(reg => console.log('Service Worker registered:', reg)) 
    .catch(err => console.error('Service Worker registration failed:', err
    ));
  }
});

