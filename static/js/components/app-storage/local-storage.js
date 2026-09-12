// static/js/components/app-storage/local-storage.js
export function getPlaylists() {
  const data = JSON.parse(localStorage.getItem("playlistsData")) || { playlists: [] };
  return data.playlists;
}

export function setPlaylists(playlists) {
  localStorage.setItem("playlistsData", JSON.stringify({ playlists }));
}

export function savePlaylist(name) {
  const playlists = getPlaylists();
  const updated = [{ name, songs: [] }, ...playlists];
  setPlaylists(updated);
}

export function saveSong(playlistName, songData) {
  const playlists = getPlaylists();
  const updatedPlaylists = playlists.map(p => {
    if (p.name === playlistName) {
      const songs = p.songs || [];
      songs.push({
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
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
  setPlaylists(updatedPlaylists);
}

export function getSongs(playlistName) {
  const playlists = getPlaylists();
  const playlist = playlists.find(p => p.name === playlistName);
  return playlist?.songs || [];
}
