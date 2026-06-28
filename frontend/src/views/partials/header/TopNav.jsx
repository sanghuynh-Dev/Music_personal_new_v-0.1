import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useContext, useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import appRoute from '../../../routes/appRoute.js';
import styles from './Header.module.scss'

function TopNav() {
    const {user, setUser} = useAuth();
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    function handleLogout() {
        appRoute.logout();
        setUser(null);
        navigate('/login');
    }

    async function handleSearch(e) {
        e.preventDefault();
        const data = await appRoute.searchRoute(query);
        console.log(data);
        if(data.success) {
            navigate(`/search?q=${query}`);
        } else if(data.error) {
            console.log(data.error);
        }
    }
    return (
        <header className={styles.topNav}>
            <div className={styles.navLeft}>             
                <form onSubmit={handleSearch} className={styles.searchBarForm}>
                    <div className={styles.searchInputWrapper}>
                        <i className="ti-search"></i>
                        <input 
                            type="text" 
                            name="q" 
                            placeholder="Search for songs, artists, or genres..." 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </form>
            </div>
            
            <div className={styles.navRight}>
                { user ? (
                    <div className={styles.userProfileMenu}>
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