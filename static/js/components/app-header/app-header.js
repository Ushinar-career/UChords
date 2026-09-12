// static\js\components\app-header\app-header.js
import { getPlaylists } from "../app-storage/local-storage.js";
import { initPlaylists } from "../app-body/playlists/playlists.js";
import { initHomeScreen } from "../../screens/home.js";

export function initHeader(body) {
  const header = document.querySelector(".app-header");
  if (header) {
    header.innerHTML = `
      <div class="header-left">
        <h1>
          <img class="logo" src="static/assets/images/icon.png" alt="Logo" title="UChords">
          UChords
        </h1>
      </div>
      <div class="header-right">
        <span class="material-icons download-icon" title="Import Playlists">download</span>
        <span class="material-icons backup-icon disabled" title="Export Playlists">backup</span>
      </div>
    `;

    const exportBtn = header.querySelector(".backup-icon");
    const importBtn = header.querySelector(".download-icon");

    const playlists = getPlaylists();
    if (playlists.length > 0) {
      exportBtn.classList.remove("disabled");
    }

    exportBtn.addEventListener("click", () => {
      if (exportBtn.classList.contains("disabled")) return;
      const dataStr = JSON.stringify(getPlaylists(), null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "playlists.json";
      a.click();

      URL.revokeObjectURL(url);
    });

    importBtn.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json";
      input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = ev => {
          try {
            const imported = JSON.parse(ev.target.result);
            localStorage.setItem("playlistsData", JSON.stringify(imported));
            initPlaylists(body);
          } catch (err) {
            alert("Invalid JSON file");
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });
  }
      
  const homeBtn = header.querySelector(".logo");
  homeBtn.addEventListener("click", () => {  
  const loader = document.querySelector(".app-loader");
  loader.classList.remove("hidden")

  try {
    initHomeScreen();
    if (loader) {
      loader.classList.add("hidden");
    }
  } catch (error) {
    console.error("Error initializing home screen:", error);
  }
  });

}


