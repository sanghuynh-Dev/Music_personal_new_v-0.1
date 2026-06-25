import { useEffect, useState } from "react";
import { NavLink, useSearchParams } from 'react-router-dom';
import clsx from "clsx";

import useSongStore from "../../stores/songStore";
import usePlayerStore from "../../stores/playerStore";
import { useAuth } from "../../contexts/AuthContext.jsx";
import appRoute from '../../routes/appRoute.js';
import styles from './SearchPage.module.scss'

function SearchPage() {
    const { user } = useAuth();
    const [searchData, setSearchData] = useState({});
    const [searchParams] = useSearchParams();
    const q = searchParams.get("q");

    const currentSong = usePlayerStore(s => s.currentSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const playSong = usePlayerStore(s => s.playSong);
    const pauseSong = usePlayerStore(s => s.pauseSong);
    const resumeSong = usePlayerStore(s => s.resumeSong);

    const toggleLikeLocal = useSongStore(s => s.toggleLikeLocal);
    const setSongs = useSongStore(s => s.setSongs);
    const songsData = useSongStore(s => s.songs);

    const isCurrentSong = (song) => song._id === currentSong?._id;

    function handleClick(song) {
        if (isCurrentSong(song)) {
            if (isPlaying) pauseSong();
            else resumeSong();
        } else {
            playSong(song._id);
        }
    }
          
    async function handleLike(song) {
        toggleLikeLocal(song._id);
    } 
    useEffect(() => {
        appRoute.searchRoute(q).then((data) => {
            setSearchData(data);
        });
    }, [q]);
    useEffect(() => {
        setSongs(searchData.songs);
    }, [searchData]);

    return (
        <div className="search-results-container event-chang-icon-js">
            <div className="page-header-simple">
                <div className="header-icon-circle">
                    <i className="ti-search"></i>
                </div>
                <div className="header-text-meta">
                    <span>SEARCH</span>
                    <h1>Search Results</h1>
                    <p>Showing tracks matching {searchData.query === null ? `"${searchData.query}"` : ""}</p>
                </div>
            </div>

            <div className="profile-content">
                <div className="songs-list-container">
                    { searchData.songs && searchData.songs.length > 0 ? (
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
                                        <img src={song.imageUrl?.url || 'https://res.cloudinary.com/dqynaodv1/image/upload/v1717904033/resources/images/default-thumbnail.png'} alt={song.title} className="song-row-img"/>
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
                                                <button className="action-icon-btn opt-btn" onclick="showAddToPlaylistMenu(event, '<%= song._id %>')" title="Add to Playlist">
                                                    <i className="ti-more-alt"></i>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className={styles.emptySearch}>
                            <i className="ti-search"></i>
                            <p>No songs found matching {searchData.query === null ? `"${searchData.query}"` : ""}. Try searching for something else!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SearchPage