
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';


import useAdminStore from '../../stores/adminStore';
import stylesAdmin from './Admin.module.scss'
import stylesUser from './User.module.scss'

function Users({ users }) {
    const { toggleBan, promoteToArtist } = useAdminStore();

    function handleBanUser(userId, status) {
        const actionText = status === 'banned' ? 'unban' : 'ban';
        toggleBan(userId, actionText);
    }
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
                            <div className={stylesAdmin.colActions}></div>
                        </div>
                        
                        { users.map((user, index) => (
                            <div key={user._id} className={clsx("song-row", stylesUser.gridUserRow)}>
                                <div className="col-index">
                                    <span className="row-num">{ index + 1 }</span>
                                </div>
                                
                                {/* <!-- User Name/Avatar click link --> */}
                                <div className={stylesUser.userInfo}>
                                    <NavLink to={`/profile/${user._id}`} style={{display: "flex"}}><img 
                                        src={user.avatar?.url || 'https://res.cloudinary.com/dqynaodv1/image/upload/v1781293476/955c965a3e831375a9fc2ed4e7599882_zlbj68.jpg' } 
                                        alt={user.username} 
                                        className={stylesAdmin.userRowImg} 
                                    />
                                    </NavLink>
                                    <NavLink to={`/profile/${user._id}`} className={stylesAdmin.userLink}>{user.username}</NavLink>
                                </div>
                                
                                {/* <!-- Email --> */}
                                <div className={stylesAdmin.userEmail}>{user.email}</div>
                                
                                {/* <!-- Role Badge --> */}
                                <div>
                                    <span 
                                        className={clsx("detail-label", stylesUser.roleLabel)}>
                                        {user.role.toUpperCase()}
                                    </span>
                                </div>
                                
                                {/* <!-- Ban Status --> */}
                                <div>
                                    <span 
                                        className={clsx(
                                            "detail-label", 
                                            stylesUser.statusLabel,
                                            user.status === 'banned' ? 'banned' : 'normal'
                                        )}>
                                        {user.status.toUpperCase()}
                                    </span>
                                </div>
                                
                                {/* <!-- Action Buttons --> */}
                                <div className={stylesUser.colActions}>
                                    {/* <!-- Promote to Artist button --> */}
                                    <button 
                                        className={clsx(
                                            "btn-follow-action", 
                                            stylesUser.promoteBtn
                                        )}
                                        onClick={() => promoteToArtist(user._id)} 
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
                                        onClick={() => handleBanUser(user._id, user.status)}>
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