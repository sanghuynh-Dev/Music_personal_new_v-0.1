import { useEffect, useState, memo } from "react";
import { NavLink } from 'react-router-dom';
import clsx from "clsx";

import useFollowStore from "../../stores/followStore";
import { useAuth } from "../../contexts/AuthContext.jsx";
import styles from './HomePage.module.scss'

function Suggestions({ topArtists, newSuggestedArtists }) {
    const {user} = useAuth();
    const setArtists = useFollowStore(s => s.setArtists);
    const artistsData = useFollowStore(s => s.artists);
    const toggleFollow = useFollowStore(s => s.toggleFollow);


    useEffect(() => {
        setArtists(newSuggestedArtists);
    }, [newSuggestedArtists]);

    function handleFollow(artistId) {
        toggleFollow(artistId);
    }

    return (
       <aside className={styles.homeSuggestions}>
            <div className="suggestions-section" style={{marginBottom: '32px'}}>
                <h2 className="section-title" style={{marginBottom: '12px', fontSize: '18px'}}>Top Artists</h2>
                <div className={styles.suggestionsList}>
                    { topArtists && topArtists.length > 0  ? (
                        // console.log("topArtists"),
                        topArtists.map((artist) => (
                            <div key={artist._id} className={styles.suggestionCard}>
                                <NavLink to={`/profile/${artist._id}`} className={styles.suggestionInfo}>
                                    <img src={artist.avatar?.url || 'https://res.cloudinary.com/dqynaodv1/image/upload/v1781293476/955c965a3e831375a9fc2ed4e7599882_zlbj68.jpg'} alt={artist.username} className={styles.suggestionImg}/>
                                    <div className={styles.suggestionMeta}>
                                        <span className={styles.suggestionName}>{artist.username}</span>
                                        <span className={styles.suggestionRole}>{artist.followerCount || 0} Followers</span>
                                    </div>
                                </NavLink>
                            </div>
                        ))
                    ) : (
                         <p className="empty-suggestions">No top artists to display.</p>
                    )}
                </div>
            </div>

            <div className="suggestions-section">
                <h2 className="section-title" style={{marginBottom: '12px', fontSize: '18px'}}>Who to follow</h2>
                <div className={styles.suggestionsList}>
                    { newSuggestedArtists && newSuggestedArtists.length > 0  ? (
                        artistsData?.map((artist) => (
                             <div key={artist._id} className={styles.suggestionCard}>
                                <NavLink to={`/profile/${artist._id}`} className={styles.suggestionInfo}>
                                   <img src={artist.avatar?.url || 'https://res.cloudinary.com/dqynaodv1/image/upload/v1781293476/955c965a3e831375a9fc2ed4e7599882_zlbj68.jpg'} alt={artist.username} className={styles.suggestionImg}/>
                                    <div className={styles.suggestionMeta}>
                                        <span className={styles.suggestionName}>{artist.username}</span>
                                        <span className={styles.suggestionRole}>{artist.role}</span>
                                    </div>
                                </NavLink>
                                {user ? (
                                    <button
                                        className={clsx("btn-follow-action", artist.isFollowing ? "following" : "follow")} 
                                        onClick={() => handleFollow(artist._id)}>
                                        {artist.isFollowing ? "Following" : "Follow"}
                                    </button>
                                ) : (
                                    <NavLink to="/login" className="btn-follow-action">Follow</NavLink>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="empty-suggestions">No new artists to suggest.</p>
                    )}
                </div>
            </div>
        </aside>
    )
}

export default memo(Suggestions)