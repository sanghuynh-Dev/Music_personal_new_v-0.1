import { useEffect, useState, useMemo } from "react";
import { NavLink, useSearchParams } from 'react-router-dom';
import { Play, Pause, Heart, History as HistoryIcon, TrendingUp } from "lucide-react";
import clsx from "clsx";
import usePlayerStore from "../../stores/playerStore";
import useSongStore from "../../stores/songStore";
import { useAuth } from "../../contexts/AuthContext.jsx";
import appRoute from '../../routes/appRoute.js';
import { ArtistCard, PlaylistCard, CardGrid, LoadingState, NoResults, ErrorState } from "../../components/ui";
import styles from './Search.module.scss';

const RECENT_KEY = 'soundora_recent_searches';
const loadRecent = () => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; } };
const saveRecent = (q) => {
    try {
        const list = [q, ...loadRecent().filter((x) => x !== q)].slice(0, 8);
        localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    } catch { /* private mode */ }
};

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'songs', label: 'Songs' },
    { key: 'artists', label: 'Artists' },
    { key: 'playlists', label: 'Playlists' },
];

function useDebounced(value, delay = 400) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return v;
}

function SearchPage() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlQ = searchParams.get("q") || '';
    const [input, setInput] = useState(urlQ);
    const [filter, setFilter] = useState('all');
    const [results, setResults] = useState({ songs: [], artists: [], playlists: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [recent, setRecent] = useState(loadRecent);

    const playSong = usePlayerStore(s => s.playSong);
    const pauseSong = usePlayerStore(s => s.pauseSong);
    const resumeSong = usePlayerStore(s => s.resumeSong);
    const currentSong = usePlayerStore(s => s.currentSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const toggleLikeLocal = useSongStore(s => s.toggleLikeLocal);
    const setSongs = useSongStore(s => s.setSongs);

    const debounced = useDebounced(input);
    const [tick, setTick] = useState(0);

    const [prevUrlQ, setPrevUrlQ] = useState(urlQ);
    if (urlQ !== prevUrlQ) {
        setPrevUrlQ(urlQ);
        setInput(urlQ);
    }

    useEffect(() => {
        const q = debounced.trim();
        if (!q) return;
        let alive = true;
        appRoute.searchRoute(q)
            .then((data) => {
                if (!alive) return;
                setResults({ songs: data.songs || [], artists: data.artists || [], playlists: data.playlists || [] });
                setSongs(data.songs || []);
                setLoading(false);
            })
            .catch((e) => { if (alive) { setError(e.message || 'Search failed.'); setLoading(false); } });
        return () => { alive = false; };
    }, [debounced, tick, setSongs]);

    const handleInputChange = (e) => {
        const v = e.target.value;
        setInput(v);
        if (v.trim()) {
            setLoading(true);
            setError('');
        } else {
            setLoading(false);
            setError('');
            setResults({ songs: [], artists: [], playlists: [] });
        }
    };

    const submit = (e) => {
        e.preventDefault();
        const q = input.trim();
        if (q) {
            saveRecent(q);
            setRecent(loadRecent());
            setSearchParams(q ? { q } : {});
        }
    };

    const pickRecent = (r) => {
        setInput(r);
        setLoading(true);
        setSearchParams({ q: r });
    };

    const isCurrentSong = (song) => song._id === currentSong?._id;
    const handlePlay = (song) => {
        if (isCurrentSong(song)) { isPlaying ? pauseSong() : resumeSong(); }
        else playSong(song._id);
    };
    async function handleSearchLike(songId) {
        const data = await toggleLikeLocal(songId);
        // Optimistic local sync — no refetch of already-loaded results.
        if (data && typeof data.liked !== 'undefined') {
            setResults((prev) => ({
                ...prev,
                songs: prev.songs.map((s) =>
                    s._id === songId ? { ...s, liked: data.liked } : s
                ),
            }));
        }
    }

    const counts = useMemo(() => ({
        songs: results.songs.length, artists: results.artists.length, playlists: results.playlists.length,
    }), [results]);
    const hasAny = counts.songs + counts.artists + counts.playlists > 0;
    const q = debounced.trim();
    const show = (key) => filter === 'all' || filter === key;
    const spotlight = results.songs[0];

    return (
        <div className={styles.search}>
            <div className={styles.hero}>
                <h1 className={clsx("font-display", styles.heroTitle)}>What do you want to hear?</h1>
                <form onSubmit={submit} role="search" className={styles.heroForm}>
                    <input
                        type="search"
                        aria-label="Search for songs, artists, or playlists"
                        placeholder="Songs, artists, playlists…"
                        value={input}
                        onChange={handleInputChange}
                        className={styles.heroInput}
                        autoComplete="off"
                    />
                </form>
                {!q && recent.length > 0 && (
                    <div className={styles.recent}>
                        <p className={styles.recentLabel}><HistoryIcon size={14} /> Recent</p>
                        <div className={styles.chips}>
                            {recent.map((r) => (
                                <button key={r} onClick={() => pickRecent(r)} className={styles.chip}>
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {q && (
                <div className={styles.filters} role="tablist" aria-label="Result types">
                    {FILTERS.map((f) => (
                        <button
                            key={f.key}
                            role="tab"
                            aria-selected={filter === f.key}
                            className={clsx(styles.filterBtn, filter === f.key && styles.filterActive)}
                            onClick={() => setFilter(f.key)}
                        >
                            {f.label}
                            {(f.key !== 'all' && counts[f.key] > 0) && (
                                <span className={clsx(styles.filterCount, "numeric")}>{counts[f.key]}</span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            <div className={styles.results}>
                {loading && <LoadingState text={`Searching for "${q}"...`} />}
                {!loading && error && <ErrorState text={error} onRetry={() => { setError(''); setLoading(true); setTick((t) => t + 1); }} />}
                {!loading && !error && q && !hasAny && <NoResults query={q} />}

                {!loading && !error && show('songs') && spotlight && (
                    <NavLink to={`/songs/${spotlight._id}`} className={styles.spotlight}>
                        <img src={spotlight.imageUrl?.url} alt="" loading="lazy" />
                        <div className={styles.spotlightMeta}>
                            <p className={styles.spotlightKicker}><TrendingUp size={13} /> Top result</p>
                            <p className={clsx(styles.spotlightTitle, "font-display")}>{spotlight.title}</p>
                            <p className={styles.spotlightArtist}>{spotlight.artist}</p>
                        </div>
                        <span
                            role="button"
                            tabIndex={0}
                            aria-label={isCurrentSong(spotlight) && isPlaying ? `Pause ${spotlight.title}` : `Play ${spotlight.title}`}
                            className={styles.spotlightPlay}
                            onClick={(e) => { e.preventDefault(); handlePlay(spotlight); }}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePlay(spotlight); } }}
                        >
                            {isCurrentSong(spotlight) && isPlaying ? <Pause size={20} /> : <Play size={20} />}
                        </span>
                    </NavLink>
                )}

                {!loading && !error && show('songs') && results.songs.length > 1 && (
                    <section aria-label="Songs">
                        <h2 className={clsx(styles.groupTitle, "font-display")}>Songs</h2>
                        <ol className={styles.songList}>
                            {results.songs.slice(1).map((song, i) => (
                                <li key={song._id} className={styles.songItem}>
                                    <button
                                        className={styles.songPlay}
                                        onClick={() => handlePlay(song)}
                                        aria-label={isCurrentSong(song) && isPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
                                    >
                                        {isCurrentSong(song) && isPlaying ? <Pause size={16} /> : <Play size={16} />}
                                    </button>
                                    <img src={song.imageUrl?.url} alt="" loading="lazy" />
                                    <div className={styles.songMeta}>
                                        <NavLink to={`/songs/${song._id}`}>{song.title}</NavLink>
                                        <small>{song.artist}</small>
                                    </div>
                                    <span className={clsx(styles.songIndex, "numeric")}>{String(i + 2).padStart(2, '0')}</span>
                                    {user && (
                                        <button
                                            className={clsx(styles.likeBtn, song.liked && styles.liked)}
                                            onClick={() => handleSearchLike(song._id)}
                                            aria-label={`Like ${song.title}`}
                                            aria-pressed={!!song.liked}
                                        >
                                            <Heart size={16} fill={song.liked ? 'currentColor' : 'none'} />
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </section>
                )}

                {!loading && !error && show('artists') && counts.artists > 0 && (
                    <section aria-label="Artists">
                        <h2 className={clsx(styles.groupTitle, "font-display")}>Artists</h2>
                        <CardGrid>{results.artists.map((a) => <ArtistCard key={a._id} artist={a} />)}</CardGrid>
                    </section>
                )}

                {!loading && !error && show('playlists') && counts.playlists > 0 && (
                    <section aria-label="Playlists">
                        <h2 className={clsx(styles.groupTitle, "font-display")}>Playlists</h2>
                        <CardGrid>{results.playlists.map((p) => <PlaylistCard key={p._id} playlist={p} />)}</CardGrid>
                    </section>
                )}
            </div>
        </div>
    );
}

export default SearchPage
