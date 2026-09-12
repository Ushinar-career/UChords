// static/js/components/app-body/editor/editor-options.js
import { getPlaylists, setPlaylists } from "../../app-storage/local-storage.js";

export function setupEditorOptions(overlay, playlistName, songName) {
  setupAutoScroll(overlay);
  setupEditLogic(overlay, playlistName, songName);
  setupFullscreen(overlay);
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

export function initChords(editorContent) {
  const lines = editorContent.split("\n");
  let output = "";

  for (let line of lines) {
    let chordLine = "";
    let lyricLine = "";
    let i = 0;

    while (i < line.length) {
      if (line[i] === "[") {
        let end = line.indexOf("]", i);
        let chord = line.slice(i + 1, end);
        chordLine += chord.padEnd(end - i + 1, " ");
        i = end + 1;
      } else {
        chordLine += " ";
        lyricLine += line[i];
        i++;
      }
    }

    output += `<span class="chords">${chordLine}</span>\n<span class="lyrics">${lyricLine}</span>\n`;
  }

  return `<pre class="editor-text">${output}</pre>`;
}

function setupEditLogic(overlay, playlistName, songName) {
  const editBtn = overlay.querySelector(".edit-btn");
  const scrollBtn = overlay.querySelector(".editor-scroll-btn");
  const backBtn = overlay.querySelector(".back-to-songs-btn");
  let currentFontSize = 16;

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

    const parsed = initChords(content);
    overlay.querySelector(".editor-content").innerHTML = parsed;
  }

  editBtn.addEventListener("click", () => {
    const isEditing = overlay._isEditing;

    if (overlay._scrollInterval !== null) {
      clearInterval(overlay._scrollInterval);
      overlay._scrollInterval = null;
      setScrollButtonState(scrollBtn, false);
    }

    if (isEditing) {
      const rawContent = overlay.querySelector(".editor-text").innerText;
      overlay._isEditing = false;
      editBtn.textContent = "edit_document";
      saveSongContent(rawContent);
      backBtn.classList.remove("disabled");
      updateScrollButtonState(overlay);
    } else {
      overlay._isEditing = true;
      const playlists = getPlaylists();
      const currentSong = playlists
        .find(p => p.name === playlistName)
        ?.songs.find(s => s.name === songName);

      const rawContent = currentSong?.content || "";
      overlay.querySelector(".editor-content").innerHTML =
        `<pre class="editor-text" contenteditable="true">${rawContent}</pre>`;

      const newSongText = overlay.querySelector(".editor-text");
      newSongText.style.cursor = "text";
      newSongText.style.fontSize = `${currentFontSize}px`;
      newSongText.focus();

      editBtn.textContent = "save";
      scrollBtn.classList.add("disabled");
      scrollBtn.disabled = true;
      backBtn.classList.add("disabled");
    }
  });
}

function setupFullscreen(overlay) {
  const fullscreenBtn = overlay.querySelector(".fullscreen-btn");

  fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      overlay.requestFullscreen().then(() => {
        fullscreenBtn.textContent = "close_fullscreen";
      });
    } else {
      document.exitFullscreen().then(() => {
        fullscreenBtn.textContent = "open_in_full";
      });
    }
  });

  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      fullscreenBtn.textContent = "open_in_full";
    }
  });
}

