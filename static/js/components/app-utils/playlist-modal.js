// static/js/components/app-utils/playlist-modal.js
import { getPlaylists, savePlaylist } from "../app-storage/local-storage.js";
import { initPlaylists } from "../app-body/playlists/playlists.js";

export function initPlaylistModal(body) {
    const modalMarkup = document.createElement("div");
    modalMarkup.classList.add("create-playlist-modal", "hidden");
    modalMarkup.innerHTML = `
      <div class="modal-content">
        <h2>Create New Playlist</h2>
        <label>
          Name:
          <input type="text" class="playlist-name-input" placeholder="Enter a playlist name"/>
        </label>
        <div class="modal-actions">
          <span class="material-icons save-playlist-btn" title="Save Playlist">check</span>
          <span class="material-icons close-modal-btn" title="Cancel">close</span>
        </div>
      </div>
    `;

    body.appendChild(modalMarkup);

    const modal = modalMarkup;
    const saveIcon = modal.querySelector(".save-playlist-btn");
    const closeIcon = modal.querySelector(".close-modal-btn");
    const input = modal.querySelector(".playlist-name-input");

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            saveIcon.click();
        }
    });

    closeIcon.addEventListener("click", () => {
        modal.classList.add("hidden");
    });

    saveIcon.addEventListener("click", () => {
        const name = input.value.trim();
        if (name) {
            const playlists = getPlaylists();
            const exists = playlists.some(p => p.name.toLowerCase() === name.toLowerCase());
            if (exists) {
                alert("A playlist with this name already exists!");
                input.value = "";
            } else {
                savePlaylist(name);
                modal.classList.add("hidden");
                input.value = "";
                initPlaylists(body);
            }
        } else {
            alert("Input cannot be empty!");
        }
    });

    return modal;
}
