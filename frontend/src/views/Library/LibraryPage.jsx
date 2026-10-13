import { useEffect, useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Library as LibraryIcon, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import clsx from "clsx";
import appRoute from '../../routes/appRoute.js';
import apiUser from '../../services/userApi';
import usePlayerStore from '../../stores/playerStore';
import { SongCard, ArtistCard, PlaylistCard, LoadingState, ErrorState, EmptyState } from '../../components/ui';
import styles from './Library.module.scss';

function Shelf({ title, linkTo, children }) {
    const ref = useRef(null);
    const scrollBy = (dir) => {
        const el = ref.current;
        if (!el) return;
        el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
    };
    return (
        <section aria-label={title} className={styles.shelf}>
            <div className={styles.shelfHead}>
                <h2 className={clsx(styles.shelfTitle, "font-display")}>{title}</h2>
                <div className={styles.shelfTools}>
                    {linkTo && (
                        <NavLink to={linkTo} className={styles.shelfLink}>
                            View all <ArrowRight size={15} />
                        </NavLink>
                    )}
                    <div className={styles.shelfArrows}>
                        <button onClick={() => scrollBy(-1)} aria-label={`Scroll ${title} backward`}>
                            <ChevronLeft size={18} />
                        </button>
                        <button onClick={() => scrollBy(1)} aria-label={`Scroll ${title} forward`}>
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
            <div className={styles.shelfRow} ref={ref}>
                {children}
            </div>
        </section>
    );
}

function LibraryPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [playlists, setPlaylists] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [history, setHistory] = useState([]);
    const [artists, setArtists] = useState([]);
    const playSong = usePlayerStore(s => s.playSong);

    useEffect(() => {
        let alive = true;
        Promise.all([
            apiUser.getUserPlayList().catch(() => []),
            appRoute.favoritesRoute().then((d) => d.songs || []).catch(() => []),
            appRoute.historyRoute().then((d) => (d.history || []).map((h) => h.song).filter(Boolean)).catch(() => []),
            fetch(`${import.meta.env.VITE_API_URL}/followings`, { credentials: 'include', headers: { Accept: 'application/json' } })
                .then((r) => r.json()).then((d) => d.artists || []).catch(() => []),
        ]).then(([pl, fav, hist, fol]) => {
            if (!alive) return;
            setPlaylists(Array.isArray(pl) ? pl : []);
            setFavorites(fav);
            setHistory(hist);
            setArtists(fol);
            setLoading(false);
        }).catch((e) => {
            if (!alive) return;
            setError(e.message || 'Failed to load library.');
            setLoading(false);
        });
        return () => { alive = false; };
    }, []);

    if (loading) return <LoadingState text="Loading your library..." />;
    if (error) return <ErrorState text={error} onRetry={() => window.location.reload()} />;

    const total = playlists.length + favorites.length + history.length + artists.length;

    return (
        <div className={styles.library}>
            <header className={styles.masthead}>
                <h1 className={clsx("font-display", styles.title)}>Your library</h1>
                <p className={styles.lede}>
                    {total === 0
                        ? 'A quiet shelf. Play something to fill it.'
                        : `${playlists.length} playlists, ${favorites.length} favorites, ${artists.length} artists you follow.`}
                </p>
            </header>

            {playlists.length > 0 && (
                <Shelf title="Playlists">
                    {playlists.map((p) => <PlaylistCard key={p._id} playlist={p} />)}
                </Shelf>
            )}

            {favorites.length > 0 && (
                <Shelf title="Favorites" linkTo="/favorites">
                    {favorites.map((s) => <SongCard key={s._id} song={s} onPlay={() => playSong(s._id)} />)}
                </Shelf>
            )}

            {artists.length > 0 && (
                <Shelf title="Followed artists">
                    {artists.map((a) => <ArtistCard key={a._id} artist={a} />)}
                </Shelf>
            )}

            {history.length > 0 && (
                <Shelf title="Recently played" linkTo="/history">
                    {history.slice(0, 12).map((s) => <SongCard key={s._id} song={s} onPlay={() => playSong(s._id)} />)}
                </Shelf>
            )}

            {total === 0 && (
                <EmptyState
                    icon={LibraryIcon}
                    title="Nothing saved yet"
                    text="Like songs, follow artists and build playlists — they will live here."
                />
            )}
        </div>
    );
}

export default LibraryPage;
