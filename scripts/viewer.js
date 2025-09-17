import { getAppData, setAppData } from './storage.js';
import { initAlertModal} from './utils.js';

export function initViewer(playlistName, songName, songContent) {
  const overlay = renderViewer(songName, songContent);
  setupAutoScroll(overlay);
  setupEditLogic(overlay, playlistName, songName);
}

function renderViewer(songName, songContent) {
  const overlay = document.createElement('div');
  overlay.className = 'viewer';
  overlay.innerHTML = `
    <div class="header-bar">
      <h1>${songName}</h1>
    </div>
    <main class="main-content">
      <div class="button-row">
        <button class="border-btn scroll-btn"><h2>Scroll</h2></button>
        <button class="border-btn speed-decrease" title="Decrease Speed">−</button>
        <input type="number" class="speed-input" min="0.1" max="3" step="0.1" value="1.0"/>
        <button class="border-btn speed-increase" title="Increase Speed">+</button>
        <button class="border-btn edit-btn">Edit\u2002\u200A</button>
        <button class="close-btn border-btn">Close</button>
      </div>
      <section class="viewer-container">
        <div class="viewer-content">
          <pre class="song-text" contenteditable="false" style='cursor: zoom-in;'>${songContent}</pre>
        </div>
      </section>
    </main>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('.close-btn').addEventListener('click', () => overlay.remove());
  return overlay;
}

function setupAutoScroll(overlay) {
  const scrollBtn = overlay.querySelector('.scroll-btn');
  const speedInput = overlay.querySelector('.speed-input');
  const decreaseBtn = overlay.querySelector('.speed-decrease');
  const increaseBtn = overlay.querySelector('.speed-increase');
  const songText = overlay.querySelector('.song-text');

  // Initialize shared scrollInterval on overlay
  overlay._scrollInterval = null;

  function startAutoScroll() {
    const viewerContainer = overlay.querySelector('.viewer-container');
    const speed = parseFloat(speedInput.value);
    let accumulatedScroll = 0;

    overlay._scrollInterval = setInterval(() => {
      accumulatedScroll += speed;
      const scrollStep = Math.floor(accumulatedScroll);
      if (scrollStep > 0) {
        viewerContainer.scrollTop += scrollStep;
        accumulatedScroll -= scrollStep;
      }
      if (viewerContainer.scrollTop + viewerContainer.clientHeight >= viewerContainer.scrollHeight) {
        clearInterval(overlay._scrollInterval);
        overlay._scrollInterval = null;
        scrollBtn.querySelector('h2').textContent = 'Scroll';
      }
    }, 100);
  }

  function adjustSpeed(delta) {
    let currentSpeed = parseFloat(speedInput.value);
    let newSpeed = Math.min(3, Math.max(0.1, currentSpeed + delta));
    speedInput.value = newSpeed.toFixed(1);
    if (overlay._scrollInterval !== null) {
      clearInterval(overlay._scrollInterval);
      startAutoScroll();
    }
  }

  scrollBtn.addEventListener('click', () => {
    const isEditing = songText.getAttribute('contenteditable') === 'true';
    if (isEditing) {
      initAlertModal('Please save your changes before scrolling.', 'Unsaved Changes');
      return;
    }
    const isScrolling = overlay._scrollInterval !== null;
    if (isScrolling) {
      clearInterval(overlay._scrollInterval);
      overlay._scrollInterval = null;
      scrollBtn.querySelector('h2').textContent = 'Scroll';
    } else {
      scrollBtn.querySelector('h2').textContent = 'Stop' + '\u2002\u200A';
      startAutoScroll();
    }
  });

  decreaseBtn.addEventListener('click', () => adjustSpeed(-0.1));
  increaseBtn.addEventListener('click', () => adjustSpeed(0.1));
}

function setupEditLogic(overlay, playlistName, songName) {
  const editBtn = overlay.querySelector('.edit-btn');
  const songText = overlay.querySelector('.song-text');
  const scrollBtn = overlay.querySelector('.scroll-btn');
  let currentFontSize = 16;

  songText.style.fontSize = `${currentFontSize}px`;

  function saveSongContent(content) {
    const data = getAppData();
    const playlist = data.playlists.find(p => p.name === playlistName);
    if (!playlist) return;
    const song = playlist.songs.find(s => s.name === songName);
    if (!song) return;
    song.content = content;
    setAppData(data);
  }

  editBtn.addEventListener('click', () => {
    const isEditing = songText.getAttribute('contenteditable') === 'true';

    // Stop scrolling if active
    if (overlay._scrollInterval !== null) {
      clearInterval(overlay._scrollInterval);
      overlay._scrollInterval = null;
      scrollBtn.querySelector('h2').textContent = 'Scroll';
    }

    if (isEditing) {
      songText.setAttribute('contenteditable', 'false');
      songText.style.cursor = 'zoom-in';
      editBtn.textContent = 'Edit' + '\u2002\u200A';
      saveSongContent(songText.innerText);
    } else {
      songText.setAttribute('contenteditable', 'true');
      songText.style.cursor = 'text';
      songText.style.fontSize = `${currentFontSize}px`;
      songText.focus();
      editBtn.textContent = 'Save';
    }
  });

songText.addEventListener('pointerdown', (e) => {
  const isEditing = songText.getAttribute('contenteditable') === 'true';
  if (isEditing) return;

  // Only allow zoom for mouse devices
  if (e.pointerType !== 'mouse') return;

  if (e.button === 0) {
    // Left click → Zoom In
    currentFontSize = Math.min(currentFontSize + 3, 48);
  } else if (e.button === 2) {
    // Right click → Zoom Out
    currentFontSize = Math.max(currentFontSize - 3, 8);
  }
  songText.style.fontSize = `${currentFontSize}px`;
});


  songText.addEventListener('contextmenu', (e) => e.preventDefault());
}
