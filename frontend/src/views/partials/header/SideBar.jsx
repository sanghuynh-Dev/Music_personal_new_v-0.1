import { useEffect, useContext } from "react";
import { useAuth } from "../../../contexts/AuthContext.jsx";

import { NavLink } from 'react-router-dom';
import apiUser from '../../../services/userApi';


function SideBar({styles}) {

    const {user} = useAuth();

    return(
        <nav className={styles.sidebarNav}>
            <ul>
                <li>
                    <NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>
                        <i className="ti-home"></i>
                        <span>Home</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/search" className={({ isActive }) => isActive ? styles.active : ''}>
                        <i className="ti-search"></i>
                        <span>Search</span>
                    </NavLink>
                </li>
                { user && (
                    <>
                        <li>
                            <NavLink to="/favorites" className={({ isActive }) => isActive ? styles.active : ''}>
                                <i className="ti-heart"></i>
                                <span>Favorites</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/history" className={({ isActive }) => isActive ? styles.active : ''}>
                                <i className="ti-time"></i>
                                <span>History</span>
                            </NavLink>
                        </li>
                        { user && (user.role === 'artist' || user.role === 'admin') && (
                            <>
                                <li>
                                    <NavLink to="/artist/dashboard" className={({ isActive }) => isActive ? styles.active : ''}>
                                        <i className="ti-layout-grid2"></i>
                                        <span>Artist Dashboard</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/songs/upload" className={({ isActive }) => isActive ? styles.active : ''}>
                                        <i className="ti-upload"></i>
                                        <span>Upload Track</span>
                                    </NavLink>
                                </li>
                            </>
                        )}
                        { user && user.role === 'admin' && (
                            <>
                                <li>
                                    <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? styles.active : ''}>
                                        <i className="ti-settings"></i>
                                        <span>Admin Panel</span>
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </>
                )}
            </ul>
        </nav>
    )
}

export default SideBar