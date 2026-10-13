import { useState, useEffect } from 'react';
import { Search, Music, Trash2, Play, Heart } from 'lucide-react';
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

function Songs() {
  const [songs, setSongs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { reloadAdmin, deleteSong } = useAdminStore();
  const debouncedQ = useDebounced(searchTerm);

  useEffect(() => {
    let alive = true;
    adminApi.getSongs({ q: debouncedQ.trim(), page, limit: PAGE_SIZE })
      .then((data) => {
        if (!alive) return;
        setSongs(data.songs || []);
        setTotal(data.total ?? (data.songs || []).length);
        setTotalPages(data.totalPages || 1);
        setError('');
        setLoading(false);
      })
      .catch((e) => { if (alive) { setError(e.message || 'Failed to load songs.'); setLoading(false); } });
    return () => { alive = false; };
  }, [reloadAdmin, debouncedQ, page]);

  if (loading) return <div className="management-container"><p>Loading songs...</p></div>;
  if (error) return <div className="management-container"><div className="empty-state"><p>{error}</p></div></div>;

  return (
    <div className="management-container">
      <AdminPageHead
        title="Songs"
        blurb="Every upload on the platform. Deleting also removes its Cloudinary files."
        count={total}
        countLabel="songs"
      />
      <div className="controls-row">
        <div className="search-filter">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search tracks by title, artist or uploader..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="table-wrapper">
        {songs.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Song Name</th>
                <th>Artist</th>
                <th>Uploader</th>
                <th>Plays</th>
                <th>Likes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song) => (
                <tr key={song._id}>
                  <td>
                    <div className="cell-cover">
                      <Avatar src={song.imageUrl?.url} alt={song.title} kind="cover" />
                      <div className="name-wrapper">
                        <span className="main-name">{song.title}</span>
                      </div>
                    </div>
                  </td>
                  <td>{song.artist}</td>
                  <td><span style={{ color: '#A7A7A7', fontStyle: 'italic' }}>@{song.uploadedBy?.username || 'unknown'}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Play size={12} style={{ color: '#1DB954' }} />
                      {(song.playCount || 0).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Heart size={12} style={{ color: '#e74c3c' }} />
                      {(song.likes?.length || 0).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-action-outline btn-action-danger"
                        onClick={() => deleteSong(song._id)}
                        style={{ padding: '6px' }}
                        title="Delete Track"
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
            <Music className="empty-icon" />
            <p>No songs found matching your search.</p>
          </div>
        )}
      </div>

      <Pagination
        hasPrev={page > 1}
        hasNext={page < totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
        info={`Page ${page} of ${totalPages} • ${total} songs`}
      />
    </div>
  );
}

export default Songs;
