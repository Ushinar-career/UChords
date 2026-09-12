// static/js/components/app-body/editor/editor-options.js
import { getPlaylists, setPlaylists } from "../../app-storage/local-storage.js";

export function setupEditorOptions(overlay, playlistName, songName) {
  setupAutoScroll(overlay);
  setupEditLogic(overlay, playlistName, songName);
}

// --- Auto Scroll ---
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

// --- Edit Logic ---
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

