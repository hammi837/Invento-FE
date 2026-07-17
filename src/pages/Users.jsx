import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../redux/hooks';
import api from '../api';
import { SkeletonTable } from '../components/Skeleton';

const EMPTY = { username:'', email:'', password:'', role:'staff', first_name:'', last_name:'', phone:'' };

export default function Users() {
  const { user: me } = useAuth();
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [formErr,  setFormErr]  = useState('');
  const [search,   setSearch]   = useState('');

  const load = () => {
    setLoading(true);
    api.get('/users/').then(r => { setUsers(Array.isArray(r.data) ? r.data : (r.data.results ?? [])); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setFormErr('');
    try { await api.post('/users/', form); setShowForm(false); setForm(EMPTY); load(); toast.success('User created'); }
    catch (err) { setFormErr(JSON.stringify(err.response?.data ?? 'Error')); }
  };

  const toggle = async (u) => {
    try {
      await api.post(`/users/${u.id}/${u.is_active_employee ? 'deactivate' : 'reactivate'}/`);
      load();
      toast.success(`${u.username} ${u.is_active_employee ? 'deactivated' : 'reactivated'}`);
    } catch (err) { toast.error(err.response?.data?.error ?? 'Error'); }
  };

  const del = async (u) => {
    if (!window.confirm(`Permanently delete "${u.username}"?`)) return;
    try { await api.delete(`/users/${u.id}/`); load(); toast.success(`${u.username} deleted`); }
    catch (err) { toast.error(err.response?.data?.error ?? 'Error'); }
  };

  const visible = users.filter(u =>
    !search.trim() ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-wrap">Loading…</div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>{users.length} users · {users.filter(u => !u.is_active_employee).length} inactive</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setFormErr(''); setShowForm(true); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add User
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <form className="modal" onClick={e => e.stopPropagation()} onSubmit={submit}>
            <h2>New User</h2>
            <div className="modal-divider" />
            {formErr && <div className="form-error">{formErr}</div>}

            <div className="modal-grid-2">
              <div className="modal-field"><label>First Name</label>
                <input className="modal-input" placeholder="Sara" value={form.first_name}
                  onChange={e => setForm({...form, first_name: e.target.value})} /></div>
              <div className="modal-field"><label>Last Name</label>
                <input className="modal-input" placeholder="Khan" value={form.last_name}
                  onChange={e => setForm({...form, last_name: e.target.value})} /></div>
            </div>

            <div className="modal-field"><label>Username</label>
              <input className="modal-input" placeholder="sara.khan" value={form.username}
                onChange={e => setForm({...form, username: e.target.value})} required /></div>

            <div className="modal-field"><label>Email</label>
              <input className="modal-input" type="email" placeholder="sara@company.com" value={form.email}
                onChange={e => setForm({...form, email: e.target.value})} required /></div>

            <div className="modal-grid-2">
              <div className="modal-field"><label>Password</label>
                <input className="modal-input" type="password" placeholder="Min 8 chars" value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})} required minLength={8} /></div>
              <div className="modal-field"><label>Role</label>
                <select className="modal-input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select></div>
            </div>

            <div className="modal-field"><label>Phone (optional)</label>
              <input className="modal-input" placeholder="+1 234 567 8900" value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})} /></div>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create User</button>
            </div>
          </form>
        </div>
      )}

      <div className="panel">
        <div className="controls-bar">
          <div className="ctrl-search-wrap">
            <svg className="ctrl-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input className="ctrl-input" type="text" placeholder="Search users…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>User</th><th>Username</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {visible.map(u => (
                <tr key={u.id} style={{ opacity: u.is_active_employee ? 1 : 0.5 }}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                      <div className={`sidebar-avatar avatar-${u.role}`} style={{ width:28, height:28, fontSize:'0.7rem', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'white', flexShrink:0 }}>
                        {(u.username).slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ color:'#e2e8f0', fontWeight:600, fontSize:'0.82rem' }}>{u.first_name} {u.last_name}</div>
                        <div style={{ color:'#4a5568', fontSize:'0.72rem' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="pid">{u.username}</span></td>
                  <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                  <td><span className={`active-dot ${u.is_active_employee ? 'on' : 'off'}`}>{u.is_active_employee ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ fontSize:'0.75rem' }}>{new Date(u.date_joined).toLocaleDateString()}</td>
                  <td>
                    {u.id === me?.id
                      ? <span style={{ fontSize:'0.72rem', color:'#4a5568' }}>You</span>
                      : (
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => toggle(u)}>
                            {u.is_active_employee ? 'Deactivate' : 'Reactivate'}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => del(u)}>Delete</button>
                        </div>
                      )
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && <div className="empty-state"><p>No users found</p></div>}
        </div>
      </div>
    </>
  );
}
