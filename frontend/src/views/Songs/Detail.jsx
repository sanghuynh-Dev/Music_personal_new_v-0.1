import { NavLink, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import useSongStore from "../../stores/songStore";
import usePlayerStore from "../../stores/playerStore";
import usePlaylistStore from "../../stores/playlistStore";
import { useAuth } from '../../contexts/AuthContext'
import appRoute from '../../routes/appRoute'

import CommentsSection from './CommentsSection';
import styles from './Songs.module.scss'
function Detail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [songData, setSongData] = useState({});
    // player
    const currentSong = usePlayerStore(s => s.currentSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const playSong = usePlayerStore(s => s.playSong);
    const pauseSong = usePlayerStore(s => s.pauseSong);
    const resumeSong = usePlayerStore(s => s.resumeSong);

    // song
    const toggleLikeLocal = useSongStore(s => s.toggleLikeLocal);
    const setSongDetail = useSongStore(s => s.setSongDetail);
    const songsData = useSongStore(s => s.songDetail);
    const { reload } = useSongStore();
    const isCurrentSong = (song) => song._id === currentSong?._id;

    // playlist
    const { openMenu } = usePlaylistStore();


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
        appRoute.songDetailRoute(id).then((data) => {
            setSongData(data.song);
        });
    }, [id,reload]);

    return (
        <div className={styles.songDetailContainer}>
            {/* <!-- Song Header Banner --> */}
            <div className={styles.songDetailHeader}>
                <div className={styles.songDetailThumbnailWrapper}>
                    <img 
                        src={songData.imageUrl?.url || null} 
                        alt={songData.title} 
                        className={styles.songDetailThumbnail}/>
                </div>
                
                <div className={styles.songDetailInfo}>
                    <span className={styles.detailLabel}>SONG</span>
                    <h1 className={styles.detailTitle}>{songData.title}</h1>
                    
                    <div className={styles.detailSubtext}>
                        <span className={styles.detailArtistLink}>
                            By <NavLink to={`/profile/${songData.uploadedBy?._id}`}>{songData.artist}</NavLink>
                        </span>
                        &bull;
                        <span className="detail-genre">{songData.genre || 'Pop'}</span>
                        &bull;
                        <span className="detail-plays">
                            <i className="ti-headphone"></i> <strong>{songData.playCount || 0}</strong> Plays
                        </span>
                    </div>
                    
                    <div className={styles.detailActions}>
                        <button 
                            className={clsx(styles.btnPlaySongLarge,"play-btn-js")}  
                            onClick={() => handleClick(songData)}>
                            { isCurrentSong(songData) && isPlaying ? (
                                <svg className="icon-pause" id="pause-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M0 5h4v14H0zm8 0h4v14H8z"></path>
                                </svg>
                            ): (
                                <svg className="icon-play" id="play-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M0 5v14l11-7z"></path>
                                </svg>
                            )} Play
                        </button>
                        
                        { user ? (
                            <>
                                <button 
                                    className={clsx(styles.detailActionBtn, songData?.liked && styles.liked)} 
                                    onClick={() => handleLike(songData)} 
                                    title="Like">
                                    <i className="ti-heart"></i>
                                </button>
                                <button 
                                    className={clsx(styles.detailActionBtn, "opt-btn")} 
                                    onClick={(e) => handleShowPlaylist(songData,e)} 
                                    title="Add to Playlist">
                                    <i className="ti-more-alt"></i>
                                </button>
                                { songData.uploadedBy?._id.toString() === user._id.toString() || (user && user.role === 'admin') && (
                                    <NavLink to={`/songs/edit/${songData._id}`} className={styles.detailActionBtn} title="Edit Song Details">
                                        <i className="ti-pencil"></i>
                                    </NavLink>
                                )}
                            </>
                        ) : (
                            <NavLink to="/login" className={styles.detailActionBtn} title="Log in to Like"><i className="ti-heart"></i></NavLink>
                        )}
                    </div>
                </div>
            </div>

            {/* <!-- Song Content Area --> */}
            <div className={styles.songDetailBody}>
                <div className={styles.songInfoPanel}>
                    <h3 className={styles.panelTitle}>About this song</h3>
                    <p className={styles.songDescription}>
                        {songData.description || 'No description provided for this song.'}
                    </p>
                </div>
                
                {/* <!-- Comments Section --> */}
                <CommentsSection songId={id} />
            </div>
        </div>
    )
}

export default Detail