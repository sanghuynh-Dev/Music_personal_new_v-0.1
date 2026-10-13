import { createContext, useState, useEffect, useContext } from 'react';
import apiUser from '../services/userApi';

export const AuthContext = createContext();

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        let alive = true;
        apiUser.getUser()
            .then((u) => { if (alive) setUser(u); })
            .catch(() => { if (alive) setUser(null); })
            .finally(() => { if (alive) setChecked(true); });
        return () => { alive = false; };
    }, []);
    return (
        <AuthContext.Provider value={{ user, setUser, checked }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext);
}

export default AuthProvider
