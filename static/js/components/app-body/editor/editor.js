// static/js/components/app-body/editor/editor.js
import { renderEditor } from "./editor-renderer.js";
import { setupEditorOptions } from "./editor-options.js";
import { initSongs } from "../songs/songs.js";

export function initEditor(container, playlistName, songName, songContent) {
  const overlay = renderEditor(container, playlistName, songName, songContent);

  // Back button logic stays here since it ties editor to songs view
  overlay.querySelector(".back-to-songs-btn").addEventListener("click", () => {
    overlay.remove();
    initSongs(container, playlistName);
  });

  // Delegate scroll + edit logic to editor-options
  setupEditorOptions(overlay, playlistName, songName);
}
