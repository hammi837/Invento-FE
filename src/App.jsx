import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import ThemeSwitcher from './components/ThemeSwitcher';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Users from './pages/Users';
import AuditLogs from './pages/AuditLogs';
import './App.css';
import './layout.css';

const PAGE_TITLES = {
  '/':           'Dashboard',
  '/products':   'Products',
  '/forecasts':  'Forecasts',
  '/audit-logs': 'Audit Log',
  '/users':      'User Management',
};

function AppShell() {
  const [criticalCount, setCriticalCount] = useState(0);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'Invento';
  const now = new Date().toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });

  return (
    <div className="app-shell">
      <Sidebar criticalCount={criticalCount} />

      <div className="main-content">
        <div className="topbar">
          <span className="topbar-title">{title}</span>
          <div className="topbar-right">
            <span className="topbar-time">{now}</span>
            {criticalCount > 0 && (
              <span className="topbar-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {criticalCount} critical
              </span>
            )}
            <ThemeSwitcher />
          </div>
        </div>

        <div className="page-area">
          <Routes>
            <Route path="/" element={
              <ProtectedRoute><Dashboard onCriticalCount={setCriticalCount} /></ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute><Products /></ProtectedRoute>
            } />
            <Route path="/forecasts" element={
              <ProtectedRoute><Dashboard onCriticalCount={setCriticalCount} /></ProtectedRoute>
            } />
            <Route path="/audit-logs" element={
              <ProtectedRoute allowedRoles={['admin','manager']}><AuditLogs /></ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute allowedRoles={['admin']}><Users /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-surface)',
                color: 'var(--text-hi)',
                border: '1px solid var(--border-hi)',
                borderRadius: '10px',
                fontSize: '0.82rem',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: 'var(--bg-surface)' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: 'var(--bg-surface)' } },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
