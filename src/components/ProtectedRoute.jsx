import { Navigate } from 'react-router-dom';
import { useAuth } from '../redux/hooks';

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="container"><p className="state-msg">Loading…</p></div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }
  return children;
}
