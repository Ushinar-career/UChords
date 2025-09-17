import { getAppData, setAppData } from './storage.js';

export function initViewer(playlistName, songName, songContent) {
  const overlay = document.createElement('div');
  overlay.className = 'viewer';

  overlay.innerHTML = `
    <div class="header-bar">
      <h2>${songName}</h2>
    </div>
    <main class="main-content">
      <div class="button-row">
        <button class="border-btn scroll-btn">
          <h2>Scroll</h2>
        </button>
        <button class="border-btn speed-decrease" title="Decrease Speed">−</button>
        <input type="number" class="speed-input" min="0.1" max="3" step="0.1" value="1.5"/>
        <button class="border-btn speed-increase" title="Increase Speed">+</button>
        <button class="border-btn edit-btn">Edit</button>
        <button class="close-btn border-btn">Close</button>
      </div>
      <section class="viewer-container">
        <div class="viewer-content">
          <pre class="song-text" contenteditable="false">${songContent}</pre>
        </div>
      </section>
    </main>
  `;

  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('.close-btn');
  const speedInput = overlay.querySelector('.speed-input');
  const decreaseBtn = overlay.querySelector('.speed-decrease');
  const increaseBtn = overlay.querySelector('.speed-increase');
  const editBtn = overlay.querySelector('.edit-btn');
  const songText = overlay.querySelector('.song-text');

  closeBtn.addEventListener('click', () => overlay.remove());

  decreaseBtn.addEventListener('click', () => adjustSpeed(-0.1));
  increaseBtn.addEventListener('click', () => adjustSpeed(0.1));

  function adjustSpeed(delta) {
    let currentSpeed = parseFloat(speedInput.value);
    let newSpeed = Math.min(3, Math.max(0.1, currentSpeed + delta));
    speedInput.value = newSpeed.toFixed(1);
  }

  editBtn.addEventListener('click', () => {
    const isEditing = songText.getAttribute('contenteditable') === 'true';

    if (isEditing) {
      // Save mode
      songText.setAttribute('contenteditable', 'false');
      editBtn.textContent = 'Edit';
      saveSongContent(playlistName, songName, songText.textContent);
    } else {
      // Edit mode
      songText.setAttribute('contenteditable', 'true');
      songText.focus();
      editBtn.textContent = 'Save';
    }
  });
}

export function saveSongContent(playlistName, songName, content) {
  const data = getAppData();
  const playlist = data.playlists.find(p => p.name === playlistName);
  if (!playlist) return;

  const song = playlist.songs.find(s => s.name === songName);
  if (!song) return;

  song.content = content;
  setAppData(data);
}

export function getSongContent(playlistName, songName) {
  const data = getAppData();
  const playlist = data.playlists.find(p => p.name === playlistName);
  const song = playlist?.songs.find(s => s.name === songName);
  return song?.content || '';
}
