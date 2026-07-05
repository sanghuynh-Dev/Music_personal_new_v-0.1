
import { useEffect, useState, memo } from "react";

import RecentlyPlayed from './RecentlyPlayed.jsx';
import NewReleases from './NewReleases.jsx';
import MainSongFeed from './MainSongFeed.jsx';
import Suggestions from './Suggestions.jsx';
import Loading from "../../components/loading/Loading.jsx";


import styles from './HomePage.module.scss'
import { use } from "react";

function HomePage({homeData}) {
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (homeData) {
            setLoading(true);
        }
    }, []);
    return (
        <>
            { !loading ?  (
                <Loading />
            ) : (
                <div className={styles["homeContainer"]}>
                    <RecentlyPlayed recentlyPlayed={homeData.recentlyPlayed} />
                    <NewReleases newReleases={homeData.newReleases} />
                    <div className="home-content-split">
                        <MainSongFeed topSongs={homeData.topSongs} songs={homeData.songs} />
                        <Suggestions topArtists={homeData.topArtists} newSuggestedArtists={homeData.newSuggestedArtists} />
                    </div>
                </div>
            )}
        </>
    )
}

export default memo(HomePage)