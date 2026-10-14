import { NavLink } from 'react-router-dom';
import { AudioLines, Disc3, Music2, Music4, Radio, Users, Upload } from 'lucide-react';
import styles from './Auth.module.scss';

const EQ_BARS = [22, 38, 16, 44, 30, 52, 20, 36, 48, 26, 42, 18, 34, 50, 24, 40, 28, 46, 20, 36, 30, 44, 22, 38];

function AuthLayout({ children }) {
    return (
        <div className={styles.authBody}>
            {/* Page backdrop */}
            <div className={styles.authBackdrop} aria-hidden="true">
                <div className={`${styles.orb} ${styles.orbA}`} />
                <div className={`${styles.orb} ${styles.orbB}`} />
                <div className={`${styles.orb} ${styles.orbC}`} />
                <div className={styles.grid} />
                <div className={styles.noise} />
            </div>

            <div className={styles.authSplit}>
                <div className={styles.authBrand}>
                    {/* Brand ambient layers */}
                    <div className={styles.brandGlow} aria-hidden="true" />
                    <div className={styles.brandRings} aria-hidden="true" />

                    <NavLink to="/" className={styles.authBrandLogo} aria-label="Soundora home">
                        <i className="ti-music-alt"></i>
                        <span>Soundora</span>
                        <em className={styles.liveBadge}>
                            <span className={styles.liveDot} />
                            LIVE
                        </em>
                    </NavLink>

                    {/* Hero visual: vinyl + floating notes */}
                    <div className={styles.brandVisual} aria-hidden="true">
                        <div className={styles.vinylWrap}>
                            <div className={styles.vinyl}>
                                <Disc3 size={150} strokeWidth={1} />
                            </div>
                            <div className={styles.vinylCenter}>
                                <Music2 size={26} />
                            </div>
                            <span className={`${styles.floatNote} ${styles.n1}`}>
                                <Music2 size={16} />
                            </span>
                            <span className={`${styles.floatNote} ${styles.n2}`}>
                                <Music4 size={18} />
                            </span>
                            <span className={`${styles.floatNote} ${styles.n3}`}>
                                <AudioLines size={16} />
                            </span>
                        </div>

                        <div className={styles.nowPlaying}>
                            <span className={styles.npDisc} />
                            <div className={styles.npMeta}>
                                <strong>Midnight Groove — Neon Coast</strong>
                                <span>32,418 listening now</span>
                            </div>
                            <span className={styles.npBars}>
                                <i />
                                <i />
                                <i />
                                <i />
                            </span>
                        </div>
                    </div>

                    <h1 className={styles.authBrandTitle}>
                        Hear <span>everything.</span>
                    </h1>
                    <p className={styles.authBrandText}>
                        Stream tracks from independent artists, build playlists and follow the voices you love.
                    </p>

                    <ul className={styles.authBrandPoints}>
                        <li>
                            <Radio size={15} />
                            Millions of plays tracked daily
                        </li>
                        <li>
                            <Users size={15} />
                            Direct line between artists and listeners
                        </li>
                        <li>
                            <Upload size={15} />
                            Free to listen, free to upload
                        </li>
                    </ul>

                    {/* Equalizer */}
                    <div className={styles.eq} aria-hidden="true">
                        {EQ_BARS.map((h, i) => (
                            <i key={i} style={{ '--h': `${h}px`, '--d': `${(i % 12) * 0.14}s` }} />
                        ))}
                    </div>
                </div>
                <div className={styles.authCard}>{children}</div>
            </div>
        </div>
    );
}

export default AuthLayout;
