import { initImportExport } from './utils.js';
import { initPlaylists } from './playlists.js';

document.addEventListener('DOMContentLoaded', () => {
  initImportExport();
  initPlaylists();
});

if ('serviceWorker' in navigator) { 
  navigator.serviceWorker.register('./service-worker.js') 
  .then(reg => console.log('Service Worker registered:', reg)) 
  .catch(err => console.error('Service Worker registration failed:', err
  ));
}