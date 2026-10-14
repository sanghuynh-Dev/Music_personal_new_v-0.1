import { memo, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";

import useFollowStore from "../../stores/followStore";
import { useAuth } from "../../contexts/AuthContext.jsx";

import styles from './HomePage.module.scss'

function ArtistStrip({ topArtists, suggested }) {
    const { user } = useAuth();
    const setArtists = useFollowStore(s => s.setArtists);
    const artistsData = useFollowStore(s => s.artists);
    const toggleFollow = useFollowStore(s => s.toggleFollow);

    // Sync once per distinct list — never on every parent render.
    const lastSynced = useRef(null);
    useEffect(() => {
        if (suggested !== lastSynced.current) {
            lastSynced.current = suggested;
            setArtists(suggested || []);
        }
    }, [suggested, setArtists]);

    const followList = artistsData?.length ? artistsData : suggested;
    if (!topArtists?.length && !followList?.length) return null;

    return (
        <section aria-label="Artists">
            <div className={styles.sectionHead}>
                <h2 className={clsx(styles.sectionTitle, "font-display")}>Voices to follow</h2>
                <NavLink to="/explore" className={styles.sectionLink}>Discover artists</NavLink>
            </div>
            <div className={styles.artistStrip}>
                {(topArtists || []).map((artist) => (
                    <NavLink key={artist._id} to={`/profile/${artist._id}`} className={styles.artistCell}>
                        <img
                            src={artist.avatar?.url || 'https://res.cloudinary.com/dqynaodv1/image/upload/v1781293476/955c965a3e831375a9fc2ed4e7599882_zlbj68.jpg'}
                            alt={artist.username}
                            loading="lazy"
                        />
                        <strong>{artist.username}</strong>
                        <small className="numeric">{artist.followerCount || 0} followers</small>
                    </NavLink>
                ))}
            </div>
            {followList?.length > 0 && (
                <ul className={styles.followList}>
                    {followList.slice(0, 10).map((artist) => (
                        <li key={artist._id}>
                            <NavLink to={`/profile/${artist._id}`} className={styles.followWho}>
                                <img
                                    src={artist.avatar?.url || 'https://res.cloudinary.com/dqynaodv1/image/upload/v1781293476/955c965a3e831375a9fc2ed4e7599882_zlbj68.jpg'}
                                    alt=""
                                    loading="lazy"
                                />
                                <span>
                                    <strong>{artist.username}</strong>
                                    <small>{artist.role}</small>
                                </span>
                            </NavLink>
                            {user ? (
                                <button
                                    className={clsx("btn-follow-action", artist.isFollowing && "following")}
                                    onClick={() => toggleFollow(artist._id)}
                                >
                                    {artist.isFollowing ? "Following" : "Follow"}
                                </button>
                            ) : (
                                <NavLink to="/login" className="btn-follow-action">Follow</NavLink>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default memo(ArtistStrip)
