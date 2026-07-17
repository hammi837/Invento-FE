import './Skeleton.css';

export function SkeletonLine({ width = '100%', height = 14, style = {} }) {
  return <div className="skeleton" style={{ width, height, borderRadius: 6, ...style }} />;
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="skeleton" style={{ width: 38, height: 38, borderRadius: 9 }} />
        <div className="skeleton" style={{ width: 70, height: 22, borderRadius: 5 }} />
      </div>
      <div className="skeleton" style={{ width: 60, height: 34, borderRadius: 6, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: 90, height: 12, borderRadius: 4 }} />
    </div>
  );
}

export function SkeletonTable({ rows = 6, cols = 6 }) {
  return (
    <div style={{ padding: '0 4px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, padding: '11px 14px', borderBottom: '1px solid #191d26' }}>
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="skeleton" style={{ flex: 1, height: 13, borderRadius: 4, opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3 }) {
  const widths = ['100%', '85%', '70%', '90%', '60%'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton" style={{ width: widths[i % widths.length], height: 13, borderRadius: 4 }} />
      ))}
    </div>
  );
}
