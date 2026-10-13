import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Mail } from 'lucide-react';
import apiUser from '../../services/userApi';
import AuthLayout from './AuthLayout.jsx';
import styles from '../Auth/Auth.module.scss';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email.trim()) { setError('Enter your email address.'); return; }
        setBusy(true);
        try {
            await apiUser.requestPasswordReset(email.trim());
            setDone(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthLayout>
                <h2>Reset your password</h2>
                {done ? (
                    <p className={styles.authSwitchPrompt}>
                        If an account exists for that email, a reset link was sent (valid 1 hour).
                        Back to <NavLink to="/login">Sign in</NavLink>.
                    </p>
                ) : (
                    <form onSubmit={submit}>
                        <div className={styles.authFormGroup}>
                            <Mail size={18} className={styles.authIcon} />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
                            <div className={styles.errorMsg}>{error}</div>
                        </div>
                        <button type="submit" className={styles.authSubmitBtn} disabled={busy}>{busy ? 'Sending...' : 'Send reset link'}</button>
                    </form>
                )}
                <p className={styles.authSwitchPrompt}>
                    Back to <NavLink to="/login">Sign in</NavLink>.
                </p>
        </AuthLayout>
    );
}

export default ForgotPassword;
