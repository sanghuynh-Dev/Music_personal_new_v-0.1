import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext.jsx";
import StatsCardsRow from "./StatsCardsRow.jsx";
import MainContentSplit from "./MainContentSplit.jsx";
import MySongsTab from "./MySongsTab.jsx";
import FollowersTab from "./FollowersTab.jsx";
import artistApi from "../../services/artistApi";
import { Tabs, LoadingState, ErrorState, Button } from "../../components/ui";
import styles from './Artist.module.scss'

const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'songs', label: 'My Songs' },
    { key: 'followers', label: 'Followers' },
];

function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState('');
    const [tab, setTab] = useState('overview');
    const [tick, setTick] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        let alive = true;
        artistApi.getDashboard()
            .then((data) => { if (alive) { setDashboardData(data); setError(''); } })
            .catch((e) => { if (alive) setError(e.message || 'Failed to load dashboard.'); });
        return () => { alive = false; };
    }, [tick]);

    if (error) return <ErrorState text={error} onRetry={() => setTick((t) => t + 1)} />;
    if (!dashboardData) return <LoadingState text="Loading your dashboard..." />;

    return (
        <div className="artist-dashboard-container">
            <header className={styles.studioHead}>
                <div>
                    <p className={styles.studioKicker}>Studio</p>
                    <h1 className={styles.studioTitle}>Good to see you, {user?.username}</h1>
                    <p className={styles.studioSub}>Manage your tracks and follow real audience numbers.</p>
                </div>
                <div className={styles.dashboardActions}>
                    <NavLink to="/songs/upload"><Button size="sm">Upload new track</Button></NavLink>
                    {user?._id && <NavLink to={`/profile/${user._id}`}><Button size="sm" variant="ghost">View public profile</Button></NavLink>}
                </div>
            </header>

            <Tabs tabs={TABS} active={tab} onChange={setTab} />

            <div style={{ marginTop: 24 }}>
                {tab === 'overview' && (
                    <>
                        <StatsCardsRow stats={dashboardData.stats} />
                        <MainContentSplit topSongs={dashboardData.topSongs} recentSongs={dashboardData.recentSongs} />
                    </>
                )}
                {tab === 'songs' && <MySongsTab />}
                {tab === 'followers' && <FollowersTab />}
            </div>
        </div>
    )
}

export default Dashboard
