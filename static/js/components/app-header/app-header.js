// static\js\components\app-header\app-header.js
import { getPlaylists } from "../app-storage/local-storage.js";
import { initPlaylists } from "../app-body/playlists/playlists.js";
import { initHomeScreen } from "../../screens/home.js";

export function initHeader(body) {
  const header = document.querySelector(".app-header");
  if (header) {
    header.innerHTML = `
      <div class="header-left">
        <img class="logo" src="./static/assets/images/icon.png" alt="Logo" title="UChords Home">
        <h1>
          UChords
        </h1>
      </div>
      <div class="header-right">
        <span class="material-icons theme-icon" title="Switch to Light Theme">light_mode</span>
        <span class="material-icons import-icon" title="Import Playlists">download</span>
        <span class="material-icons export-icon disabled" title="Export Playlists">backup</span>
        <span class="material-icons help-icon" title="help">info</span>
      </div>
    `;

    const exportBtn = header.querySelector(".export-icon");
    const importBtn = header.querySelector(".import-icon");

    const playlists = getPlaylists();
    if (playlists) {
      if (playlists.length > 0) {
        exportBtn.classList.remove("disabled");
      }
    }


    exportBtn.addEventListener("click", async () => {
  if (exportBtn.classList.contains("disabled")) return;

  const playlistsArray = getPlaylists();
  const dataObj = { playlists: playlistsArray };
  const dataStr = JSON.stringify(dataObj, null, 2);

  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: "playlists.json",
        types: [
          {
            description: "JSON Files",
            accept: { "application/json": [".json"] },
          },
        ],
      });

      const writable = await handle.createWritable();
      await writable.write(dataStr);
      await writable.close();

      alert("Playlists exported successfully!");
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed: " + err.message);
    }
  } else {
    try {
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "playlists.json";
      a.click();

      URL.revokeObjectURL(url);
      alert("Playlists exported (saved to Downloads folder).");
    } catch (err) {
      console.error("Fallback export failed:", err);
      alert("Export failed: " + err.message);
    }
  }
});


importBtn.addEventListener("click", () => {
  const proceed = confirm("Importing will remove your current playlists. Do you want to continue?");
  if (!proceed) return;

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
        initHomeScreen();
      } catch (err) {
        alert("Failed to import playlists: " + err.message);
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
