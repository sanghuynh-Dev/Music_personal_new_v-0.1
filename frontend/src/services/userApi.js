
export const getUser =  async () => {
    const data = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());

    return data;
}

export const  getUserPlayList = async () => {
    const data = await fetch(`${import.meta.env.VITE_API_URL}/user/playlists`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());

    return data;
}

export const updateAvatarUser = async (avatar) => {
    const data = await fetch(`${import.meta.env.VITE_API_URL}/profile/avatar`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: avatar
    }).then(res => res.json());

    return data;
}

export const updateBannerUser = async (banner) => {
    const data = await fetch(`${import.meta.env.VITE_API_URL}/profile/header`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: banner
    }).then(res => res.json());

    return data;
}

export const toggleFollowApi = async (artistId,isFollowing) => {
    const data = await fetch(`${import.meta.env.VITE_API_URL}/artists/${artistId}/${isFollowing ? "unfollow" : "follow"}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include',
    }).then(res => res.json());

    return data;
}
export default {
  getUser,
  getUserPlayList,
  updateAvatarUser,
  updateBannerUser,
  toggleFollowApi
};

