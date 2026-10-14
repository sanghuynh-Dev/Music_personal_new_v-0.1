
import { NavLink, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import clsx from "clsx";

import useSongStore from "../../stores/songStore";
import usePlayerStore from "../../stores/playerStore";
import usePLaylistStore from "../../stores/playlistStore";
import { useAuth } from "../../contexts/AuthContext"
import appRoute from "../../routes/appRoute"
import playlistApi from "../../services/playlistApi"
import PlayPauseIcon from "../../components/PlayPauseIcon";
import ReportButton from "../../components/ReportButton.jsx";
import styles from './Playlist.module.scss'

function Detail() {
    const { user } = useAuth()
    const { id } = useParams()
    const navigate = useNavigate()
    const [ playlistData, setPlaylistData ] = useState({})
    // playerStore
    const playPlaylist = usePlayerStore(s => s.playPlaylist);
    const currentSong = usePlayerStore(s => s.currentSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const activePlaylistId = usePlayerStore(s => s.activePlaylistId);
    const playSong = usePlayerStore(s => s.playSong);
    const pauseSong = usePlayerStore(s => s.pauseSong);
    const resumeSong = usePlayerStore(s => s.resumeSong);
    // songStore
    const toggleLikeLocal = useSongStore(s => s.toggleLikeLocal);
    const setSongs = useSongStore(s => s.setSongs);
    const songsData = useSongStore(s => s.songs);
    const isCurrentSong = (song) => song._id === currentSong?._id;

    // playlistStore (narrow selectors — whole-store subscribes re-render on any write)
    const removeSongToPlaylist = usePLaylistStore(s => s.removeSongToPlaylist);
    const deletePlaylist = usePLaylistStore(s => s.deletePlaylist);
    const reloadPlaylist = usePLaylistStore(s => s.reloadPlaylist);
    const isCurrentPlaylist = activePlaylistId === id;
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPrivate, setEditPrivate] = useState(false);
    const [saving, setSaving] = useState(false);

    function handlePlaylistClick() {
        if (isCurrentPlaylist) {
            if (isPlaying) pauseSong();
            else resumeSong();
        } else {
            playPlaylist(id);
        }
    }
    async function handleLike(song) {
        toggleLikeLocal(song._id);
    } 
    function handlePlaySongClick(song,songIds) {
        if (isCurrentSong(song)) {
            if (isPlaying) pauseSong();
            else resumeSong();
        } else {
            playSong(song._id,songIds);
        }
    }

    async function handleDeletePlaylist() {
        const result = await deletePlaylist(id);
        if (result.success) navigate('/');

    }

    function startEditing() {
        setEditName(playlistData.playlist?.name || '');
        setEditPrivate(!!playlistData.playlist?.isPrivate);
        setEditing(true);
    }

    async function handleSavePlaylist(e) {
        e.preventDefault();
        setSaving(true);
        try {
            const data = await playlistApi.updatePlaylist(id, { name: editName, isPrivate: editPrivate });
            if (data.success) {
                setEditing(false);
                setPlaylistData((prev) => ({ ...prev, playlist: data.playlist, title: data.playlist.name }));
            }
        } finally {
            setSaving(false);
        }
    }
    function removeSong(songID) {
        removeSongToPlaylist(id,songID);
        setSongs(
            songsData.filter(song => song._id !== songID)
        );
    }

    useEffect(() => {
        setSongs(playlistData.songs);
    }, [playlistData]);


    useEffect(() => {
        appRoute.playlistRoute(id).then(data => setPlaylistData(data))
    },[reloadPlaylist,id]);

    return (
        <div className={styles.playlistPage}>
            <div className={styles.coverHead}>
                <div className={styles.mosaic} aria-hidden="true">
                    {[0, 1, 2, 3].map((i) => {
                        const s = playlistData.songs?.[i];
                        return s?.imageUrl?.url
                            ? <img key={i} src={s.imageUrl.url} alt="" loading="lazy" />
                            : <span key={i} className={styles.mosaicEmpty}><i className="ti-music-alt"></i></span>;
                    })}
                </div>
                <div className={styles.coverMeta}>
                    <p className={styles.playlistKicker}>
                        Playlist{playlistData.playlist?.isPrivate ? ' · Private' : ''}
                    </p>
                    {editing ? (
                        <form onSubmit={handleSavePlaylist} className={styles.editForm}>
                            <input value={editName} onChange={(e) => setEditName(e.target.value)}
                                maxLength={100} required aria-label="Playlist name" />
                            <label className={styles.privateCheck}>
                                <input type="checkbox" checked={editPrivate} onChange={(e) => setEditPrivate(e.target.checked)} /> Private
                            </label>
                            <button type="submit" disabled={saving} className="btn-play-playlist">
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button type="button" onClick={() => setEditing(false)} className={styles.cancelLink}>Cancel</button>
                        </form>
                    ) : (
                        <h1 className={styles.playlistTitle}>{playlistData.playlist?.name}</h1>
                    )}
                    <p className={styles.playlistByline}>
                        By <NavLink to={`/profile/${playlistData.playlist?.user._id}`}>{playlistData.playlist?.user.username}</NavLink>
                        <span className="numeric">, {playlistData.songs ? playlistData.songs.length : 0} tracks</span>
                    </p>
                    <div className={styles.coverActions}>
                        { playlistData.songs && playlistData.songs?.length > 0 && (
                            <button
                                className="btn-play-playlist play-list-btn-js"
                                onClick={() => handlePlaylistClick()}>
                                 <PlayPauseIcon playing={isCurrentPlaylist && isPlaying} size={24} />
                                Play
                            </button>
                        )}
                        { playlistData.isOwner && !editing && (
                            <button className={styles.btnGhost} onClick={startEditing}>
                                Edit
                            </button>
                        )}
                        { playlistData.isOwner && (
                            <button className={styles.btnDeletePlaylist} onClick={() => handleDeletePlaylist()}>
                                <i className="ti-trash"></i> Delete
                            </button>
                        )}
                        { user && !playlistData.isOwner && (
                            <ReportButton
                                targetType="playlist"
                                targetId={playlistData.playlist?._id || id}
                                label={playlistData.playlist?.name}
                                className={styles.btnIconGhost}
                                title="Report this playlist"
                                size={16}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="profile-content">

                <div className="songs-list-container">
                    { playlistData.songs && playlistData.songs?.length > 0 ? (
                        <div className="songs-table">
                            <div className="songs-table-header">
                                <div className="col-index">#</div>
                                <div className="col-title">Title</div>
                                <div className="col-genre">Genre</div>
                                <div className="col-plays"><i className="ti-headphone"></i></div>
                                <div className="col-actions"></div>
                            </div>
                            
                            {songsData?.map((song, index) => (
                                <div key={song._id} className="song-row" id={`song-row-${song._id}`} data-id={song._id}>
                                    <div className="col-index">
                                        <span className="row-num">{index + 1}</span>
                                        <button 
                                            className="row-play-btn play-btn-js" 
                                            onClick={() => handlePlaySongClick(song,playlistData.playlist.songs.map(s => s._id))} 
                                            title="Play">
                                            <PlayPauseIcon playing={isCurrentSong(song) && isPlaying} size={24} />
                                        </button>
                                    </div>
                                    <div className="col-title">
                                        <img src={song.imageUrl?.url || ''} alt={song.title} className="song-row-img"/>
                                        <div className="song-row-info">
                                            <NavLink to={`/songs/${song._id}`} className="song-row-title">{song.title}</NavLink>
                                            <NavLink to={`/profile/${song.uploadedBy._id}`} className="song-row-artist">{song.artist}</NavLink>
                                        </div>
                                    </div>
                                    <div className="col-genre">{song.genre || 'Unknown'}</div>
                                    <div className="col-plays">{song.playCount || 0}</div>
                                    <div className="col-actions">
                                        { user && (
                                            <>
                                                <button 
                                                    className={clsx('action-icon-btn like-btn', song.liked && 'liked')} 
                                                    onClick={() => handleLike(song)} 
                                                    title="Like">
                                                    <i className="ti-heart"></i>
                                                </button>
                                                { playlistData.isOwner && (
                                                    <button 
                                                        className="action-icon-btn remove-btn" 
                                                        onClick={() => removeSong(song._id)} 
                                                        title="Remove from Playlist">
                                                        <i className="ti-close"></i>
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ): (
                        <div className={styles.emptyPlaylist}>
                            <i className="ti-music-alt"></i>
                            <p>This playlist has no songs yet. Go check out the <NavLink to="/">explore</NavLink> page to add some!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Detail