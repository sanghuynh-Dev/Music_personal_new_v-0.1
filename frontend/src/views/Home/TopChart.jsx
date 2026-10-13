import { memo, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Play, Pause, Heart, MoreHorizontal } from "lucide-react";
import clsx from "clsx";

import usePlayerStore from "../../stores/playerStore";
import useSongStore from "../../stores/songStore";
import usePlaylistStore from "../../stores/playlistStore";
import { useAuth } from "../../contexts/AuthContext.jsx";

import styles from './HomePage.module.scss'

function TopChart({ songs }) {
    const { user } = useAuth();
    const currentSong = usePlayerStore(s => s.currentSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const playSong = usePlayerStore(s => s.playSong);
    const pauseSong = usePlayerStore(s => s.pauseSong);
    const resumeSong = usePlayerStore(s => s.resumeSong);
    const toggleLikeLocal = useSongStore(s => s.toggleLikeLocal);
    const setTopSongs = useSongStore(s => s.setTopSongs);
    const topSongsData = useSongStore(s => s.topSongs);
    const openMenu = usePlaylistStore(s => s.openMenu);

    useEffect(() => {
        setTopSongs(songs);
    }, [songs, setTopSongs]);

    const list = topSongsData?.length ? topSongsData : songs;
    const isCurrentSong = (song) => song._id === currentSong?._id;

    function handleClick(song) {
        if (isCurrentSong(song)) {
            if (isPlaying) pauseSong();
            else resumeSong();
        } else {
            playSong(song._id);
        }
    }

    function handleShowPlaylist(song, e) {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        openMenu(song._id, {
            x: Math.max(8, Math.min(rect.left - 160, window.innerWidth - 216)),
            y: rect.bottom
        });
    }

    return (
        <ol className={styles.chart}>
            {list.map((song, index) => (
                <li key={song._id} className={clsx(styles.chartRow, isCurrentSong(song) && styles.chartRowCurrent)}>
                    <span className={clsx(styles.chartRank, "font-display", "numeric")} aria-hidden="true">
                        {index + 1}
                    </span>
                    <button
                        className={styles.chartCoverBtn}
                        onClick={() => handleClick(song)}
                        aria-label={isCurrentSong(song) && isPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
                    >
                        <img src={song.imageUrl?.url} alt="" loading="lazy" />
                        <span className={styles.chartCoverIcon}>
                            {isCurrentSong(song) && isPlaying
                                ? <Pause size={18} />
                                : <Play size={18} />}
                        </span>
                    </button>
                    <div className={styles.chartMeta}>
                        <NavLink to={`/songs/${song._id}`} className={styles.chartTitle}>{song.title}</NavLink>
                        <NavLink to={`/profile/${song.uploadedBy?._id || song.uploadedBy}`} className={styles.chartArtist}>
                            {song.artist}
                        </NavLink>
                    </div>
                    <span className={clsx(styles.chartPlays, "numeric")}>
                        {(song.playCount || 0).toLocaleString()}
                    </span>
                    {user && (
                        <span className={styles.chartActions}>
                            <button
                                className={clsx(styles.chartIconBtn, song.liked && styles.liked)}
                                onClick={() => toggleLikeLocal(song._id)}
                                title="Like"
                                aria-label={`Like ${song.title}`}
                                aria-pressed={!!song.liked}
                            >
                                <Heart size={17} fill={song.liked ? 'currentColor' : 'none'} />
                            </button>
                            <button
                                className={styles.chartIconBtn}
                                onClick={(e) => handleShowPlaylist(song, e)}
                                title="Add to playlist"
                                aria-label={`Add ${song.title} to playlist`}
                            >
                                <MoreHorizontal size={18} />
                            </button>
                        </span>
                    )}
                </li>
            ))}
        </ol>
    );
}

export default memo(TopChart)
