// static/js/components/app-body/editor/editor-renderer.js
export function renderEditor(container, playlistName, songName, songContent) {
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
      <span class="material-icons edit-btn" title="Edit Song">edit_document</span>
      <span class="material-icons fullscreen-btn" title="Full Screen editor">open_in_full</span>
    </div>
    <h3 class="song-name-ribbon">Showing song: <i>${songName}</i></h3>
    <div class="editor-content">
      <pre class="editor-text" contenteditable="false">${songContent || "No content yet."}</pre>
    </div>
  `;
  container.appendChild(overlay);
  return overlay;
}
