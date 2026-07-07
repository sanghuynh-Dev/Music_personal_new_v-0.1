export default function SkeletonSongDetail() {
  return (
    <div className="flex flex-col gap-8">
        {/* <!-- Song Header Banner --> */}
        <div className="flex align-items-center gap-8 pb-24 border-solid border-gray-200 outline">
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
  );
}