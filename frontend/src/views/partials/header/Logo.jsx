import { NavLink } from 'react-router-dom';

function Logo({ styles }) {
    return (
        <NavLink to="/" className={styles.sidebarLogo} aria-label="Soundora home">
            <span className={styles.logoMark} aria-hidden="true">
                <i className="ti-music-alt"></i>
            </span>
            <span className={styles.logoWord}>Soundora</span>
        </NavLink>
    )
}

export default Logo
