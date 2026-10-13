import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import styles from './UI.module.css';

const FALLBACK_IMG = 'https://res.cloudinary.com/dqynaodv1/image/upload/v1781293476/955c965a3e831375a9fc2ed4e7599882_zlbj68.jpg';
const imgProps = (alt) => ({ loading: 'lazy', onError: (e) => { e.currentTarget.src = FALLBACK_IMG; }, alt });

/* ---------- Headers ---------- */
export function SectionHeader({ title, actionLabel, actionTo, onAction }) {
    return (
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{title}</h2>
            {actionLabel && (actionTo ? (
                <Link className={styles.sectionAction} to={actionTo}>{actionLabel}</Link>
            ) : (
                <button className={styles.sectionAction} onClick={onAction}>{actionLabel}</button>
            ))}
        </div>
    );
}

export function PageHeader({ title, subtitle, crumbs = [] }) {
    return (
        <div className={styles.pageHeader}>
            {crumbs.length > 0 && (
                <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                    {crumbs.map((c, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            {i > 0 && <ChevronRight size={12} />}
                            {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
                        </span>
                    ))}
                </nav>
            )}
            <h1 className={styles.pageTitle}>{title}</h1>
            {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
        </div>
    );
}

/* ---------- Cards & rows (presentational — real API field names) ---------- */
export function SongCard({ song, onPlay }) {
    const inner = (
        <>
            <img src={song.imageUrl?.url || FALLBACK_IMG} {...imgProps(song.title)} className={styles.artwork} />
            <p className={styles.cardTitle}>{song.title}</p>
            <p className={styles.cardSubtitle}>{song.artist}</p>
        </>
    );
    if (onPlay) {
        return <button className={styles.songCard} onClick={() => onPlay(song)} aria-label={`Play ${song.title}`}>{inner}</button>;
    }
    return <Link className={styles.songCard} to={`/songs/${song._id}`}>{inner}</Link>;
}

export function ArtistCard({ artist, verified }) {
    return (
        <Link className={styles.artistCard} to={`/profile/${artist._id}`}>
            <img src={artist.avatar?.url || FALLBACK_IMG} {...imgProps(artist.username)} className={clsx(styles.artwork, styles.artworkCircle)} />
            <p className={styles.cardTitle}>{artist.username}</p>
            <p className={styles.cardSubtitle}>{(artist.followerCount ?? 0).toLocaleString()} followers</p>
            {(verified || artist.role === 'artist') && (
                <span className={styles.verifiedBadge}><CheckCircle2 size={12} /> {artist.artistVerified ? 'Verified Artist' : 'Artist'}</span>
            )}
        </Link>
    );
}

export function PlaylistCard({ playlist }) {
    const cover = playlist.songs?.[0]?.imageUrl?.url || FALLBACK_IMG;
    return (
        <Link className={styles.playlistCard} to={`/playlists/${playlist._id}`}>
            <img src={cover} {...imgProps(playlist.name)} className={styles.artwork} />
            <p className={styles.cardTitle}>{playlist.name}</p>
            <p className={styles.cardSubtitle}>{(playlist.songCount ?? playlist.songs?.length ?? 0)} songs</p>
        </Link>
    );
}

export function SongRow({ song, index, onPlay, actions }) {
    return (
        <div className={styles.songRow}>
            {typeof index === 'number' && <span style={{ width: 28, color: 'var(--secondary-text)', fontSize: 'var(--text-sm)' }}>{index + 1}</span>}
            <button onClick={() => onPlay?.(song)} aria-label={`Play ${song.title}`} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                <img src={song.imageUrl?.url || FALLBACK_IMG} {...imgProps(song.title)} className={styles.songRowImg} />
                <span className={styles.songRowMain}>
                    <span className={styles.cardTitle}>{song.title}</span>
                    <span className={styles.cardSubtitle}>{song.artist}</span>
                </span>
            </button>
            <span className={styles.songRowMeta}>
                {song.playCount != null ? `${Number(song.playCount).toLocaleString()} plays` : ''}
            </span>
            {actions}
        </div>
    );
}

export function CardGrid({ children, className }) {
    return <div className={clsx(styles.cardGrid, className)}>{children}</div>;
}
