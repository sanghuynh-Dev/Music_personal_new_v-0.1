import { useEffect, memo } from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "../../contexts/AuthContext.jsx";

import usePlayerStore from "../../stores/playerStore";
import apiUser from '../../services/userApi';
import appRoute from '../../routes/appRoute.js';
import styles from './HomePage.module.scss'

function RecentlyPlayed({ recentlyPlayed }) {
    const {user} = useAuth();
    const currentSong = usePlayerStore(s => s.currentSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const playSong = usePlayerStore(s => s.playSong);
    const pauseSong = usePlayerStore(s => s.pauseSong);
    const resumeSong = usePlayerStore(s => s.resumeSong);

    const isCurrentSong = (song) => song._id === currentSong?._id;

    function handleClick(song) {
        if (isCurrentSong(song)) {
            if (isPlaying) pauseSong();
            else resumeSong();
        } else {
            playSong(song._id);
        }
    }

    return (
        <>
            { user && recentlyPlayed?.length > 0 && (
                // console.log("recentlyPlayed"),
                <section className={clsx(styles.homeSection, "recently-played-section")}>
                    <h2 className={styles.sectionTitle}>Recently Played</h2>
                    <div className={styles.recentlyPlayedGrid}>
                        {recentlyPlayed.map((historyItem) => {
                            const song = historyItem.song;
                            return (
                                <div key={song._id} className={styles.recentSongCard}>
                                    <img src= {song.imageUrl?.url} alt={song.title}/>
                                    <div className={styles.recentMeta}>
                                        <NavLink to={`/songs/${song._id}`}><h4>{song.title}</h4></NavLink>
                                        <NavLink to={`/profile/${song.uploadedBy?._id}`}><p>{song.artist}</p></NavLink>
                                    </div>
                                    <button 
                                        className={styles.recentPlayBtn} 
                                        title="Play" 
                                        onClick={() => handleClick(song)}
                                        >
                                        { isCurrentSong(song) && isPlaying ? (
                                            <svg className="icon-pause" id="pause-icon" width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M6 5h4v14H6zm8 0h4v14h-4z"></path>
                                            </svg>
                                        ) : (
                                            <svg className="icon-play" id="play-icon" width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M8 5v14l11-7z"></path>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}
        </>
    )
}

export default memo(RecentlyPlayed)