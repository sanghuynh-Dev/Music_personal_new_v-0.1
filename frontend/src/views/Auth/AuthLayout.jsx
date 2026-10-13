import { NavLink } from 'react-router-dom';
import styles from './Auth.module.scss';

function AuthLayout({ children }) {
    return (
        <div className={styles.authBody}>
            <div className={styles.authSplit}>
                <div className={styles.authBrand}>
                    <NavLink to="/" className={styles.authBrandLogo} aria-label="Soundora home">
                        <i className="ti-music-alt"></i>
                        <span>Soundora</span>
                    </NavLink>
                    <h1 className={styles.authBrandTitle}>Hear everything.</h1>
                    <p className={styles.authBrandText}>
                        Stream tracks from independent artists, build playlists and follow the voices you love.
                    </p>
                    <ul className={styles.authBrandPoints}>
                        <li>Millions of plays tracked daily</li>
                        <li>Direct line between artists and listeners</li>
                        <li>Free to listen, free to upload</li>
                    </ul>
                </div>
                <div className={styles.authCard}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default AuthLayout;
