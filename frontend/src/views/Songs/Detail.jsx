import { NavLink, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import useSongStore from "../../stores/songStore";
import usePlayerStore from "../../stores/playerStore";
import usePlaylistStore from "../../stores/playlistStore";
import useAlertStore from "../../stores/alertStore";
import { useAuth } from '../../contexts/AuthContext'
import appRoute from '../../routes/appRoute'

import CommentsSection from './CommentsSection';
import styles from './Songs.module.scss'
function Detail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [songData, setSongData] = useState(null);
    const [loadError, setLoadError] = useState('');
    // player
    const currentSong = usePlayerStore(s => s.currentSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const playSong = usePlayerStore(s => s.playSong);
    const pauseSong = usePlayerStore(s => s.pauseSong);
    const resumeSong = usePlayerStore(s => s.resumeSong);

    // song
    const toggleLikeLocal = useSongStore(s => s.toggleLikeLocal);
    const reload = useSongStore(s => s.reload);
    const isCurrentSong = (song) => song._id === currentSong?._id;

    // playlist
    const { openMenu } = usePlaylistStore();


    function handleClick(song) {
        if (isCurrentSong(song)) {
            if (isPlaying) pauseSong();
            else resumeSong();
        } else {
            playSong(song._id);
        }
    }

    function handleShowPlaylist (song,e) {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        openMenu(song._id, {
            x: rect.left - 200,
            y: rect.bottom 
        });
    };
    async function handleLike(song) {
        toggleLikeLocal(song._id);
    } 
    useEffect(() => {
        let alive = true;
        appRoute.songDetailRoute(id).then((data) => {
            if (!alive) return;
            if (data?.song) setSongData(data.song);
            else setLoadError('Song not found.');
        }).catch(() => { if (alive) setLoadError('Failed to load song.'); });
        return () => { alive = false; };
    }, [id,reload]);

    async function handleShare() {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            useAlertStore.getState().openModal('Success', 'Song link copied to clipboard.');
        } catch {
            useAlertStore.getState().openModal('Error', 'Could not copy link.');
        }
    }

    if (loadError) {
        return (
            <div className={styles.songDetailContainer}>
                <p style={{ color: 'var(--secondary-text)' }}>{loadError}</p>
            </div>
        );
    }
    if (!songData) {
        return (
            <div className={styles.songDetailContainer}>
                <p style={{ color: 'var(--secondary-text)' }}>Loading song...</p>
            </div>
        );
    }

    const isOwner = user && songData.uploadedBy && String(songData.uploadedBy._id || songData.uploadedBy) === String(user._id);
    const canEdit = isOwner || user?.role === 'admin';

    return (
        <div className={styles.songDetailContainer}>
            <div className={styles.dossier}>
                <div className={styles.dossierRail}>
                    <div className={styles.dossierArtWrap}>
                        <img
                            src={songData.imageUrl?.url || null}
                            alt={songData.title}
                            className={styles.songDetailThumbnail} />
                    </div>
                    <button
                        className={clsx(styles.btnPlaySongLarge, styles.dossierPlay, "play-btn-js")}
                        onClick={() => handleClick(songData)}>
                        { isCurrentSong(songData) && isPlaying ? (
                            <svg className="icon-pause" id="pause-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M0 5h4v14H0zm8 0h4v14H8z"></path>
                            </svg>
                        ): (
                            <svg className="icon-play" id="play-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M0 5v14l11-7z"></path>
                            </svg>
                        )} {isCurrentSong(songData) && isPlaying ? 'Pause' : 'Play'}
                    </button>

                    { user ? (
                        <div className={styles.detailActions}>
                            <button
                                className={clsx(styles.detailActionBtn, songData?.liked && styles.liked)}
                                onClick={() => handleLike(songData)}
                                title="Like"
                                aria-label={songData?.liked ? 'Unlike' : 'Like'}>
                                <i className="ti-heart"></i>
                            </button>
                            <button
                                className={clsx(styles.detailActionBtn, "opt-btn")}
                                onClick={(e) => handleShowPlaylist(songData,e)}
                                title="Add to Playlist">
                                <i className="ti-more-alt"></i>
                            </button>
                            <button
                                className={styles.detailActionBtn}
                                onClick={handleShare}
                                title="Copy link to this song">
                                <i className="ti-share"></i>
                            </button>
                            { canEdit && (
                                <NavLink to={`/songs/edit/${songData._id}`} className={styles.detailActionBtn} title="Edit Song Details">
                                    <i className="ti-pencil"></i>
                                </NavLink>
                            )}
                        </div>
                    ) : (
                        <NavLink to="/login" className={styles.detailActionBtn} title="Log in to Like"><i className="ti-heart"></i></NavLink>
                    )}
                </div>

                <div className={styles.dossierMain}>
                    <p className={styles.detailLabel}>Single</p>
                    <h1 className={styles.dossierTitle}>{songData.title}</h1>
                    <p className={styles.dossierByline}>
                        <NavLink to={`/profile/${songData.uploadedBy?._id}`}>{songData.artist}</NavLink>
                    </p>

                    <dl className={styles.statBand}>
                        <div>
                            <dt>Plays</dt>
                            <dd className="numeric">{(songData.playCount || 0).toLocaleString()}</dd>
                        </div>
                        <div>
                            <dt>Genre</dt>
                            <dd>{songData.genre || 'Pop'}</dd>
                        </div>
                        <div>
                            <dt>Released</dt>
                            <dd>{songData.createdAt ? new Date(songData.createdAt).toLocaleDateString() : '—'}</dd>
                        </div>
                    </dl>

                    <div className={styles.songInfoPanel}>
                        <h3 className={styles.panelTitle}>About this song</h3>
                        <p className={styles.songDescription}>
                            {songData.description || 'No description provided for this song.'}
                        </p>
                    </div>

                    <CommentsSection songId={id} />
                </div>
            </div>
        </div>
    )
}

export default Detail