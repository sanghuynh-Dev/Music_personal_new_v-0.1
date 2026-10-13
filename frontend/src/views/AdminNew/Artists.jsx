import { useState, useEffect } from 'react';
import { Search, Mic2 } from 'lucide-react';
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

function Artists() {
  const [artists, setArtists] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { reloadAdmin, toggleBan, demoteArtist } = useAdminStore();
  const debouncedQ = useDebounced(searchTerm);

  useEffect(() => {
    let alive = true;
    adminApi.getArtists({ q: debouncedQ.trim(), page, limit: PAGE_SIZE })
      .then((data) => {
        if (!alive) return;
        setArtists(data.artists || []);
        setTotal(data.total ?? (data.artists || []).length);
        setTotalPages(data.totalPages || 1);
        setError('');
        setLoading(false);
      })
      .catch((e) => { if (alive) { setError(e.message || 'Failed to load artists.'); setLoading(false); } });
    return () => { alive = false; };
  }, [reloadAdmin, debouncedQ, page]);

  if (loading) return <div className="management-container"><p>Loading artists...</p></div>;
  if (error) return <div className="management-container"><div className="empty-state"><p>{error}</p></div></div>;

  return (
    <div className="management-container">
      <AdminPageHead
        title="Artists"
        blurb="Verified voices and uploaders. Demote instead of banning when possible."
        count={total}
        countLabel="artists"
      />
      <div className="controls-row">
        <div className="search-filter">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search artists by name or email..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="table-wrapper">
        {artists.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Artist Info</th>
                <th>Email</th>
                <th>Total Songs</th>
                <th>Followers</th>
                <th>Plays</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {artists.map((artist) => (
                <tr key={artist._id}>
                  <td>
                    <div className="cell-profile">
                      <Avatar src={artist.avatar?.url} alt={artist.username} className="circle" />
                      <div className="name-wrapper">
                        <span className="main-name">{artist.username}</span>
                      </div>
                    </div>
                  </td>
                  <td>{artist.email}</td>
                  <td><strong style={{ color: '#fff' }}>{artist.songCount || 0}</strong> tracks</td>
                  <td>{(artist.followerCount || 0).toLocaleString()}</td>
                  <td>{(artist.totalPlays || 0).toLocaleString()}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className={`btn-action-outline ${artist.status === 'active' ? 'btn-action-danger' : 'btn-action-primary'}`}
                        onClick={() => toggleBan(artist._id, artist.status === 'banned' ? 'unban' : 'ban')}
                      >
                        {artist.status === 'banned' ? 'Unban' : 'Ban'}
                      </button>
                      <button
                        className="btn-action-outline"
                        onClick={() => demoteArtist(artist._id)}
                        title="Demote artist to user"
                      >
                        Demote
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <Mic2 className="empty-icon" />
            <p>No artists found matching your search.</p>
          </div>
        )}
      </div>

      <Pagination
        hasPrev={page > 1}
        hasNext={page < totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
        info={`Page ${page} of ${totalPages} • ${total} artists`}
      />
    </div>
  );
}

export default Artists;
