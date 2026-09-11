// static/js/components/app-body/editor/editor.js
import { getPlaylists, setPlaylists } from "../../app-storage/local-storage.js";
import { initSongs } from "../songs/songs.js";

export function initEditor(container, playlistName, songName, songContent) {
  const overlay = renderEditor(container, playlistName, songName, songContent);
  setupAutoScroll(overlay);
  setupEditLogic(overlay, playlistName, songName);
}

function renderEditor(container, playlistName, songName, songContent) {
  container.innerHTML = "";
  const overlay = document.createElement("div");
  overlay.className = "editor";
  overlay.innerHTML = `
    <div class="editor-options">
      <span class="material-icons back-to-songs-btn" title="Back to songs">arrow_back</span>
      <span class="editor-scroll-btn scroll-inactive"><h3>Auto Scroll</h3></span>
      <div class="editor-scroll-options">
        <span class="material-icons speed-decrease" title="Decrease Speed">remove</span>
        <input type="number" class="speed-input" min="0.1" max="5" step="0.1" value="1.0"/>
        <span class="material-icons speed-increase" title="Increase Speed">add</span>
      </div>
      <span class="material-icons edit-btn" title="Edit Song">edit</span>
      <span class="material-icons fullscreen-btn" title="Full Screen editor">open_in_full</span>
    </div>
    <h3 class="song-name-ribbon">Showing song: <i>${songName}</i></h3>
    <div class="editor-content">
      <pre class="editor-text" contenteditable="false">${songContent || "No content yet."}</pre>
    </div>
  `;
  container.appendChild(overlay);

  overlay.querySelector(".back-to-songs-btn").addEventListener("click", () => {
    overlay.remove();
    initSongs(container, playlistName);
  });
  return overlay;
}

function setScrollButtonState(scrollBtn, isScrolling) {
  if (isScrolling) {
    scrollBtn.innerHTML = `<h3>Stop Scroll</h3>`;
    scrollBtn.classList.add("scroll-active");
    scrollBtn.classList.remove("scroll-inactive");
  } else {
    scrollBtn.innerHTML = `<h3>Auto Scroll</h3>`;
    scrollBtn.classList.add("scroll-inactive");
    scrollBtn.classList.remove("scroll-active");
  }
}

function setupAutoScroll(overlay) {
  const scrollBtn = overlay.querySelector(".editor-scroll-btn");
  const speedInput = overlay.querySelector(".speed-input");
  const decreaseBtn = overlay.querySelector(".speed-decrease");
  const increaseBtn = overlay.querySelector(".speed-increase");
  const editorContainer = overlay.querySelector(".editor-content");
  const editorText = overlay.querySelector(".editor-text");

  overlay._scrollInterval = null;
  overlay._isEditing = false;

  function startAutoScroll() {
    const speed = parseFloat(speedInput.value);
    let accumulatedScroll = 0;

    overlay._scrollInterval = setInterval(() => {
      accumulatedScroll += speed;
      const scrollStep = Math.floor(accumulatedScroll);
      if (scrollStep > 0) {
        editorText.scrollTop += scrollStep;
        accumulatedScroll -= scrollStep;
      }

      if (editorText.scrollTop + editorText.clientHeight >= editorText.scrollHeight) {
        clearInterval(overlay._scrollInterval);
        overlay._scrollInterval = null;
        setScrollButtonState(scrollBtn, false);
        updateScrollButtonState(overlay);
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

  function setupSpeedOptions(button, delta) {
    let holdTimeout;
    let holdInterval;

    const start = (e) => {
      e.preventDefault();
      adjustSpeed(delta);
      holdTimeout = setTimeout(() => {
        holdInterval = setInterval(() => adjustSpeed(delta), 100);
      }, 300);
    };

    const stop = () => {
      clearTimeout(holdTimeout);
      clearInterval(holdInterval);
    };

    button.addEventListener("mousedown", start);
    button.addEventListener("touchstart", start);
    ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach((evt) => {
      button.addEventListener(evt, stop);
    });
  }

  setupSpeedOptions(decreaseBtn, -0.1);
  setupSpeedOptions(increaseBtn, +0.1);

  scrollBtn.addEventListener("click", () => {
    if (scrollBtn.disabled) return;
    const isScrolling = overlay._scrollInterval !== null;
    if (isScrolling) {
      clearInterval(overlay._scrollInterval);
      overlay._scrollInterval = null;
      setScrollButtonState(scrollBtn, false);
    } else {
      startAutoScroll();
      setScrollButtonState(scrollBtn, true);
    }
  });

  speedInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
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

  editorContainer.addEventListener("scroll", () => updateScrollButtonState(overlay));
  updateScrollButtonState(overlay);
  window.addEventListener("resize", () => updateScrollButtonState(overlay));
}

function updateScrollButtonState(overlay) {
  const editorText = overlay.querySelector(".editor-text");
  const scrollBtn = overlay.querySelector(".editor-scroll-btn");

  if (!editorText) return;

  if (overlay._isEditing) {
    scrollBtn.classList.add("disabled");
    scrollBtn.disabled = true;
    return;
  }

  const isScrollable = editorText.scrollHeight > editorText.clientHeight;

  if (isScrollable) {
    scrollBtn.classList.remove("disabled");
    scrollBtn.disabled = false;
  } else {
    scrollBtn.classList.add("disabled");
    scrollBtn.disabled = true;
  }
}

function setupEditLogic(overlay, playlistName, songName) {
  const editBtn = overlay.querySelector(".edit-btn");
  const songText = overlay.querySelector(".editor-text");
  const scrollBtn = overlay.querySelector(".editor-scroll-btn");
  const backBtn = overlay.querySelector(".back-to-songs-btn");
  let currentFontSize = 16;

  songText.style.fontSize = `${currentFontSize}px`;

  function sanitizeContent(raw) {
    const stripped = raw.replace(/<\/?[^>]+(>|$)/g, "");
    return stripped.replace(/\r?\n/g, "\n");
  }

  function saveSongContent(content) {
    const playlists = getPlaylists();
    const updatedPlaylists = playlists.map((p) => {
      if (p.name === playlistName) {
        const updatedSongs = p.songs.map((s) =>
          s.name === songName ? { ...s, content: sanitizeContent(content) } : s
        );
        return { ...p, songs: updatedSongs };
      }
      return p;
    });
    setPlaylists(updatedPlaylists);
  }

  songText.addEventListener("paste", (event) => {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  });

  editBtn.addEventListener("click", () => {
    const isEditing = songText.getAttribute("contenteditable") === "true";

    if (overlay._scrollInterval !== null) {
      clearInterval(overlay._scrollInterval);
      overlay._scrollInterval = null;
      setScrollButtonState(scrollBtn, false);
    }

    if (isEditing) {
      overlay._isEditing = false;
      songText.setAttribute("contenteditable", "false");
      songText.style.cursor = "zoom-in";
      editBtn.textContent = "edit";
      saveSongContent(songText.innerText);
      backBtn.classList.remove("disabled");
      updateScrollButtonState(overlay);
    } else {
      overlay._isEditing = true;
      songText.setAttribute("contenteditable", "true");
      songText.style.cursor = "text";
      songText.style.fontSize = `${currentFontSize}px`;
      songText.focus();
      editBtn.textContent = "save";
      scrollBtn.classList.add("disabled");
      scrollBtn.disabled = true;
      backBtn.classList.add("disabled");
    }
  });

  songText.addEventListener("pointerdown", (e) => {
    const isEditing = songText.getAttribute("contenteditable") === "true";
    if (isEditing) return;
    if (e.pointerType !== "mouse") return;

    if (e.button === 0) {
      currentFontSize = Math.min(currentFontSize + 3, 48);
    } else if (e.button === 2) {
      currentFontSize = Math.max(currentFontSize - 3, 8);
    }
    songText.style.fontSize = `${currentFontSize}px`;
  });

  songText.addEventListener("contextmenu", (e) => e.preventDefault());
}

