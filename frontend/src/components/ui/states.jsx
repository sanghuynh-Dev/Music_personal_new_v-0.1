import { Music, SearchX, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import styles from './UI.module.css';

/* ---------- Loading / Skeleton ---------- */
export function LoadingState({ text = 'Loading...', className }) {
    return (
        <div className={clsx(styles.stateBox, className)} role="status" aria-live="polite">
            <span className={styles.eqLoader} aria-hidden="true">
                <i /><i /><i /><i /><i />
            </span>
            <p className={styles.stateText}>{text}</p>
        </div>
    );
}

export function Skeleton({ className, style }) {
    return <div className={clsx(styles.skeleton, className)} style={style} aria-hidden="true" />;
}

export function SongCardSkeleton() {
    return (
        <div aria-hidden="true">
            <Skeleton className={styles.skelArt} />
            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                <Skeleton className={styles.skelTitle} />
                <Skeleton className={styles.skelText} style={{ width: '40%' }} />
            </div>
        </div>
    );
}

export function SongRowSkeleton() {
    return (
        <div className={styles.skelRow} aria-hidden="true">
            <Skeleton className={styles.skelAvatar} />
            <div style={{ flex: 1, display: 'grid', gap: 8 }}>
                <Skeleton className={styles.skelTitle} />
                <Skeleton className={styles.skelText} style={{ width: '35%' }} />
            </div>
        </div>
    );
}

/* ---------- Empty / Error ---------- */
export function EmptyState({ icon, title = 'Nothing here yet', text, action }) {
    const Icon = icon || Music;
    return (
        <div className={styles.stateBox}>
            <span className={styles.stateIcon}><Icon size={40} /></span>
            <h3 className={styles.stateTitle}>{title}</h3>
            {text && <p className={styles.stateText}>{text}</p>}
            {action}
        </div>
    );
}

export function NoResults({ query }) {
    return (
        <EmptyState
            icon={SearchX}
            title="No results found"
            text={query ? `Nothing matches "${query}". Try a different keyword.` : 'Try searching for songs, artists or playlists.'}
        />
    );
}

export function ErrorState({ title = 'Something went wrong', text = 'Please try again.', onRetry }) {
    return (
        <div className={styles.stateBox} role="alert">
            <span className={styles.stateIcon}><AlertTriangle size={40} /></span>
            <h3 className={styles.stateTitle}>{title}</h3>
            <p className={styles.stateText}>{text}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className={styles.btn + ' ' + styles.btnGhost + ' ' + styles.btnSm}
                >
                    Retry
                </button>
            )}
        </div>
    );
}
