import { NavLink } from 'react-router-dom';
import { X, Heart } from 'lucide-react';
import clsx from 'clsx';
import { useShallow } from 'zustand/shallow';
import { useAuth } from "../../../contexts/AuthContext.jsx";
import usePlayerStore, { selectQueueList } from "../../../stores/playerStore";
import useSongStore from "../../../stores/songStore";
import ControlBtn from "./ControlBtn.jsx";
import styles from './Footer.module.scss';

function formatTime(seconds) {
    if (seconds == null || isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function ExpandedPlayer({ onClose, currentTime, duration, onSeek }) {
    const { user } = useAuth();
    const currentSong = usePlayerStore(s => s.currentSong);
    const queueIndex = usePlayerStore(s => s.queueIndex);
    const tracks = usePlayerStore(useShallow(selectQueueList));
    const playFromQueue = usePlayerStore(s => s.playFromQueue);
    const toggleLikeLocal = useSongStore(s => s.toggleLikeLocal);
    const songDetail = useSongStore(s => s.songDetail);

    if (!currentSong) return null;
    const likedTrack = songDetail && songDetail._id === currentSong._id ? songDetail : currentSong;

    return (
        <div className={styles.expandedOverlay} role="dialog" aria-modal="true" aria-label="Expanded player" onClick={onClose}>
            <div className={styles.expandedPanel} onClick={(e) => e.stopPropagation()}>
                <button className={styles.expandedClose} onClick={onClose} aria-label="Collapse player"><X size={22} /></button>
                <img src={currentSong.imageUrl?.url} alt={currentSong.title} className={styles.expandedArtwork} />
                <div className={styles.expandedMeta}>
                    <h2 className={styles.expandedTitle}>{currentSong.title}</h2>
                    <NavLink to={`/profile/${currentSong.uploadedBy?._id}`} className={styles.expandedArtist} onClick={onClose}>
                        {currentSong.artist}
                    </NavLink>
                    <p className={styles.expandedSub}>
                        {(currentSong.playCount || 0).toLocaleString()} plays
                        {currentSong.genre ? ` • ${currentSong.genre}` : ''}
                    </p>
                </div>
                <div className={styles.expandedTimeline}>
                    <span>{formatTime(currentTime)}</span>
                    <input type="range" className={styles.progressRange}
                        style={{ '--fill': `${duration ? Math.min(100, (currentTime / duration) * 100) : 0}%` }}
                        min={0} max={Math.floor(duration) || 0}
                        step={1} value={Math.floor(currentTime)} onChange={onSeek} aria-label="Seek" />
                    <span>{formatTime(duration)}</span>
                </div>
                <div className={styles.expandedControls}>
                    <ControlBtn />
                    {user && (
                    <button
                        className={clsx("action-btn", likedTrack?.liked && "liked")}
                        onClick={() => toggleLikeLocal(currentSong._id)}
                        aria-label={likedTrack?.liked ? 'Unlike' : 'Like'}
                        style={{ fontSize: 22 }}
                    >
                        <Heart size={22} fill={likedTrack?.liked ? 'currentColor' : 'none'} />
                    </button>
                    )}
                </div>
                <div className={styles.expandedQueue}>
                    <h3>Up next</h3>
                    <ul>
                        {tracks.slice(queueIndex, queueIndex + 6).map((song) => (
                            <li key={String(song._id)} onClick={() => playFromQueue(String(song._id))}
                                className={clsx(String(song._id) === String(currentSong._id) && styles.focusItem)}>
                                <img src={song.imageUrl?.url} alt="" loading="lazy" />
                                <div><strong>{song.title}</strong><span>{song.artist}</span></div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default ExpandedPlayer;
