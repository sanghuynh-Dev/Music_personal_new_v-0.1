import { useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";

import useAlertStore from "../../stores/alertStore";
import styles from './Modals.module.scss';
import clsx from 'clsx';

// 'Failed' is the legacy failure title used across stores —
// normalize it (and any unknown title) to the Error look.
const KINDS = {
    Success: { cls: 'Success', Icon: CheckCircle2 },
    Warning: { cls: 'Warning', Icon: AlertTriangle },
    Error: { cls: 'Error', Icon: XCircle },
    Failed: { cls: 'Error', Icon: XCircle },
};

function Alert() {
    const { isAlertOpen, title, message, closeModal } = useAlertStore();

    useEffect(() => {
        if (!isAlertOpen) return;
        const onKey = (e) => {
            if (e.key === 'Escape') closeModal();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isAlertOpen, closeModal]);

    if (!isAlertOpen) return null;

    const kind = KINDS[title] || KINDS.Error;
    const Icon = kind.Icon;

    return (
        <div
            className={clsx(styles.alertBox, styles[kind.cls])}
            role={kind.cls === 'Error' ? 'alert' : 'status'}
        >
            <div className={styles.alertLeft}>
                <span className={styles.alertBadge} aria-hidden="true">
                    <Icon size={20} />
                </span>
                <div className={styles.alertContent}>
                    <h4>{title}</h4>
                    <p>{message}</p>
                </div>
            </div>

            <button className={styles.alertClose} onClick={closeModal} aria-label="Dismiss notification">
                <X size={16} />
            </button>
        </div>
    );
}

export default Alert;
