// static/js/components/app-navigation/router.js
import { initPlaylists } from "../app-body/playlists/playlists.js";
import { initSongs } from "../app-body/songs/songs.js";
import { initEditor } from "../app-body/editor/editor.js";
import { getSongs } from "../app-storage/local-storage.js";

export function initRouter() {
  window.addEventListener("popstate", (event) => {
    const body = document.querySelector(".app-body");
    const state = event.state;

    if (!state || state.screen === "playlists") {
      initPlaylists(body);
      return;
    }

    if (state.screen === "songs") {
      initSongs(body, state.playlistName);
      return;
    }

    if (state.screen === "editor") {
      const song = getSongs(state.playlistName).find(s => s.name === state.songName);
      initEditor(body, state.playlistName, song?.name || "", song?.content || "");
    }
  });
}