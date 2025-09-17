const STORAGE_KEY = 'UChordsData';

export function getAppData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : { playlists: [] };
}

export function setAppData(data) {
  if (!data.playlists || data.playlists.length === 0) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}