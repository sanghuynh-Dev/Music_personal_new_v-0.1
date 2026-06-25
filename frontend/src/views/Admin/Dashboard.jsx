
import { useEffect, useState } from "react";
import { Routes, Route } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

import { useAuth } from "../../contexts/AuthContext.jsx";
import Overview from './Overview.jsx';
import Artists from './Artists.jsx';
import Users from './Users.jsx';
import Songs from './Songs.jsx';
import appRoute from '../../routes/appRoute.js';
import styles from './Admin.module.scss'

function Dashboard() {
    const [dashboardData, setDashboardData] = useState({});
    const [dashboardArtistData, setDashboardArtistData] = useState({});
    const [dashboardUserData, setDashboardUserData] = useState({});
    const [dashboardSongData, setDashboardSongData] = useState({});
    const { user } = useAuth();
                
    useEffect(() => {
        appRoute.dashboardAdminRoute().then((data) => {
            setDashboardData(data);
        });
    }, []);

    useEffect(() => {
        appRoute.dashboardAdminGetArtistRoute().then((data) => {
            setDashboardArtistData(data);
        });
    }, []);

    useEffect(() => {
        appRoute.dashboardAdminGetUserRoute().then((data) => {
            setDashboardUserData(data);
        });
    }, []);

    useEffect(() => {
        appRoute.dashboardAdminGetSongRoute().then((data) => {
            setDashboardSongData(data);
        });
    }, []);

    return (
        <div className="admin-dashboard-container">
            {/* <!-- Admin Header --> */}
            <div className={styles.dashboardHeaderSimple}>
                <span className="detail-label">ADMIN PANEL</span>
                <h1 className={styles.titleLabel}>System Overview</h1>
                
                {/* <!-- Admin Sub-navigation Tab Links --> */}
                <div className={styles.adminTabs}>
                    <NavLink to="/admin/dashboard" 
                        className={({ isActive }) => isActive ? 'btn-follow-action following' : 'btn-follow-action'}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/admin/users" 
                        className={({ isActive }) => isActive ? 'btn-follow-action following' : 'btn-follow-action'}>
                        Users
                    </NavLink>
                    <NavLink to="/admin/artists" 
                        className={({ isActive }) => isActive ? 'btn-follow-action following' : 'btn-follow-action'}>
                        Artists
                    </NavLink>
                    <NavLink to="/admin/songs" 
                        className={({ isActive }) => isActive ? 'btn-follow-action following' : 'btn-follow-action'}>
                        Songs
                    </NavLink>
                </div>
            </div>

            {/* <!-- Stats Cards Row --> */}
            <Routes>
                <Route path="/dashboard" element={
                    <Overview 
                        stats={dashboardData.stats} 
                        recentUsers={dashboardData.recentUsers} 
                        recentSongs={dashboardData.recentSongs} 
                    />
                }/>
                <Route path="/artists" element={<Artists artists={dashboardArtistData.artists}/>}/>
                <Route path="/users" element={<Users artists={dashboardUserData.users}/>}/>
                <Route path="/songs" element={<Songs artists={dashboardSongData.songs}/>}/>
            </Routes>
        </div>
    )
}

export default Dashboard