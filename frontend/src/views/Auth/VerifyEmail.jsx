import { useEffect, useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import apiUser from '../../services/userApi';
import { LoadingState } from '../../components/ui';
import AuthLayout from './AuthLayout.jsx';
import styles from './Auth.module.scss';

function VerifyEmail() {
    const [params] = useSearchParams();
    const token = params.get('token') || '';
    const [state, setState] = useState(token ? 'busy' : 'missing');

    useEffect(() => {
        if (!token) return;
        let alive = true;
        apiUser.verifyEmail(token)
            .then(() => { if (alive) setState('ok'); })
            .catch(() => { if (alive) setState('bad'); });
        return () => { alive = false; };
    }, [token]);

    return (
        <AuthLayout>
                {state === 'busy' && <LoadingState text="Verifying your email..." />}
                {state === 'ok' && (
                    <>
                        <h2>Email verified</h2>
                        <p className={styles.authSwitchPrompt}>Continue to <NavLink to="/login">Sign in</NavLink>.</p>
                    </>
                )}
                {state === 'bad' && (
                    <>
                        <h2>Link expired or invalid</h2>
                        <p className={styles.authSwitchPrompt}>Request a new link from Settings, or go <NavLink to="/">Home</NavLink>.</p>
                    </>
                )}
                {state === 'missing' && (
                    <>
                        <h2>Missing token</h2>
                        <p className={styles.authSwitchPrompt}>Open the link from your email, or go <NavLink to="/">Home</NavLink>.</p>
                    </>
                )}
        </AuthLayout>
    );
}

export default VerifyEmail;
