import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";

import appRoute from '../../routes/appRoute';
import useSongStore from "../../stores/songStore";
import usePlayerStore from "../../stores/playerStore";
import usePlaylistStore from "../../stores/playlistStore";
import Loading from "../../components/Loading/Loading.jsx";

function FavoritesPage() {
    const [favoritesData, setFavoritesData] = useState({});

    const currentSong = usePlayerStore(s => s.currentSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const playSong = usePlayerStore(s => s.playSong);
    const pauseSong = usePlayerStore(s => s.pauseSong);
    const resumeSong = usePlayerStore(s => s.resumeSong);

    const toggleLikeLocal = useSongStore(s => s.toggleLikeLocal);
    const setSongs = useSongStore(s => s.setSongs);
    const songsData = useSongStore(s => s.songs);

    const { openMenu } = usePlaylistStore();

    const isCurrentSong = (song) => song._id === currentSong?._id;

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (favoritesData) {
            setLoading(true);
        }
    }, []);

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
        toggleLikeLocal(song._id);
    } 
    
    useEffect(() => {
        appRoute.favoritesRoute().then((data) => {
            setFavoritesData(data);
        });
    }, []);
    useEffect(() => {
        setSongs(favoritesData.songs);
    }, [favoritesData]);
    return (
        <>
            { !loading ?  (
                <Loading />
            ) : (
                <div className="favorites-container event-chang-icon-js">
                <div className="page-header-simple">
                    <div className="header-icon-circle">
                        <i className="ti-heart"></i>
                    </div>
                    <div className="header-text-meta">
                        <span>PLAYLIST</span>
                        <h1>Favorite Songs</h1>
                        <p>Your personal collection of liked tracks.</p>
                    </div>
                </div>

                <div className="profile-content">
                    <div className="songs-list-container">
                        { favoritesData.songs && favoritesData.songs.length > 0 ? (
                            <div className="songs-table">
                                <div className="songs-table-header">
                                    <div className="col-index">#</div>
                                    <div className="col-title">Title</div>
                                    <div className="col-genre">Genre</div>
                                    <div className="col-plays"><i className="ti-headphone"></i></div>
                                    <div className="col-actions"></div>
                                </div>
                                
                                { songsData?.map((song, index) => (
                                    <div key={song._id} className="song-row" id={"song-row-" + song._id} data-id={song._id}>
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
                                        <div className="col-genre">{song.genre || "Unknown"}</div>
                                        <div className="col-plays">{song.plays}</div>
                                        <div className="col-actions">
                                            <button 
                                                className={clsx("action-icon-btn like-btn", song.liked && "liked")}
                                                onClick={() => handleLike(song)} 
                                                title="Unlike">
                                                <i className="ti-heart"></i>
                                            </button>
                                            <button 
                                                className="action-icon-btn opt-btn" 
                                                onClick={(e) => handleShowPlaylist(song,e)}
                                                title="Add to Playlist">
                                                <i className="ti-more-alt"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-favorites">
                                <i className="ti-heart-broken"></i>
                                <p>You haven't favorited any songs yet. Go check out the <a href="/">explore</a> page!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            )}
        </>
    )
}

export default FavoritesPage