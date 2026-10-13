export const addSongToPlaylist = async (playlistId, songId) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/playlists/${playlistId}/add-song`, {
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
    const response = await fetch(`${import.meta.env.VITE_API_URL}/playlists/${playlistId}/remove-song`, {
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

export const createPlaylist = async (name, isPrivate = false) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/playlists/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ name, isPrivate })
    });
   return await response.json();
}

export const deletePlaylist = async (playlistId) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
    });
   return await response.json();
}

export const getPlaylistById = async (playlistId) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/playlists/${playlistId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
    });
   return await response.json();
}

export const updatePlaylist = async (playlistId, data) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/playlists/${playlistId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
    });
   return await response.json();
}

export default {
  addSongToPlaylist,
  removeSongToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  updatePlaylist
};