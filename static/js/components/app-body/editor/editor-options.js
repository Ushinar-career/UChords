// static/js/components/app-body/editor/editor-options.js
import { getPlaylists, setPlaylists } from "../../app-storage/local-storage.js";

const NOTES = [
  "C", "C#", "D", "D#", "E", "F",
  "F#", "G", "G#", "A", "A#", "B"
];

const FLAT_MAP = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#"
};

export function setupEditorOptions(overlay, playlistName, songName, songContent) {
  setupAutoScroll(overlay);
  setupEditLogic(overlay, playlistName, songName);
  setupFullscreen(overlay);
  setupSongTextZoom(overlay);
  setupTranspose(overlay, songContent);
  overlay._transpose = 0;

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

function setupTranspose(overlay, songContent) {
  const upBtn = overlay.querySelector(".transpose-up-btn");
  const downBtn = overlay.querySelector(".transpose-down-btn");
  const value = overlay.querySelector(".transpose-value");
  const render = () => {
    value.textContent = overlay._transpose;
    overlay.querySelector(".editor-content")
      .innerHTML = initChords(
        songContent,
        overlay._transpose
      );
  };
  upBtn.addEventListener("click", () => {
    overlay._transpose++;
    render();
  });
  downBtn.addEventListener("click", () => {
    overlay._transpose--;
    render();
  });
}

function transposeChord(chord, semitones) {
  const match = chord.match(/^([A-G][b#]?)(.*)$/);
  if (!match) return chord;
  let [, root, suffix] = match;
  root = FLAT_MAP[root] || root;
  const index = NOTES.indexOf(root);
  if (index === -1) return chord;
  const newIndex =
    (index + semitones + NOTES.length) % NOTES.length;
  return NOTES[newIndex] + suffix;
}

function detectOriginalKey(editorContent) {
  const rootCounts = {};
  const lines = sanitizeContent(editorContent).split("\n");
  for (const line of lines) {
    let i = 0;
    while (i < line.length) {
      if (line[i] === "[") {
        const end = line.indexOf("]", i);
        if (end !== -1) {
          const chord = line.slice(i + 1, end);
          const match = chord.match(/^([A-G][b#]?)/);
          if (match) {
            let root = match[1];
            root = FLAT_MAP[root] || root;
            rootCounts[root] = (rootCounts[root] || 0) + 1;
          }
        }
        i = end + 1;
        continue;
      }
      i++;
    }
  }
  let bestKey = "C";
  let bestCount = 0;
  for (const [key, count] of Object.entries(rootCounts)) {
    if (count > bestCount) {
      bestCount = count;
      bestKey = key;
    }
  }
  return bestKey;
}

export function initChords(editorContent, transpose = 0) {
  const safeContent = sanitizeContent(editorContent);
  const lines = safeContent.split("\n");

  const escapeHtml = (str) => {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  };

  let output = "";

  for (const line of lines) {
    let chordLine = "";
    let lyricLine = "";
    let i = 0;

    while (i < line.length) {
      if (line[i] === "[") {
        const end = line.indexOf("]", i);

        if (end !== -1) {
          const chord = line.slice(i + 1, end);
          const displayChord = transposeChord(chord, transpose);
          chordLine += displayChord.padEnd(
            Math.max(displayChord.length, end - i),
            " "
          );
          i = end + 1;
          continue;
        }
      }

      chordLine += " ";
      lyricLine += line[i];
      i++;
    }

    output +=
      `<span class="chords">${escapeHtml(chordLine)}</span>\n` +
      `<span class="lyrics">${escapeHtml(lyricLine)}</span>\n`;
  }

  return `<pre class="editor-text">${output}</pre>`;
}

function setupEditLogic(overlay, playlistName, songName) {
  const editBtn = overlay.querySelector(".edit-btn");
  const scrollBtn = overlay.querySelector(".editor-scroll-btn");
  const backBtn = overlay.querySelector(".back-to-songs-btn");
  let currentFontSize = 16;




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
    setupSongTextZoom(overlay);
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
    `<pre class="editor-text" contenteditable="true"></pre>`;

overlay.querySelector(".editor-text").textContent = rawContent;

const newSongText = overlay.querySelector(".editor-text");

newSongText.addEventListener("paste", (e) => {
  e.preventDefault();

  const text = e.clipboardData.getData("text/plain");

  if (document.execCommand) {
    document.execCommand("insertText", false, text);
  } else {
    const selection = window.getSelection();
    selection.deleteFromDocument();
    selection.getRangeAt(0).insertNode(
      document.createTextNode(text)
    );
  }
});

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

export function setupSongTextZoom(overlay) {
  const songText = overlay.querySelector(".editor-text");
  if (!songText) return;

  let currentFontSize = 16;
  songText.style.fontSize = `${currentFontSize}px`;

  let lastTapTime = 0;
  let zoomMode = false;
  let startY = 0;

  songText.addEventListener("touchstart", (e) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime;

    if (timeSinceLastTap < 300 && e.touches.length === 1) {
      zoomMode = true;
      startY = e.touches[0].clientY;
      overlay.querySelector(".editor-content").style.overflow = "hidden";
    }

    lastTapTime = now;
  });

  songText.addEventListener("touchmove", (e) => {
    if (!zoomMode || e.touches.length !== 1) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;

    if (Math.abs(deltaY) > 5) {
      if (deltaY < 0) {
        currentFontSize = Math.min(currentFontSize + 1, 48);
      } else {
        currentFontSize = Math.max(currentFontSize - 1, 8);
      }
      songText.style.fontSize = `${currentFontSize}px`;
      startY = currentY;
    }
  });

  songText.addEventListener("touchend", () => {
    if (zoomMode) {
      zoomMode = false;
      overlay.querySelector(".editor-content").style.overflow = "";
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

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeContent(raw) {
  const temp = document.createElement("div");
  temp.innerHTML = raw;

  return temp.textContent
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

function setupAutoScroll(overlay) {
  const scrollBtn = overlay.querySelector(".editor-scroll-btn");
  const speedInput = overlay.querySelector(".speed-input");
  const decreaseBtn = overlay.querySelector(".speed-decrease");
  const increaseBtn = overlay.querySelector(".speed-increase");
  const editorContainer = overlay.querySelector(".editor-content");

  overlay._scrollInterval = null;
  overlay._isEditing = false;

  const getEditorText = () => overlay.querySelector(".editor-text");

  function startAutoScroll() {
    const speed = parseFloat(speedInput.value);
    let accumulatedScroll = 0;

    overlay._scrollInterval = setInterval(() => {
      const editorText = getEditorText();

      if (!editorText) {
        clearInterval(overlay._scrollInterval);
        overlay._scrollInterval = null;
        setScrollButtonState(scrollBtn, false);
        return;
      }

      accumulatedScroll += speed;
      const scrollStep = Math.floor(accumulatedScroll);

      if (scrollStep > 0) {
        editorText.scrollTop += scrollStep;
        accumulatedScroll -= scrollStep;
      }

      if (
        editorText.scrollTop + editorText.clientHeight >=
        editorText.scrollHeight
      ) {
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

  editorContainer.addEventListener("scroll", () =>
    updateScrollButtonState(overlay)
  );

  updateScrollButtonState(overlay);

  window.addEventListener("resize", () =>
    updateScrollButtonState(overlay)
  );
}