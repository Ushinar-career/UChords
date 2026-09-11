// static/js/components/app-body/songs/song-render.js
import { getSongs } from "../../app-storage/local-storage.js";

export function renderSongsHTML(playlistName) {
  return `
    <div class="body-options-ribbon">
      <span class="material-icons back-to-playlists-btn" title="Back to playlists">arrow_back</span>
      <div class="create-song-btn">
        <span class="material-icons add-icon" title="Create Song">add</span>
        <h3>Create Song</h3>
      </div>
    </div>
    <h3 class="playlist-name-ribbon">Showing playlist: <i>${playlistName}</i></h3>
    <div class="body-cards-container"></div>
  `;
}

export function renderSongCards(container, playlistName) {
  const songs = getSongs(playlistName);
  const cardsContainer = container.querySelector(".body-cards-container");

  if (!songs || songs.length === 0) {
    cardsContainer.innerHTML = '<p class="empty-message">No Songs Yet!</p>';
    return;
  }

  cardsContainer.innerHTML = "";
  songs.forEach((song, index) => {
    const card = document.createElement("div");
    card.classList.add("song-card");
    card.setAttribute("draggable", "true");
    card.dataset.index = index;

    card.innerHTML = `
      <div class="song-text">
        <h3>${song.name}</h3>
        <p>Artist: ${song.artist || ""}</p>
        <div class="song-data">
          <p>Country: ${song.country || "N/A"}</p>
          <p>Language: ${song.language || "N/A"}</p>
        </div>
      </div>
      <div class="song-options">
        <span class="material-icons song-edit-btn" title="Edit">edit</span>
        <span class="material-icons song-delete-btn" title="Delete">delete</span>
        <span class="material-icons song-move-btn" title="Move">drag_indicator</span>
      </div>
    `;
    cardsContainer.appendChild(card);
  });
}
