import { initInputModal, toggleEmptyMessage, updateExportButtonState } from './utils.js';
import { getAppData, setAppData } from './storage.js';
import { initSongsList } from './songs.js';

export function initPlaylists() {
    createPlaylist();
    renderPlaylistsView();
}

function createPlaylist() {
  const createBtn = document.querySelector('.create-btn');
  createBtn.addEventListener('click', () => {
    initInputModal({
      title: 'Create a Playlist',
      input: true,
      defaultValue: '',
      placeholder: 'Enter playlist name',
      buttons: [
        {
          label: 'Create',
          action: (name, warningEl) => {
            const trimmed = name?.trim();
            if (!trimmed) {
                warningEl.textContent = 'Please enter a playlist name.';
                warningEl.style.display = 'block';
                return false;
            }
            if (!addPlaylist(trimmed)) {
                warningEl.textContent = `A playlist named "${trimmed}" already exists.`;
                warningEl.style.display = 'block';
                return false;
            }            
          }
        },
        {
          label: 'Cancel',
          action: () => {}
        }
      ]
    });
  });

  function addPlaylist(name) {
    const data = getAppData();
    const exists = data.playlists.some(p => p.name.toLowerCase() === name.toLowerCase());
    if (exists) return false;
    data.playlists.push({ name, songs: [] });
    setAppData(data);
    renderPlaylistsView();
    return true;
  }
}

export function renderPlaylistsView() {
  const container = document.querySelector('.playlist-container');
  if (!container) return;
  const emptyMessage = container.querySelector('.empty-message');
  container.innerHTML = '';
  if (emptyMessage) container.appendChild(emptyMessage);
  const playlists = getAppData().playlists;
  playlists.forEach(playlist => createPlaylistCard(playlist.name, container));

  function createPlaylistCard(name, container) {
    if (!container || !name) return;
    const card = document.createElement('div');
    card.className = 'playlist-card';
    card.innerHTML = `
      <span class="playlist-name">${name}</span>
      <div class="card-actions">
        <span class="icon-btn rename-btn" title="Rename">✏️</span>
        <span class="icon-btn delete-btn" title="Delete">🗑️</span>
        <span class="icon-btn move-btn" title="Move/Reorder">🟰</span>
      </div>
    `;
    container.appendChild(card);
    toggleEmptyMessage();
    const nameEl = card.querySelector('.playlist-name');
    nameEl.addEventListener('click', () => {
      initSongsList(name);
    });
    const renameBtn = card.querySelector('.rename-btn');
    renameBtn.addEventListener('click', () => {
      initInputModal({
        title: 'Rename Playlist',
        input: true,
        defaultValue: name,
        placeholder: 'Enter new name',
        buttons: [
          {
            label: 'Rename',
            action: (newName, warningEl) => {
              const trimmed = newName?.trim();
              if (!trimmed) {
                warningEl.textContent = 'Please enter a valid name.';
                warningEl.style.display = 'block';
                return false;
              }
              if (!renamePlaylist(name, trimmed)) {
                warningEl.textContent = `A playlist named "${trimmed}" already exists.`;
                warningEl.style.display = 'block';
                return false;
              }
            }
          },
          {
            label: 'Cancel',
            action: () => {}
          }
        ]
      });
    });
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
      initInputModal({
        title: 'Delete Playlist',
        message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
        input: false,
        buttons: [
          {
            label: 'Delete',
            action: () => deletePlaylist(name)
          },
          {
            label: 'Cancel',
            action: () => {}
          }
        ]
      });
    });
  }
  enablePlaylistDragAndDrop(container);
  updateExportButtonState();
}

function deletePlaylist(name) {
  const data = getAppData();
  const index = data.playlists.findIndex(p => p.name === name);
  if (index === -1) return;

  data.playlists.splice(index, 1);
  setAppData(data);
  toggleEmptyMessage();
  renderPlaylistsView();
}

function renamePlaylist(oldName, newName) {
  const data = getAppData();
  const exists = data.playlists.some(p => p.name.toLowerCase() === newName.toLowerCase());
  if (exists) return false;

  const playlist = data.playlists.find(p => p.name === oldName);
  if (!playlist) return false;

  playlist.name = newName;
  setAppData(data);
  renderPlaylistsView();
  return true;
}

function enablePlaylistDragAndDrop(container) {
  let draggedCard = null;
  container.querySelectorAll('.move-btn').forEach(moveBtn => {
    moveBtn.addEventListener('mousedown', (e) => {
      const card = e.target.closest('.playlist-card');
      if (!card) return;
      draggedCard = card;
      applyDraggingStyle(card);
      card.setAttribute('draggable', 'true');
    });
    moveBtn.addEventListener('mouseup', () => {
      if (draggedCard) {
        resetDraggingStyle(draggedCard);
        draggedCard.removeAttribute('draggable');
        draggedCard = null;
      }
    });
  });
  container.addEventListener('dragstart', (e) => {
    if (!draggedCard) return;
    e.dataTransfer.effectAllowed = 'move';
  });
  container.addEventListener('dragover', (e) => {
    if (!draggedCard || !(draggedCard instanceof Node)) return;
    e.preventDefault();
    const target = e.target.closest('.playlist-card');
    if (target && target !== draggedCard) {
      const bounding = target.getBoundingClientRect();
      const offset = bounding.y + bounding.height / 2;
      container.insertBefore(
        draggedCard,
        e.clientY < offset ? target : target.nextSibling
      );
    }
  });
  container.addEventListener('drop', () => {
    if (!draggedCard || !(draggedCard instanceof Node)) return;
    updatePlaylistOrder(container);
    resetDraggingStyle(draggedCard);
    draggedCard.removeAttribute('draggable');
    draggedCard = null;
  });
  container.querySelectorAll('.move-btn').forEach(moveBtn => {
    moveBtn.addEventListener('touchstart', (e) => {
      const card = e.target.closest('.playlist-card');
      if (!card) return;
      draggedCard = card;
      applyDraggingStyle(card);
      container.style.overflowY = 'hidden';
    });
    moveBtn.addEventListener('touchmove', (e) => {
      if (!draggedCard) return;
      const touchY = e.touches[0].clientY;
      const target = document.elementFromPoint(e.touches[0].clientX, touchY)?.closest('.playlist-card');
      if (target && target !== draggedCard) {
        const bounding = target.getBoundingClientRect();
        const offset = bounding.y + bounding.height / 2;
        container.insertBefore(
          draggedCard,
          touchY < offset ? target : target.nextSibling
        );
      }
    });
    moveBtn.addEventListener('touchend', () => {
      if (!draggedCard) return;
      updatePlaylistOrder(container);
      resetDraggingStyle(draggedCard);
      draggedCard = null;
      container.style.overflowY = 'auto';
    });
  });

  function updatePlaylistOrder(container) {
    const newOrder = Array.from(container.querySelectorAll('.playlist-card'))
      .map(card => card.querySelector('.playlist-name').textContent);
    const data = getAppData();
    data.playlists.sort((a, b) => {
      return newOrder.indexOf(a.name) - newOrder.indexOf(b.name);
    });
    setAppData(data);
    renderPlaylistsView();
  }

  function applyDraggingStyle(card) {
    card.classList.add('dragging');
    card.style.opacity = '0.6';
    card.style.border = '2px dashed wheat';
  }

  function resetDraggingStyle(card) {
    card.classList.remove('dragging');
    card.style.opacity = '1';
    card.style.border = 'inherit';
  }
}


