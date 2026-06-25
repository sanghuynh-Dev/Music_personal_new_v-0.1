import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext.jsx";
import StatsCardsRow from "./StatsCardsRow.jsx";
import MainContentSplit from "./MainContentSplit.jsx";
import appRoute from '../../routes/appRoute.js';
import styles from './Artist.module.scss'
function Dashboard() {
    const [dashboardData, setDashboardData] = useState({});
    const { user } = useAuth();
              
    useEffect(() => {
        appRoute.dashboardArtistRoute().then((data) => {
            setDashboardData(data);
        });
    }, []);
    return (
       <div className="artist-dashboard-container">
            <div className={styles.dashboardHeaderSimple}>
                <div>
                    <span className="detail-label">CREATOR PANEL</span>
                    <h1 className={styles.dashboardTitle} >Welcome back, {user?.username}!</h1>
                    <p className={styles.dashboardDescription} >Manage your tracks and view real-time audience
                        statistics.</p>
                </div>

                <NavLink to="/songs/upload" className="btn-play-playlist" style={{textDecoration: 'none'}}>
                    <i className="ti-upload"></i> Upload New Track
                </NavLink>
            </div>

            {/* <!-- Stats Cards Row --> */}
            <StatsCardsRow stats={dashboardData.stats}/>

            {/* <!-- Main Content split --> */}
            <MainContentSplit topSongs={dashboardData.topSongs} recentSongs={dashboardData.recentSongs}/>
        </div>
    )
}

export default Dashboard