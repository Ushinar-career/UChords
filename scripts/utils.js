import { getAppData, setAppData } from './storage.js';
import { renderPlaylistsView } from './playlists.js';

// Helper: Create DOM element
function createElement(tag, className, props = {}) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  Object.assign(el, props);
  return el;
}

// Helper: Setup modal interactions
function setupModalInteractions({ inputEl, firstBtn, overlay }) {
  if (inputEl) {
    inputEl.focus();
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') firstBtn?.click();
    });
  } else {
    firstBtn?.focus();
  }

  const escHandler = (e) => {
    if (e.key === 'Escape') {
      document.body.removeChild(overlay);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) document.body.removeChild(overlay);
  });
}

// Modal: Input
export function initInputModal({
  title,
  message = '',
  input = false,
  defaultValue = '',
  placeholder = 'Enter value',
  buttons = []
} = {}) {
  const overlay = createElement('div', 'modal-overlay');
  const modal = createElement('div', 'modal');
  const titleEl = createElement('h2', 'modal-title', { textContent: title });
  modal.appendChild(titleEl);

  if (message) {
    modal.appendChild(createElement('p', 'modal-message', { textContent: message }));
  }

  const inputEl = input ? createElement('input', null, {
    type: 'text',
    placeholder,
    value: defaultValue
  }) : null;
  if (inputEl) modal.appendChild(inputEl);

  const warningEl = createElement('div', 'modal-warning', {
    style: 'color: red; margin-top: 8px; display: none;'
  });
  modal.appendChild(warningEl);

  const actions = createElement('div', 'modal-actions');
  const buttonElements = buttons.map(({ label, action }) => {
    const btn = createElement('button', 'modal-btn', { textContent: label });
    btn.onclick = () => {
      const value = inputEl?.value.trim() ?? null;
      if (action(value, warningEl) !== false) {
        document.body.removeChild(overlay);
      }
    };
    actions.appendChild(btn);
    return btn;
  });

  modal.appendChild(actions);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  setupModalInteractions({ inputEl, firstBtn: buttonElements[0], overlay });
}

// Modal: Alert
export function initAlertModal(message, title = 'Notification', callback = null) {
  initInputModal({
    title,
    message,
    buttons: [
      {
        label: 'Close',
        action: () => {
          if (callback) callback();
        }
      }
    ]
  });
}

// Import-Export Logic
// Import-Export Logic (No JSZip, No FileSaver.js)
export function initImportExport() {
  const exportBtn = document.querySelector('.export-btn');
  const importBtn = document.querySelector('.import-btn');
  const importInput = document.querySelector('.import-input');

  // Export as plain JSON
  exportBtn.addEventListener('click', () => {
    const data = getAppData();
    const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(jsonBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'UChordsData.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Confirm before importing
  importBtn.addEventListener('click', () => {
    initInputModal({
      title: 'Import Playlists',
      message: 'Importing will replace your current playlists. Continue?',
      buttons: [
        { label: 'Yes', action: () => importInput.click() },
        { label: 'No', action: () => {} }
      ]
    });
  });

  // Handle JSON import
  importInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsedData = JSON.parse(text);

      if (!Array.isArray(parsedData.playlists)) {
        throw new Error('Invalid data format. Expected an array of playlists.');
      }

      setAppData(parsedData);
      toggleEmptyMessage();
      renderPlaylistsView();
      initAlertModal('Playlists imported successfully!', 'Import Complete');
    } catch (err) {
      console.error('Import error:', err);
      initAlertModal(err.message, 'Import Error');
    } finally {
      importInput.value = '';
    }
  });
}


// Empty Message Toggle Logic
export function toggleEmptyMessage() {
  const data = getAppData();
  const emptyMessage = document.querySelector('.empty-message');
  if (data.playlists.length === 0) {
      emptyMessage.style.display = 'block';
  } else {
      emptyMessage.style.display = 'none';
  }
}

// Export Button Disabling Logic
export function updateExportButtonState() {
  const exportBtn = document.querySelector('.export-btn');
  const playlists = getAppData().playlists;
  const isDisabled = !playlists || playlists.length === 0;

  exportBtn.disabled = isDisabled;
  exportBtn.style.opacity = isDisabled ? '0.6' : '1';
  exportBtn.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
}

