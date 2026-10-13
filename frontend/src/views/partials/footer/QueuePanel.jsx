import clsx from "clsx";
import { useShallow } from 'zustand/shallow';
import usePlayerStore, { selectQueueList } from "../../../stores/playerStore";
import { Trash2, X, Shuffle } from "lucide-react";
import styles from './Footer.module.scss';

function QueuePanel({ onClose }) {
    const queue = usePlayerStore(s => s.queue);
    const tracks = usePlayerStore(useShallow(selectQueueList));
    const currentSong = usePlayerStore(s => s.currentSong);
    const playFromQueue = usePlayerStore(s => s.playFromQueue);
    const removeFromQueue = usePlayerStore(s => s.removeFromQueue);
    const clearQueue = usePlayerStore(s => s.clearQueue);
    const shuffleQueue = usePlayerStore(s => s.shuffleQueue);

    return (
        <>
            <div className={styles.queueOutside} onClick={onClose} aria-hidden="true" />
            <div className={clsx(styles.queueDropdown, styles.show)} role="dialog" aria-label="Play queue">
            <div className={styles.queueDropdownHeader}>
                <h4>Up Next ({queue.length})</h4>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={shuffleQueue} title="Shuffle queue" aria-label="Shuffle queue"><Shuffle size={14} /></button>
                    <button onClick={clearQueue} title="Clear queue" aria-label="Clear queue"><Trash2 size={14} /></button>
                    <button onClick={onClose} aria-label="Close queue">&times;</button>
                </div>
            </div>
            <ul className={styles.queueDropdownList} id="queue-list-items">
                {tracks.map((song, i) => {
                    const id = String(song._id);
                    const isCurrent = id === String(currentSong?._id);
                    return (
                        <li key={`${id}-${i}`}
                            className={clsx(styles.queueItem, isCurrent && styles.focusItem)}
                            onClick={() => playFromQueue(id)}
                        >
                            <img src={song.imageUrl?.url} alt="" loading="lazy" />
                            <div className={styles.queueItemMeta}>
                                <strong>{song.title}</strong>
                                <span>{song.artist}</span>
                            </div>
                            {!isCurrent && (
                                <button
                                    className={styles.queueItemRemove}
                                    title="Remove from queue"
                                    aria-label={`Remove ${song.title} from queue`}
                                    onClick={(e) => { e.stopPropagation(); removeFromQueue(id); }}
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </li>
                    );
                })}
                {tracks.length === 0 && (
                    <li className={styles.queueItem}><div className={styles.queueItemMeta}><span>Queue is empty.</span></div></li>
                )}
            </ul>
            </div>
        </>
    );
}

export default QueuePanel;
