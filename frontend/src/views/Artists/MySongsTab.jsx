import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Play, Pause, Pencil, Trash2 } from "lucide-react";
import usePlayerStore from "../../stores/playerStore";
import useSongStore from "../../stores/songStore";
import artistApi from "../../services/artistApi";
import { SearchInput, Dropdown, Pagination, LoadingState, ErrorState, EmptyState } from "../../components/ui";
import styles from './Artist.module.scss';

function useDebounced(value, delay = 400) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return v;
}

function MySongsTab() {
    const [songs, setSongs] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [q, setQ] = useState('');
    const [sort, setSort] = useState('newest');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tick, setTick] = useState(0);
    const debouncedQ = useDebounced(q);

    const currentSong = usePlayerStore(s => s.currentSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const playSong = usePlayerStore(s => s.playSong);
    const pauseSong = usePlayerStore(s => s.pauseSong);
    const resumeSong = usePlayerStore(s => s.resumeSong);
    const deleteSong = useSongStore(s => s.deleteSong);
    const reloadSongs = useSongStore(s => s.reload);

    useEffect(() => {
        let alive = true;
        artistApi.getMySongs({ q: debouncedQ, page, sort })
            .then((d) => {
                if (!alive) return;
                setSongs(d.songs || []);
                setTotal(d.total || 0);
                setTotalPages(d.totalPages || 1);
                setError('');
                setLoading(false);
            })
            .catch((e) => { if (alive) { setError(e.message || 'Failed to load songs.'); setLoading(false); } });
        return () => { alive = false; };
    }, [debouncedQ, page, sort, reloadSongs, tick]);

    const handlePlay = (song) => {
        if (currentSong?._id === song._id) { isPlaying ? pauseSong() : resumeSong(); }
        else playSong(song._id);
    };

    const handleSearch = (e) => { setQ(e.target.value); setPage(1); setLoading(true); };
    const handleSort = (e) => { setSort(e.target.value); setPage(1); setLoading(true); };
    const handlePage = (dir) => { setLoading(true); setPage((p) => dir > 0 ? Math.min(totalPages, p + 1) : Math.max(1, p - 1)); };

    return (
        <div>
            <div className={styles.manageBar}>
                <SearchInput value={q} onChange={handleSearch} placeholder="Search your tracks..." />
                <Dropdown value={sort} onChange={handleSort} aria-label="Sort tracks">
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="plays">Most played</option>
                </Dropdown>
            </div>

            {loading && <LoadingState text="Loading your tracks..." />}
            {!loading && error && <ErrorState text={error} onRetry={() => setTick((t) => t + 1)} />}
            {!loading && !error && songs.length === 0 && (
                <EmptyState title="No tracks found" text={q ? `Nothing matches "${q}".` : 'Upload your first track to get started.'} />
            )}
            {!loading && !error && songs.length > 0 && (
                <>
                    <ul className={styles.trackList}>
                        {songs.map((song) => (
                            <li key={song._id} className={styles.trackRow}>
                                <button onClick={() => handlePlay(song)} aria-label={`Play ${song.title}`} className={styles.trackPlay}>
                                    {currentSong?._id === song._id && isPlaying ? <Pause size={18} /> : <Play size={18} />}
                                </button>
                                <img src={song.imageUrl?.url} alt="" loading="lazy" className={styles.trackThumb} />
                                <div className={styles.trackMeta}>
                                    <NavLink to={`/songs/${song._id}`} className={styles.trackTitle}>{song.title}</NavLink>
                                    <span className={styles.trackSub}>
                                        {(song.playCount || 0).toLocaleString()} plays • {(song.likeCount ?? song.likes?.length ?? 0).toLocaleString()} likes • {song.createdAt ? new Date(song.createdAt).toLocaleDateString() : ''}
                                    </span>
                                </div>
                                <div className={styles.trackActions}>
                                    <NavLink to={`/songs/edit/${song._id}`} title="Edit" aria-label={`Edit ${song.title}`} className={styles.trackIconBtn}>
                                        <Pencil size={16} />
                                    </NavLink>
                                    <button title="Delete" aria-label={`Delete ${song.title}`} className={styles.trackIconBtnDanger}
                                        onClick={() => deleteSong(song._id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <Pagination
                        hasPrev={page > 1} hasNext={page < totalPages}
                        onPrev={() => handlePage(-1)}
                        onNext={() => handlePage(1)}
                        info={`Page ${page} of ${totalPages} • ${total} tracks`}
                    />
                </>
            )}
        </div>
    );
}

export default MySongsTab;
