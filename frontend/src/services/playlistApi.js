export const addSongToPlaylist = async (playlistId, songId) => {
    const response = await fetch(`http://localhost:3000/playlists/${playlistId}/add-song`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ songId })
    });
   return await response.json();
}

export const removeSongToPlaylist = async (playlistId, songId) => {
    const response = await fetch(`http://localhost:3000/playlists/${playlistId}/remove-song`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ songId })
    });
   return await response.json();
}

export const createPlaylist = async (name) => {
    const response = await fetch(`http://localhost:3000/playlists/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ name })
    });
   return await response.json();
}

export const deletePlaylist = async (playlistId) => {
    const response = await fetch(`http://localhost:3000/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
    });
   return await response.json();
}

export default {
  addSongToPlaylist,
  removeSongToPlaylist,
  createPlaylist,
  deletePlaylist
};