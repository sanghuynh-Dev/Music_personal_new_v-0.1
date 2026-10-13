
function StatsCardsRow({ stats }) {
    const cards = [
        { label: 'Total songs', value: stats?.totalSongs ?? 0, icon: 'ti-music-alt', bg: 'rgba(245, 166, 35, 0.12)', color: 'var(--accent)' },
        { label: 'Total plays', value: stats?.totalPlays ?? 0, icon: 'ti-headphone', bg: 'rgba(124, 108, 245, 0.12)', color: 'var(--indigo)' },
        { label: 'Total likes', value: stats?.totalLikes ?? 0, icon: 'ti-heart', bg: 'rgba(224, 92, 92, 0.12)', color: 'var(--danger)' },
        { label: 'Followers', value: stats?.totalFollowers ?? 0, icon: 'ti-user', bg: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)' },
    ];
    return (
        <div className="stats-cards-grid">
            {cards.map((c) => (
                <div className="stat-card" key={c.label}>
                    <div className="stat-icon-circle" style={{ backgroundColor: c.bg, color: c.color }}>
                        <i className={c.icon}></i>
                    </div>
                    <div>
                        <span className="stat-label">{c.label}</span>
                        <strong className="stat-value">{Number(c.value).toLocaleString()}</strong>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default StatsCardsRow
