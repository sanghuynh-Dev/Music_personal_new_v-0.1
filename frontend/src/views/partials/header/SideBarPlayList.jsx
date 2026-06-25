import { NavLink } from 'react-router-dom';
import { useEffect, useContext, useState } from "react";
import { AuthContext } from "../../../contexts/AuthContext.jsx";
import usePLaylistStore from '../../../stores/playlistStore.js';
import apiUser from '../../../services/userApi';
function SideBarPlayList({styles}) {
    const {user, setUser} = useContext(AuthContext);
    const [userPlayLists, setUserPlayLists] = useState([]);

    const {
        toggleModal,
        reload
    } = usePLaylistStore();
    
    useEffect(() => {
        apiUser.getUser().then((user) => {
            setUser(user);
        });
    }, []);

    useEffect(() => {
        apiUser.getUserPlayList().then((userPlayLists) => {
            setUserPlayLists(userPlayLists);
        });
    }, [reload]);

    return (
       <div className={styles.sidebarPlaylists}>
            <div className={styles.playlistsHeader}>
                <h3>PLAYLISTS</h3>
                { user && (
                    <button 
                        type="button" 
                        onClick={toggleModal}
                        title="Create Playlist">
                        <i className="ti-plus"></i>
                    </button>
                )}
            </div>
            { user ? (
                // <!-- Playlist list -->
                <ul className={styles.playlists} id="playlists-sidebar-list">
                    { userPlayLists?.length > 0 ? (
                        userPlayLists.map((playlist) => (
                             <li key={playlist._id}>
                                <NavLink to={`/playlists/${playlist._id}`} className={({ isActive }) => isActive ? styles.active : ''}>
                                    <i className="ti-list"></i>
                                    <span>{playlist.name}</span>
                                </NavLink>
                            </li>
                        ))
                    ) : (
                        <li className={styles.emptyPlaylistsMsg}>No playlists created</li>
                    )}
                </ul>
            ) : (
                <p className={styles.playlistsLoginPrompt}><NavLink to="/login">Log in</NavLink> to create playlists.</p>
            )}
        </div>
    )
}

export default SideBarPlayList