import { X, Trash2 } from "lucide-react";

import useConfirmStore from "../../stores/confirmStore";
import styles from './Modals.module.scss';

function ConfirmModal() {
    const { isConfirmOpen, handleConfirm, handleCancel, actionText,message } = useConfirmStore();
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
                        <div className={styles.confirmIcon}>
                            <Trash2 size={30} />
                        </div>

                        <h2>{actionText}</h2>
                        <p>{message}</p>
                    </div>


                    <div className={styles.confirmActions}>
                        <button className={styles.cancelBtn} onClick={handleCancel}>
                            Cancel
                        </button>

                        <button className={styles.deleteBtn} onClick={handleConfirm}>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        )
    );
}

export default ConfirmModal;