import { NavLink } from "react-router-dom";

import styles from './Artist.module.scss'


function MainContentSplit({ topSongs, recentSongs }) {
    const maxPlays = topSongs?.length  > 0 ? Math.max(...topSongs.map(s => s.playCount || 1)) : 1;
    return (
        <div className={styles.mainContentSplit}>
            {/* <!-- Left: Top Songs play count distribution graph (CSS) --> */}
            <div className={styles.chartSection}>
                <h3 className={styles.panelTitle}>Top Tracks</h3>
                <div className={styles.barChartContainer}>
                    { topSongs && topSongs.length > 0 ? (
                        topSongs.map(song => {
                            const pct = maxPlays> 0 ? ((song.playCount || 0) / maxPlays) * 100 : 0;
                            return (
                                <div key={song._id} className={styles.chartRow}>
                                    <div className={styles.chartHeader}>
                                        <NavLink to={`/songs/${song._id}`}>
                                            {song.title}
                                        </NavLink>
                                        <span className={styles.playCount}>
                                            {song.playCount || 0} plays
                                        </span>
                                    </div>
                                    <div className={styles.progressTrack}>
                                        <div className={styles.progressFill}
                                            style={{ width: `${pct}%` }}>
                                        </div>
                                    </div>
                                </div>
                            )
                        })     
                    ) : (
                         <p className={styles.emptyMessage}>
                            No tracks uploaded yet. Start by uploading a track to see metrics!
                        </p>
                    )}
                </div>
            </div>

            {/* <!-- Right: Recent Uploads list --> */}
            <div className={styles.recentUploadsListSection}>
                <h3 className={styles.panelTitle}>Recent Uploads</h3>
                <ul className={styles.uploadList}>
                    { recentSongs && recentSongs.length > 0 ? (
                        recentSongs.map(song => (
                            <li key={song._id} className={styles.uploadItem}>
                                <NavLink className={styles.songLink} to={`/songs/${song._id}`}>
                                    <img src={song.imageUrl?.url}
                                        alt={song.title}
                                        className={styles.songThumbnail}/>
                                    <div className={styles.songInfo}>
                                        <strong className={styles.songTitle}>
                                            {song.title}
                                        </strong>
                                        <span className={styles.uploadDate} >
                                            {new Date(song.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </NavLink>
                                <div className={styles.actionGroup}>
                                    <NavLink to={`/songs/edit/${song._id}`} className="action-icon-btn" title="Edit"
                                        style={{ fontSize: "14px"}}><i className="ti-pencil"></i>
                                    </NavLink>
                                </div>
                            </li>
                        ))
                    ) : (
                        <p className={styles.emptyMessage}>
                            No recent uploads.
                        </p>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default MainContentSplit