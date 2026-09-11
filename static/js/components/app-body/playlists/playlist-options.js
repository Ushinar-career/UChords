// static/js/components/app-body/playlists/playlist-options.js
import { getPlaylists } from "../../app-storage/local-storage.js";
import { initSongs } from "../../app-body/songs/songs.js";

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll(".playlist-card:not(.dragging)")];
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

export function attachPlaylistOptions(body, rerenderFn) {
  body.querySelectorAll(".playlist-card").forEach(card => {
    const playlistName = card.querySelector("h3").textContent;

    // Delete
    card.querySelector(".playlist-delete-btn").addEventListener("click", e => {
      e.stopPropagation();
      if (!confirm(`Delete "${playlistName}"?`)) return;
      const updated = getPlaylists().filter(p => p.name !== playlistName);
      localStorage.setItem("playlists", JSON.stringify(updated));
      rerenderFn(body);
    });

    // Edit
    card.querySelector(".playlist-edit-btn").addEventListener("click", e => {
      e.stopPropagation();
      const newName = prompt("Enter new name:", playlistName);
      if (newName && newName.trim()) {
        const updated = getPlaylists().map(p =>
          p.name === playlistName ? { name: newName.trim() } : p
        );
        localStorage.setItem("playlists", JSON.stringify(updated));
        rerenderFn(body);
      }
    });

    // Drag start/end
    const moveBtn = card.querySelector(".playlist-move-btn");
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

    // Click to open songs
    card.addEventListener("click", () => {
      initSongs(body, playlistName);
    });
  });

  // Drag/drop container logic
  const container = body.querySelector(".body-cards-container");
  container.addEventListener("dragover", e => {
    e.preventDefault();
    const dragging = container.querySelector(".dragging");
    const afterElement = getDragAfterElement(container, e.clientY);
    if (afterElement == null) {
      container.appendChild(dragging);
    } else {
      container.insertBefore(dragging, afterElement);
    }
  });

  container.addEventListener("drop", () => {
    const newOrderNames = Array.from(container.querySelectorAll(".playlist-card"))
      .map(card => card.querySelector("h3").textContent);

    const playlists = getPlaylists();
    const updated = newOrderNames.map(name => playlists.find(p => p.name === name));

    localStorage.setItem("playlists", JSON.stringify(updated.reverse()));
    rerenderFn(body);
  });
}
