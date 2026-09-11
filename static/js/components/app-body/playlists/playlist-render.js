// static/js/components/app-body/playlists/playlist-render.js
import { getPlaylists } from "../../app-storage/local-storage.js";

export function renderPlaylistsHTML() {
  const playlists = getPlaylists();

  let html = `
    <div class="body-options-ribbon">
      <div class="create-playlist-btn">
        <span class="material-icons add-icon" title="Add Playlist">add</span>
        <h3>Create New Playlist</h3>
      </div>
    </div>
    <h3>All Playlists</h3>
    <div class="body-cards-container">
  `;

  if (!playlists || playlists.length === 0) {
    html += `<p class="empty-message">No Playlists Yet!</p>`;
  } else {
    playlists.forEach((playlist, index) => {
      html += `
        <div class="playlist-card" draggable="true" data-index="${index}">
          <div class="playlist-text">
            <h3>${playlist.name}</h3>
          </div>
          <div class="playlist-options">
            <span class="material-icons playlist-edit-btn" title="Rename">edit</span>
            <span class="material-icons playlist-delete-btn" title="Delete">delete</span>
            <span class="material-icons playlist-move-btn" title="Move">drag_indicator</span>
          </div>
        </div>
      `;
    });
  }

  html += `</div>`;
  return html;
}

