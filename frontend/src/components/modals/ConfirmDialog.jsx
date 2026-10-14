import { X, Trash2, Info } from "lucide-react";
import clsx from "clsx";

import useConfirmStore from "../../stores/confirmStore";
import styles from './Modals.module.scss';

function ConfirmModal() {
    const { isConfirmOpen, handleConfirm, handleCancel, actionText, message, confirmLabel, danger } = useConfirmStore();
    return (
        isConfirmOpen && (
            <div className={styles.confirmOverlay} onClick={handleCancel}>
                <div
                    className={styles.confirmModal}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button className={styles.closeBtn} onClick={handleCancel}>
                        <X size={22} />
                    </button>
                    <div className={styles.confirmContent}>
                        <div className={clsx(styles.confirmIcon, !danger && styles.confirmIconNeutral)}>
                            {danger ? <Trash2 size={30} /> : <Info size={30} />}
                        </div>

                        <h2>{actionText}</h2>
                        <p>{message}</p>
                    </div>


                    <div className={styles.confirmActions}>
                        <button className={styles.cancelBtn} onClick={handleCancel}>
                            Cancel
                        </button>

                        <button className={danger ? styles.deleteBtn : styles.confirmPrimary} onClick={handleConfirm}>
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        )
    );
}

export default ConfirmModal;
