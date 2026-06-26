
export const toggleBanUser =  async (userId) => {
    const data = await fetch(`http://localhost:3000/admin/user/${userId}/ban`, {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json());

    return data;
}

export const promoteToArtist =  async (userId) => {
    const data = await fetch(`http://localhost:3000/admin/user/${userId}/promote`, {
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

