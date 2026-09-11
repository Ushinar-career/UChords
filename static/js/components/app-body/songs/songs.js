// static/js/components/app-body/songs/songs.js
import { renderSongsHTML, renderSongCards } from "./song-render.js";
import { attachSongOptions } from "./song-options.js";
import { initSongModal } from "../../app-utils/song-modal.js";
import { initPlaylists } from "../playlists/playlists.js";

export function initSongs(container, playlistName) {
  function rerender(targetContainer, targetPlaylist) {
    renderSongs(targetContainer, targetPlaylist);
  }

  function renderSongs(targetContainer, targetPlaylist) {
    targetContainer.innerHTML = renderSongsHTML(targetPlaylist);
    renderSongCards(targetContainer, targetPlaylist);
    attachSongOptions(targetContainer, targetPlaylist, rerender);

    const createBtn = targetContainer.querySelector(".create-song-btn");
    createBtn.addEventListener("click", () => {
      initSongModal(targetContainer, targetPlaylist);
    });

    const backBtn = targetContainer.querySelector(".back-to-playlists-btn");
    backBtn.addEventListener("click", () => {
      initPlaylists(targetContainer);
    });
  }

  renderSongs(container, playlistName);
}
