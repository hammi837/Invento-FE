import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import api from './api';
import './App.css';

function App() {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortKey, setSortKey] = useState('days_until_stockout');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    api.get('/forecasts/')
      .then(res => {
        setForecasts(res.data.results);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load forecasts. Is the Django server running?');
        setLoading(false);
        console.error(err);
      });
  }, []);

  const statusColor = (status) => {
    if (status === 'critical') return { bg: '#ffe0e0', text: '#c0392b', bar: '#e74c3c' };
    if (status === 'warning')  return { bg: '#fff3cd', text: '#a67c00', bar: '#f1c40f' };
    return { bg: '#d4edda', text: '#1e7e34', bar: '#2ecc71' };
  };

  const categories = useMemo(() => {
    const set = new Set(forecasts.map(f => f.category).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [forecasts]);

  const counts = useMemo(() => ({
    critical: forecasts.filter(f => f.stock_status === 'critical').length,
    warning:  forecasts.filter(f => f.stock_status === 'warning').length,
    ok:       forecasts.filter(f => f.stock_status === 'ok').length,
    total:    forecasts.length,
  }), [forecasts]);

  const filtered = useMemo(() => {
    let result = [...forecasts];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(f =>
        (f.product_name ?? '').toLowerCase().includes(q) ||
        f.product_id.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(f => f.stock_status === statusFilter);
    }
    if (categoryFilter !== 'all') {
      result = result.filter(f => f.category === categoryFilter);
    }

    result.sort((a, b) => {
      let valA = a[sortKey] ?? '';
      let valB = b[sortKey] ?? '';
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [forecasts, search, statusFilter, categoryFilter, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortIcon = (key) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  const chartData = useMemo(() => {
    return [...forecasts]
      .filter(f => f.days_until_stockout != null)
      .sort((a, b) => a.days_until_stockout - b.days_until_stockout)
      .slice(0, 10)
      .map(f => ({
        name: f.product_name && f.product_name.length > 18
          ? f.product_name.slice(0, 18) + '…'
          : (f.product_name ?? f.product_id),
        days:   f.days_until_stockout,
        status: f.stock_status,
      }));
  }, [forecasts]);

  if (loading) return <div className="container"><p className="state-msg">Loading forecasts…</p></div>;
  if (error)   return <div className="container"><p className="state-msg error">{error}</p></div>;

  return (
    <div className="container">
      <header>
        <h1>Inventory Forecast Dashboard</h1>
        <p className="subtitle">Weekly demand forecasts · sorted by urgency</p>
      </header>

      {/* ── Summary cards ── */}
      <div className="cards">
        {[
          { key: 'critical', label: 'CRITICAL', count: counts.critical },
          { key: 'warning',  label: 'WARNING',  count: counts.warning  },
          { key: 'ok',       label: 'OK',        count: counts.ok       },
        ].map(({ key, label, count }) => (
          <div
            key={key}
            className={`card card-${key} ${statusFilter === key ? 'active' : ''}`}
            onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
            role="button"
            aria-pressed={statusFilter === key}
          >
            <div className="card-number">{count}</div>
            <div className="card-label">{label}</div>
          </div>
        ))}
        <div className="card card-total">
          <div className="card-number">{counts.total}</div>
          <div className="card-label">TOTAL PRODUCTS</div>
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="chart-section">
        <h2>Most Urgent — Days Until Stockout (Top 10)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(val) => [`${val} days`, 'Days Until Stockout']}
              contentStyle={{ fontSize: 13 }}
            />
            <Bar dataKey="days" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={statusColor(entry.status).bar} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Filters ── */}
      <div className="controls">
        <input
          type="text"
          placeholder="Search product name or ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
          aria-label="Search products"
        />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          aria-label="Filter by category"
        >
          {categories.map(c => (
            <option key={c} value={c}>
              {c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
        {(statusFilter !== 'all' || categoryFilter !== 'all' || search) && (
          <button
            className="clear-filter"
            onClick={() => { setStatusFilter('all'); setCategoryFilter('all'); setSearch(''); }}
          >
            Clear filters ×
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('product_id')}>Product ID{sortIcon('product_id')}</th>
            <th onClick={() => handleSort('product_name')}>Product Name{sortIcon('product_name')}</th>
            <th onClick={() => handleSort('category')}>Category{sortIcon('category')}</th>
            <th onClick={() => handleSort('current_stock')}>Current Stock{sortIcon('current_stock')}</th>
            <th onClick={() => handleSort('predicted_units')}>Weekly Demand{sortIcon('predicted_units')}</th>
            <th onClick={() => handleSort('days_until_stockout')}>Days Until Stockout{sortIcon('days_until_stockout')}</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(f => {
            const colors = statusColor(f.stock_status);
            return (
              <tr key={f.id} style={{ backgroundColor: colors.bg }}>
                <td><span className="pid">{f.product_id}</span></td>
                <td>{f.product_name ?? '—'}</td>
                <td style={{ textTransform: 'capitalize' }}>{f.category ?? '—'}</td>
                <td>{f.current_stock?.toLocaleString() ?? '—'}</td>
                <td>{f.predicted_units != null ? Math.round(f.predicted_units).toLocaleString() : '—'}</td>
                <td>{f.days_until_stockout ?? '—'}</td>
                <td>
                  <span className="badge" style={{ background: colors.bg, color: colors.text }}>
                    {f.stock_status.toUpperCase()}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <p className="empty">No products match your filters.</p>
      )}
    </div>
  );
}

export default App;
