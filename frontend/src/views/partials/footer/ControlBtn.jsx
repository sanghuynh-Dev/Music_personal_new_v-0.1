
import { NavLink } from 'react-router-dom';
import { memo } from "react";
import clsx from "clsx";
import usePlayerStore from "../../../stores/playerStore";
import styles from './Footer.module.scss';
function ControlBtn({originalInfoQueue}) {
    const playSong = usePlayerStore(s => s.playSong);
    const pauseSong = usePlayerStore(s => s.pauseSong);
    const resumeSong = usePlayerStore(s => s.resumeSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const currentSong = usePlayerStore(s => s.currentSong);
    const isShuffle = usePlayerStore(s => s.isShuffle);
    const toggleShuffle = usePlayerStore(s => s.toggleShuffle);
    const toggleRepeat = usePlayerStore(s => s.toggleRepeat);
    const repeatMode = usePlayerStore(s => s.repeatMode);
    const nextSong = usePlayerStore(s => s.nextSong);
    const prevSong = usePlayerStore(s => s.prevSong);
    function handlePlay() {
        if (currentSong) {
            if (isPlaying) pauseSong();
            else resumeSong();
        }
    }

    function handleNextSong() {
        if (currentSong) {
            nextSong();
        }
    }

     function handlePrevSong() {
        if (currentSong) {
            prevSong();
        }
    }
    return (
        console.log("control"),
        <div className={styles.playerControlBtns}>
            <button 
                onClick={() => toggleShuffle()}
                className={clsx(styles.controlBtn, isShuffle && styles.active)} 
                title="Shuffle">
                <i className="ti-control-shuffle"></i>
            </button>
            <button 
                onClick={() => handlePrevSong()}
                className={styles.controlBtn} 
                title="Previous">
                    <i className="ti-control-skip-backward"></i>
            </button>
            <button 
                className={clsx(styles.controlBtn, styles.playBtn)}
                onClick={() => handlePlay()}
                title="Play/Pause">
                { isPlaying ? (
                    <svg className="icon-pause" id="pause-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 5h4v14H6zm8 0h4v14h-4z"></path>
                    </svg>
                ) : (
                    <svg className="icon-play" id="play-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"></path>
                    </svg>
                )}
            </button>
            <button 
                onClick={() => handleNextSong()}
                className={styles.controlBtn} 
                title="Next">
                <i className="ti-control-skip-forward"></i>
            </button>
            <button 
                className={clsx(styles.controlBtn, ["all", "one"].includes(repeatMode) && styles.active, repeatMode === "one" && styles.loopOne)} 
                onClick={() => toggleRepeat()}
                title="Repeat">
                <i className="ti-loop"></i>
            </button>
        </div>
    )
}

export default memo(ControlBtn)