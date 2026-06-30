import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { NavLink } from 'react-router-dom';
import { useAuth } from "../../../contexts/AuthContext.jsx";
import usePlayerStore from "../../../stores/playerStore";
import useSongStore from "../../../stores/songStore";
import RenderQueue from "./RenderQueue.jsx";
import ControlBtn from "./ControlBtn.jsx";
import styles from './Footer.module.scss'

function Footer() {
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [isShow, setIsShow] = useState(false);
    const { user } = useAuth();
    const audioRef = useRef();

    const currentSong = usePlayerStore(s => s.currentSong);
    const originalInfoQueue = usePlayerStore(s => s.originalInfoQueue);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const setAudioRef = usePlayerStore(s => s.setAudioRef);
    const nextSong = usePlayerStore(s => s.nextSong);
    const repeatMode = usePlayerStore(s => s.repeatMode);
    const activePlaylistId = usePlayerStore(s => s.activePlaylistId);

    const toggleLikeLocal = useSongStore(s => s.toggleLikeLocal);
    const { reload,songDetail } = useSongStore();


    useEffect(() => {
        setAudioRef(audioRef.current);
    }, [currentSong]);

    useEffect(() => {
        if (!audioRef.current || !currentSong) return;

        audioRef.current.src = currentSong.audioUrl.url;
        audioRef.current.load();
        audioRef.current.oncanplaythrough = () => {
            audioRef.current.play();
        };
    }, [currentSong]);

    useEffect(() => {
        if (!audioRef.current) return;

        audioRef.current.loop = repeatMode === "one";
    }, [repeatMode]);
    useEffect(() => {
        if (!audioRef.current) return;

        audioRef.current.volume = volume;
    }, [volume]);
    function updateProgressBar() {
        if (audioRef.current?.duration) {
            const audio = audioRef.current;
            const percentage = (audio.currentTime / audio.duration) * 100;
            setProgress(percentage);
        }
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function seekAudio(e) {
        const width = e.currentTarget.clientWidth;
        const clickX = e.nativeEvent.offsetX;
        const duration = audioRef.current.duration;

        if (duration) {
            audioRef.current.currentTime = (clickX / width) * duration;
        }
    }

    return (
        <>
            { currentSong && (
                <>
                    <footer id={styles.playerBar} >
                        <div className={styles.playerBarContainer}>
                            <div className={styles.currentSongDetails} id="player-song-details" >
                                <img src={currentSong?.imageUrl?.url} alt="" className={styles.playerSongImg} id="player-song-thumbnail"/>
                                <div className={styles.playerSongMeta}>
                                    <span className={styles.playerSongTitle} >{currentSong?.title}</span>
                                    <NavLink to={`/profile/${currentSong?.uploadedBy?._id}`} className={styles.playerSongArtist} >{currentSong?.artist}</NavLink>
                                </div>
                                
                                { user && (
                                    <div className={styles.playerSongActions}>
                                        <button 
                                            className={clsx("action-btn", songDetail?.liked && "liked")} 
                                            onClick={() => toggleLikeLocal(songDetail._id)}>
                                            <i className="ti-heart"></i>
                                        </button>
                                        
                                        
                                    </div>
                                )}
                            </div>
                            
                            <div className={styles.playerControls}>
                                <ControlBtn />
                                <div className={styles.playerControlTimeline}>
                                    <span className={styles.playerTime}>{formatTime(audioRef.current?.currentTime)}</span>
                                    <div className={styles.playerTimeline} onClick={(e) => seekAudio(e)}>
                                        <div className={styles.playerProgress} style={{width: progress + "%"}}></div>
                                    </div>
                                    <span className={styles.playerTime}>{formatTime(audioRef.current?.duration)}</span>
                                </div>
                            </div>

                            <div className={styles.volumeContainer}>
                                <button className={styles.controlBtn} id="player-btn-volume" title="Volume"><i className="ti-volume"></i></button>
                                <input 
                                    type="range" 
                                    className={styles.volumeSlider} 
                                    onChange={e => {setVolume(e.target.value)}} 
                                    min="0" max="1" step="0.01" value={volume}/>

                                <div className={clsx(styles.playerQueueWrapper, isShow && styles.active)}>
                                    <button 
                                        className="action-btn"
                                        onClick={() => setIsShow(!isShow)}
                                        title="Queue">
                                        <i className="ti-menu-alt"></i>
                                    </button>
                                    <div className={clsx(styles.queueDropdown, isShow && styles.show)}>
                                        <div className={styles.queueDropdownHeader}>
                                            <h4>Next Up</h4>
                                            <button onClick={() => setIsShow(!isShow)}>&times;</button>
                                        </div>
                                        <ul className={styles.queueDropdownList} id="queue-list-items">
                                            <RenderQueue originalInfoQueue={originalInfoQueue} />
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            {/* <!-- Current Song Info --> */}
                            
                        </div>
                    </footer>
                    {/* <!-- Audio element --> */}
                    <audio 
                        ref={audioRef} 
                        preload="metadata"
                        onTimeUpdate={updateProgressBar}
                        onEnded={nextSong}
                        >
                    </audio>

                    {/* <!-- Create Playlist Modal --> */}
                    

                    {/* <!-- Dropdown for adding songs to playlists --> */}
                    {/* <PlaylisOption /> */}
                </>
            )}
        </>
    );
}

export default Footer