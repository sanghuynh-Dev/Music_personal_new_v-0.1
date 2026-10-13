import { useState, useEffect } from 'react';
import { Search, UserX, Trash2, X } from 'lucide-react';
import adminApi from '../../services/adminApi';
import useAdminStore from '../../stores/adminStore';
import { Pagination } from '../../components/ui';
import Avatar from '../../components/Avatar.jsx';
import AdminPageHead from './AdminPageHead.jsx';

const PAGE_SIZE = 20;

function useDebounced(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function Users() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const { reloadAdmin, toggleBan, promoteToArtist, deleteUser, toggleVerify } = useAdminStore();
  const debouncedQ = useDebounced(searchTerm);

  useEffect(() => {
    let alive = true;
    adminApi.getUsers({
      q: debouncedQ.trim(),
      role: roleFilter === 'all' ? '' : roleFilter,
      status: statusFilter === 'all' ? '' : statusFilter,
      page,
      limit: PAGE_SIZE,
    })
      .then((data) => {
        if (!alive) return;
        setUsers(data.users || []);
        setTotal(data.total ?? (data.users || []).length);
        setTotalPages(data.totalPages || 1);
        setError('');
        setLoading(false);
      })
      .catch((e) => { if (alive) { setError(e.message || 'Failed to load users.'); setLoading(false); } });
    return () => { alive = false; };
  }, [reloadAdmin, debouncedQ, roleFilter, statusFilter, page]);

  const openDetail = (userId) => {
    setDetailLoading(true);
    setDetail(null);
    adminApi.getUserDetail(userId)
      .then((data) => setDetail(data))
      .catch(() => setDetail({ error: true }))
      .finally(() => setDetailLoading(false));
  };

  if (loading) return <div className="management-container"><p>Loading users...</p></div>;
  if (error) return <div className="management-container"><div className="empty-state"><p>{error}</p></div></div>;

  return (
    <div className="management-container">
      <AdminPageHead
        title="Users"
        blurb="Accounts, roles and access. Banning signs a user out everywhere."
        count={total}
        countLabel="users"
      />
      <div className="controls-row">
        <div className="search-filter">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search users by username or email..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} aria-label="Filter by role">
          <option value="all">All roles</option>
          <option value="user">User</option>
          <option value="artist">Artist</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      <div className="table-wrapper">
        {users.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Info</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} onClick={() => openDetail(user._id)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div className="cell-profile">
                      <Avatar src={user.avatar?.url} alt={user.username} className="circle" />
                      <div className="name-wrapper">
                        <span className="main-name">{user.username}</span>
                        <span className="sub-name">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td><span className={`badge role-${user.role}`}>{user.role}</span></td>
                  <td><span className={`badge ${user.status}`}>{user.status}</span></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="table-actions">
                      {user.role === 'user' && (
                        <button className="btn-action-outline" onClick={() => promoteToArtist(user._id)}>
                          Promote
                        </button>
                      )}
                      {user.role === 'artist' && (
                        <button className="btn-action-outline" onClick={() => toggleVerify(user._id, !!user.artistVerified)}>
                          {user.artistVerified ? 'Unverify' : 'Verify'}
                        </button>
                      )}
                      <button
                        className={`btn-action-outline ${user.status === 'active' ? 'btn-action-danger' : 'btn-action-primary'}`}
                        onClick={() => toggleBan(user._id, user.status === 'banned' ? 'unban' : 'ban')}
                      >
                        {user.status === 'active' ? 'Ban User' : 'Unban'}
                      </button>
                      <button
                        className="btn-action-outline btn-action-danger"
                        onClick={() => deleteUser(user._id)}
                        style={{ padding: '6px' }}
                        title="Delete User"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <UserX className="empty-icon" />
            <p>No users found matching your filters.</p>
          </div>
        )}
      </div>

      <Pagination
        hasPrev={page > 1}
        hasNext={page < totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
        info={`Page ${page} of ${totalPages} • ${total} users`}
      />

      {(detail || detailLoading) && (
        <div className="detail-drawer" role="dialog" aria-label="User detail">
          <div className="detail-drawer-header">
            <h3>User detail</h3>
            <button onClick={() => { setDetail(null); setDetailLoading(false); }} aria-label="Close detail"><X size={18} /></button>
          </div>
          {detailLoading && <p>Loading…</p>}
          {detail?.error && <p>Failed to load user detail.</p>}
          {detail?.user && (
            <div className="detail-drawer-body">
              <Avatar src={detail.user.avatar?.url} alt={detail.user.username} className="circle" />
              <p><strong>{detail.user.username}</strong> ({detail.user.email})</p>
              <p>Role: {detail.user.role} • Status: {detail.user.status}</p>
              <ul>
                <li>Songs: {detail.stats?.songCount ?? 0}</li>
                <li>Playlists: {detail.stats?.playlistCount ?? 0}</li>
                <li>Followers: {detail.stats?.followerCount ?? 0}</li>
                <li>Following: {detail.stats?.followingCount ?? 0}</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Users;
