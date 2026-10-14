import { useNavigate, useLocation } from 'react-router-dom';
import { MonitorSmartphone, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import styles from './Modals.module.scss';

function SessionRevokedModal() {
    const { sessionRevoked, setSessionRevoked } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (!sessionRevoked) return null;

    function dismiss() {
        setSessionRevoked(false);
    }

    function goToLogin() {
        setSessionRevoked(false);
        if (location.pathname !== '/login') {
            navigate('/login', { replace: true });
        }
    }

    return (
        <div className={styles.revokedOverlay} onClick={dismiss}>
            <div
                className={styles.revokedModal}
                role="alertdialog"
                aria-modal="true"
                aria-label="Logged in on another device"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className={styles.revokedClose}
                    onClick={dismiss}
                    aria-label="Dismiss"
                >
                    <X size={18} />
                </button>
                <div className={styles.revokedIcon}>
                    <MonitorSmartphone size={26} />
                </div>
                <h3>Logged in elsewhere</h3>
                <p>Your account was just signed in on another device. This session was signed out.</p>
                <button type="button" className={styles.revokedPrimary} onClick={goToLogin}>
                    Sign in again
                </button>
            </div>
        </div>
    );
}

export default SessionRevokedModal;
