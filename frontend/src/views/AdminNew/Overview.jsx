import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Music, Mic2, Play, Layers, UserPlus, Disc, MessageSquare, AlertTriangle, UserX, Check } from 'lucide-react';
import adminApi from '../../services/adminApi';
import useAdminStore from '../../stores/adminStore';
import Avatar from '../../components/Avatar.jsx';

function Overview({ counts, recentUsers, recentSongs }) {
  const [analytics, setAnalytics] = useState({ userGrowth: [], songGrowth: [] });
  const [pending, setPending] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const reviewReport = useAdminStore(s => s.reviewReport);

  useEffect(() => {
    let alive = true;
    adminApi.getAnalytics(7).then((d) => { if (alive) setAnalytics(d); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    adminApi.getReports('pending', { limit: 5, page: 1 })
      .then((d) => { if (alive) setPending(d.reports || []); })
      .catch(() => {});
    return () => { alive = false; };
  }, [refreshKey]);

  const stats = [
    { label: 'Total Users', key: 'totalUsers', icon: Users },
    { label: 'Total Songs', key: 'totalSongs', icon: Music },
    { label: 'Total Artists', key: 'totalArtists', icon: Mic2 },
    { label: 'Total Playlists', key: 'totalPlaylists', icon: Layers },
    { label: 'Total Plays', key: 'totalPlays', icon: Play },
    { label: 'Comments', key: 'totalComments', icon: MessageSquare },
    { label: 'Pending Reports', key: 'pendingReports', icon: AlertTriangle },
    { label: 'Banned Users', key: 'bannedUsers', icon: UserX },
  ];

  // Zero-filled trailing 7-day window shared by both series.
  const last7Keys = (() => {
    const out = [];
    const d = new Date();
    for (let i = 6; i >= 0; i--) {
      const t = new Date(d);
      t.setDate(d.getDate() - i);
      out.push(t.toISOString().slice(0, 10));
    }
    return out;
  })();

  const zipWeek = (series) => {
    const byDay = Object.fromEntries((series || []).map((p) => [String(p._id).slice(0, 10), p.count]));
    return last7Keys.map((k) => ({ day: k.slice(5), count: byDay[k] || 0 }));
  };

  const usersWeek = zipWeek(analytics.userGrowth);
  const songsWeek = zipWeek(analytics.songGrowth);
  const weekMax = Math.max(1, ...usersWeek.map((d) => d.count), ...songsWeek.map((d) => d.count));
  const weekTotalUsers = usersWeek.reduce((s, d) => s + d.count, 0);
  const weekTotalSongs = songsWeek.reduce((s, d) => s + d.count, 0);

  const handleResolve = async (id) => {
    await reviewReport(id, 'resolve');
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="dashboard-overview">
      <div className="stats-grid">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div className="stat-card" key={idx}>
              <div className="stat-icon">
                <Icon size={22} />
              </div>
              <div className="stat-details">
                <span className="stat-value">{(counts?.[stat.key] ?? 0).toLocaleString()}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-visuals">
        <div className="visual-card">
          <div className="card-header">
            <h3>This week</h3>
            <span className="header-actions legend">
              <span className="legend-item"><i className="dot dot-amber" /> {weekTotalUsers} signups</span>
              <span className="legend-item"><i className="dot dot-indigo" /> {weekTotalSongs} uploads</span>
            </span>
          </div>
          <div className="week-bars" role="img" aria-label={`Signups ${weekTotalUsers}, uploads ${weekTotalSongs} in the last 7 days`}>
            {last7Keys.map((k, i) => (
              <div className="week-col" key={k}>
                <div className="week-bars-pair">
                  <span
                    className="week-bar week-bar-users"
                    style={{ height: `${Math.max(3, (usersWeek[i].count / weekMax) * 100)}%` }}
                    title={`${k}: ${usersWeek[i].count} signups`}
                  />
                  <span
                    className="week-bar week-bar-songs"
                    style={{ height: `${Math.max(3, (songsWeek[i].count / weekMax) * 100)}%` }}
                    title={`${k}: ${songsWeek[i].count} uploads`}
                  />
                </div>
                <span className="week-day">{k.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="visual-card attention-card">
          <div className="card-header">
            <h3>Needs attention</h3>
            <NavLink to="/admin/reports" className="header-link">All reports</NavLink>
          </div>
          {pending.length === 0 ? (
            <p className="attention-empty">Queue is clear. Nothing pending review.</p>
          ) : (
            <ul className="attention-list">
              {pending.map((r) => (
                <li key={r._id}>
                  <div className="attention-main">
                    <strong>{r.type}</strong>
                    <span>{r.reason || 'No reason given'} — {r.reporter?.username || 'unknown'}</span>
                  </div>
                  <button
                    className="btn-action-outline btn-action-primary"
                    onClick={() => handleResolve(r._id)}
                    title="Mark resolved"
                    aria-label={`Resolve report ${r.type}`}
                  >
                    <Check size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="dashboard-visuals">
        <div className="visual-card">
          <div className="card-header">
            <h3>Recent Users</h3>
            <span className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <UserPlus size={14} /> New today
            </span>
          </div>
          <div className="recent-list">
            {(recentUsers || []).map((user) => (
              <div className="list-item" key={user._id}>
                <div className="item-info">
                  <Avatar src={user.avatar?.url} alt={user.username} className="item-image circle" />
                  <div className="item-details">
                    <span className="item-title">{user.username}</span>
                    <span className="item-subtitle">{user.email}</span>
                  </div>
                </div>
                <div>
                  <span className={`badge ${user.role === 'artist' ? 'role-artist' : 'role-user'}`}>
                    {user.role}
                  </span>
                </div>
              </div>
            ))}
            {(!recentUsers || recentUsers.length === 0) && <p style={{ color: '#A7A7A7' }}>No recent users.</p>}
          </div>
        </div>

        <div className="visual-card">
          <div className="card-header">
            <h3>Recently Uploaded Songs</h3>
            <span className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#A7A7A7', fontSize: '13px' }}>
              <Disc size={14} /> Last uploads
            </span>
          </div>
          <div className="recent-list">
            {(recentSongs || []).map((song) => (
              <div className="list-item" key={song._id}>
                <div className="item-info">
                  <Avatar src={song.imageUrl?.url} alt={song.title} kind="cover" className="item-image" />
                  <div className="item-details">
                    <span className="item-title">{song.title}</span>
                    <span className="item-subtitle">by {song.artist} • {song.uploadedBy?.username || 'unknown'}</span>
                  </div>
                </div>
                <div className="item-value">
                  <Play size={12} /> {(song.playCount || 0).toLocaleString()}
                </div>
              </div>
            ))}
            {(!recentSongs || recentSongs.length === 0) && <p style={{ color: '#A7A7A7' }}>No recent songs.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Overview;
