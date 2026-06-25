
import { NavLink } from 'react-router-dom';

import stylesAdmin from './Admin.module.scss'
import stylesUser from './User.module.scss'

function Users({ users }) {

    return (
       <div className="profile-content">
            <div className="songs-list-container">
                { users && users.length > 0 ? (
                    <div className="songs-table">
                        {/* <!-- Custom Column Headers --> */}
                        <div className={clsx("songs-table-header", stylesUser.gridSongsTableHeader)}>
                            <div className="col-index">#</div>
                            <div>User Info</div>
                            <div>Email</div>
                            <div>Role</div>
                            <div>Status</div>
                            <div className={stylesAdmin.colActions}>Actions</div>
                        </div>
                        
                        { users.map((user, index) => (
                            <div className={clsx("song-row", stylesUser.gridUserRow)} id={`user-row-${user._id}`}>
                                <div className="col-index">
                                    <span className="row-num">{ index + 1 }</span>
                                </div>
                                
                                {/* <!-- User Name/Avatar click link --> */}
                                <div className={stylesUser.userInfo}>
                                    <img 
                                        src={user.avatar?.url || 'https://res.cloudinary.com/dqynaodv1/image/upload/v1717904033/resources/images/default-avatar.png' } 
                                        alt={user.username} 
                                        className={stylesAdmin.userRowImg} 
                                    />
                                    <NavLink to={`/profile/${user._id}`} className={stylesAdmin.userLink}>{user.username}</NavLink>
                                </div>
                                
                                {/* <!-- Email --> */}
                                <div className={stylesAdmin.userEmail}>{user.email}</div>
                                
                                {/* <!-- Role Badge --> */}
                                <div>
                                    <span 
                                        className={clsx("detail-label role-label", stylesAdmin.roleLabel)} 
                                        id={`role-badge-${user._id}`}>
                                        {user.role.toUpperCase()}
                                    </span>
                                </div>
                                
                                {/* <!-- Ban Status --> */}
                                <div>
                                    <span 
                                        className={clsx(
                                            "detail-label status-label", 
                                            stylesAdmin.statusLabel,
                                            user.status === 'banned' ? 'banned' : 'normal'
                                        )}  
                                        id={`status-badge-${user._id}`}>
                                        {user.status.toUpperCase()}
                                    </span>
                                </div>
                                
                                {/* <!-- Action Buttons --> */}
                                <div className={stylesUser.colActions}>
                                    {/* <!-- Promote to Artist button --> */}
                                    <button 
                                        className={clsx(
                                            "btn-follow-action promote-btn", 
                                            stylesUser.promoteBtn
                                        )} 
                                        id={`promote-btn-${user._id}`} 
                                        onclick="promoteToArtist('<%= u._id %>')" 
                                        style={{display: `${user.role === 'user' ? 'inline-block' : 'none'}`}}>
                                        Promote
                                    </button>
                                    
                                    {/* <!-- Ban/Unban toggle button --> */}
                                    <button 
                                        className={clsx(
                                            "btn-delete-playlist ban-btn", 
                                            stylesUser.banBtn,
                                            user.status === 'banned' ? 'banned' : 'normal'
                                        )} 
                                        id={`ban-btn-${user._id}`} 
                                        onclick="toggleBan('<%= u._id %>')" >
                                        {user.status === 'banned' ? 'Unban' : 'Ban'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-feed">
                        <i className="ti-user"></i>
                        <p>No registered users found in the system database.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Users