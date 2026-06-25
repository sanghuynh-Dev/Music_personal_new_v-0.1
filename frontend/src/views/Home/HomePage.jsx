
import { useEffect, useState, memo } from "react";

import RecentlyPlayed from './RecentlyPlayed.jsx';
import NewReleases from './NewReleases.jsx';
import MainSongFeed from './MainSongFeed.jsx';
import Suggestions from './Suggestions.jsx';

import styles from './HomePage.module.scss'

function HomePage({homeData}) {
    return (
        <div className={styles["homeContainer"]}>
            <RecentlyPlayed recentlyPlayed={homeData.recentlyPlayed} />
            <NewReleases newReleases={homeData.newReleases} />
            <div className="home-content-split">
                <MainSongFeed topSongs={homeData.topSongs} songs={homeData.songs} />
                <Suggestions topArtists={homeData.topArtists} newSuggestedArtists={homeData.newSuggestedArtists} />
            </div>
        </div>
    )
}

export default memo(HomePage)