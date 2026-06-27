
import styles from './Artist.module.scss'
function StatsCardsRow({ stats }) {
    return (
        <div className="stats-cards-grid">
            <div className="stat-card">
                <div className="stat-icon-circle" style={{ backgroundColor: "rgba(29, 185, 84, 0.1)", color: "var(--primary-color)"}}>
                    <i className="ti-music-alt"></i>
                </div>
                <div>
                    <span className="stat-label">TOTAL SONGS</span>
                    <strong className="stat-value">
                        {stats?.totalSongs}
                    </strong>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon-circle" style={{ backgroundColor:"rgba(52, 152, 219, 0.1)",color:" #3498db"}}>
                    <i className="ti-headphone"></i>
                </div>
                <div>
                    <span className="stat-label">TOTAL PLAYS</span>
                    <strong className="stat-value">
                        {stats?.totalPlays}
                    </strong>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon-circle" style={{ backgroundColor: "rgba(241, 196, 15, 0.1)", color:" #f1c40f"}}>
                    <i className="ti-heart"></i>
                </div>
                <div>
                    <span className="stat-label">FOLLOWERS</span>
                    <strong className="stat-value">
                        {stats?.totalFollowers}
                    </strong>
                </div>
            </div>
        </div>
    )
}

export default StatsCardsRow