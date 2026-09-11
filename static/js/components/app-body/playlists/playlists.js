// static/js/components/app-body/playlists/playlists.js
import { renderPlaylistsHTML } from "./playlist-render.js";
import { attachPlaylistOptions } from "./playlist-options.js";
import { initPlaylistModal } from "../../app-utils/playlist-modal.js";

export function initPlaylists(body) {
  function rerender(targetBody) {
    renderPlaylists(targetBody);
  }

  function renderPlaylists(targetBody) {
    targetBody.innerHTML = renderPlaylistsHTML();

    const modal = initPlaylistModal(targetBody);
    const createBtn = targetBody.querySelector(".create-playlist-btn");
    createBtn.addEventListener("click", () => {
      modal.classList.remove("hidden");
      modal.querySelector(".playlist-name-input").focus();
    });

    attachPlaylistOptions(targetBody, rerender);
  }

  renderPlaylists(body);
}

