import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { SkeletonCard, SkeletonTable } from '../components/Skeleton';

/* ── colour tokens (match App.css semantic system) ── */
const C = {
  critical: { bar: '#ef4444', text: '#f87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.18)' },
  warning:  { bar: '#f59e0b', text: '#fbbf24', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.18)' },
  ok:       { bar: '#6366f1', text: '#818cf8', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.18)' },
};

const ChartTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const c = C[d.status] ?? C.ok;
  return (
    <div style={{ background:'#1a1e28', border:`1px solid ${c.border}`, borderRadius:8, padding:'8px 12px' }}>
      <div style={{ fontSize:11, color:'#6e7681', marginBottom:3 }}>{d.fullName}</div>
      <div style={{ fontSize:15, fontWeight:800, color:c.text }}>{d.days} days left</div>
    </div>
  );
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export default function Dashboard({ onCriticalCount }) {
  const { user } = useAuth();
  const [forecasts,     setForecasts]     = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [statusFilter,   setStatusFilter]   = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortKey, setSortKey] = useState('days_until_stockout');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    // Fetch both forecasts and real product count in parallel
    Promise.all([
      api.get('/forecasts/'),
      api.get('/products/'),
    ]).then(([fRes, pRes]) => {
      setForecasts(Array.isArray(fRes.data) ? fRes.data : (fRes.data.results ?? []));
      const products = Array.isArray(pRes.data) ? pRes.data : (pRes.data.results ?? []);
      setTotalProducts(products.length);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const counts = useMemo(() => ({
    critical: forecasts.filter(f => f.stock_status === 'critical').length,
    warning:  forecasts.filter(f => f.stock_status === 'warning').length,
    ok:       forecasts.filter(f => f.stock_status === 'ok').length,
    total:    forecasts.length,
  }), [forecasts]);

  useEffect(() => { onCriticalCount?.(counts.critical); }, [counts.critical]);

  const healthPct = counts.total > 0 ? Math.round((counts.ok / counts.total) * 100) : 0;

  const categories = useMemo(() => {
    const s = new Set(forecasts.map(f => f.category).filter(Boolean));
    return ['all', ...Array.from(s).sort()];
  }, [forecasts]);

  const filtered = useMemo(() => {
    let r = [...forecasts];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(f => (f.product_name ?? '').toLowerCase().includes(q) || f.product_id.toLowerCase().includes(q));
    }
    if (statusFilter   !== 'all') r = r.filter(f => f.stock_status === statusFilter);
    if (categoryFilter !== 'all') r = r.filter(f => f.category === categoryFilter);
    r.sort((a, b) => {
      let va = a[sortKey] ?? '', vb = b[sortKey] ?? '';
      if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1  : -1;
      return 0;
    });
    return r;
  }, [forecasts, search, statusFilter, categoryFilter, sortKey, sortDir]);

  const urgentChart = useMemo(() =>
    [...forecasts]
      .filter(f => f.days_until_stockout != null)
      .sort((a, b) => a.days_until_stockout - b.days_until_stockout)
      .slice(0, 8)
      .map(f => ({
        name:     (f.product_name ?? f.product_id).slice(0, 14) + ((f.product_name?.length ?? 0) > 14 ? '…' : ''),
        fullName: f.product_name ?? f.product_id,
        days:     f.days_until_stockout,
        status:   f.stock_status,
      }))
  , [forecasts]);

  /* Simulated area chart data — weekly demand trend */
  const trendData = useMemo(() => {
    const weeks = ['4w ago','3w ago','2w ago','Last wk','This wk'];
    return weeks.map((wk, i) => ({
      week: wk,
      demand: Math.round(forecasts.reduce((s, f) => s + (f.predicted_units ?? 0), 0) * (0.85 + i * 0.04)),
    }));
  }, [forecasts]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };
  const si = (key) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  /* ── Headline summary sentence ── */
  const headline = () => {
    if (loading) return 'Loading your inventory data…';
    if (counts.critical > 0) return `⚠️  ${counts.critical} product${counts.critical > 1 ? 's' : ''} need immediate restocking.`;
    if (counts.warning  > 0) return `${counts.warning} product${counts.warning > 1 ? 's are' : ' is'} running low — worth reviewing today.`;
    return '✅  All products are well-stocked. Looking healthy.';
  };

  return (
    <>
      {/* ── Morning greeting ── */}
      <div className="dash-greeting">
        <div>
          <h1 className="dash-greeting-title">
            {greeting()}, <span className="dash-greeting-name">{user?.username ?? 'there'}</span>
          </h1>
          <p className="dash-greeting-sub">{headline()}</p>
        </div>
        <div className="dash-greeting-date">
          {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="stat-grid">
        {loading ? (
          [1,2,3,4].map(i => <SkeletonCard key={i} />)
        ) : [
          { key:'critical', label:'Critical Stock',   value:counts.critical, trend:'up',  sub:`${counts.critical} need restock`,   iconColor:'icon-critical',
            icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
          { key:'warning',  label:'Low Stock',        value:counts.warning,  trend:'amb', sub:`${counts.warning} watch closely`,    iconColor:'icon-warning',
            icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
          { key:'ok',       label:'Healthy Products', value:counts.ok,       trend:'dow', sub:`${healthPct}% inventory health`,    iconColor:'icon-ok',
            icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> },
          { key:'total',    label:'Total Products',   value: totalProducts,   trend:'neu', sub:'forecast accuracy 14.35% MAPE',     iconColor:'icon-total',
            icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> },
        ].map(s => (
          <div key={s.key}
            className={`stat-card stat-${s.key} ${statusFilter === s.key ? 'active' : ''}`}
            role={s.key !== 'total' ? 'button' : undefined}
            onClick={() => s.key !== 'total' && setStatusFilter(statusFilter === s.key ? 'all' : s.key)}
          >
            <div className="stat-card-top">
              <div className={`stat-icon ${s.iconColor}`}>{s.icon}</div>
              <span className={`stat-trend ${s.trend}`}>{s.sub}</span>
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Health bar ── */}
      {!loading && (
        <div className="panel" style={{ padding:'16px 20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <span style={{ fontSize:'0.75rem', fontWeight:700, color:'#6e7681', textTransform:'uppercase', letterSpacing:'0.08em' }}>
              Inventory Health
            </span>
            <span style={{ fontSize:'0.9rem', fontWeight:800, color: healthPct >= 70 ? '#4ade80' : healthPct >= 40 ? '#fbbf24' : '#f87171' }}>
              {healthPct}%
            </span>
          </div>
          <div className="health-track">
            <div className="health-fill" style={{
              width: `${healthPct}%`,
              background: healthPct >= 70
                ? 'linear-gradient(90deg,#16a34a,#22c55e)'
                : healthPct >= 40
                ? 'linear-gradient(90deg,#d97706,#f59e0b)'
                : 'linear-gradient(90deg,#dc2626,#ef4444)',
            }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, fontSize:'0.7rem', color:'#3d444d' }}>
            <span>{counts.ok} healthy · {counts.warning} warning · {counts.critical} critical</span>
            <span>{totalProducts} products tracked</span>
          </div>
        </div>
      )}

      {/* ── Charts row ── */}
      <div className="content-grid">
        {/* Demand trend area chart */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Demand Forecast Trend</span>
            <span style={{ fontSize:'0.72rem', color:'#4a5568' }}>Simulated weekly</span>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData} margin={{ left:-10, right:8, top:4, bottom:0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2430" vertical={false} />
                <XAxis dataKey="week" tick={{ fill:'#3d444d', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#3d444d', fontSize:11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip
                  contentStyle={{ background:'#1a1e28', border:'1px solid #2a3042', borderRadius:8, fontSize:12 }}
                  labelStyle={{ color:'#818cf8' }}
                  itemStyle={{ color:'#c9d1d9' }}
                />
                <Area type="monotone" dataKey="demand" stroke="#6366f1" strokeWidth={2}
                  fill="url(#areaGrad)" dot={{ fill:'#6366f1', strokeWidth:0, r:3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Urgency bar chart */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Days Until Stockout</span>
            <span style={{ fontSize:'0.72rem', color:'#4a5568' }}>Top 8 urgent</span>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={urgentChart} layout="vertical" margin={{ left:0, right:12, top:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2430" horizontal={false} />
                <XAxis type="number" tick={{ fill:'#3d444d', fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fill:'#6e7681', fontSize:10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill:'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="days" radius={[0, 4, 4, 0]} maxBarSize={14}>
                  {urgentChart.map((e, i) => <Cell key={i} fill={(C[e.status] ?? C.ok).bar} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── AI Daily Brief placeholder ── */}
      <div className="panel ai-brief-panel">
        <div className="panel-header">
          <span className="panel-title" style={{ display:'flex', alignItems:'center', gap:7 }}>
            <span style={{ fontSize:'1rem' }}>✨</span> AI Daily Brief
          </span>
          <span className="coming-soon-tag">Coming Soon</span>
        </div>
        <div className="ai-brief-body">
          <div className="ai-brief-preview">
            <div className="ai-brief-line" style={{ width:'72%' }} />
            <div className="ai-brief-line" style={{ width:'88%' }} />
            <div className="ai-brief-line" style={{ width:'60%' }} />
          </div>
          <p className="ai-brief-hint">
            The AI Daily Brief will generate a plain-English summary of your inventory health,
            flag products needing attention, and suggest purchase orders — powered by your forecast data.
          </p>
        </div>
      </div>

      {/* ── Stock alerts + full table ── */}
      <div className="content-grid" style={{ gridTemplateColumns:'1fr 300px' }}>
        {/* Full forecast table */}
        <div className="panel">
          <div className="controls-bar">
            <div className="ctrl-search-wrap">
              <svg className="ctrl-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input className="ctrl-input" type="text" placeholder="Search product…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="ctrl-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              {categories.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase()+c.slice(1)}</option>
              ))}
            </select>
            {(statusFilter !== 'all' || categoryFilter !== 'all' || search) && (
              <button className="ctrl-clear" onClick={() => { setStatusFilter('all'); setCategoryFilter('all'); setSearch(''); }}>
                Clear ×
              </button>
            )}
            <span style={{ marginLeft:'auto', fontSize:'0.72rem', color:'#3d444d' }}>{filtered.length}/{forecasts.length}</span>
          </div>

          {loading ? <SkeletonTable rows={6} cols={6} /> : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('product_id')}>ID{si('product_id')}</th>
                    <th onClick={() => handleSort('product_name')}>Product{si('product_name')}</th>
                    <th onClick={() => handleSort('category')}>Category{si('category')}</th>
                    <th onClick={() => handleSort('current_stock')}>Stock{si('current_stock')}</th>
                    <th onClick={() => handleSort('predicted_units')}>Demand/wk{si('predicted_units')}</th>
                    <th onClick={() => handleSort('days_until_stockout')}>Days Left{si('days_until_stockout')}</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(f => {
                    const c = C[f.stock_status] ?? C.ok;
                    return (
                      <tr key={f.id} style={{ cursor:'pointer' }}
                        onClick={() => setSelectedProduct(selectedProduct?.id === f.id ? null : f)}>
                        <td><span className="pid">{f.product_id}</span></td>
                        <td className="td-name">{f.product_name ?? '—'}</td>
                        <td style={{ textTransform:'capitalize' }}>{f.category ?? '—'}</td>
                        <td>{f.current_stock?.toLocaleString() ?? '—'}</td>
                        <td>{f.predicted_units != null ? Math.round(f.predicted_units).toLocaleString() : '—'}</td>
                        <td style={{ color:c.text, fontWeight:700 }}>{f.days_until_stockout ?? '—'}</td>
                        <td><span className={`status-badge badge-${f.stock_status}`}>{f.stock_status.toUpperCase()}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && <div className="empty-state"><p>No products match filters</p></div>}
            </div>
          )}
        </div>

        {/* Right: Alerts + Product Detail */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Alert list */}
          <div className="panel" style={{ flex:selectedProduct ? 0 : 1 }}>
            <div className="panel-header">
              <span className="panel-title">Stock Alerts</span>
              <span style={{ fontSize:'0.7rem', color:'#3d444d' }}>
                {forecasts.filter(f => f.stock_status !== 'ok').length} items
              </span>
            </div>
            <div className="alert-list">
              {loading ? (
                [1,2,3].map(i => (
                  <div key={i} style={{ padding:'12px 16px', display:'flex', gap:10, alignItems:'center' }}>
                    <div className="skeleton" style={{ width:8, height:8, borderRadius:'50%' }} />
                    <div style={{ flex:1, display:'flex', flexDirection:'column', gap:5 }}>
                      <div className="skeleton" style={{ height:11, borderRadius:4, width:'70%' }} />
                      <div className="skeleton" style={{ height:9, borderRadius:4, width:'50%' }} />
                    </div>
                  </div>
                ))
              ) : forecasts
                  .filter(f => f.stock_status !== 'ok' && f.days_until_stockout != null)
                  .sort((a, b) => a.days_until_stockout - b.days_until_stockout)
                  .slice(0, 7)
                  .map(f => (
                    <div key={f.id} className="alert-item" style={{ cursor:'pointer' }}
                      onClick={() => setSelectedProduct(selectedProduct?.id === f.id ? null : f)}>
                      <div className={`alert-dot dot-${f.stock_status}`} />
                      <div className="alert-info">
                        <div className="alert-name">{f.product_name ?? f.product_id}</div>
                        <div className="alert-meta">Stock: {f.current_stock?.toLocaleString()}</div>
                      </div>
                      <span className={`alert-days days-${f.stock_status}`}>{f.days_until_stockout}d</span>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* Product detail panel */}
          {selectedProduct && (
            <div className="panel product-detail-panel">
              <div className="panel-header">
                <span className="panel-title">{selectedProduct.product_id}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedProduct(null)}>×</button>
              </div>
              <div style={{ padding:'16px' }}>
                <div style={{ fontWeight:700, color:'var(--text-hi)', fontSize:'0.9rem', marginBottom:12 }}>
                  {selectedProduct.product_name}
                </div>

                {[
                  { label:'Current Stock',    value: selectedProduct.current_stock?.toLocaleString() },
                  { label:'Weekly Demand',    value: Math.round(selectedProduct.predicted_units).toLocaleString() + ' units' },
                  { label:'Days Until Out',   value: selectedProduct.days_until_stockout + ' days',
                    color: (C[selectedProduct.stock_status] ?? C.ok).text },
                  { label:'Category',         value: selectedProduct.category },
                  { label:'Forecast Date',    value: selectedProduct.forecast_date },
                ].map(row => (
                  <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid #191d26' }}>
                    <span style={{ fontSize:'0.75rem', color:'#6e7681' }}>{row.label}</span>
                    <span style={{ fontSize:'0.78rem', fontWeight:600, color: row.color ?? '#c9d1d9' }}>{row.value ?? '—'}</span>
                  </div>
                ))}

                <div style={{ marginTop:14 }}>
                  <div style={{ fontSize:'0.68rem', fontWeight:700, color:'#3d444d', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>
                    AI Insight
                  </div>
                  <div style={{ background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:8, padding:'10px 12px', fontSize:'0.78rem', color:'#818cf8', lineHeight:1.6 }}>
                    {selectedProduct.stock_status === 'critical'
                      ? `⚠️ ${selectedProduct.product_name} will stock out in ${selectedProduct.days_until_stockout} day(s). Suggested reorder: ${Math.round(selectedProduct.predicted_units * 2).toLocaleString()} units.`
                      : selectedProduct.stock_status === 'warning'
                      ? `📊 ${selectedProduct.product_name} has ${selectedProduct.days_until_stockout} days of stock. Weekly demand is ${Math.round(selectedProduct.predicted_units).toLocaleString()} units. Consider ordering soon.`
                      : `✅ ${selectedProduct.product_name} is well stocked with ${selectedProduct.days_until_stockout} days of inventory remaining.`
                    }
                  </div>
                </div>

                <div style={{ marginTop:12 }}>
                  <span className={`status-badge badge-${selectedProduct.stock_status}`} style={{ fontSize:'0.72rem', padding:'4px 10px' }}>
                    {selectedProduct.stock_status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
