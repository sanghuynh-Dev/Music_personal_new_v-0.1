import { useState, useEffect } from 'react';
import { Search, ListMusic, Trash2 } from 'lucide-react';
import adminApi from '../../services/adminApi';
import useAdminStore from '../../stores/adminStore';
import { Pagination } from '../../components/ui';
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

function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { reloadAdmin, deletePlaylist } = useAdminStore();
  const debouncedQ = useDebounced(searchTerm);

  useEffect(() => {
    let alive = true;
    adminApi.getPlaylists({ q: debouncedQ.trim(), page, limit: PAGE_SIZE })
      .then((data) => {
        if (!alive) return;
        setPlaylists(data.playlists || []);
        setTotal(data.total ?? (data.playlists || []).length);
        setTotalPages(data.totalPages || 1);
        setError('');
        setLoading(false);
      })
      .catch((e) => { if (alive) { setError(e.message || 'Failed to load playlists.'); setLoading(false); } });
    return () => { alive = false; };
  }, [reloadAdmin, debouncedQ, page]);

  if (loading) return <div className="management-container"><p>Loading playlists...</p></div>;
  if (error) return <div className="management-container"><div className="empty-state"><p>{error}</p></div></div>;

  return (
    <div className="management-container">
      <AdminPageHead
        title="Playlists"
        blurb="User collections. Songs themselves are kept when a playlist is removed."
        count={total}
        countLabel="playlists"
      />
      <div className="controls-row">
        <div className="search-filter">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search playlists by name..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>
      </div>
      <div className="table-wrapper">
        {playlists.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Playlist</th>
                <th>Owner</th>
                <th>Songs</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {playlists.map((p) => (
                <tr key={p._id}>
                  <td><span className="main-name">{p.name}</span></td>
                  <td>{p.user?.username} <span style={{ color: '#A7A7A7' }}>({p.user?.email})</span></td>
                  <td>{p.songCount ?? (p.songs?.length || 0)}</td>
                  <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-action-outline btn-action-danger"
                        onClick={() => deletePlaylist(p._id)}
                        style={{ padding: '6px' }}
                        title="Delete Playlist"
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
            <ListMusic className="empty-icon" />
            <p>No playlists found.</p>
          </div>
        )}
      </div>

      <Pagination
        hasPrev={page > 1}
        hasNext={page < totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
        info={`Page ${page} of ${totalPages} • ${total} playlists`}
      />
    </div>
  );
}

export default Playlists;
