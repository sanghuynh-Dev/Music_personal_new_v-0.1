import { useEffect, memo, useRef } from "react";
import { NavLink } from 'react-router-dom';
import clsx from "clsx";

import usePlayerStore from "../../stores/playerStore";
import useSongStore from "../../stores/songStore";
import usePlaylistStore from "../../stores/playlistStore";
import {toggleLikeApi} from "../../services/songApi.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import styles from './HomePage.module.scss'

function MainSongFeed({ topSongs, songs }) {
    const {user} = useAuth();
    const scrollRef = useRef(null);
    // player
    const currentSong = usePlayerStore(s => s.currentSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const playSong = usePlayerStore(s => s.playSong);
    const pauseSong = usePlayerStore(s => s.pauseSong);
    const resumeSong = usePlayerStore(s => s.resumeSong);
    // playlist
    const openMenu = usePlaylistStore(s => s.openMenu);

    // event like
    const toggleLikeLocal = useSongStore(s => s.toggleLikeLocal);
    const setSongs = useSongStore(s => s.setSongs);
    const setTopSongs = useSongStore(s => s.setTopSongs);
    const songsData = useSongStore(s => s.songs);
    const topSongsData = useSongStore(s => s.topSongs);

    const isCurrentSong = (song) => song._id === currentSong?._id;

    useEffect(() => {
        setSongs(songs);
    }, [songs]);

    useEffect(() => {
        setTopSongs(topSongs);
    }, [topSongs]);
    function handleClick(song) {
        if (isCurrentSong(song)) {
            if (isPlaying) pauseSong();
            else resumeSong();
        } else {
            playSong(song._id);
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

    
    async function handleLike(song) {
        // update global state
        toggleLikeLocal(song._id);
    }
    return (
        <section ref={scrollRef} className={clsx(styles.homeSection, styles.mainSongsFeed)}>
            <h2 className="section-title">Top Songs</h2>
            <div className="songs-list-container" style={{marginBottom: '32px'}}>
                { topSongs && topSongs.length > 0 ? (
                    <div  className="songs-table">
                        <div className="songs-table-header">
                            <div className="col-index">#</div>
                            <div className="col-title">Title</div>
                            <div className="col-genre">Genre</div>
                            <div className="col-plays"><i className="ti-headphone"></i></div>
                            <div className="col-actions"></div>
                        </div>
                        
                        {topSongsData?.map((song, index) => (
                            <div key={song._id} className="song-row" data-id={song._id}>
                                <div className="col-index">
                                    <span className="row-num">{index + 1}</span>
                                    <button 
                                        className="row-play-btn play-btn-js"  
                                        onClick={() => handleClick(song)}
                                        title="Play"
                                        >
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
                                    <img src={song.imageUrl?.url} alt={song.title} className="song-row-img"/>
                                    <div className="song-row-info">
                                        <NavLink to={`/songs/${song._id}`} className="song-row-title">{song.title}</NavLink>
                                        <NavLink to={`/profile/${song.uploadedBy._id || song.uploadedBy}`} className="song-row-artist">{song.artist}</NavLink>
                                    </div>
                                </div>
                                <div className="col-genre">{song.genre || 'Unknown'}</div>
                                <div className="col-plays">{song.playCount || 0}</div>
                                <div className="col-actions">
                                    { user && (
                                        <>
                                            <button 
                                                className={clsx("action-icon-btn like-btn", song.liked && "liked")}
                                                onClick={() => handleLike(song)}
                                                title="Like">
                                                <i className="ti-heart"></i>
                                            </button>
                                            <button 
                                                className="action-icon-btn opt-btn" 
                                                onClick={(e) => handleShowPlaylist(song,e)}
                                                title="Add to Playlist">
                                                <i className="ti-more-alt"></i>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty-feed">No tracks available.</p>
                )}
            </div>

            <h2 className="section-title">Explore Music</h2>
            <div className="songs-list-container">
                { songs && songs.length > 0 ? (
                    <div className="songs-table">
                        <div className="songs-table-header">
                            <div className="col-index">#</div>
                            <div className="col-title">Title</div>
                            <div className="col-genre">Genre</div>
                            <div className="col-plays"><i className="ti-headphone"></i></div>
                            <div className="col-actions"></div>
                        </div>
                        
                        {songsData?.map((song, index) => (
                            <div key={song._id} className="song-row" data-id={song._id}>
                                <div className="col-index">
                                    <span className="row-num">{index + 1}</span>
                                    <button 
                                        className="row-play-btn play-btn-js"  
                                        onClick={() => handleClick(song)} 
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
                                    <img src={song.imageUrl?.url} alt={song.title} className="song-row-img"/>
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
                                                className={clsx("action-icon-btn like-btn", song.liked && "liked")}
                                                onClick={() => handleLike(song)} 
                                                title="Like">
                                                <i className="ti-heart"></i>
                                            </button>
                                            <button 
                                                className="action-icon-btn opt-btn" 
                                                onClick={(e) => handleShowPlaylist(song,e)} 
                                                title="Add to Playlist">
                                                <i className="ti-more-alt"></i>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-feed">
                        <i className="ti-music-alt"></i>
                        <p>No songs found. Start by uploading some music!</p>
                    </div>
                )}
            </div>
        </section>
    )
}

export default memo(MainSongFeed)