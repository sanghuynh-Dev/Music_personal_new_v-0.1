import { CloudUpload, X } from "lucide-react";

import useSongStore from "../../stores/songStore";
import styles from './Modals.module.scss';

function UploadProgressPanel() {
    const { uploading, progress, uploadStatus } = useSongStore();
    return (
        uploading && (
            <div className={styles.uploadPanel}>
                <div className={styles.header}>
                    <div className={styles.iconBox}>
                        <CloudUpload size={26} />
                    </div>

                    <div>
                        <h3>{uploadStatus}</h3>
                        <p>{uploadStatus !== "Completed!" ? "Please wait..." : ""}</p>
                    </div>
                </div>

                <div className={styles.progressNumber}>
                    {progress}%
                </div>

                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        )
    );
}

export default UploadProgressPanel;