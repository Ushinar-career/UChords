// static/js/components/app-utils/song-modal.js
import { getSongs, saveSong } from "../app-storage/local-storage.js";
import { initSongs } from "../app-body/songs/songs.js";

export function initSongModal(container, playlistName) {
  const modalMarkup = document.createElement("div");
  modalMarkup.classList.add("create-song-modal", "hidden");
  modalMarkup.innerHTML = `
    <div class="modal-content">
      <h2>Create New Song</h2>
      <label>
        Name:
        <input type="text" class="song-name-input" placeholder="Enter song name"/>
      </label>
      <label>
        Artist:
        <input type="text" class="song-artist-input" placeholder="Enter artist name"/>
      </label>
      <label>
        Country (optional):
        <input type="text" class="song-country-input" placeholder="Enter country"/>
      </label>
      <label>
        Language (optional):
        <input type="text" class="song-language-input" placeholder="Enter language"/>
      </label>
      <div class="modal-actions">
        <span class="material-icons save-song-btn" title="Save Song">check</span>
        <span class="material-icons close-song-modal-btn" title="Cancel" style="color:red;">close</span>
      </div>
    </div>
  `;

  container.appendChild(modalMarkup);

  const modal = modalMarkup;
  const saveIcon = modal.querySelector(".save-song-btn");
  const closeIcon = modal.querySelector(".close-song-modal-btn");
  const inputs = modal.querySelectorAll(".song-name-input, .song-artist-input, .song-country-input, .song-language-input");

  modal.classList.remove("hidden");
  modal.querySelector(".song-name-input").focus();

  inputs.forEach(input => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        saveIcon.click();
      }
    });
  });

  closeIcon.addEventListener("click", () => {
    modal.classList.add("hidden");
    inputs.forEach(input => input.value = "");
  });

  saveIcon.addEventListener("click", () => {
    const name = modal.querySelector(".song-name-input").value.trim();
    const artist = modal.querySelector(".song-artist-input").value.trim();
    const country = modal.querySelector(".song-country-input").value.trim();
    const language = modal.querySelector(".song-language-input").value.trim();

    if (!name) {
      alert("Song name is required!");
      return;
    }

    const songs = getSongs(playlistName);
    const exists = songs.some(
      s => s.name.toLowerCase() === name.toLowerCase() && s.artist?.toLowerCase() === artist.toLowerCase()
    );

    if (exists) {
      alert("This song already exists in the playlist!");
      modal.querySelector(".song-name-input").value = "";
    } else {
      saveSong(playlistName, { name, artist, country, language });
      modal.classList.add("hidden");
      inputs.forEach(input => input.value = "");
      initSongs(container, playlistName);
    }
  });
}