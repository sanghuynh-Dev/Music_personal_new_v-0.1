import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Users } from "lucide-react";
import artistApi from "../../services/artistApi";
import { Pagination, LoadingState, ErrorState, EmptyState } from "../../components/ui";
import styles from './Artist.module.scss';

function FollowersTab() {
    const [followers, setFollowers] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tick, setTick] = useState(0);

    useEffect(() => {
        let alive = true;
        artistApi.getFollowers({ page })
            .then((d) => {
                if (!alive) return;
                setFollowers(d.followers || []);
                setTotal(d.total || 0);
                setTotalPages(d.totalPages || 1);
                setError('');
                setLoading(false);
            })
            .catch((e) => { if (alive) { setError(e.message || 'Failed to load followers.'); setLoading(false); } });
        return () => { alive = false; };
    }, [page, tick]);

    const handlePage = (dir) => { setLoading(true); setPage((p) => dir > 0 ? Math.min(totalPages, p + 1) : Math.max(1, p - 1)); };

    if (loading) return <LoadingState text="Loading followers..." />;
    if (error) return <ErrorState text={error} onRetry={() => setTick((t) => t + 1)} />;
    if (followers.length === 0) {
        return <EmptyState icon={Users} title="No followers yet" text="Share your music to grow your audience." />;
    }

    return (
        <div>
            <ul className={styles.followerList}>
                {followers.map((f) => (
                    <li key={f._id} className={styles.followerRow}>
                        <img src={f.avatar?.url} alt="" loading="lazy" className={styles.followerAvatar} />
                        <NavLink to={`/profile/${f._id}`} className={styles.followerName}>{f.username}</NavLink>
                    </li>
                ))}
            </ul>
            <Pagination
                hasPrev={page > 1} hasNext={page < totalPages}
                onPrev={() => handlePage(-1)}
                onNext={() => handlePage(1)}
                info={`Page ${page} of ${totalPages} • ${total} followers`}
            />
        </div>
    );
}

export default FollowersTab;
