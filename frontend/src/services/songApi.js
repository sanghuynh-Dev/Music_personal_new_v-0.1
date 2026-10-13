import axios from 'axios';


export const toggleLikeApi = async (songId) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/songs/${songId}/like`, {
        method: "POST",
        credentials: 'include'
    });

    return await res.json();
};

export const editSong = async (songId,data) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/songs/edit/${songId}`, {
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

export const uploadSong = async (data, onProgress) => {
    const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/songs/upload`,
        data,
        {
            withCredentials: true,
            headers: {
                Accept: "application/json"
            },
            onUploadProgress: (event) => {
                const total = event.total || event.loaded || 1;
                const percent = Math.round(
                    (event.loaded * 100) / total
                );

                onProgress?.(percent);
            }
        }
    );

    return res.data;
};

export const deleteSong = async (songId) => {
    // Owner delete (artist/admin checked server-side) — NOT the admin-only endpoint,
    // so artists can delete their own uploads.
    const res = await fetch(`${import.meta.env.VITE_API_URL}/songs/${songId}`, {
        method: "DELETE",
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include',
    });
    return await res.json();
}

export const loadComments = async (songId) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/songs/${songId}/comments`, {
        method: "GET",
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include',
    });
    return await res.json();
}

export const addComment = async (songId, data) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/songs/${songId}/comment`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({content: data}),
    });
    return await res.json();
}

export const renderQueue = async (songId) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/songs/queue?currentSongId=${songId}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
    });
    return await res.json();
}

export const saveHistory = async (songId) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/songs/${songId}/play`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
    });
    return await res.json();
}

export const getSongInfo = async (songId) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/songs/info/${songId}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
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
  deleteSong,
  loadComments,
  addComment,
  renderQueue,
  saveHistory,
  getSongInfo
};