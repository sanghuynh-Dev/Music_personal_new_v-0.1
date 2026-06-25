import { NavLink, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import useSongStore from "../../stores/songStore";
import usePlayerStore from "../../stores/playerStore";
import { useAuth } from '../../contexts/AuthContext'
import appRoute from '../../routes/appRoute'
import styles from './Songs.module.scss'
function Detail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [songData, setSongData] = useState({});
    const currentSong = usePlayerStore(s => s.currentSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const playSong = usePlayerStore(s => s.playSong);
    const pauseSong = usePlayerStore(s => s.pauseSong);
    const resumeSong = usePlayerStore(s => s.resumeSong);

    const toggleLikeLocal = useSongStore(s => s.toggleLikeLocal);
    const setSongDetail = useSongStore(s => s.setSongDetail);
    const songsData = useSongStore(s => s.songDetail);
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
        appRoute.songDetailRoute(id).then((data) => {
            setSongData(data.song);
            console.log(data);
        });
    }, []);

    useEffect(() => {
        setSongDetail(songData);
    }, [songData]);
    return (
        <div className={styles.songDetailContainer}>
            {/* <!-- Song Header Banner --> */}
            <div className={styles.songDetailHeader}>
                <div className={styles.songDetailThumbnailWrapper}>
                    <img 
                        src={songData.imageUrl?.url || 'https://res.cloudinary.com/dqynaodv1/image/upload/v1717904033/resources/images/default-thumbnail.png'} 
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
                                    className={clsx(styles.detailActionBtn, songsData?.liked && styles.liked)} 
                                    onClick={() => handleLike(songData)} 
                                    title="Like">
                                    <i className="ti-heart"></i>
                                </button>
                                <button className={clsx(styles.detailActionBtn, "opt-btn")} onclick="showAddToPlaylistMenu(event, '<%= songData._id %>')" title="Add to Playlist">
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
                <div className={styles.songCommentsPanel}>
                    <h3 className={styles.panelTitle}>Comments (<span id="comment-count-label">0</span>)</h3>
                    
                    { user ? (
                        <form id="comment-form" className={styles.commentInputForm}>
                            <div className={styles.commentInputWrapper}>
                                <img 
                                    src={user?.avatar?.url || 'https://res.cloudinary.com/dqynaodv1/image/upload/v1717904033/resources/images/default-avatar.png'} 
                                    alt="My avatar" 
                                    className={styles.commentUserAvatar}/>
                                <textarea id="comment-textarea" placeholder="Add a comment..." required></textarea>
                            </div>
                            <div className={styles.commentFormActions}>
                                <button type="submit" className={styles.btnSubmitComment}>Comment</button>
                            </div>
                        </form>
                    ) : (
                        <div className={styles.loginToCommentMsg}>
                            <p><NavLink to="/login">Log in</NavLink> to join the conversation.</p>
                        </div>
                    )}
                    <ul className={styles.commentsList} id="comments-list-items">
                        {/* <!-- Dynamically populated via AJAX --> */}
                        <li className="comments-loading">Loading comments...</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Detail