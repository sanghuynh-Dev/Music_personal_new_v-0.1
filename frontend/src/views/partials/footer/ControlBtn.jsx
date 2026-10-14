
import { memo } from "react";
import clsx from "clsx";
import usePlayerStore from "../../../stores/playerStore";
import PlayPauseIcon from "../../../components/PlayPauseIcon";
import styles from './Footer.module.scss';
function ControlBtn() {
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
        <div className={styles.playerControlBtns}>
            <button
                onClick={() => toggleShuffle()}
                className={clsx(styles.controlBtn, isShuffle && styles.active)}
                title="Shuffle"
                aria-label="Toggle shuffle"
                aria-pressed={isShuffle}>
                <i className="ti-control-shuffle"></i>
            </button>
            <button
                onClick={() => handlePrevSong()}
                className={styles.controlBtn}
                title="Previous"
                aria-label="Previous track">
                    <i className="ti-control-skip-backward"></i>
            </button>
            <button
                className={clsx(styles.controlBtn, styles.playBtn)}
                onClick={() => handlePlay()}
                title="Play/Pause"
                aria-label={isPlaying ? 'Pause' : 'Play'}>
                <PlayPauseIcon playing={isPlaying} size={24} />
            </button>
            <button 
                onClick={() => handleNextSong()}
                className={styles.controlBtn} 
                title="Next"
                aria-label="Next track">
                <i className="ti-control-skip-forward"></i>
            </button>
            <button 
                className={clsx(styles.controlBtn, ["all", "one"].includes(repeatMode) && styles.active, repeatMode === "one" && styles.loopOne)} 
                onClick={() => toggleRepeat()}
                title={`Repeat: ${repeatMode}`}
                aria-label={`Repeat mode: ${repeatMode}`}
                aria-pressed={repeatMode !== "off"}>
                <i className="ti-loop"></i>
            </button>
        </div>
    )
}

export default memo(ControlBtn)