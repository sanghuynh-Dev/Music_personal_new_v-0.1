import { createContext, useState, useEffect, useContext } from 'react';
import apiUser from '../services/userApi';

export const AuthContext = createContext();

// Recheck interval while logged in — catches revocation on idle pages.
const SESSION_RECHECK_MS = 30000;

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [checked, setChecked] = useState(false);
    const [sessionRevoked, setSessionRevoked] = useState(false);

    useEffect(() => {
        let alive = true;
        apiUser.getUser()
            .then((u) => { if (alive) setUser(u); })
            .catch((err) => {
                if (!alive) return;
                if (err?.code === 'SESSION_REVOKED') setSessionRevoked(true);
                setUser(null);
            })
            .finally(() => { if (alive) setChecked(true); });

        const onRevoked = () => {
            if (!alive) return;
            setSessionRevoked(true);
            setUser(null);
        };
        window.addEventListener('session-revoked', onRevoked);
        return () => { alive = false; window.removeEventListener('session-revoked', onRevoked); };
    }, []);

    // While logged in, revalidate on focus + every 30s so a takeover
    // surfaces even on pages that make no API calls — and so account
    // changes (e.g. promoted to artist) appear without a page reload.
    useEffect(() => {
        if (!user) return;
        let alive = true;
        // Captured per subscription — the effect re-subscribes on every
        // user change, so `user` here is always the latest snapshot.
        const cur = user;
        const recheck = () => {
            if (!alive || sessionRevoked) return;
            apiUser.getUser()
                .then((u) => {
                    if (!alive || !u) return;
                    if (
                        cur.role !== u.role ||
                        cur.username !== u.username ||
                        cur.emailVerified !== u.emailVerified ||
                        cur.status !== u.status ||
                        cur.avatar?.url !== u.avatar?.url
                    ) {
                        setUser(u);
                    }
                })
                .catch((err) => {
                    if (!alive) return;
                    if (err?.code === 'SESSION_REVOKED') {
                        setSessionRevoked(true);
                        setUser(null);
                    }
                });
        };
        const timer = setInterval(recheck, SESSION_RECHECK_MS);
        const onFocus = () => recheck();
        const onVisible = () => { if (document.visibilityState === 'visible') recheck(); };
        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            alive = false;
            clearInterval(timer);
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [user, sessionRevoked]);

    return (
        <AuthContext.Provider value={{ user, setUser, checked, sessionRevoked, setSessionRevoked }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext);
}

export default AuthProvider
