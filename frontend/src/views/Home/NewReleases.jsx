import { useEffect, memo } from "react";
import { NavLink } from 'react-router-dom';

import usePlayerStore from "../../stores/playerStore";
import styles from './HomePage.module.scss'

function NewReleases({ newReleases }) {
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
            { newReleases?.length > 0 && (
                // console.log("newReleases"),
                <section className={styles["homeSection"]}>
                    <h2 className={styles["sectionTitle"]}>New Releases</h2>
                    <div className={styles["recentlyPlayedGrid"]}>
                        {newReleases.map((song) => (
                            <div key={song._id} className={styles["recentSongCard"]}>
                                <img src= {song.imageUrl?.url || "https://res.cloudinary.com/dqynaodv1/image/upload/v1717904033/resources/images/default-thumbnail.png"} alt={song.title}/>
                                <div className={styles["recentMeta"]}>
                                    <NavLink to={`/songs/${song._id}`} style={{ display: "block" }}>
                                        <h4>{song.title}</h4>
                                    </NavLink>
                                    <p>{song.artist}</p>
                                </div>
                                <button className={styles["recentPlayBtn"]} title="Play" onClick={() => handleClick(song)}>
                                    { isCurrentSong(song) && isPlaying ? (
                                         <svg className="icon-pause" id="pause-icon" width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M6 5h4v14H6zm8 0h4v14h-4z"></path>
                                        </svg>
                                    ): (
                                        <svg className="icon-play" id="play-icon" width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M8 5v14l11-7z"></path>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </>
    )
}

export default memo(NewReleases)