// ═══════════════════════════════════════════
//  Shared UI Atoms — v4
// ═══════════════════════════════════════════
import THEMES from '../themes.js';

const EF = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";

/* ── Btn ─────────────────────────────────── */
export const Btn = ({ t, children, color, light, full, sm, style: s = {}, onClick, disabled }) => (
  <button disabled={disabled} onClick={onClick} style={{
    background:   light ? (color || t.primary) + '18' : (color || t.primary),
    color:        light ? (color || t.primary) : '#fff',
    border:       t.border || 'none',
    borderRadius: t.btnRadius,
    padding:      sm ? '7px 14px' : '11px 20px',
    fontSize:     sm ? '12px' : '14px',
    fontWeight:   700,
    boxShadow:    light ? 'none' : t.btnShadow,
    width:        full ? '100%' : undefined,
    display:      'block',
    fontFamily:   "'Heebo',sans-serif",
    ...s,
  }}>{children}</button>
);

/* ── Card ────────────────────────────────── */
export const Card = ({ t, children, style: s = {}, onClick, className = '' }) => (
  <div onClick={onClick} className={`card ${className}`} style={{
    background:   t.card,
    borderRadius: t.radius,
    boxShadow:    t.shadow,
    border:       t.cardBorder || 'none',
    ...s,
  }}>{children}</div>
);

/* ── InputF ──────────────────────────────── */
export const InputF = ({ t, placeholder, type = 'text', value, onChange, autoFocus }) => (
  <input autoFocus={autoFocus} type={type} placeholder={placeholder} value={value} onChange={onChange}
    style={{ width: '100%', padding: '9px 13px', borderRadius: t.inputRadius, border: t.cardBorder || '2px solid rgba(0,0,0,.08)', fontSize: '13px', fontWeight: 500, color: t.text, background: t.inputBg, outline: 'none', direction: 'rtl', fontFamily: "'Heebo',sans-serif" }}
  />
);

/* ── TextareaF ───────────────────────────── */
export const TextareaF = ({ t, placeholder, value, onChange }) => (
  <textarea placeholder={placeholder} value={value} onChange={onChange}
    style={{ width: '100%', padding: '8px 12px', borderRadius: t.inputRadius, border: t.cardBorder || '2px solid rgba(0,0,0,.08)', fontSize: '12px', color: t.text, background: t.inputBg, outline: 'none', resize: 'none', height: '62px', direction: 'rtl', fontFamily: "'Heebo',sans-serif" }}
  />
);

/* ── SelectF ─────────────────────────────── */
export const SelectF = ({ t, value, onChange, children }) => (
  <select value={value} onChange={onChange}
    style={{ width: '100%', padding: '9px 12px', borderRadius: t.inputRadius, border: t.cardBorder || '2px solid rgba(0,0,0,.08)', fontSize: '13px', fontWeight: 500, color: t.text, background: t.inputBg, direction: 'rtl', fontFamily: "'Heebo',sans-serif", outline: 'none' }}>
    {children}
  </select>
);

/* ── Lbl ─────────────────────────────────── */
export const Lbl = ({ t, children }) => (
  <div style={{ fontSize: '11px', fontWeight: 700, color: t.textMid, marginBottom: '5px', letterSpacing: '.2px' }}>{children}</div>
);

/* ── ProgressBar ─────────────────────────── */
export const ProgressBar = ({ t, value, height = 9, showLabel = false, bgO, fillO }) => {
  const pct = Math.max(0, Math.min(100, value || 0));
  return (
    <div>
      <div className="progress-track" style={{ background: bgO || t.progressBg, height, border: t.cardBorder || 'none' }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: fillO || `linear-gradient(90deg,${t.primary},${t.secondary})` }} />
      </div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', fontSize: '10px', color: t.textLight, fontWeight: 600 }}>
          <span>{pct}%</span>
          <span>{pct >= 100 ? '🎉 הושג!' : pct >= 75 ? '🚀 כמעט!' : pct >= 40 ? '💪 מתקדם!' : '⭐ בהתחלה'}</span>
        </div>
      )}
    </div>
  );
};

/* ── Toggle ──────────────────────────────── */
export const Toggle = ({ t, value, onChange }) => (
  <div className="toggle-track" onClick={() => onChange(!value)} style={{ background: value ? t.secondary : '#CBD5E1', border: t.border || 'none' }}>
    <div className="toggle-thumb" style={{ left: value ? '22px' : '2px' }} />
  </div>
);

/* ── BadgeChip ───────────────────────────── */
export const BadgeChip = ({ t, icon, name, earned, size = 'sm' }) => {
  const big = size === 'lg';
  return (
    <div className="badge-chip anim-pop" style={{ minWidth: big ? '80px' : '62px', padding: big ? '10px 6px' : '7px 4px', background: earned ? t.accent + '28' : t.progressBg, borderRadius: t.radius, border: earned ? `2px solid ${t.accent}88` : t.cardBorder || '2px solid transparent', opacity: earned ? 1 : 0.5 }}>
      <div className="emoji" style={{ fontSize: big ? '26px' : '20px', lineHeight: 1, fontFamily: EF }}>{icon}</div>
      <div style={{ fontSize: big ? '10px' : '9px', fontWeight: 800, color: t.text, marginTop: '3px', lineHeight: 1.2 }}>{name}</div>
      {earned && <div style={{ fontSize: '9px', color: t.secondary, fontWeight: 700, marginTop: '2px' }}>✓ הושג!</div>}
    </div>
  );
};

/* ── Confetti ────────────────────────────── */
export const Confetti = () => {
  const items = ['⭐','🎉','✨','🌟','💫','🎊','🏆','💎'];
  return (
    <div className="confetti-overlay">
      {Array.from({ length: 20 }, (_, i) => (
        <span key={i} style={{ position: 'absolute', left: `${4 + i * 4.5}%`, top: `${18 + Math.random() * 30}%`, fontSize: `${12 + Math.random() * 9}px`, animation: `confetti ${0.7 + Math.random() * 0.8}s ease-out ${i * 0.055}s both`, fontFamily: EF }}>{items[i % 8]}</span>
      ))}
    </div>
  );
};

/* ── EmptyState ──────────────────────────── */
export const EmptyState = ({ t, icon, title, sub, action, onAction }) => (
  <div style={{ textAlign: 'center', padding: '36px 20px', color: t.textLight }}>
    <div style={{ fontSize: '46px', marginBottom: '10px', fontFamily: EF }}>{icon}</div>
    <div style={{ fontWeight: 800, fontSize: '15px', color: t.text, marginBottom: '5px' }}>{title}</div>
    {sub && <div style={{ fontSize: '12px', marginBottom: '12px', lineHeight: 1.5 }}>{sub}</div>}
    {action && <Btn t={t} onClick={onAction} style={{ margin: '0 auto', width: 'auto', display: 'inline-block' }}>{action}</Btn>}
  </div>
);

/* ── Header ──────────────────────────────── */
export const Header = ({ t, title, subtitle, right, back, onBack }) => (
  <div style={{ background: t.headerGrad, padding: '14px 18px 16px', color: '#fff', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
    <div className="header-circle" style={{ top: -40, left: -40, width: 110, height: 110 }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
      <div>
        {back && <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.82)', fontSize: '12px', fontWeight: 600, marginBottom: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'Heebo',sans-serif", padding: 0 }}>← {back}</button>}
        {subtitle && <div style={{ fontSize: '11px', opacity: .82, fontWeight: 500, marginBottom: '2px' }}>{subtitle}</div>}
        <h2 style={{ margin: 0, fontSize: '19px', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-.3px' }}>{title}</h2>
      </div>
      {right}
    </div>
  </div>
);

/* ── BottomNav (mobile only) ─────────────── */
export const BottomNav = ({ t, items, active, onNav }) => (
  <div className="bottom-nav bottom-nav-wrapper" style={{ background: t.navBg || '#fff', borderTop: `1px solid ${t.progressBg}` }}>
    {items.map(item => (
      <button key={item.id} onClick={() => onNav(item.id)}
        className={`bottom-nav-btn ${active === item.id ? 'active' : ''}`}
        style={{ color: active === item.id ? t.primary : t.textLight, fontWeight: active === item.id ? 800 : 500 }}>
        <span className="nav-icon emoji" style={{ fontFamily: EF }}>{item.icon}</span>
        <span>{item.label}</span>
      </button>
    ))}
  </div>
);

/* ── Sidebar (desktop only) ──────────────── */
export const Sidebar = ({ t, items, active, onNav, familyName, role, userName, onLogout }) => (
  <aside className="sidebar" style={{ borderColor: t.progressBg }}>

    {/* Logo */}
    <div style={{ padding: '16px 18px 14px', borderBottom: `1px solid ${t.progressBg}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
        <span style={{ fontSize: '28px', fontFamily: EF }}>👨‍👩‍👧‍👦</span>
        <div>
          <div style={{ fontWeight: 900, fontSize: '15px', color: t.text, lineHeight: 1.1, letterSpacing: '-.2px' }}>
            <span style={{ color: t.primary }}>משפחה</span>{' '}
            <span style={{ color: t.secondary }}>במשימה</span>
          </div>
          {familyName && <div style={{ fontSize: '11px', color: t.textLight, marginTop: '1px' }}>{familyName}</div>}
        </div>
      </div>
    </div>

    {/* Nav items */}
    <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
      {items.map(item => (
        <button key={item.id} onClick={() => onNav(item.id)}
          className={`sidebar-nav-btn ${active === item.id ? 'active' : ''}`}
          style={{
            color:      active === item.id ? t.primary : t.textMid,
            background: active === item.id ? t.primary + '12' : 'transparent',
            borderRight: active === item.id ? `3px solid ${t.primary}` : '3px solid transparent',
            position: 'relative',
          }}>
          <span className="nav-icon emoji" style={{ fontFamily: EF }}>{item.icon}</span>
          <span>{item.label}</span>
          {item.badge > 0 && (
            <span style={{ marginRight: 'auto', marginLeft: '-2px', background: '#EF476F', color: '#fff', borderRadius: '50px', minWidth: '18px', height: '18px', fontSize: '10px', fontWeight: 900, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </nav>

    {/* User info + logout */}
    <div style={{ padding: '10px 14px 14px', borderTop: `1px solid ${t.progressBg}` }}>
      {/* Who is logged in */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: t.progressBg, borderRadius: '10px', marginBottom: '8px' }}>
        <span style={{ fontSize: '18px', fontFamily: EF }}>{role === 'parent' ? '👨‍👩‍👧' : '🧒'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {userName || (role === 'parent' ? 'הורה' : 'ילד/ה')}
          </div>
          <div style={{ fontSize: '10px', color: t.textLight }}>{role === 'parent' ? 'חשבון הורה' : 'חשבון ילד'}</div>
        </div>
      </div>
      {/* Logout */}
      <button onClick={onLogout} style={{
        width: '100%', padding: '7px 12px',
        background: 'none', border: `1.5px solid ${t.danger}30`,
        borderRadius: '8px', color: t.danger,
        fontFamily: "'Heebo',sans-serif", fontSize: '12px', fontWeight: 700,
        cursor: 'pointer', transition: 'background .15s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
      }}
      onMouseEnter={e => e.currentTarget.style.background = t.danger + '10'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <span style={{ fontFamily: EF }}>🚪</span> יציאה
      </button>
    </div>
  </aside>
);

/* ── ThemePicker ─────────────────────────── */
export const ThemePicker = ({ currentId, onChange }) => (
  <div className="theme-grid">
    {Object.values(THEMES).map(th => (
      <button key={th.id} onClick={() => onChange(th.id)} className="theme-option-btn"
        style={{
          borderRadius: th.radius,
          background:   currentId === th.id ? th.headerGrad : th.progressBg,
          border:       currentId === th.id ? 'none' : th.cardBorder || '2px solid transparent',
          color:        currentId === th.id ? '#fff' : th.text,
          boxShadow:    currentId === th.id ? th.btnShadow : 'none',
          outline:      currentId === th.id ? `3px solid ${th.primary}` : 'none',
          outlineOffset: '2px',
        }}>
        <span style={{ fontSize: '20px', fontFamily: EF }}>{th.name.split(' ').at(-1)}</span>
        <span style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 800, fontSize: '11px' }}>{th.label}</div>
          <div style={{ fontSize: '10px', opacity: .7 }}>{th.name.split(' ').slice(0, -1).join(' ')}</div>
        </span>
        {currentId === th.id && <span style={{ marginRight: 'auto', fontSize: '12px' }}>✓</span>}
      </button>
    ))}
  </div>
);

/* ── SavedModal ──────────────────────────── */
export const SavedModal = ({ t, icon, text }) => (
  <div className="modal-overlay">
    <div className="modal-card anim-pop" style={{ borderRadius: t.radius, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
      <div style={{ fontSize: '52px', fontFamily: EF }}>{icon}</div>
      <div style={{ fontWeight: 900, fontSize: '17px', color: t.text, marginTop: '9px', fontFamily: "'Heebo',sans-serif" }}>{text}</div>
    </div>
  </div>
);
