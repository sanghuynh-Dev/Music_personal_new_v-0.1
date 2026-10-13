import { NavLink } from 'react-router-dom';
import {
    Home,
    Compass,
    Search,
    Library,
    Heart,
    History,
    Mic2,
    Upload,
    ShieldCheck,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from "../../../contexts/AuthContext.jsx";

const linkClass = ({ isActive }, styles) => clsx(styles.navLink, isActive && styles.active);

function SideBar({ styles }) {
    const { user } = useAuth();
    const isArtist = user && (user.role === 'artist' || user.role === 'admin');

    return (
        <nav className={styles.sidebarNav} aria-label="Main navigation">
            <p className={styles.navGroupLabel}>Menu</p>
            <ul>
                <li>
                    <NavLink to="/" end className={(p) => linkClass(p, styles)}>
                        <Home size={19} strokeWidth={2} />
                        <span>Home</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/explore" className={(p) => linkClass(p, styles)}>
                        <Compass size={19} strokeWidth={2} />
                        <span>Explore</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/search" className={(p) => linkClass(p, styles)}>
                        <Search size={19} strokeWidth={2} />
                        <span>Search</span>
                    </NavLink>
                </li>
            </ul>

            {user && (
                <>
                    <p className={styles.navGroupLabel}>Collection</p>
                    <ul>
                        <li>
                            <NavLink to="/library" className={(p) => linkClass(p, styles)}>
                                <Library size={19} strokeWidth={2} />
                                <span>Library</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/favorites" className={(p) => linkClass(p, styles)}>
                                <Heart size={19} strokeWidth={2} />
                                <span>Favorites</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/history" className={(p) => linkClass(p, styles)}>
                                <History size={19} strokeWidth={2} />
                                <span>History</span>
                            </NavLink>
                        </li>
                    </ul>
                </>
            )}

            {isArtist && (
                <>
                    <p className={styles.navGroupLabel}>Studio</p>
                    <ul>
                        <li>
                            <NavLink to="/artist/dashboard" className={(p) => linkClass(p, styles)}>
                                <Mic2 size={19} strokeWidth={2} />
                                <span>Artist dashboard</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/songs/upload" className={(p) => linkClass(p, styles)}>
                                <Upload size={19} strokeWidth={2} />
                                <span>Upload track</span>
                            </NavLink>
                        </li>
                    </ul>
                </>
            )}

            {user && user.role === 'admin' && (
                <>
                    <p className={styles.navGroupLabel}>Manage</p>
                    <ul>
                        <li>
                            <NavLink to="/admin/dashboard" className={(p) => linkClass(p, styles)}>
                                <ShieldCheck size={19} strokeWidth={2} />
                                <span>Admin panel</span>
                            </NavLink>
                        </li>
                    </ul>
                </>
            )}
        </nav>
    )
}

export default SideBar
