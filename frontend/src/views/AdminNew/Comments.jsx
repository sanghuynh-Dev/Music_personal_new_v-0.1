import { useState, useEffect } from 'react';
import { Search, MessageSquare, Trash2 } from 'lucide-react';
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

function Comments() {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { reloadAdmin, deleteComment } = useAdminStore();
  const debouncedQ = useDebounced(searchTerm);

  useEffect(() => {
    let alive = true;
    adminApi.getComments({ q: debouncedQ.trim(), page, limit: PAGE_SIZE })
      .then((data) => {
        if (!alive) return;
        setComments(data.comments || []);
        setTotal(data.total ?? (data.comments || []).length);
        setTotalPages(data.totalPages || 1);
        setError('');
        setLoading(false);
      })
      .catch((e) => { if (alive) { setError(e.message || 'Failed to load comments.'); setLoading(false); } });
    return () => { alive = false; };
  }, [reloadAdmin, debouncedQ, page]);

  if (loading) return <div className="management-container"><p>Loading comments...</p></div>;
  if (error) return <div className="management-container"><div className="empty-state"><p>{error}</p></div></div>;

  return (
    <div className="management-container">
      <AdminPageHead
        title="Comments"
        blurb="Conversation under tracks. Remove what breaks the rules."
        count={total}
        countLabel="comments"
      />
      <div className="controls-row">
        <div className="search-filter">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search comment text..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>
      </div>
      <div className="table-wrapper">
        {comments.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Content</th>
                <th>Author</th>
                <th>Song</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((c) => (
                <tr key={c._id}>
                  <td className="comment-cell">{c.content}</td>
                  <td>{c.user?.username}</td>
                  <td>{c.song?.title} <span style={{ color: '#A7A7A7' }}>({c.song?.artist})</span></td>
                  <td>{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-action-outline btn-action-danger"
                        onClick={() => deleteComment(c._id)}
                        style={{ padding: '6px' }}
                        title="Delete Comment"
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
            <MessageSquare className="empty-icon" />
            <p>No comments found.</p>
          </div>
        )}
      </div>

      <Pagination
        hasPrev={page > 1}
        hasNext={page < totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
        info={`Page ${page} of ${totalPages} • ${total} comments`}
      />
    </div>
  );
}

export default Comments;
