
import { data, NavLink, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import clsx from "clsx";

import useSongStore from "../../stores/songStore";
import usePlayerStore from "../../stores/playerStore";
import usePLaylistStore from "../../stores/playlistStore";
import { useAuth } from "../../contexts/AuthContext"
import appRoute from "../../routes/appRoute"
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

    // playlistStore
    const {
        removeSongToPlaylist,
        deletePlaylist,
        reloadPlaylist
    } = usePLaylistStore();
    const isCurrentPlaylist = activePlaylistId === id;

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
    function handlePlaySongClick(song,playlist) {
        if (isCurrentSong(song)) {
            if (isPlaying) pauseSong();
            else resumeSong();
        } else {
            playSong(song._id,playlist);
        }
    }

    function handleShowPlaylist (song,e) {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        openMenu(song._id, {
            x: rect.left - 200,
            y: rect.bottom 
        });
    };

    async function handleDeletePlaylist() {
        const result = await deletePlaylist(id);
        if (result.success) navigate('/');
        
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
        <div className="playlist-detail-container event-chang-icon-js">
            <div className="page-header-simple">
                <div className="header-icon-circle playlist-icon">
                    <i className="ti-list"></i>
                </div>
                <div className="header-text-meta">
                    <span>PLAYLIST</span>
                    <h1>{playlistData.playlist?.name}</h1>
                    <p>Created by <NavLink to={`/profile/${playlistData.playlist?.user._id}`}>{playlistData.playlist?.user.username}</NavLink> &bull; { playlistData.songs ? playlistData.songs.length : 0 } tracks</p>
                </div>
                
                { playlistData.isOwner && (
                    <div className="playlist-header-actions">
                        <button className={styles.btnDeletePlaylist} onClick={() => handleDeletePlaylist()}>
                            <i className="ti-trash"></i> Delete Playlist
                        </button>
                    </div>
                )}
            </div>

            <div className="profile-content">
                { playlistData.songs && playlistData.songs?.length > 0 && (
                    <div className={styles.playlistPlayRow}>
                        <button 
                            className="btn-play-playlist play-list-btn-js" 
                            onClick={() => handlePlaylistClick(id)}>
                             {isCurrentPlaylist && isPlaying ? (
                                <svg className="icon-pause" id="pause-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 5h4v14H6zm8 0h4v14h-4z"></path>
                                </svg> 
                            ) : (
                                <svg className="icon-play" id="play-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z"></path>
                                </svg>
                            )}
                            Play
                        </button>
                    </div>
                )}

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
                                            onClick={() => handlePlaySongClick(song,playlistData.playlist.songs)} 
                                            title="Play">
                                            { isCurrentSong(song) && isPlaying ? (
                                                <svg className="icon-pause" id="pause-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M0 5h4v14H0zm8 0h4v14H8z"></path>
                                                </svg>
                                            ): (
                                                <svg className="icon-play" id="play-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M0 5v14l11-7z"></path>
                                                </svg>
                                            )}
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