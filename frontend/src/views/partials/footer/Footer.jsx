import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { NavLink } from 'react-router-dom';
import { Volume2, VolumeX, Maximize2 } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import usePlayerStore from "../../../stores/playerStore";
import useSongStore from "../../../stores/songStore";
import QueuePanel from "./QueuePanel.jsx";
import ExpandedPlayer from "./ExpandedPlayer.jsx";
import ControlBtn from "./ControlBtn.jsx";
import styles from './Footer.module.scss'

function formatTime(seconds) {
    if (seconds == null || isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function Footer() {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isQueueOpen, setIsQueueOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const { user } = useAuth();
    const audioRef = useRef(null);

    const currentSong = usePlayerStore(s => s.currentSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const repeatMode = usePlayerStore(s => s.repeatMode);
    const volume = usePlayerStore(s => s.volume);
    const muted = usePlayerStore(s => s.muted);
    const setVolume = usePlayerStore(s => s.setVolume);
    const toggleMute = usePlayerStore(s => s.toggleMute);
    const setAudioRef = usePlayerStore(s => s.setAudioRef);
    const nextSong = usePlayerStore(s => s.nextSong);

    const toggleLikeLocal = useSongStore(s => s.toggleLikeLocal);
    const songDetail = useSongStore(s => s.songDetail);

    // Register the single audio element once (not on every song change).
    useEffect(() => {
        setAudioRef(audioRef.current);
        return () => setAudioRef(null);
    }, [setAudioRef]);

    // Load a new track; autoplay only when the store says we're playing
    // (never autoplay after a refresh — isPlaying rehydrates as false).
    useEffect(() => {
        const el = audioRef.current;
        if (!el || !currentSong?.audioUrl?.url) return;
        el.src = currentSong.audioUrl.url;
        el.load();
        setCurrentTime(0);
        setDuration(0);
        if (usePlayerStore.getState().isPlaying) {
            el.play().catch(() => usePlayerStore.getState().pauseSong());
        }
    }, [currentSong]);

    useEffect(() => {
        if (audioRef.current) audioRef.current.loop = repeatMode === "one";
    }, [repeatMode]);

    useEffect(() => {
        const el = audioRef.current;
        if (!el) return;
        el.volume = volume;
        el.muted = muted;
    }, [volume, muted]);

    // MediaSession + document title
    useEffect(() => {
        if (currentSong) {
            document.title = `${currentSong.title} • ${currentSong.artist} — Soundora`;
        } else {
            document.title = 'Soundora';
        }
        if ('mediaSession' in navigator && currentSong) {
            try {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: currentSong.title,
                    artist: currentSong.artist,
                    artwork: currentSong.imageUrl?.url ? [{ src: currentSong.imageUrl.url }] : [],
                });
                const st = usePlayerStore.getState();
                navigator.mediaSession.setActionHandler('play', () => st.resumeSong());
                navigator.mediaSession.setActionHandler('pause', () => st.pauseSong());
                navigator.mediaSession.setActionHandler('previoustrack', () => st.prevSong());
                navigator.mediaSession.setActionHandler('nexttrack', () => st.nextSong());
            } catch { /* unsupported */ }
        }
        return () => { document.title = 'Soundora'; };
    }, [currentSong]);

    const onTimeUpdate = () => {
        const el = audioRef.current;
        if (el) setCurrentTime(el.currentTime);
    };
    const onLoadedMetadata = () => {
        const el = audioRef.current;
        if (el && isFinite(el.duration)) setDuration(el.duration);
    };
    const onSeek = (e) => {
        const el = audioRef.current;
        const t = Number(e.target.value);
        if (el && isFinite(el.duration)) {
            el.currentTime = t;
            setCurrentTime(t);
        }
    };

    // Escape closes queue/expanded; lock body scroll while expanded.
    useEffect(() => {
        if (!isQueueOpen && !isExpanded) return;
        const onKey = (e) => {
            if (e.key === 'Escape') { setIsQueueOpen(false); setIsExpanded(false); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isQueueOpen, isExpanded]);

    useEffect(() => {
        if (!isExpanded) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, [isExpanded]);

    // Audio element stays mounted even with no track so the store never
    // holds a detached node (fixes dead controls after clear/delete).
    // currentSong.liked is synced by the like action, so footer/expand/lists agree.
    const likedTrack = songDetail && currentSong && songDetail._id === currentSong._id ? songDetail : currentSong;

    return (
        <>
            <audio
                ref={audioRef}
                preload="metadata"
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onLoadedMetadata}
                onEnded={nextSong}
            />
            {currentSong && (
            <footer id={styles.playerBar}>
                <div className={styles.playerBarContainer}>
                    <div className={styles.currentSongDetails} id="player-song-details">
                        <img src={currentSong?.imageUrl?.url} alt={currentSong?.title} loading="lazy" className={styles.playerSongImg} id="player-song-thumbnail" data-playing={isPlaying || undefined} />
                        <div className={styles.playerSongMeta}>
                            <span className={styles.playerSongTitle}>{currentSong?.title}</span>
                            <NavLink to={`/profile/${currentSong?.uploadedBy?._id}`} className={styles.playerSongArtist}>{currentSong?.artist}</NavLink>
                        </div>

                        {user && (
                            <div className={styles.playerSongActions}>
                                <button
                                    className={clsx("action-btn", likedTrack?.liked && "liked")}
                                    onClick={() => toggleLikeLocal(currentSong._id)}
                                    aria-label={likedTrack?.liked ? 'Unlike' : 'Like'}
                                    aria-pressed={!!likedTrack?.liked}
                                >
                                    <i className="ti-heart"></i>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={styles.playerControls}>
                        <ControlBtn />
                        <div className={styles.playerControlTimeline}>
                            <span className={styles.playerTime}>{formatTime(currentTime)}</span>
                            <input
                                type="range"
                                className={clsx(styles.playerTimeline, styles.progressRange)}
                                style={{ '--fill': `${duration ? Math.min(100, (currentTime / duration) * 100) : 0}%` }}
                                min={0}
                                max={Math.floor(duration) || 0}
                                step={1}
                                value={Math.floor(currentTime)}
                                onChange={onSeek}
                                aria-label="Seek"
                            />
                            <span className={styles.playerTime}>{formatTime(duration)}</span>
                        </div>
                    </div>

                    <div className={styles.volumeContainer}>
                        <button className={styles.controlBtn} onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'} aria-label={muted ? 'Unmute' : 'Mute'} aria-pressed={muted}>
                            {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                        <input
                            type="range"
                            className={styles.volumeSlider}
                            onChange={e => setVolume(parseFloat(e.target.value))}
                            min="0" max="1" step="0.01" value={muted ? 0 : volume}
                            aria-label="Volume"
                        />
                        <button className={styles.controlBtn} onClick={() => { setIsQueueOpen(false); setIsExpanded(true); }} title="Expand player" aria-label="Expand player">
                            <Maximize2 size={18} />
                        </button>

                        <div className={clsx(styles.playerQueueWrapper, isQueueOpen && styles.active)}>
                            <button
                                className="action-btn"
                                onClick={() => { setIsExpanded(false); setIsQueueOpen(!isQueueOpen); }}
                                title="Queue"
                                aria-label="Toggle queue"
                                aria-expanded={isQueueOpen}
                            >
                                <i className="ti-menu-alt"></i>
                            </button>
                            {isQueueOpen && <QueuePanel onClose={() => setIsQueueOpen(false)} />}
                        </div>
                    </div>
                </div>
            </footer>
            )}
            {isExpanded && currentSong && <ExpandedPlayer onClose={() => setIsExpanded(false)} currentTime={currentTime} duration={duration} onSeek={onSeek} />}
        </>
    );
}

export default Footer
