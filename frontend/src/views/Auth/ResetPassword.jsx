import { useState } from 'react';
import { NavLink, useSearchParams, useNavigate } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import apiUser from '../../services/userApi';
import AuthLayout from './AuthLayout.jsx';
import styles from './Auth.module.scss';

function ResetPassword() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const token = params.get('token') || '';
    const [pw, setPw] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        if (pw.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setBusy(true);
        try {
            await apiUser.resetPassword(token, pw);
            navigate('/login');
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    if (!token) {
        return (
            <AuthLayout>
                    <h2>Invalid reset link</h2>
                    <p className={styles.authSwitchPrompt}>
                        This link is missing its token. Request a new one from the <NavLink to="/forgot-password">forgot password</NavLink> page.
                    </p>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
                <h2>Choose a new password</h2>
                <form onSubmit={submit}>
                    <div className={styles.authFormGroup}>
                        <LockKeyhole size={18} className={styles.authIcon} />
                        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" required />
                        <div className={styles.errorMsg}>{error}</div>
                    </div>
                    <button type="submit" className={styles.authSubmitBtn} disabled={busy}>{busy ? 'Saving...' : 'Reset password'}</button>
                </form>
        </AuthLayout>
    );
}

export default ResetPassword;
