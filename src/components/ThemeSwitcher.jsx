import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../redux/hooks';

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="theme-switcher" ref={ref}>
      <button className="theme-trigger" onClick={() => setOpen(o => !o)} title="Change theme">
        {themes[theme]?.icon}
      </button>
      {open && (
        <div className="theme-dropdown">
          <div className="theme-dropdown-label">Theme</div>
          {Object.values(themes).map(t => (
            <button
              key={t.key}
              className={`theme-option ${theme === t.key ? 'active' : ''}`}
              onClick={() => { setTheme(t.key); setOpen(false); }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {theme === t.key && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 'auto' }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
