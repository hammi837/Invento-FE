import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../redux/hooks';

const NAV_ICON = {
  dashboard: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  products:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  forecast:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  orders:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  analytics: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  ai:        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>,
  users:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  audit:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  settings:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
};

function NavItem({ to, icon, label, badge, comingSoon }) {
  if (comingSoon) {
    return (
      <span className="sidebar-link sidebar-link-soon">
        {icon}
        <span>{label}</span>
        <span className="sidebar-soon-badge">Soon</span>
      </span>
    );
  }
  return (
    <NavLink to={to} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} end={to === '/'}>
      {icon}
      <span>{label}</span>
      {badge > 0 && <span className="sidebar-link-badge">{badge}</span>}
    </NavLink>
  );
}

export default function Sidebar({ criticalCount }) {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.username ?? 'U').slice(0, 2).toUpperCase();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">📦</div>
        <span className="sidebar-logo-text">Invento</span>
        <span className="sidebar-logo-badge">AI</span>
      </div>

      <div className="sidebar-section">
        {/* Main */}
        <div className="sidebar-section-label">Overview</div>
        <nav className="sidebar-nav">
          <NavItem to="/" icon={NAV_ICON.dashboard} label="Dashboard" badge={criticalCount} />
          <NavItem to="/products" icon={NAV_ICON.products} label="Products" />
          <NavItem to="/forecasts" icon={NAV_ICON.forecast} label="Forecasting" />
        </nav>

        {/* Operations */}
        <div className="sidebar-section-label">Operations</div>
        <nav className="sidebar-nav">
          <NavItem to="/purchase-orders" icon={NAV_ICON.orders} label="Purchase Orders" comingSoon />
          <NavItem to="/analytics" icon={NAV_ICON.analytics} label="Analytics" comingSoon />
        </nav>

        {/* AI */}
        <div className="sidebar-section-label">Intelligence</div>
        <nav className="sidebar-nav">
          <NavItem to="/ai-assistant" icon={NAV_ICON.ai} label="AI Assistant" comingSoon />
        </nav>

        {/* Admin */}
        {hasRole('admin', 'manager') && (
          <>
            <div className="sidebar-section-label">Admin</div>
            <nav className="sidebar-nav">
              <NavItem to="/audit-logs" icon={NAV_ICON.audit} label="Audit Log" />
              {hasRole('admin') && (
                <NavItem to="/users" icon={NAV_ICON.users} label="Users" />
              )}
              <NavItem to="/settings" icon={NAV_ICON.settings} label="Settings" comingSoon />
            </nav>
          </>
        )}
      </div>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className={`sidebar-avatar avatar-${user?.role}`}>{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.username}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
          <button className="sidebar-logout" title="Sign out"
            onClick={() => { logout(); navigate('/login'); }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
