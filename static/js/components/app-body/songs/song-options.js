// static/js/components/app-body/songs/song-options.js
import { getSongs, getPlaylists, setPlaylists } from "../../app-storage/local-storage.js";
import { initEditor } from "../editor/editor.js";

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll(".song-card:not(.dragging)")];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

export function attachSongOptions(container, playlistName, rerenderFn) {
  const cardsContainer = container.querySelector(".body-cards-container");

  cardsContainer.querySelectorAll(".song-card").forEach(card => {
    const name = card.querySelector("h3").textContent;
    const artist = card.querySelector(".song-text p").textContent.replace("Artist: ", "");
    const song = getSongs(playlistName).find(s => s.name === name && s.artist === artist);

    // Delete
    card.querySelector(".song-delete-btn").addEventListener("click", e => {
      e.stopPropagation();
      if (!confirm(`Delete "${name}" by "${artist}"?`)) return;

      const updatedSongs = getSongs(playlistName).filter(s => !(s.name === name && s.artist === artist));
      const playlists = getPlaylists();
      const updatedPlaylists = playlists.map(p =>
        p.name === playlistName ? { ...p, songs: updatedSongs } : p
      );
      setPlaylists(updatedPlaylists);
      rerenderFn(container, playlistName);
    });

    // Edit
    card.querySelector(".song-edit-btn").addEventListener("click", e => {
      e.stopPropagation();
      const newName = prompt("Enter new name:", song.name);
      if (!newName || !newName.trim()) return;

      const trimmedName = newName.trim();
      const exists = getSongs(playlistName).some(s => s.name === trimmedName && s.artist === song.artist);
      if (exists) {
        alert("A song with this name already exists in this playlist!");
      }

      const newArtist = prompt("Enter new artist:", song.artist || "");
      const newCountry = prompt("Enter new country:", song.country || "");
      const newLanguage = prompt("Enter new language:", song.language || "");

      const updatedSongs = getSongs(playlistName).map(s =>
        s.name === song.name && s.artist === song.artist
          ? {
              ...s,
              name: trimmedName,
              artist: newArtist.trim(),
              country: newCountry.trim(),
              language: newLanguage.trim()
            }
          : s
      );

      const playlists = getPlaylists();
      const updatedPlaylists = playlists.map(p =>
        p.name === playlistName ? { ...p, songs: updatedSongs } : p
      );
      setPlaylists(updatedPlaylists);
      rerenderFn(container, playlistName);
    });

    // Drag start/end
    const moveBtn = card.querySelector(".song-move-btn");
    moveBtn.style.cursor = "grab";
    moveBtn.addEventListener("mousedown", e => {
      e.stopPropagation();
      card.style.cursor = "grabbing";
    });
    card.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", card.dataset.index);
      card.classList.add("dragging");
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      card.style.cursor = "default";
    });

    // Click to open editor
    card.addEventListener("click", () => {
      initEditor(container, playlistName, song.name, song.content || "");
    });
  });

  // Drag/drop container logic
  cardsContainer.addEventListener("dragover", e => {
    e.preventDefault();
    const dragging = cardsContainer.querySelector(".dragging");
    const afterElement = getDragAfterElement(cardsContainer, e.clientY);
    if (afterElement == null) {
      cardsContainer.appendChild(dragging);
    } else {
      cardsContainer.insertBefore(dragging, afterElement);
    }
  });

  cardsContainer.addEventListener("drop", () => {
    const newOrder = Array.from(cardsContainer.querySelectorAll(".song-card")).map(card => {
      const name = card.querySelector("h3").textContent;
      const artist = card.querySelector(".song-text p").textContent.replace("Artist: ", "");
      const country = card.querySelector(".song-data p:nth-child(1)").textContent.replace("Country: ", "");
      const language = card.querySelector(".song-data p:nth-child(2)").textContent.replace("Language: ", "");
      const song = getSongs(playlistName).find(s => s.name === name && s.artist === artist);
      return { name, artist, country, language, content: song?.content || "" };
    });

    const playlists = getPlaylists();
    const updatedPlaylists = playlists.map(p =>
      p.name === playlistName ? { ...p, songs: newOrder } : p
    );
    setPlaylists(updatedPlaylists);
    rerenderFn(container, playlistName);
  });
}
