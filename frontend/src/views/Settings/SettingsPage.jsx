import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import apiUser from '../../services/userApi';
import useConfirmStore from '../../stores/confirmStore';
import { PageHeader, Input, Button, LoadingState } from '../../components/ui';
import { toast } from '../../components/ui';
import styles from './Settings.module.scss';

function SettingsPage() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [pwError, setPwError] = useState('');
    const [pwBusy, setPwBusy] = useState(false);
    const [verifyState, setVerifyState] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');

    // Refresh user to get latest emailVerified flag
    useEffect(() => {
        let alive = true;
        apiUser.getUser().then((u) => { if (alive && u) setUser(u); }).catch(() => {});
        return () => { alive = false; };
    }, [setUser]);

    const submitPassword = async (e) => {
        e.preventDefault();
        setPwError('');
        if (!currentPassword || !newPassword) { setPwError('Both fields are required.'); return; }
        setPwBusy(true);
        try {
            await apiUser.changePassword(currentPassword, newPassword);
            setCurrentPassword('');
            setNewPassword('');
            toast.success('Password changed successfully.');
        } catch (err) {
            setPwError(err.message);
        } finally {
            setPwBusy(false);
        }
    };

    const resendVerification = async () => {
        setVerifyState('');
        try {
            const r = await apiUser.requestVerification();
            if (r.already) setVerifyState('Your email is already verified.');
            else if (r.emailed) setVerifyState('Verification email sent. Check your inbox.');
            else setVerifyState('Email service is not configured yet. Please contact support.');
        } catch (err) {
            setVerifyState(err.message);
        }
    };

    const deleteAccount = async (e) => {
        e.preventDefault();
        setDeleteError('');
        if (!deletePassword) { setDeleteError('Enter your password to confirm.'); return; }
        const ok = await useConfirmStore.getState().openModal(
            'Delete your account?',
            'This permanently deletes your profile, songs, playlists and history. This cannot be undone.',
            { confirmLabel: 'Delete', danger: true }
        );
        if (!ok) return;
        try {
            await apiUser.deleteMe(deletePassword);
            setUser(null);
            navigate('/login');
        } catch (err) {
            setDeleteError(err.message);
        }
    };

    if (!user) return <LoadingState text="Loading settings..." />;

    return (
        <div className={styles.settings}>
            <PageHeader title="Settings" subtitle="Security, email and account management." crumbs={[{ label: 'Home', to: '/' }, { label: 'Settings' }]} />

            <section className={styles.card} aria-label="Profile">
                <div className={styles.cardHead}>
                    <h2>Profile</h2>
                    <p>Signed in as {user.username} ({user.email})</p>
                </div>
            </section>

            <section className={styles.card} aria-label="Email verification">
                <div className={styles.cardHead}>
                    <h2>Email verification</h2>
                    <p>{user.email} — {user.emailVerified ? 'verified' : 'not verified'}</p>
                </div>
                {!user.emailVerified && <Button size="sm" variant="ghost" onClick={resendVerification}>Resend verification email</Button>}
                {verifyState && <p className={styles.note}>{verifyState}</p>}
            </section>

            <section className={styles.card} aria-label="Change password">
                <div className={styles.cardHead}>
                    <h2>Change password</h2>
                    <p>Use at least 6 characters.</p>
                </div>
                <form onSubmit={submitPassword} className={styles.form}>
                    <Input label="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
                    <Input label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" error={pwError} />
                    <div><Button size="sm" disabled={pwBusy}>{pwBusy ? 'Saving...' : 'Change password'}</Button></div>
                </form>
            </section>

            <section className={`${styles.card} ${styles.danger}`} aria-label="Delete account">
                <div className={styles.cardHead}>
                    <h2>Delete account</h2>
                    <p>Permanently delete your account and all your content. This cannot be undone.</p>
                </div>
                <form onSubmit={deleteAccount} className={styles.form}>
                    <Input label="Confirm with your password" type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} autoComplete="current-password" error={deleteError} />
                    <div><Button size="sm" variant="danger">Delete my account</Button></div>
                </form>
            </section>
        </div>
    );
}

export default SettingsPage;
