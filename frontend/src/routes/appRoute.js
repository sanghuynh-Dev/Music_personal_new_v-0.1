export const homeRoute = async () => {
    const data = await fetch('http://localhost:3000/', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());

    return data;
}

export const searchRoute = async (q) => {
    const data = await fetch(`http://localhost:3000/search?q=${q}`, {
        method: 'GET',
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const favoritesRoute = async () => {
    const data = await fetch('http://localhost:3000/favorites', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const historyRoute = async () => {
    const data = await fetch('http://localhost:3000/history', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const dashboardArtistRoute = async () => {
    const data = await fetch('http://localhost:3000/artist/dashboard', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const dashboardAdminRoute = async () => {
    const data = await fetch('http://localhost:3000/admin/dashboard', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const dashboardAdminGetArtistRoute = async () => {
    const data = await fetch('http://localhost:3000/admin/artists', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const dashboardAdminGetUserRoute = async () => {
    const data = await fetch('http://localhost:3000/admin/users', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const dashboardAdminGetSongRoute = async () => {
    const data = await fetch('http://localhost:3000/admin/songs', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const songDetailRoute = async (songID) => {
    const data = await fetch(`http://localhost:3000/songs/${songID}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const getSongInfo = async (songID) => {
    const data = await fetch(`http://localhost:3000/songs/info/${songID}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const getProfileUser = async (userID) => {
    const data = await fetch(`http://localhost:3000/profile/${userID}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const playlistRoute = async (playlistID) => {
    const data = await fetch(`http://localhost:3000/playlists/${playlistID}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());
    return data;
}

export const postLogin = async (email, password) => {
    const data = await fetch(`http://localhost:3000/login`, {
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
    const data = await fetch(`http://localhost:3000/logout`, {
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