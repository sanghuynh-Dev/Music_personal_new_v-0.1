import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function RequireAdmin({ children }) {
    const { user, checked } = useAuth();
    // Wait for the auth check — otherwise F5 on /admin kicks out logged-in admins.
    if (!checked) return null;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/" replace />;
    return children;
}

export default RequireAdmin;
