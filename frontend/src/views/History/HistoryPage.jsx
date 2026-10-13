import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import clsx from "clsx";

import usePlayerStore from "../../stores/playerStore";
import useSongStore from "../../stores/songStore";
import usePlaylistStore from "../../stores/playlistStore";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { EmptyState } from "../../components/ui";
import TrackTable from "../../components/TrackTable.jsx";
import Loading from "../../components/loading/Loading.jsx";
import appRoute from '../../routes/appRoute.js';

import styles from '../Favorites/Collection.module.scss';

function HistoryPage() {
    const [historyData, setHistoryData] = useState({});
    const { user } = useAuth();
    const currentSong = usePlayerStore(s => s.currentSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const playSong = usePlayerStore(s => s.playSong);
    const pauseSong = usePlayerStore(s => s.pauseSong);
    const resumeSong = usePlayerStore(s => s.resumeSong);

    const toggleLikeLocal = useSongStore(s => s.toggleLikeLocal);
    const setSongs = useSongStore(s => s.setSongs);
    const songsData = useSongStore(s => s.songs);

    const { openMenu } = usePlaylistStore();
    const loading = !!historyData?.history;

    function handleClick(song) {
        const isCurrent = song._id === currentSong?._id;
        if (isCurrent) {
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

    useEffect(() => {
        const historySong = historyData.history?.map(item => ({
            ...item.song,
            listenedAt: item.listenedAt
        }));
        setSongs(historySong);
    }, [historyData]);

    useEffect(() => {
        appRoute.historyRoute().then((data) => {
            setHistoryData(data);
        });
    }, []);

    if (!loading) return <Loading />;

    const count = historyData.history?.length || 0;
    const span = count > 1
        ? `from ${new Date(historyData.history[historyData.history.length - 1].listenedAt).toLocaleDateString()} to ${new Date(historyData.history[0].listenedAt).toLocaleDateString()}`
        : 'your recent listening';

    return (
        <div className={styles.collection}>
            <header className={styles.masthead}>
                <p className={styles.kicker}>Collection</p>
                <h1 className={clsx(styles.title, "font-display")}>Listening history</h1>
                <p className={styles.lede}>
                    {count === 0 ? 'Plays you start will be remembered here.' : `${count} plays, ${span}.`}
                </p>
            </header>

            {count > 0 ? (
                <TrackTable
                    songs={songsData}
                    currentSong={currentSong}
                    isPlaying={isPlaying}
                    onPlay={handleClick}
                    onLike={(song) => toggleLikeLocal(song._id)}
                    onAdd={handleShowPlaylist}
                    user={user}
                    playsHeader="Listened"
                    renderPlays={(song) => song.listenedAt ? new Date(song.listenedAt).toLocaleDateString() : '—'}
                />
            ) : (
                <EmptyState
                    icon={Clock}
                    title="A blank tape"
                    text="Start listening and your history will appear here."
                />
            )}
        </div>
    );
}

export default HistoryPage;
