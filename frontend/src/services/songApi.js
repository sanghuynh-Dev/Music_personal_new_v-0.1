export const toggleLikeApi = async (songId) => {
    const res = await fetch(`http://localhost:3000/songs/${songId}/like`, {
        method: "POST",
        credentials: 'include'
    });

    return await res.json();
};

export const editSong = async (songId,data) => {
    const res = await fetch(`http://localhost:3000/songs/edit/${songId}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    return await res.json();
}

export const uploadSong = async (data) => {
    const res = await fetch(`http://localhost:3000/songs/upload`, {
        method: "POST",
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: data,
    });
    return await res.json();
}

export const deleteSong = async (songId) => {
    const res = await fetch(`http://localhost:3000/admin/song/${songId}`, {
        method: "DELETE",
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include',
    });
    return await res.json();
}

export default {
  toggleLikeApi,
  editSong,
  uploadSong,
  deleteSong
};