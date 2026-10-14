import { useEffect, useState } from 'react';
import { Flag, X } from 'lucide-react';
import useReportStore from '../../stores/reportStore';
import styles from './Modals.module.scss';

const REPORT_TYPES = [
    { value: 'copyright', label: 'Copyright' },
    { value: 'inappropriate', label: 'Inappropriate' },
    { value: 'spam', label: 'Spam' },
    { value: 'impersonation', label: 'Impersonation' },
    { value: 'other', label: 'Other' },
];

const TARGET_NAMES = { song: 'Song', user: 'User', playlist: 'Playlist', comment: 'Comment' };
const REASON_MAX = 1000;

function ReportForm({ submitting, onSubmit }) {
    const [type, setType] = useState('inappropriate');
    const [reason, setReason] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        if (submitting) return;
        onSubmit({ type, reason: reason.trim() });
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className={styles.reportTypes} role="radiogroup" aria-label="Report reason type">
                {REPORT_TYPES.map((t) => (
                    <label key={t.value} className={styles.reportType}>
                        <input
                            type="radio"
                            name="report-type"
                            value={t.value}
                            checked={type === t.value}
                            onChange={() => setType(t.value)}
                        />
                        <span>{t.label}</span>
                    </label>
                ))}
            </div>

            <textarea
                className={styles.reportReason}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={REASON_MAX}
                rows={4}
                placeholder="What is wrong here? (optional, helps moderators)"
                aria-label="Report details"
            />
            <div className={styles.reportCount}>
                {reason.length}/{REASON_MAX}
            </div>

            <p className={styles.reportNote}>
                Our moderators review every report. False or abusive reports may affect your account.
            </p>

            <div className={styles.reportActions}>
                <button type="button" className={styles.reportCancel} onClick={useReportStore.getState().closeReport} disabled={submitting}>
                    Cancel
                </button>
                <button type="submit" className={styles.reportSubmit} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit report'}
                </button>
            </div>
        </form>
    );
}

function ReportModal() {
    const { isOpen, target, submitting, closeReport, submit } = useReportStore();

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => {
            if (e.key === 'Escape') closeReport();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, closeReport]);

    if (!isOpen || !target) return null;

    return (
        <div className={styles.reportOverlay} onClick={closeReport}>
            <div
                className={styles.reportModal}
                role="dialog"
                aria-modal="true"
                aria-label="Report content"
                onClick={(e) => e.stopPropagation()}
            >
                <button type="button" className={styles.reportClose} onClick={closeReport} aria-label="Close">
                    <X size={18} />
                </button>
                <div className={styles.reportHead}>
                    <span className={styles.reportIcon}>
                        <Flag size={20} />
                    </span>
                    <div>
                        <h3>Report {TARGET_NAMES[target.type] || 'content'}</h3>
                        {target.label && <p className={styles.reportTarget}>{target.label}</p>}
                    </div>
                </div>

                {/* Remount per target so the form always opens fresh. */}
                <ReportForm key={`${target.type}:${target.id}`} submitting={submitting} onSubmit={submit} />
            </div>
        </div>
    );
}

export default ReportModal;
