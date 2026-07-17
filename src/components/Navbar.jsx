import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <span className="nav-brand">📦 Invento</span>
        <NavLink to="/"        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Dashboard</NavLink>
        <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Products</NavLink>
        {hasRole('admin', 'manager') && (
          <NavLink to="/audit-logs" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Audit Log</NavLink>
        )}
        {hasRole('admin') && (
          <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Users</NavLink>
        )}
      </div>
      <div className="nav-right">
        <span className="nav-user">
          {user?.username}
          <span className={`nav-role role-${user?.role}`}>{user?.role}</span>
        </span>
        <button className="nav-logout" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
