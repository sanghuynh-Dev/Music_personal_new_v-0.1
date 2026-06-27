import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";

import useAlertStore from "../../stores/alertStore";
import styles from './Modals.module.scss';
import clsx from 'clsx';

function Alert() {

    const {isAlertOpen, title, message, closeModal } = useAlertStore();
    return (
        isAlertOpen && (
            <div className={clsx(styles.alertBox, styles[`${title}`])}>
                <div className={styles.alertLeft}>
                    <div className={styles.alertIcon}>
                        {title === "Success" && <CheckCircle2 size={22} />}
                        {title === "Warning" && <AlertTriangle size={22} />}
                        {title === "Error" && <XCircle size={22} />}
                    </div>

                    <div className={styles.alertContent}>
                        <h4>{title}</h4>
                        <p>{message}</p>
                    </div>
                </div>

                <button className={styles.alertClose} onClick={closeModal}>
                    <X size={18} />
                </button>
            </div>
        )
    );
}

export default Alert;