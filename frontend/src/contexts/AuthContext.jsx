import { createContext, useState, useEffect, useContext } from 'react';
import apiUser from '../services/userApi';

export const AuthContext = createContext();

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        apiUser.getUser().then((user) => {
            setUser(user);
        });
    }, []);
    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext);
}

export default AuthProvider