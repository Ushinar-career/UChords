import { getAppData, setAppData } from './storage.js';

// ==============================
// Initialization Logic
// ==============================
export function initViewer(playlistName, songName, songContent) {
  const overlay = renderViewer(songName, songContent);
  setupAutoScroll(overlay);
  setupEditLogic(overlay, playlistName, songName);
}

function renderViewer(songName, songContent) {
  const overlay = document.createElement('div');
  overlay.className = 'viewer';
  overlay.innerHTML = `
    <header class="header-bar">
      <div class="app-title">
        <i>${songName}</i>
      </div>
    </header>
    <main class="main-content">
      <div class="button-row">
        <button class="border-btn scroll-btn"><h2>Scroll</h2></button>
        <button class="border-btn speed-decrease" title="Decrease Speed">−</button>
        <input type="number" class="speed-input" min="0.1" max="5" step="0.1" value="1.0"/>
        <button class="border-btn speed-increase" title="Increase Speed">+</button>
        <button class="border-btn edit-btn">Edit</button>
        <button class="close-btn border-btn">❌</button>
      </div>
      <section class="viewer-container">
        <div class="viewer-content">
          <pre class="song-text" contenteditable="false">${songContent}</pre>
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
    let newSpeed = Math.min(5, Math.max(0.1, currentSpeed + delta));
    speedInput.value = newSpeed.toFixed(1);
    if (overlay._scrollInterval !== null) {
      clearInterval(overlay._scrollInterval);
      startAutoScroll();
    }
  }

  scrollBtn.addEventListener('click', () => {
    const isScrolling = overlay._scrollInterval !== null;
    if (isScrolling) {
      clearInterval(overlay._scrollInterval);
      overlay._scrollInterval = null;
      scrollBtn.querySelector('h2').textContent = 'Scroll';
    } else {
      scrollBtn.querySelector('h2').textContent = 'Stop';
      startAutoScroll();
    }
  });

  decreaseBtn.addEventListener('click', () => adjustSpeed(-0.1));
  increaseBtn.addEventListener('click', () => adjustSpeed(0.1));
  speedInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      let newSpeed = parseFloat(speedInput.value);
      if (!isNaN(newSpeed)) {
        newSpeed = Math.min(5, Math.max(0.1, newSpeed));
        speedInput.value = newSpeed.toFixed(1);
        if (overlay._scrollInterval !== null) {
          clearInterval(overlay._scrollInterval);
          startAutoScroll();
        }
      }
    }
  });
}

export function setupEditLogic(overlay, playlistName, songName) {
  const editBtn = overlay.querySelector('.edit-btn');
  const songText = overlay.querySelector('.song-text');
  const scrollBtn = overlay.querySelector('.scroll-btn');
  const closeBtn = overlay.querySelector('.close-btn');
  let currentFontSize = 16;

  songText.style.fontSize = `${currentFontSize}px`;
let lastTapTime = 0;
let zoomMode = false;
let startY = 0;

songText.addEventListener('touchstart', (e) => {
  const now = Date.now();
  const timeSinceLastTap = now - lastTapTime;

  if (timeSinceLastTap < 300 && e.touches.length === 1) {
    zoomMode = true;
    startY = e.touches[0].clientY;

    // Prevent scroll while zooming
    const viewerContainer = overlay.querySelector('.viewer-container');
    viewerContainer.style.overflow = 'hidden';
  }

  lastTapTime = now;
});

songText.addEventListener('touchmove', (e) => {
  if (!zoomMode || e.touches.length !== 1) return;

  const currentY = e.touches[0].clientY;
  const deltaY = currentY - startY;

  if (Math.abs(deltaY) > 5) {
    if (deltaY < 0) {
      // Dragging up → Zoom In
      currentFontSize = Math.min(currentFontSize + 1, 48);
    } else {
      // Dragging down → Zoom Out
      currentFontSize = Math.max(currentFontSize - 1, 8);
    }
    songText.style.fontSize = `${currentFontSize}px`;
    startY = currentY; // Update for smoother zoom
  }
});

songText.addEventListener('touchend', () => {
  if (zoomMode) {
    zoomMode = false;

    // Restore scroll
    const viewerContainer = overlay.querySelector('.viewer-container');
    viewerContainer.style.overflow = '';
  }
});

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
      // Save mode → disable editing
      songText.setAttribute('contenteditable', 'false');
      songText.style.cursor = 'zoom-in';
      editBtn.textContent = 'Edit';
      saveSongContent(songText.innerText);

      // Re-enable buttons
      scrollBtn.classList.remove('disabled');
      closeBtn.classList.remove('disabled');
    } else {
        // Edit mode → enable editing
      songText.setAttribute('contenteditable', 'true');
      songText.style.cursor = 'text';
      songText.style.fontSize = `${currentFontSize}px`;
      songText.focus();

      // Scroll viewer container to top
      const viewerContainer = overlay.querySelector('.viewer-container');
      viewerContainer.scrollTop = 0;

      // Move cursor to the beginning
      const range = document.createRange();
      const selection = window.getSelection();
      range.setStart(songText.firstChild || songText, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);

      editBtn.textContent = 'Save';
      scrollBtn.classList.add('disabled');
      closeBtn.classList.add('disabled');

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
