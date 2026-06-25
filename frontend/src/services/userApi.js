
export const getUser =  async () => {
    const data = await fetch('http://localhost:3000/user', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());

    return data;
}

export const  getUserPlayList = async () => {
    const data = await fetch('http://localhost:3000/user/playlists', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());

    return data;
}

export const updateAvatarUser = async (avatar) => {
    const data = await fetch('http://localhost:3000/profile/avatar', {
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
    const data = await fetch('http://localhost:3000/profile/header', {
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
    const data = await fetch(`http://localhost:3000/artists/${artistId}/${isFollowing ? "unfollow" : "follow"}`, {
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

