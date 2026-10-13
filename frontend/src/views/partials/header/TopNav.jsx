import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from "react";
import { LogOut, Bell, Settings as SettingsIcon, Menu, PanelRight } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import useUiStore from "../../../stores/uiStore.js";
import appRoute from '../../../routes/appRoute.js';
import apiUser from '../../../services/userApi';
import styles from './Header.module.scss'

function TopNav() {
    const {user, setUser} = useAuth();
    const setSidebarOpen = useUiStore(s => s.setSidebarOpen);
    const toggleRightPanel = useUiStore(s => s.toggleRightPanel);
    const rightPanelOpen = useUiStore(s => s.rightPanelOpen);
    const [query, setQuery] = useState('');
    const [notifs, setNotifs] = useState([]);
    const [unread, setUnread] = useState(0);
    const [showNotifs, setShowNotifs] = useState(false);
    const notifRef = useRef(null);
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await appRoute.logout();
        } catch (e) {
            console.error('Logout failed:', e.message);
        } finally {
            setUser(null);
            navigate('/login');
        }
    }

    function handleSearch(e) {
        e.preventDefault();
        const q = query.trim();
        navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
    }

    const [prevUserId, setPrevUserId] = useState(user?._id || null);
    // Reset notifications when account changes (render-time adjustment).
    if ((user?._id || null) !== prevUserId) {
        setPrevUserId(user?._id || null);
        setNotifs([]);
        setUnread(0);
    }

    useEffect(() => {
        if (!user) return;
        let alive = true;
        const load = () => {
            apiUser.getNotifications()
                .then((d) => { if (alive) { setNotifs(d.items || []); setUnread(d.unreadCount || 0); } })
                .catch(() => {});
        };
        load();
        const t = setInterval(load, 60000);
        return () => { alive = false; clearInterval(t); };
    }, [user]);

    useEffect(() => {
        const onDoc = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false); };
        document.addEventListener('click', onDoc);
        return () => document.removeEventListener('click', onDoc);
    }, []);

    const markAllRead = async () => {
        try {
            await apiUser.markAllNotificationsRead();
            setNotifs((list) => list.map((n) => ({ ...n, read: true })));
            setUnread(0);
        } catch { /* noop */ }
    };

    return (
        <header className={styles.topNav}>
            <div className={styles.navLeft}>
                <button
                    className={styles.iconBtn}
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu size={20} />
                </button>
                <form onSubmit={handleSearch} className={styles.searchBarForm} role="search">
                    <div className={styles.searchInputWrapper}>
                        <i className="ti-search"></i>
                        <input
                            type="search"
                            name="q"
                            aria-label="Search for songs, artists, or genres"
                            placeholder="Search for songs, artists, or genres..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </form>
            </div>

            <div className={styles.navRight}>
                <button
                    className={styles.iconBtn}
                    onClick={toggleRightPanel}
                    aria-label={rightPanelOpen ? 'Hide now playing panel' : 'Show now playing panel'}
                    aria-expanded={rightPanelOpen}
                    title="Now playing"
                >
                    <PanelRight size={19} />
                </button>
                { user ? (
                    <div className={styles.userProfileMenu}>
                        <div className={styles.notifWrap} ref={notifRef}>
                            <button className={styles.btnNotif} onClick={() => setShowNotifs((v) => !v)}
                                title="Notifications" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} aria-expanded={showNotifs}>
                                <Bell size={18} />
                                {unread > 0 && <span className={styles.notifBadge}>{unread > 9 ? '9+' : unread}</span>}
                            </button>
                            {showNotifs && (
                                <div className={styles.notifDropdown} role="dialog" aria-label="Notifications">
                                    <div className={styles.notifHeader}>
                                        <strong>Notifications</strong>
                                        {unread > 0 && <button onClick={markAllRead}>Mark all read</button>}
                                    </div>
                                    <ul>
                                        {notifs.length === 0 && <li className={styles.notifEmpty}>You're all caught up.</li>}
                                        {notifs.map((n) => (
                                            <li key={n._id} className={n.read ? '' : styles.notifUnread}>
                                                {n.link ? <NavLink to={n.link} onClick={() => setShowNotifs(false)}>{n.text}</NavLink> : <span>{n.text}</span>}
                                                <small>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</small>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <NavLink to="/settings" className={styles.userBadge} title="Account settings" aria-label="Account settings">
                            <SettingsIcon size={16} />
                        </NavLink>
                        <NavLink to={`/profile/${user._id}`} className={styles.userBadge}>
                            <img src={ user.avatar?.url || "https://res.cloudinary.com/dqynaodv1/image/upload/v1781293476/955c965a3e831375a9fc2ed4e7599882_zlbj68.jpg"} alt={user.username} className={styles.userAvatarSmall}/>
                            <span>{user.username}</span>
                        </NavLink>
                        <div className={styles.btnLogout} onClick={handleLogout} title="Sign Out">
                            <LogOut size={16} />
                        </div>
                    </div>
                ) : (
                     <div className={styles.authButtons}>
                        <NavLink to="/register" className={styles.btnRegister}>Sign up</NavLink>
                        <NavLink to="/login" className={styles.btnLogin}>Log in</NavLink>
                    </div>
                )}
            </div>
        </header>
    )
}

export default TopNav
