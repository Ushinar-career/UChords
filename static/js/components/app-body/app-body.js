// static/js/components/app-body/app-body.js
import { initPlaylists } from "../app-body/playlists/playlists.js";

export function initBody() {
  const body = document.querySelector(".app-body");
  if (body) {
    initPlaylists(body);
  }
}
