import { memo, useRef } from "react";
import { NavLink } from "react-router-dom";
import { Play, Pause, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import clsx from "clsx";

import usePlayerStore from "../../stores/playerStore";
import { ArtistLink } from "../../components/SongLinks.jsx";

import styles from './HomePage.module.scss'

function TrackRail({ title, linkTo, linkLabel, songs, onPlay }) {
    const currentSong = usePlayerStore(s => s.currentSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const pauseSong = usePlayerStore(s => s.pauseSong);
    const resumeSong = usePlayerStore(s => s.resumeSong);
    const trackRef = useRef(null);

    if (!songs?.length) return null;

    const scrollBy = (dir) => {
        const el = trackRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
    };

    const handleClick = (song) => {
        const isCurrent = song._id === currentSong?._id;
        if (isCurrent) {
            if (isPlaying) pauseSong();
            else resumeSong();
        } else {
            onPlay(song._id);
        }
    };

    return (
        <section aria-label={title}>
            <div className={styles.sectionHead}>
                <h2 className={clsx(styles.sectionTitle, "font-display")}>{title}</h2>
                <div className={styles.sectionTools}>
                    {linkTo && (
                        <NavLink to={linkTo} className={styles.sectionLink}>
                            {linkLabel || 'View all'} <ArrowRight size={15} />
                        </NavLink>
                    )}
                    <div className={styles.railArrows}>
                        <button onClick={() => scrollBy(-1)} aria-label={`Scroll ${title} backward`}>
                            <ChevronLeft size={18} />
                        </button>
                        <button onClick={() => scrollBy(1)} aria-label={`Scroll ${title} forward`}>
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
            <div className={styles.rail} ref={trackRef}>
                {songs.map((song) => {
                    const isCurrent = song._id === currentSong?._id;
                    return (
                        <article key={song._id} className={styles.railCard}>
                            <div className={styles.railArt}>
                                <img src={song.imageUrl?.url} alt={song.title} loading="lazy" />
                                <button
                                    className={styles.railPlayBtn}
                                    onClick={() => handleClick(song)}
                                    aria-label={isCurrent && isPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
                                >
                                    {isCurrent && isPlaying ? <Pause size={18} /> : <Play size={18} />}
                                </button>
                            </div>
                            <NavLink to={`/songs/${song._id}`} className={styles.railTitle}>{song.title}</NavLink>
                            <ArtistLink song={song} className={styles.railArtist} />
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

export default memo(TrackRail)
