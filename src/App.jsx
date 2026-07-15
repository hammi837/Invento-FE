import { useState, useEffect } from 'react';
import api from './api';
import './App.css';

function App() {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/forecasts/?ordering=days_until_stockout')
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

  const getStatusBadge = (status) => {
    const map = {
      critical: { label: 'CRITICAL', className: 'badge badge-critical' },
      warning:  { label: 'WARNING',  className: 'badge badge-warning'  },
      ok:       { label: 'OK',       className: 'badge badge-ok'       },
      unknown:  { label: 'UNKNOWN',  className: 'badge badge-unknown'  },
    };
    return map[status] || map.unknown;
  };

  if (loading) return (
    <div className="container">
      <div className="loading">Loading forecasts...</div>
    </div>
  );

  if (error) return (
    <div className="container">
      <div className="error">{error}</div>
    </div>
  );

  const critical = forecasts.filter(f => f.stock_status === 'critical').length;
  const warning  = forecasts.filter(f => f.stock_status === 'warning').length;
  const ok       = forecasts.filter(f => f.stock_status === 'ok').length;

  return (
    <div className="container">
      <h1>Inventory Forecast Dashboard</h1>
      <p className="subtitle">Weekly demand forecasts — sorted by urgency</p>

      {/* Summary cards */}
      <div className="cards">
        <div className="card card-critical">
          <span className="card-number">{critical}</span>
          <span className="card-label">Critical</span>
        </div>
        <div className="card card-warning">
          <span className="card-number">{warning}</span>
          <span className="card-label">Warning</span>
        </div>
        <div className="card card-ok">
          <span className="card-number">{ok}</span>
          <span className="card-label">OK</span>
        </div>
        <div className="card card-total">
          <span className="card-number">{forecasts.length}</span>
          <span className="card-label">Total Products</span>
        </div>
      </div>

      {/* Forecast table */}
      <table>
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Product Name</th>
            <th>Category</th>
            <th>Current Stock</th>
            <th>Weekly Demand</th>
            <th>Days Until Stockout</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {forecasts.map(f => {
            const badge = getStatusBadge(f.stock_status);
            return (
              <tr key={f.id} className={`row-${f.stock_status}`}>
                <td><code>{f.product_id}</code></td>
                <td>{f.product_name ?? '—'}</td>
                <td>{f.category ?? '—'}</td>
                <td>{f.current_stock ?? '—'}</td>
                <td>{f.predicted_units != null ? Math.round(f.predicted_units) : '—'}</td>
                <td>{f.days_until_stockout ?? '—'}</td>
                <td><span className={badge.className}>{badge.label}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
