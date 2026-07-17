import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../redux/hooks';
import { SkeletonTable } from '../components/Skeleton';

const EMPTY = { product_id: '', name: '', category: 'food', price: '', current_stock: '', reorder_point: '' };
const CATS  = ['electronics', 'clothing', 'food', 'home', 'sports', 'other'];

const CATEGORY_ICON = {
  electronics: '💻', clothing: '👕', food: '🛒',
  home: '🏠', sports: '⚽', other: '📦',
};

export default function Products() {
  const { hasRole }   = useAuth();
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formErr,   setFormErr]   = useState('');
  const [search,    setSearch]    = useState('');
  const [page,      setPage]      = useState(1);
  const PAGE_SIZE = 10;
  const fileRef = useRef(null);

  const canEdit   = hasRole('admin', 'manager');
  const canDelete = hasRole('admin');

  const load = () => {
    setLoading(true);
    api.get('/products/?ordering=product_id')
      .then(r => { setProducts(r.data.results ?? r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setImageFile(null);
    setImagePreview(null);
    setFormErr('');
    setShowForm(true);
  };

  const openEdit = p => {
    setEditing(p.product_id);
    setForm({
      product_id: p.product_id, name: p.name, category: p.category,
      price: p.price ?? '', current_stock: p.current_stock, reorder_point: p.reorder_point,
    });
    setImageFile(null);
    setImagePreview(p.image_url ?? null);
    setFormErr('');
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormErr('');
    try {
      // Use FormData only if there's an image, otherwise JSON
      if (imageFile) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
        fd.append('image', imageFile);
        const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };
        editing
          ? await api.patch(`/products/${editing}/`, fd, cfg)
          : await api.post('/products/', fd, cfg);
      } else {
        editing
          ? await api.patch(`/products/${editing}/`, form)
          : await api.post('/products/', form);
      }
      setShowForm(false);
      load();
      setPage(1);
      toast.success(editing ? 'Product updated' : 'Product created');
    } catch (err) {
      setFormErr(JSON.stringify(err.response?.data ?? 'Error saving product'));
    }
  };

  const del = async (pid) => {
    if (!window.confirm(`Delete ${pid}?`)) return;
    try { await api.delete(`/products/${pid}/`); load(); toast.success(`${pid} deleted`); }
    catch (err) { toast.error(err.response?.data?.detail ?? 'Error deleting'); }
  };

  const visible = products.filter(p =>
    !search.trim() ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.product_id.toLowerCase().includes(search.toLowerCase())
  );

  // Reset to page 1 when search changes
  useEffect(() => { setPage(1); }, [search]);

  const totalPages = Math.ceil(visible.length / PAGE_SIZE);
  const paginated  = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <SkeletonTable rows={8} cols={7} />;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>{products.length} products · {products.filter(p => p.needs_reorder).length} need reorder</p>
        </div>
        {canEdit && (
          <button className="btn btn-primary" onClick={openAdd}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Product
          </button>
        )}
      </div>

      {/* ── Modal ── */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <form className="modal" onClick={e => e.stopPropagation()} onSubmit={submit}>
            <h2>{editing ? 'Edit Product' : 'New Product'}</h2>
            <div className="modal-divider" />
            {formErr && <div className="form-error">{formErr}</div>}

            {/* Image upload */}
            <div className="modal-field">
              <label>Product Image (optional)</label>
              <div className="img-upload-area" onClick={() => fileRef.current?.click()}>
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="img-preview" />
                ) : (
                  <div className="img-placeholder">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span>Click to upload image</span>
                    <span className="img-hint">PNG, JPG up to 5MB</span>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
                  onChange={handleImageChange} />
              </div>
              {imagePreview && (
                <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf:'flex-start', marginTop:4 }}
                  onClick={() => { setImageFile(null); setImagePreview(null); }}>
                  Remove image
                </button>
              )}
            </div>

            <div className="modal-grid-2">
              <div className="modal-field">
                <label>Product ID</label>
                <input className="modal-input" placeholder="P0021" value={form.product_id}
                  onChange={e => setForm({...form, product_id: e.target.value})} required disabled={!!editing} />
              </div>
              <div className="modal-field">
                <label>Category</label>
                <select className="modal-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div className="modal-field">
              <label>Product Name</label>
              <input className="modal-input" placeholder="e.g. Wireless Headphones" value={form.name}
                onChange={e => setForm({...form, name: e.target.value})} required />
            </div>

            <div className="modal-grid-2">
              <div className="modal-field">
                <label>Price ($)</label>
                <input className="modal-input" type="number" step="0.01" min="0.01" placeholder="0.00"
                  value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
              </div>
              <div className="modal-field">
                <label>Current Stock</label>
                <input className="modal-input" type="number" min="0" placeholder="0"
                  value={form.current_stock} onChange={e => setForm({...form, current_stock: e.target.value})} required />
              </div>
            </div>

            <div className="modal-field">
              <label>Reorder Point</label>
              <input className="modal-input" type="number" min="0" placeholder="e.g. 500"
                value={form.reorder_point} onChange={e => setForm({...form, reorder_point: e.target.value})} required />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Table ── */}
      <div className="panel">
        <div className="controls-bar">
          <div className="ctrl-search-wrap">
            <svg className="ctrl-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input className="ctrl-input" type="text" placeholder="Search products…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span style={{ marginLeft:'auto', fontSize:'0.75rem', color:'var(--text-muted)' }}>
            {visible.length} results · page {page}/{totalPages || 1}
          </span>
        </div>

        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Reorder At</th>
                <th>Status</th>
                {canEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginated.map(p => (
                <tr key={p.id}>
                  {/* Product thumbnail */}
                  <td style={{ padding:'8px 10px 8px 14px' }}>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name}
                        style={{ width:36, height:36, borderRadius:8, objectFit:'cover', border:'1px solid var(--border)' }} />
                    ) : (
                      <div style={{ width:36, height:36, borderRadius:8, background:'var(--bg-hover)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', border:'1px solid var(--border)' }}>
                        {CATEGORY_ICON[p.category] ?? '📦'}
                      </div>
                    )}
                  </td>
                  <td><span className="pid">{p.product_id}</span></td>
                  <td className="td-name">{p.name}</td>
                  <td style={{ textTransform:'capitalize' }}>{p.category}</td>
                  <td>${parseFloat(p.price).toFixed(2)}</td>
                  <td>{p.current_stock?.toLocaleString()}</td>
                  <td>{p.reorder_point?.toLocaleString()}</td>
                  <td>
                    {p.needs_reorder
                      ? <span className="status-badge badge-critical">REORDER</span>
                      : <span className="status-badge badge-ok">OK</span>}
                  </td>
                  {canEdit && (
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        {canDelete && (
                          <button className="btn btn-danger btn-sm" onClick={() => del(p.product_id)}>Delete</button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && <div className="empty-state"><p>No products found</p></div>}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="pagination-bar">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Prev
              </button>

              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    className={`pagination-page ${page === n ? 'active' : ''}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
