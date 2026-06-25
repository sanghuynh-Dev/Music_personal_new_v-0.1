import clsx from 'clsx';
import { NavLink } from 'react-router-dom';
import styles from './Admin.module.scss'

function Overview({ stats, recentUsers, recentSongs }) {

    return (
        <>
            {/* <!-- Stats Cards Row --> */}
            <div className="stats-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'}}>
                <div className="stat-card">
                    <div className="stat-icon-circle" style={{ backgroundColor:' rgba(52, 152, 219, 0.1)', color: '#3498db'}}>
                        <i className="ti-user"></i>
                    </div>
                    <div>
                        <span className="stat-label" style={{fontSize: '11px'}}>TOTAL USERS</span>
                        <strong className="stat-value">{ stats?.totalUsers }</strong>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-circle" style={{backgroundColor: 'rgba(29, 185, 84, 0.1)', color: 'var(--primary-color)'}}>
                        <i className="ti-microphone"></i>
                    </div>
                    <div>
                        <span className="stat-label" style={{fontSize: '11px'}}>ARTISTS</span>
                        <strong className="stat-value" >{ stats?.totalArtists }</strong>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-circle" style={{backgroundColor: 'rgba(155, 89, 182, 0.1)', color: '#9b59b6'}}>
                        <i className="ti-music-alt"></i>
                    </div>
                    <div>
                        <span className="stat-label" style={{fontSize: '11px'}}>TRACKS</span>
                        <strong className="stat-value">{ stats?.totalTracks }</strong>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-circle" style={{backgroundColor: 'rgba(241, 196, 15, 0.1)', color: '#f1c40f'}}>
                        <i className="ti-headphone"></i>
                    </div>
                    <div>
                        <span className="stat-label" style={{fontSize: '11px'}}>TOTAL PLAYS</span>
                        <strong className="stat-value">{ stats?.totalPlays }</strong>
                    </div>
                </div>
            </div>

            {/* <!-- Listings Split Grid --> */}
            <div className={styles.dashboardSplit}>
                {/* <!-- Left: Recent Signups --> */}
                <div className={styles.dashboardCard} >
                    <h3 className="panel-title" style={{marginBottom: '20px'}}>Recent User Registrations</h3>
                    <ul className={styles.dashboardList}>
                        { recentUsers && recentUsers.length > 0 ?(
                            recentUsers.map((user) => (
                                <li className={styles.dashboardItem}>
                                    <NavLink to={`/profile/${user._id}`} className={styles.dashboardLink}>
                                        <img src={user.avatar?.url || 'https://res.cloudinary.com/dqynaodv1/image/upload/v1717904033/resources/images/default-avatar.png'} alt={user.username} className={styles.dashboardImage}/>
                                        <div>
                                            <strong className={styles.dashboardPrimaryText}>{user.username}</strong>
                                            <span className={styles.dashboardSecondaryText}>{user.email}</span>
                                        </div>
                                    </NavLink>
                                    <span className={styles.detailLabel}>{user.role.toUpperCase()}</span>
                                </li>
                            ))
                        ) : (
                            <p className={styles.emptyMessage}>No new users registered.</p>
                        )}
                    </ul>
                </div>

                {/* <!-- Right: Recent Uploads --> */}
                <div className={styles.dashboardCard}>
                    <h3 className="panel-title" style={{marginBottom: '20px'}}>Recently Uploaded Tracks</h3>
                    <ul className={styles.dashboardList}>
                        { recentSongs && recentSongs.length > 0 ?(
                            recentSongs.map((song) => (
                                <li className={styles.dashboardItem}>
                                    <NavLink to={`/songs/${song._id}`} className={styles.dashboardLink}>
                                        <img src={song.imageUrl?.url || 'https://res.cloudinary.com/dqynaodv1/image/upload/v1717904033/resources/images/default-thumbnail.png'} alt={song.title} className={styles.dashboardImage} style={{borderRadius: '4px' }}/>
                                        <div>
                                            <strong className={clsx(styles.dashboardPrimaryText, "text-dot")}>{song.title}</strong>
                                            <span className= {styles.dashboardSecondaryText}>by {song.artist}</span>
                                        </div>
                                    </NavLink>
                                    <span className={styles.detailLabel}>{song.genre || 'POP'}</span>
                                </li>
                            ))
                        ) : (
                            <p className={styles.emptyMessage}>No songs uploaded.</p>
                        )}
                    </ul>
                </div>
            </div>
        </>
    )
}

export default Overview