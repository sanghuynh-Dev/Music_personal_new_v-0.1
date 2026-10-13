import { useEffect, useState, useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import clsx from "clsx";
import appRoute from '../../routes/appRoute.js';
import usePlayerStore from '../../stores/playerStore';
import TrackRail from '../Home/TrackRail.jsx';
import ArtistStrip from '../Home/ArtistStrip.jsx';
import { LoadingState, ErrorState } from '../../components/ui';
import styles from './Explore.module.scss';

// Stable empty list — avoids re-syncing the follow store on every render.
const NO_SUGGESTIONS = [];

function ExplorePage() {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [genre, setGenre] = useState('All');
    const playSong = usePlayerStore(s => s.playSong);

    useEffect(() => {
        let alive = true;
        appRoute.homeRoute()
            .then((d) => { if (alive) setData(d); })
            .catch((e) => { if (alive) setError(e.message || 'Failed to load.'); });
        return () => { alive = false; };
    }, []);

    const genres = useMemo(() => {
        const counts = new Map();
        for (const s of (data?.songs || [])) {
            if (!s.genre) continue;
            counts.set(s.genre, (counts.get(s.genre) || 0) + 1);
        }
        return [...counts.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => ({ name, count }));
    }, [data]);

    const trending = useMemo(() => {
        const list = [...(data?.topSongs || [])];
        return genre === 'All' ? list : list.filter((s) => s.genre === genre);
    }, [data, genre]);

    if (error) return <ErrorState text={error} onRetry={() => window.location.reload()} />;
    if (!data) return <LoadingState text="Exploring music..." />;

    return (
        <div className={styles.explore}>
            <header className={styles.masthead}>
                <h1 className={clsx("font-display", styles.title)}>Explore</h1>
                <p className={styles.lede}>Browse by mood and genre, then follow the sound.</p>
            </header>

            {genres.length > 0 && (
                <nav className={styles.genreIndex} aria-label="Genres">
                    <button
                        className={clsx(styles.genreRow, genre === 'All' && styles.genreActive)}
                        onClick={() => setGenre('All')}
                        aria-pressed={genre === 'All'}
                    >
                        <span className={clsx(styles.genreName, "font-display")}>Everything</span>
                        <span className={clsx(styles.genreCount, "numeric")}>{(data?.songs || []).length}</span>
                        <ArrowUpRight size={20} className={styles.genreArrow} />
                    </button>
                    {genres.map((g) => (
                        <button
                            key={g.name}
                            className={clsx(styles.genreRow, genre === g.name && styles.genreActive)}
                            onClick={() => setGenre(genre === g.name ? 'All' : g.name)}
                            aria-pressed={genre === g.name}
                        >
                            <span className={clsx(styles.genreName, "font-display")}>{g.name}</span>
                            <span className={clsx(styles.genreCount, "numeric")}>{g.count}</span>
                            <ArrowUpRight size={20} className={styles.genreArrow} />
                        </button>
                    ))}
                </nav>
            )}

            <TrackRail
                title={genre === 'All' ? 'Trending now' : `Trending in ${genre}`}
                songs={trending.slice(0, 10)}
                onPlay={(id) => playSong(id)}
            />

            {(data.newReleases || []).length > 0 && (
                <TrackRail
                    title="New releases"
                    songs={(data.newReleases || []).slice(0, 10)}
                    onPlay={(id) => playSong(id)}
                />
            )}

            <ArtistStrip topArtists={data.topArtists || []} suggested={NO_SUGGESTIONS} />
        </div>
    );
}

export default ExplorePage;
