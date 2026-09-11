// static\js\components\app-storage\local-storage.js
export function savePlaylist(name) {
  const playlists = JSON.parse(localStorage.getItem("playlists")) || [];
  playlists.push({ name });
  localStorage.setItem("playlists", JSON.stringify(playlists));
}

export function getPlaylists() {
  return JSON.parse(localStorage.getItem("playlists")) || [];
}

export function saveSong(playlistName, songData) {
  const playlists = getPlaylists();
  const updated = playlists.map(p => {
    if (p.name === playlistName) {
      const songs = p.songs || [];
      songs.push({
        name: songData.name,
        artist: songData.artist,
        country: songData.country,
        language: songData.language,
        content: songData.content || ""
      });
      return { ...p, songs };
    }
    return p;
  });
  localStorage.setItem("playlists", JSON.stringify(updated));
}

export function getSongs(playlistName) {
  const playlists = getPlaylists();
  const playlist = playlists.find(p => p.name === playlistName);
  return playlist?.songs || [];
}
