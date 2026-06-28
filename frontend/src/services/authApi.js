export const CheckEmail =  async (email) => {
    const data = await fetch(`${import.meta.env.VITE_API_URL}/register/check-email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
    }).then(res => res.json());

    return data;
}

export const register =  async (email, username, password) => {
    const data = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ 
            username,
            email,
            password, 
        }),
        credentials: 'include'
    }).then(res => res.json());

    return data;
}

export default { 
    CheckEmail,
    register
}