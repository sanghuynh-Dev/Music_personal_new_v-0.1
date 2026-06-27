export const homeRoute = async () => {
    const data = await fetch(import.meta.env.VITE_API_URL, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());

    return data;
}

export const searchRoute = async (q) => {
    console.log("API URL =", import.meta.env.VITE_API_URL);
    const data = await fetch(`${import.meta.env.VITE_API_URL}/search?q=${q}`, {
        method: 'GET',
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const favoritesRoute = async () => {
    const data = await fetch(`${import.meta.env.VITE_API_URL}/favorites`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const historyRoute = async () => {
    const data = await fetch(`${import.meta.env.VITE_API_URL}/history`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const dashboardArtistRoute = async () => {
    const data = await fetch(`${import.meta.env.VITE_API_URL}/artist/dashboard`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const dashboardAdminRoute = async () => {
    const data = await fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const dashboardAdminGetArtistRoute = async () => {
    const data = await fetch(`${import.meta.env.VITE_API_URL}/admin/artists`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const dashboardAdminGetUserRoute = async () => {
    const data = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const dashboardAdminGetSongRoute = async () => {
    const data = await fetch(`${import.meta.env.VITE_API_URL}/admin/songs`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const songDetailRoute = async (songID) => {
    const data = await fetch(`${import.meta.env.VITE_API_URL}/songs/${songID}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const getSongInfo = async (songID) => {
    const data = await fetch(`${import.meta.env.VITE_API_URL}/songs/info/${songID}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const getProfileUser = async (userID) => {
    const data = await fetch(`${import.meta.env.VITE_API_URL}/profile/${userID}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const playlistRoute = async (playlistID) => {
    const data = await fetch(`${import.meta.env.VITE_API_URL}/playlists/${playlistID}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const postLogin = async (email, password) => {
    const data = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    }).then(res => res.json());
    return data;
}

export const logout = async () => {
    const data = await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
    }).then(res => res.json());
    return data;
}


export default {
  homeRoute,
  searchRoute,
  favoritesRoute,
  historyRoute,
  dashboardArtistRoute,
  dashboardAdminRoute,
  dashboardAdminGetArtistRoute,
  dashboardAdminGetUserRoute,
  dashboardAdminGetSongRoute,
  songDetailRoute,
  getSongInfo,
  getProfileUser,
  playlistRoute,
  postLogin,
  logout
};