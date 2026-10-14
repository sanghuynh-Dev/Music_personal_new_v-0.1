import { useNavigate } from 'react-router-dom';
import { Flag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import useReportStore from '../stores/reportStore';

/**
 * Flag button that opens the global report modal.
 * Guests are sent to login (filing a report requires an account).
 */
function ReportButton({ targetType, targetId, label, className, title = 'Report', size = 16 }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const openReport = useReportStore((s) => s.openReport);

    if (!targetId) return null;
    return (
        <button
            type="button"
            className={className}
            title={title}
            aria-label={`${title}${label ? `: ${label}` : ''}`}
            onClick={() => {
                if (user) openReport({ type: targetType, id: targetId, label });
                else navigate('/login');
            }}
        >
            <Flag size={size} />
        </button>
    );
}

export default ReportButton;
