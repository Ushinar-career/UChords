// static/js/components/app-body/editor/editor.js
import { initSongs } from "../songs/songs.js";

import { renderEditor } from "./editor-renderer.js";
import { setupEditorOptions, initChords } from "./editor-options.js";

export function initEditor(container, playlistName, songName, songContent) {
  const overlay = renderEditor(container, playlistName, songName, songContent);

  if (songContent) {
    const parsed = initChords(songContent);
    overlay.querySelector(".editor-content").innerHTML = parsed;
  }

  overlay.querySelector(".back-to-songs-btn").addEventListener("click", () => {
    overlay.remove();
    initSongs(container, playlistName);
  });

  setupEditorOptions(overlay, playlistName, songName);
}

