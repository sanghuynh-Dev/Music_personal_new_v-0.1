import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export function RequireAuth({ children }) {
    const { user, checked } = useAuth();
    const location = useLocation();
    if (!checked) return null;
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    return children;
}

export function RequireArtist({ children }) {
    const { user, checked } = useAuth();
    const location = useLocation();
    if (!checked) return null;
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    if (user.role !== 'artist' && user.role !== 'admin') return <Navigate to="/" replace />;
    return children;
}

export default RequireAuth;
