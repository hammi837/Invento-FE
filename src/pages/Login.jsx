import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../redux/hooks';
import './Login.css';

const FEATURES = [
  { icon: '📊', text: 'AI-powered demand forecasting with Prophet ML models' },
  { icon: '🚨', text: 'Real-time stock alerts — critical, warning, and OK statuses' },
  { icon: '👥', text: 'Role-based access for Admin, Manager, and Staff' },
  { icon: '📋', text: 'Full audit trail of every inventory change' },
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = { admin: ['admin', 'Admin1234!'], manager: ['manager', 'Manager1234!'], staff: ['staff', 'Staff1234!'] };
    setUsername(creds[role][0]);
    setPassword(creds[role][1]);
    setError('');
  };

  return (
    <div className="auth-page">

      {/* ── Left panel — brand + features ── */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M20 7H4C2.9 7 2 7.9 2 9v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" fill="white" fillOpacity="0.9"/>
                <path d="M16 7V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="13" r="2" fill="#6366f1"/>
              </svg>
            </div>
            <span className="auth-brand-name">Invento</span>
          </div>

          <div className="auth-hero">
            <h1 className="auth-hero-title">
              Smart inventory,<br />
              <span className="auth-hero-accent">AI-powered insights</span>
            </h1>
            <p className="auth-hero-sub">
              Manage stock, forecast demand, and prevent stockouts before they happen.
            </p>
          </div>

          <ul className="auth-features">
            {FEATURES.map((f, i) => (
              <li key={i} className="auth-feature-item">
                <span className="auth-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>

          <div className="auth-left-footer">
            <div className="auth-stat"><strong>20</strong><span>Products tracked</span></div>
            <div className="auth-stat-divider" />
            <div className="auth-stat"><strong>14.35%</strong><span>Avg. MAPE</span></div>
            <div className="auth-stat-divider" />
            <div className="auth-stat"><strong>3</strong><span>Role levels</span></div>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="auth-right">
        <div className="auth-form-wrap">

          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="auth-error" role="alert">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="username">Username</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-field-row">
                <label htmlFor="password">Password</label>
              </div>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="auth-toggle-pass" onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}>
                  {showPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <span className="auth-spinner">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Signing in…
                </span>
              ) : (
                <>
                  Sign In
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Demo quick-login */}
          <div className="auth-demo">
            <div className="auth-demo-label">Quick demo access</div>
            <div className="auth-demo-btns">
              {['admin', 'manager', 'staff'].map(role => (
                <button key={role} type="button" className={`auth-demo-btn demo-${role}`} onClick={() => fillDemo(role)}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <p className="auth-footer-note">
            Secure access · Role-based permissions · JWT authentication
          </p>
        </div>
      </div>
    </div>
  );
}
