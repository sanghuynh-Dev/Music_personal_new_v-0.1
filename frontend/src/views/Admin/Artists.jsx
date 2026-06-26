
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import styles from './Admin.module.scss'

function Artists({ artists }) {

    return (
       <div className="profile-content">
            <div className="songs-list-container">
                { artists && artists.length > 0 ? (
                    <div className="songs-table">
                        {/* <!-- Column Headers --> */}
                        <div className={clsx("songs-table-header", styles.gridSongsTableHeader)}>
                            <div className="col-index">#</div>
                            <div>Artist Info</div>
                            <div>Email</div>
                            <div>Tracks</div>
                            <div>Total Plays</div>
                            <div>Followers</div>
                        </div>
                        
                        { artists.map((artist, index) => (
                            <div key={artist._id} className={clsx("song-row", styles.gridSongRow)}>
                                <div className="col-index">
                                    <span className="row-num">{index + 1}</span>
                                </div>
                                
                                {/* <!-- Artist info (links to profile) --> */}
                                <div className={styles.artistInfo}>
                                    <NavLink to={`/profile/${artist._id}`} style={{display: "flex"}}><img 
                                        src={ artist.avatar?.url || 'https://res.cloudinary.com/dqynaodv1/image/upload/v1781293476/955c965a3e831375a9fc2ed4e7599882_zlbj68.jpg'} 
                                        alt={ artist.username } 
                                        className={styles.userRowImg} 
                                    />
                                    </NavLink>
                                    <NavLink to={`/profile/${artist._id}`} className={styles.artistLink}>{ artist.username }</NavLink>
                                </div>
                                
                                {/* <!-- Email --> */}
                                <div className={styles.artistEmail}>{ artist.email }</div>
                                
                                {/* <!-- Track count --> */}
                                <div className={styles.artistCount}>{ artist.songCount }</div>
                                
                                {/* <!-- Total play counts --> */}
                                <div className={styles.artistCount}>{ artist.totalPlays }</div>
                                
                                {/* <!-- Followers count --> */}
                                <div className={styles.artistCount}>{ artist.followerCount }</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-feed">
                        <i className="ti-microphone"></i>
                        <p>No artists found in the system database.</p>
                    </div>
                )}
            </div>
        </div> 
    )
}

export default Artists