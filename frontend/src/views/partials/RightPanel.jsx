import { NavLink } from 'react-router-dom';
import { X, Play, Pause } from 'lucide-react';
import clsx from 'clsx';
import { useShallow } from 'zustand/shallow';
import usePlayerStore, { selectQueueList } from "../../stores/playerStore";
import useUiStore from '../../stores/uiStore.js';
import styles from './RightPanel.module.scss';

function RightPanel() {
    const open = useUiStore(s => s.rightPanelOpen);
    const setOpen = useUiStore(s => s.toggleRightPanel);
    const currentSong = usePlayerStore(s => s.currentSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const pauseSong = usePlayerStore(s => s.pauseSong);
    const resumeSong = usePlayerStore(s => s.resumeSong);
    const playFromQueue = usePlayerStore(s => s.playFromQueue);
    const tracks = usePlayerStore(useShallow(selectQueueList));

    if (!open) return null;

    const upNext = (tracks || []).filter(t => String(t._id) !== String(currentSong?._id)).slice(0, 8);

    return (
        <aside className={styles.panel} aria-label="Now playing">
            <div className={styles.panelHead}>
                <h2>Now playing</h2>
                <button onClick={setOpen} aria-label="Close now playing panel">
                    <X size={18} />
                </button>
            </div>

            {currentSong ? (
                <div className={styles.nowPlaying}>
                    <img
                        src={currentSong.imageUrl?.url}
                        alt={currentSong.title}
                        className={clsx(styles.artwork, isPlaying && styles.spinning)}
                        loading="lazy"
                    />
                    <div className={styles.meta}>
                        <NavLink to={`/songs/${currentSong._id}`} className={styles.title}>
                            {currentSong.title}
                        </NavLink>
                        <NavLink to={`/profile/${currentSong.uploadedBy?._id}`} className={styles.artist}>
                            {currentSong.artist}
                        </NavLink>
                    </div>
                    <button
                        className={styles.inlinePlay}
                        onClick={() => { isPlaying ? pauseSong() : resumeSong(); }}
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                </div>
            ) : (
                <p className={styles.empty}>Nothing playing yet. Pick a track to begin.</p>
            )}

            <div className={styles.upNextHead}>
                <h3>Up next</h3>
                <span className={styles.count}>{upNext.length}</span>
            </div>
            {upNext.length > 0 ? (
                <ul className={styles.upNextList}>
                    {upNext.map((t) => (
                        <li key={String(t._id)}>
                            <button onClick={() => playFromQueue(String(t._id))}>
                                <img src={t.imageUrl?.url} alt="" loading="lazy" />
                                <span className={styles.trackMeta}>
                                    <strong>{t.title}</strong>
                                    <small>{t.artist}</small>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className={styles.empty}>Your queue is empty.</p>
            )}
        </aside>
    );
}

export default RightPanel;
