import { memo } from "react";
import { NavLink } from "react-router-dom";
import { Play, Pause } from "lucide-react";
import clsx from "clsx";

import usePlayerStore from "../../stores/playerStore";
import { ArtistLink, SongTitleLink } from "../../components/SongLinks.jsx";

import styles from './HomePage.module.scss'

function Equalizer({ active }) {
    return (
        <span className={clsx(styles.eq, !active && styles.eqPaused)} aria-hidden="true">
            <i /><i /><i /><i />
        </span>
    );
}

function HeroSection({ song }) {
    const currentSong = usePlayerStore(s => s.currentSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const playSong = usePlayerStore(s => s.playSong);
    const pauseSong = usePlayerStore(s => s.pauseSong);
    const resumeSong = usePlayerStore(s => s.resumeSong);

    if (!song) return null;
    const isCurrent = song._id === currentSong?._id;
    const playing = isCurrent && isPlaying;
    const handlePlay = () => {
        if (isCurrent) { isPlaying ? pauseSong() : resumeSong(); }
        else playSong(song._id);
    };

    return (
        <section className={styles.hero} aria-label="Featured music">
            {song.imageUrl?.url && (
                <img src={song.imageUrl.url} alt="" aria-hidden="true" className={styles.heroBg} loading="eager" />
            )}
            <div className={styles.heroOverlay} />
            <div className={styles.heroContent}>
                <p className={styles.heroKicker}>
                    <Equalizer active={playing} />
                    Featured this week
                </p>
                <h1 className={clsx(styles.heroTitle, "font-display")}><SongTitleLink song={song} /></h1>
                <p className={styles.heroArtist}>
                    <ArtistLink song={song} />
                    {(song.playCount != null) && (
                        <span className={clsx(styles.heroPlays, "numeric")}>
                            {Number(song.playCount).toLocaleString()} plays
                        </span>
                    )}
                </p>
                <div className={styles.heroActions}>
                    <button className={styles.heroPlayBtn} onClick={handlePlay} aria-label={playing ? 'Pause' : `Play ${song.title}`}>
                        {playing ? <Pause size={20} /> : <Play size={20} />}
                        {playing ? 'Pause' : 'Play'}
                    </button>
                    <NavLink to={`/songs/${song._id}`} className={styles.heroGhostBtn}>Details</NavLink>
                </div>
            </div>
            <NavLink
                to={`/songs/${song._id}`}
                className={styles.heroArt}
                aria-label={`Open ${song.title}`}
            >
                <img src={song.imageUrl?.url} alt={song.title} loading="eager" />
            </NavLink>
        </section>
    );
}

export default memo(HeroSection)
