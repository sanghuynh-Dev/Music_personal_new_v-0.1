import axios from 'axios';


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

export const uploadSong = async (data, onProgress) => {
    const res = await axios.post(
        "http://localhost:3000/songs/upload",
        data,
        {
            withCredentials: true,
            headers: {
                Accept: "application/json"
            },
            onUploadProgress: (event) => {
                const percent = Math.round(
                    (event.loaded * 100) / event.total
                );

                onProgress?.(percent);
            }
        }
    );

    return res.data;
};

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

export const loadComments = async (songId) => {
    const res = await fetch(`http://localhost:3000/songs/${songId}/comments`, {
        method: "GET",
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include',
    });
    return await res.json();
}

export const addComment = async (songId, data) => {
    const res = await fetch(`http://localhost:3000/songs/${songId}/comment`, {
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

export default {
  toggleLikeApi,
  editSong,
  uploadSong,
  deleteSong,
  loadComments,
  addComment
};