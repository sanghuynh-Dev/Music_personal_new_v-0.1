import clsx from "clsx";
import { NavLink } from 'react-router-dom';
import { memo } from "react";
import usePlayerStore from "../../../stores/playerStore";
import styles from './Footer.module.scss';
function RenderQueue({originalInfoQueue}) {
    const playSong = usePlayerStore(s => s.playSong);
    const pauseSong = usePlayerStore(s => s.pauseSong);
    const resumeSong = usePlayerStore(s => s.resumeSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const currentSong = usePlayerStore(s => s.currentSong);
    const isCurrentSong = (song) => song._id === currentSong?._id;
    function handlePlaySongClick(song,playlist) {
        if (isCurrentSong(song)) {
            if (isPlaying) pauseSong();
            else resumeSong();
        } else {
            playSong(song._id,playlist);
        }
    }
    return (
        originalInfoQueue && originalInfoQueue.map((song, index) => (
            <li key={song._id} 
                className={clsx(styles.queueItem, isCurrentSong(song) && styles.focusItem)} 
                onClick={() => handlePlaySongClick(song, originalInfoQueue)}>
                <img src={song.imageUrl?.url || "https://res.cloudinary.com/dqynaodv1/image/upload/v1717904033/resources/images/default-thumbnail.png"} alt={song.title} />
                <div className={styles.queueItemMeta}>
                    <strong>{song.title}</strong>
                    <span>{song.artist}</span>
                </div>
            </li>
        ))
    )
}

export default memo(RenderQueue)