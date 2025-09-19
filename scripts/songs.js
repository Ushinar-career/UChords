import { initInputModal, initImportExport } from './utils.js';
import { getAppData, setAppData } from './storage.js';
import { initPlaylists } from './playlists.js';
import { initViewer } from './viewer.js';

// ==============================
// Initialization Logic
// ==============================
export function initSongsList(playlistName) {
  getAppData();
  renderSongsView(playlistName);
}
 
// ==============================
// Song Rendering Logic
// ============================== 
function renderSongsView(playlistName) {
  const createMainContent = document.querySelector('.main-content');
  createMainContent.innerHTML = '';
  const createButtonRow = document.createElement('div');
  createButtonRow.className = 'button-row';
  const createSongBtn = document.createElement('button');
  createSongBtn.className = 'create-song-btn border-btn';
  createSongBtn.innerHTML = '<h2>✚ Create Song</h2>';
  createSongBtn.addEventListener('click', () => {
    initInputModal({
      title: 'Create a Song',
      input: true,
      defaultValue: '',
      placeholder: 'Enter song name',
      buttons: [
        {
          label: 'Create',
          action: (name, warningEl) => {
            const trimmed = name?.trim();
            if (!trimmed) {
              warningEl.textContent = 'Please enter a song name.';
              warningEl.style.display = 'block';
              return false;
            }
            const data = getAppData();
            const playlist = data.playlists.find(p => p.name === playlistName);
            const exists = playlist?.songs.some(s => s.name.toLowerCase() === trimmed.toLowerCase());
            if (exists) {
              warningEl.textContent = `A song named "${trimmed}" already exists in this playlist.`;
              warningEl.style.display = 'block';
              return false;
            }
            if (playlist) {
              playlist.songs.push({ name: trimmed, content: 'Enter/Edit text here...'});
              setAppData(data);
              createSongCard(trimmed, songContainer);
              toggleEmptyMessage2();  
              enableSongDragAndDrop(songContainer, playlistName);
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
  const createBackBtn = document.createElement('button');
  createBackBtn.className = 'back-btn border-btn';
  createBackBtn.innerHTML = '<p>❮ Back</p>';
  createBackBtn.addEventListener('click', () => {
    createMainContent.innerHTML = `
      <div class="button-row">
        <button class="create-btn border-btn">
          <h2>✚ Create Playlist</h2>
        </button>
        <button class="import-btn border-btn">⬇ Import</button>
        <button class="export-btn border-btn">⬆ Export</button>
        <input type="file" class="import-input" accept=".json" style="display: none;"/>
      </div>
      <section class="playlist-container">
        <p class="empty-message">🎶 No Playlists yet. Create a playlist to get started.</p>
      </section>
    `;
    initPlaylists();
    initImportExport();
  });
  createMainContent.appendChild(createButtonRow);
  createButtonRow.appendChild(createSongBtn);
  createButtonRow.appendChild(createBackBtn);
  const songContainer = document.createElement('section');
  songContainer.className = 'song-container';
  const emptyMsg = document.createElement('p');
  emptyMsg.className = 'empty-message';
  emptyMsg.textContent = '🎶 No Songs yet. Create a Song to get started.';
  songContainer.appendChild(emptyMsg);
  createMainContent.appendChild(songContainer);
  addSong(playlistName);
  enableSongDragAndDrop(songContainer, playlistName);

  function addSong(name) {
    const data = getAppData();
    const playlist = data.playlists.find(p => p.name === name);
    playlist?.songs.forEach(song => createSongCard(song.name, songContainer));
  }
    
  function createSongCard(name, container) {
    const card = document.createElement('div');
    card.className = 'song-card';
    card.innerHTML = `
      <span class="song-name">${name}</span>
      <div class="card-actions">
        <span class="icon-btn rename-btn" title="Rename">✏️</span>
        <span class="icon-btn delete-btn" title="Delete">🗑️</span>
        <span class="icon-btn move-btn" title="Move/Reorder">🟰</span>
      </div>
    `;
    container.appendChild(card);
    toggleEmptyMessage2();
    const nameEl = card.querySelector('.song-name');
    nameEl.addEventListener('click', () => {
      const data = getAppData();
      const playlist = data.playlists.find(p => p.name === playlistName);
      const song = playlist?.songs.find(s => s.name === name);
      const content = song?.content || '';
      initViewer(playlistName, name, content);
    });
    const renameBtn = card.querySelector('.rename-btn');
    renameBtn.addEventListener('click', () => {
      initInputModal({
        title: 'Rename Song',
        input: true,
        defaultValue: name,
        placeholder: 'Enter new name',
        buttons: [
          {
            label: 'Rename',
            action: (newName, warningEl) => {
              const trimmed = newName?.trim();
              if (!trimmed || trimmed === name) {
                warningEl.textContent = 'Please enter a valid name.';
                warningEl.style.display = 'block';
                return false;
              }
              if (!renameSong(name, trimmed, playlistName)) {
                warningEl.textContent = `A song named "${trimmed}" already exists in this playlist.`;
                warningEl.style.display = 'block';
                return false;
              }
              renderSongsView(playlistName);
              return true;
            }
          },
          { label: 'Cancel', action: () => {} }
        ]
      });
    });

    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
      initInputModal({
        title: 'Delete Song',
        message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
        buttons: [
          {
            label: 'Delete',
            action: () => {
              if (deleteSong(name, playlistName)) {
                card.remove();
                toggleEmptyMessage2();
              }
            }
          },
          { label: 'Cancel', action: () => {} }
        ]
      });
    });
  }
 
  function toggleEmptyMessage2() {
    const container = document.querySelector('.song-container');
    const emptyMsg = container?.querySelector('.empty-message');
    const hasSongs = container?.querySelectorAll('.song-card').length > 0;
    if (emptyMsg) emptyMsg.style.display = hasSongs ? 'none' : 'block';
  }

  function renameSong(oldName, newName, playlistName) {
    const data = getAppData();
    const playlist = data.playlists.find(p => p.name === playlistName);
    if (!playlist) return false;
    const exists = playlist.songs.some(s => s.name.toLowerCase() === newName.toLowerCase());
    if (exists) return false;
    const song = playlist.songs.find(s => s.name === oldName);
    if (!song) return false;
    song.name = newName;
    setAppData(data);
    return true;
  }

  function deleteSong(name, playlistName) {
    const data = getAppData();
    const playlist = data.playlists.find(p => p.name === playlistName);
    if (!playlist) return false;
    const index = playlist.songs.findIndex(s => s.name === name);
    if (index === -1) return false;
    playlist.songs.splice(index, 1);
    setAppData(data);
    return true;
  }

  function enableSongDragAndDrop(container, playlistName) {
    let draggedCard = null;
    container.querySelectorAll('.move-btn').forEach(moveBtn => {
      moveBtn.addEventListener('mousedown', (e) => {
        const card = e.target.closest('.song-card');
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
      moveBtn.addEventListener('touchstart', (e) => {
        const card = e.target.closest('.song-card');
        if (!card) return;
        draggedCard = card;
        applyDraggingStyle(card);
        container.style.overflowY = 'hidden';
      });
      moveBtn.addEventListener('touchmove', (e) => {
        if (!draggedCard) return;
        const touchY = e.touches[0].clientY;
        const target = document.elementFromPoint(e.touches[0].clientX, touchY)?.closest('.song-card');
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
        updateSongOrder(container, playlistName);
        resetDraggingStyle(draggedCard);
        draggedCard = null;
        container.style.overflowY = 'auto';
      });
    });
    container.addEventListener('dragstart', (e) => {
      if (!draggedCard) return;
      e.dataTransfer.effectAllowed = 'move';
    });
    container.addEventListener('dragover', (e) => {
      if (!draggedCard) return;
      e.preventDefault();
      const target = e.target.closest('.song-card');
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
      if (!draggedCard) return;
      updateSongOrder(container, playlistName);
      resetDraggingStyle(draggedCard);
      draggedCard.removeAttribute('draggable');
      draggedCard = null;
    });

    function updateSongOrder(container, playlistName) {
      const newOrder = Array.from(container.querySelectorAll('.song-card'))
        .map(card => card.querySelector('.song-name').textContent);
      const data = getAppData();
      const playlist = data.playlists.find(p => p.name === playlistName);
      if (playlist) {
        playlist.songs.sort((a, b) => newOrder.indexOf(a.name) - newOrder.indexOf(b.name));
        setAppData(data);
      }
    }

    function applyDraggingStyle(card) {
      card.classList.add('dragging');
      card.style.opacity = '0.6';
      card.style.border = '2px dashed lightgray';
    }

    function resetDraggingStyle(card) {
      card.classList.remove('dragging');
      card.style.opacity = '1';
      card.style.border = 'inherit';
    }
  }
}



