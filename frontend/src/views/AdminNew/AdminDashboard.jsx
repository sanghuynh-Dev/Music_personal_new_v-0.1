import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users as UsersIcon, Music, Mic2, AlertTriangle, ArrowLeft, Disc, ListMusic, MessageSquare } from 'lucide-react';
import clsx from 'clsx';

// Sub views (all backed by real admin API — no mock data)
import Overview from './Overview.jsx';
import Users from './Users.jsx';
import Songs from './Songs.jsx';
import Artists from './Artists.jsx';
import Playlists from './Playlists.jsx';
import Comments from './Comments.jsx';
import Reports from './Reports.jsx';

import adminApi from '../../services/adminApi';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Avatar from '../../components/Avatar.jsx';

// Styling
import './AdminDashboard.scss';

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({});
  const [error, setError] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const location = useLocation();
  const { user } = useAuth();

  const titleMap = {
    '/admin/dashboard': 'Overview',
    '/admin/users': 'Users',
    '/admin/songs': 'Songs',
    '/admin/artists': 'Artists',
    '/admin/playlists': 'Playlists',
    '/admin/comments': 'Comments',
    '/admin/reports': 'Reports',
  };

  const currentTitle = titleMap[location.pathname] || 'Console';

  const menuItems = [
    { path: '/admin/dashboard', name: 'Overview', icon: LayoutDashboard },
    { path: '/admin/users', name: 'Users', icon: UsersIcon },
    { path: '/admin/songs', name: 'Songs', icon: Music },
    { path: '/admin/artists', name: 'Artists', icon: Mic2 },
    { path: '/admin/playlists', name: 'Playlists', icon: ListMusic },
    { path: '/admin/comments', name: 'Comments', icon: MessageSquare },
    { path: '/admin/reports', name: 'Reports', icon: AlertTriangle, badge: pendingCount },
  ];

  useEffect(() => {
    let alive = true;
    adminApi.getDashboard()
      .then((data) => {
        if (!alive) return;
        setDashboardData(data);
        setPendingCount(data?.stats?.pendingReports || 0);
        setError('');
      })
      .catch((e) => { if (alive) setError(e.message || 'Failed to load dashboard.'); });
    return () => { alive = false; };
  }, []);

  return (
    <div className="console-layout">
      {/* Top command bar */}
      <header className="console-topbar">
        <NavLink to="/admin/dashboard" className="console-brand">
          <Disc className="console-brand-icon" size={24} />
          <span className="console-brand-word">Console</span>
        </NavLink>

        <nav className="console-tabs" aria-label="Admin sections">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => clsx('console-tab', isActive && 'console-tab-active')}
              >
                <Icon className="console-tab-icon" size={17} />
                <span>{item.name}</span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="console-tab-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="console-identity">
          <NavLink to="/" className="console-back" title="Back to site">
            <ArrowLeft size={16} />
            <span>Site</span>
          </NavLink>
          <Avatar src={user?.avatar?.url} alt={user?.username || 'Admin'} className="console-avatar" />
          <span className="console-username">{user?.username || 'Administrator'}</span>
        </div>
      </header>

      {/* Page heading */}
      <div className="console-pagehead">
        <nav className="console-crumbs" aria-label="Breadcrumb">
          <NavLink to="/admin/dashboard">Console</NavLink>
          <span className="console-crumb-sep">/</span>
          <span aria-current="page">{currentTitle}</span>
        </nav>
      </div>

      {/* Content */}
      <main className="console-content" key={location.pathname}>
        {error && <div className="empty-state"><p>{error} (need admin login with API access)</p></div>}
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="/dashboard" element={<Overview
            counts={dashboardData.stats}
            recentUsers={dashboardData.recentUsers}
            recentSongs={dashboardData.recentSongs}
          />} />
          <Route path="/users" element={<Users />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/comments" element={<Comments />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default AdminDashboard;
