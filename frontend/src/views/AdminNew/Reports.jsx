import { useState, useEffect } from 'react';
import { Search, AlertTriangle } from 'lucide-react';
import adminApi from '../../services/adminApi';
import useAdminStore from '../../stores/adminStore';
import { Pagination } from '../../components/ui';
import AdminPageHead from './AdminPageHead.jsx';

const STATUS_OPTIONS = ['all', 'pending', 'resolved', 'dismissed'];
const PAGE_SIZE = 20;

function useDebounced(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function Reports() {
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('all');
  const { reloadAdmin, reviewReport } = useAdminStore();
  const debouncedQ = useDebounced(searchTerm);

  useEffect(() => {
    let alive = true;
    adminApi.getReports(status === 'all' ? '' : status, { page, limit: PAGE_SIZE })
      .then((data) => {
        if (!alive) return;
        let list = data.reports || [];
        const q = debouncedQ.trim().toLowerCase();
        if (q) {
          list = list.filter((r) =>
            (r.type || '').toLowerCase().includes(q) ||
            (r.reason || '').toLowerCase().includes(q) ||
            (r.reporter?.username || '').toLowerCase().includes(q) ||
            String(r.targetId || '').toLowerCase().includes(q)
          );
        }
        setReports(list);
        setTotal(data.total ?? list.length);
        setTotalPages(data.totalPages || 1);
        setError('');
        setLoading(false);
      })
      .catch((e) => { if (alive) { setError(e.message || 'Failed to load reports.'); setLoading(false); } });
    return () => { alive = false; };
  }, [reloadAdmin, status, debouncedQ, page]);

  if (loading) return <div className="management-container"><p>Loading reports...</p></div>;
  if (error) return <div className="management-container"><div className="empty-state"><p>{error}</p></div></div>;

  return (
    <div className="management-container">
      <AdminPageHead
        title="Reports"
        blurb="Community flags. Resolve or dismiss — the reporter gets notified."
        count={total}
        countLabel="reports"
      />
      <div className="controls-row">
        <div className="search-filter">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search reports by type, reason or reporter..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Filter by status">
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        {reports.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Target</th>
                <th>Reporter</th>
                <th>Reason</th>
                <th>Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report._id}>
                  <td>{report.type} <span style={{ color: '#A7A7A7' }}>({report.targetType})</span></td>
                  <td><span style={{ fontWeight: 600, color: '#1DB954' }}>{String(report.targetId).slice(-8)}</span></td>
                  <td><span style={{ color: '#A7A7A7' }}>{report.reporter?.username}</span></td>
                  <td className="comment-cell" style={{ maxWidth: 280 }}>{report.reason || '—'}</td>
                  <td>{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : ''}</td>
                  <td><span className={`badge ${report.status}`}>{report.status}</span></td>
                  <td>
                    <div className="table-actions">
                      {report.status === 'pending' ? (
                        <>
                          <button className="btn-action-outline btn-action-primary" onClick={() => reviewReport(report._id, 'resolve')}>
                            Resolve
                          </button>
                          <button className="btn-action-outline" onClick={() => reviewReport(report._id, 'dismiss')}>
                            Dismiss
                          </button>
                        </>
                      ) : (
                        <span style={{ color: '#A7A7A7', fontSize: '13px', fontStyle: 'italic' }}>
                          Handled{report.handledBy?.username ? ` by ${report.handledBy.username}` : ''}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <AlertTriangle className="empty-icon" />
            <p>No reports found.</p>
          </div>
        )}
      </div>

      <Pagination
        hasPrev={page > 1}
        hasNext={page < totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
        info={`Page ${page} of ${totalPages} • ${total} reports`}
      />
    </div>
  );
}

export default Reports;
