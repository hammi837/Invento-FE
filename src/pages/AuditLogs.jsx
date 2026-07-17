import { useState, useEffect } from 'react';
import api from '../api';

const ACTION_STYLE = {
  create: 'badge-ok',
  update: { background:'rgba(79,70,229,0.12)', color:'#818cf8' },
  delete: 'badge-critical',
};

export default function AuditLogs() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/audit-logs/${filter ? `?action=${filter}` : ''}`)
      .then(r => { setLogs(Array.isArray(r.data) ? r.data : (r.data.results ?? [])); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter]);

  if (loading) return <div className="loading-wrap">Loading…</div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Audit Log</h1>
          <p>Immutable record of every change in the system</p>
        </div>
      </div>

      <div className="panel">
        <div className="controls-bar">
          <select className="ctrl-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
          <span style={{ marginLeft:'auto', fontSize:'0.75rem', color:'#4a5568' }}>{logs.length} entries</span>
        </div>

        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Time</th><th>User</th><th>Action</th><th>Model</th><th>Object</th><th>Details</th></tr>
            </thead>
            <tbody>
              {logs.map(l => {
                const badgeClass = typeof ACTION_STYLE[l.action] === 'string' ? ACTION_STYLE[l.action] : '';
                const badgeStyle = typeof ACTION_STYLE[l.action] === 'object' ? ACTION_STYLE[l.action] : {};
                return (
                  <tr key={l.id}>
                    <td style={{ fontSize:'0.75rem', color:'#4a5568', whiteSpace:'nowrap' }}>
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td><span className="pid">{l.username ?? '—'}</span></td>
                    <td>
                      <span className={`status-badge ${badgeClass}`} style={badgeStyle}>
                        {l.action.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ color:'#a0aec0' }}>{l.model_name}</td>
                    <td><code style={{ background:'#1e2130', color:'#818cf8', padding:'2px 6px', borderRadius:4, fontSize:'0.75rem' }}>{l.object_id}</code></td>
                    <td style={{ color:'#718096', fontSize:'0.78rem', maxWidth:280, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.details}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {logs.length === 0 && <div className="empty-state"><p>No audit log entries</p></div>}
        </div>
      </div>
    </>
  );
}
