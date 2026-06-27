
export const toggleBanUser =  async (userId) => {
    const data = await fetch(`${import.meta.env.VITE_API_URL}/admin/user/${userId}/ban`, {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());

    return data;
}

export const promoteToArtist =  async (userId) => {
    const data = await fetch(`${import.meta.env.VITE_API_URL}/admin/user/${userId}/promote`, {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());

    return data;
}

export default {
  toggleBanUser,
  promoteToArtist
};

