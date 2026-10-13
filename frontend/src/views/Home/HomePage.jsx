import { memo } from "react";
import { NavLink } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";

import HeroSection from './HeroSection.jsx';
import TopChart from './TopChart.jsx';
import TrackRail from './TrackRail.jsx';
import ArtistStrip from './ArtistStrip.jsx';
import { LoadingState } from "../../components/ui";
import usePlayerStore from "../../stores/playerStore";

import styles from './HomePage.module.scss'

function HomePage({ homeData }) {
    const playSong = usePlayerStore(s => s.playSong);

    if (!homeData || !homeData.songs) {
        return <LoadingState text="Loading your music..." />;
    }
    const featured = homeData.topSongs?.[0] || homeData.songs?.[0];
    const chart = (homeData.topSongs || []).slice(0, 10);
    const fresh = homeData.newReleases || [];
    const recent = (homeData.recentlyPlayed || []).map(h => h.song).filter(Boolean);
    const artists = homeData.topArtists || [];
    const suggested = homeData.newSuggestedArtists || [];

    return (
        <div className={styles.homeContainer}>
            <HeroSection song={featured} />

            {chart.length > 0 && (
                <section aria-label="Top tracks">
                    <div className={styles.sectionHead}>
                        <h2 className={clsx(styles.sectionTitle, "font-display")}>Top tracks this week</h2>
                        <NavLink to="/explore" className={styles.sectionLink}>
                            Explore all <ArrowRight size={15} />
                        </NavLink>
                    </div>
                    <TopChart songs={chart} />
                </section>
            )}

            {fresh.length > 0 && (
                <TrackRail
                    title="Fresh releases"
                    linkTo="/explore"
                    linkLabel="More new music"
                    songs={fresh}
                    onPlay={(id) => playSong(id)}
                />
            )}

            {recent.length > 0 && (
                <TrackRail
                    title="Recently played"
                    linkTo="/history"
                    linkLabel="Full history"
                    songs={recent}
                    onPlay={(id) => playSong(id)}
                />
            )}

            {(artists.length > 0 || suggested.length > 0) && (
                <ArtistStrip topArtists={artists} suggested={suggested} />
            )}
        </div>
    )
}

export default memo(HomePage)
