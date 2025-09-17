import { initImportExport } from './utils.js';
import { initPlaylists } from './playlists.js';

document.addEventListener('DOMContentLoaded', () => {
  initImportExport();
  initPlaylists();
});

// ✅ handle going back to playlists
document.addEventListener('songs:close', () => {
  const mainContent = document.querySelector('.main-content');
  mainContent.innerHTML = `
    <div class="button-row">
      <button class="create-btn border-btn">
        <h2>+ Create Playlist</h2>
      </button>
      <button class="import-btn border-btn">Import</button>
      <button class="export-btn border-btn">Export</button>
      <input type="file" class="import-input" accept=".zip" style="display: none;"/>
    </div>
    <section class="playlist-container">
      <p class="empty-message">No Playlists yet. Create a playlist to get started.</p>
    </section>
  `;
  initImportExport();
  initPlaylists();
});
