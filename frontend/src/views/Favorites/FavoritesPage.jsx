import { useEffect } from "react";
import { Heart } from "lucide-react";
import clsx from "clsx";

import useSongStore from "../../stores/songStore";
import usePlayerStore from "../../stores/playerStore";
import usePlaylistStore from "../../stores/playlistStore";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { EmptyState } from "../../components/ui";
import TrackTable from "../../components/TrackTable.jsx";
import Loading from "../../components/loading/Loading.jsx";

import styles from './Collection.module.scss';

function FavoritesPage({ favoritesData }) {
    const currentSong = usePlayerStore(s => s.currentSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const playSong = usePlayerStore(s => s.playSong);
    const pauseSong = usePlayerStore(s => s.pauseSong);
    const resumeSong = usePlayerStore(s => s.resumeSong);

    const toggleLikeLocal = useSongStore(s => s.toggleLikeLocal);
    const setSongs = useSongStore(s => s.setSongs);
    const songsData = useSongStore(s => s.songs);
    const { user } = useAuth();

    const { openMenu } = usePlaylistStore();

    const loading = !!favoritesData?.songs;

    function handleClick(song) {
        const isCurrent = song._id === currentSong?._id;
        if (isCurrent) {
            if (isPlaying) pauseSong();
            else resumeSong();
        } else {
            playSong(song._id);
        }
    }

    async function handleUnlike(song) {
        const data = await toggleLikeLocal(song._id);
        // Optimistic removal — no refetch of the favorites list.
        if (data && data.liked === false) {
            const list = useSongStore.getState().songs || [];
            useSongStore.getState().setSongs(list.filter((s) => s._id !== song._id));
        }
    }

    function handleShowPlaylist(song, e) {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        openMenu(song._id, {
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom
        });
    }

    useEffect(() => {
        if (favoritesData?.songs) setSongs(favoritesData.songs);
    }, [favoritesData, setSongs]);

    if (!loading) return <Loading />;

    const list = songsData || [];
    const count = list.length;

    return (
        <div className={styles.collection}>
            <header className={styles.masthead}>
                <p className={styles.kicker}>Collection</p>
                <h1 className={clsx(styles.title, "font-display")}>Favorite songs</h1>
                <p className={styles.lede}>
                    {count === 0
                        ? 'Every favorite starts with one tap of the heart.'
                        : `${count} track${count === 1 ? '' : 's'} you keep coming back to.`}
                </p>
            </header>

            {count > 0 ? (
                <TrackTable
                    songs={list}
                    currentSong={currentSong}
                    isPlaying={isPlaying}
                    onPlay={handleClick}
                    onLike={handleUnlike}
                    onAdd={handleShowPlaylist}
                    user={user}
                    playsHeader="Plays"
                    renderPlays={(song) => song.playCount || 0}
                />
            ) : (
                <EmptyState
                    icon={Heart}
                    title="No favorites yet"
                    text="Tap the heart on any song and it will live here."
                />
            )}
        </div>
    );
}

export default FavoritesPage;
