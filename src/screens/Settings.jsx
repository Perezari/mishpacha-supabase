import { useState } from 'react';
import { Btn, InputF, Lbl, Toggle } from '../components/Atoms.jsx';
import THEMES from '../themes.js';

const EF = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";

const Section = ({ t, title, children, style: s = {} }) => (
  <div style={{ background: '#fff', borderRadius: t.radius, boxShadow: t.cardShadow || t.shadow, border: t.cardBorder || 'none', padding: '14px 16px', marginBottom: 10, ...s }}>
    {title && <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 12, color: t.text }}>{title}</div>}
    {children}
  </div>
);

const Row = ({ t, label, children, last }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: last ? 'none' : `1px solid ${t.progressBg}` }}>
    <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
    {children}
  </div>
);

/* ── Theme thumbnail ─────────────────────
   Shows a mini preview strip of the theme's
   main colors. Works for both light and dark themes.
────────────────────────────────────────── */
const ThemeThumb = ({ th, active, onChange }) => {
  const isGame = th.isGame;
  // Extract first color from bgGrad
  const bgMatch = th.bgGrad?.match(/#[0-9a-fA-F]{3,8}/);
  const bg1 = bgMatch ? bgMatch[0] : th.primary;

  return (
    <button
      onClick={() => onChange(th.id)}
      style={{
        position: 'relative',
        borderRadius: 14,
        overflow: 'hidden',
        border: active ? `3px solid ${th.primary}` : '2px solid rgba(0,0,0,.08)',
        boxShadow: active ? `0 4px 16px ${th.primary}44` : '0 2px 8px rgba(0,0,0,.06)',
        cursor: 'pointer',
        transition: 'all .18s',
        transform: active ? 'scale(1.03)' : 'scale(1)',
        outline: 'none',
        padding: 0,
        background: 'none',
      }}
    >
      {/* Mini gradient preview */}
      <div style={{ height: 44, background: th.headerGrad || th.bgGrad, position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles on preview */}
        <div style={{ position: 'absolute', top: -10, left: -10, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.15)' }}/>
        <div style={{ position: 'absolute', bottom: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,.1)' }}/>
        {/* Theme emoji centered */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 20, fontFamily: EF, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,.25))' }}>
            {th.name.split(' ').at(-1)}
          </span>
        </div>
        {/* Active checkmark */}
        {active && (
          <div style={{ position: 'absolute', top: 3, left: 5, background: 'rgba(255,255,255,.9)', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: th.primary }}>✓</div>
        )}
      </div>
      {/* Label */}
      <div style={{ padding: '4px 6px 6px', background: '#fff', textAlign: 'center' }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#1A1A2E', lineHeight: 1.2 }}>{th.label || th.name.split(' ').slice(0,-1).join(' ')}</div>
      </div>
    </button>
  );
};

/* ── Game theme picker ───────────────────── */
const GameThemePicker = ({ currentId, onChange }) => {
  const gameThemes   = Object.values(THEMES).filter(th => th.isGame);
  const parentThemes = Object.values(THEMES).filter(th => !th.isGame);

  return (
    <>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#7B5EA7', marginBottom: 8, letterSpacing: '.4px', textTransform: 'uppercase' }}>✨ עולמות משחק</div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gameThemes.length}, 1fr)`, gap: 8, marginBottom: 14 }}>
        {gameThemes.map(th => <ThemeThumb key={th.id} th={th} active={currentId === th.id} onChange={onChange} />)}
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#7B5EA7', marginBottom: 8, letterSpacing: '.4px', textTransform: 'uppercase' }}>🎨 סגנונות נוספים</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {parentThemes.map(th => <ThemeThumb key={th.id} th={th} active={currentId === th.id} onChange={onChange} />)}
      </div>
    </>
  );
};

/* ── Parent theme picker ─────────────────── */
const ParentThemePicker = ({ currentId, onChange }) => {
  const themes = Object.values(THEMES).filter(th => !th.isGame);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
      {themes.map(th => <ThemeThumb key={th.id} th={th} active={currentId === th.id} onChange={onChange} />)}
    </div>
  );
};

/* ═══════════════════════════════════════════
   SETTINGS SCREEN
═══════════════════════════════════════════ */
export default function SettingsScreen({
  t, user, kids, family,
  onThemeChange, onUpdateFamilyName, onJoinFamily, onLogout,
}) {
  const [n1, setN1] = useState(true);
  const [n2, setN2] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [familyName,  setFamilyName]  = useState(family?.name || 'המשפחה שלי');
  const [savingName,  setSavingName]  = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [joinCode,    setJoinCode]    = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinErr,     setJoinErr]     = useState('');
  const [joinOk,      setJoinOk]      = useState(false);

  const kid     = kids.find(k => k.id === user.kidId);
  const isChild = user.role === 'child';
  const primary = t.primary || '#7C4DFF';

  const saveName = async () => {
    setSavingName(true);
    await onUpdateFamilyName?.(familyName.trim());
    setSavingName(false);
    setEditingName(false);
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(family?.id || '').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) { setJoinErr('נא להכניס קוד'); return; }
    setJoinLoading(true); setJoinErr('');
    const { error } = await onJoinFamily?.(joinCode.trim()) || {};
    setJoinLoading(false);
    if (error) setJoinErr('קוד לא תקין — בדוק ונסה שוב');
    else { setJoinOk(true); setJoinCode(''); }
  };

  return (
    <div style={{ background: t.bgGrad, fontFamily: "'Heebo',sans-serif", color: t.text, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ background: t.headerGrad, padding: '16px 18px 18px', color: '#fff', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: -40, left: -40, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }}/>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, opacity: .82 }}>{isChild ? 'הגדרות אישיות' : 'פאנל ניהול הורה'}</div>
          <h2 style={{ margin: '3px 0 0', fontSize: 20, fontWeight: 900, letterSpacing: '-.3px' }}>
            <span style={{ fontFamily: EF }}>⚙️</span> הגדרות
          </h2>
        </div>
      </div>

      <div style={{ padding: '12px 14px', flex: 1, overflowY: 'auto', background: t.sheetBg || t.bgGrad }}>

        {/* Profile */}
        <Section t={t}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{ fontSize: 34, fontFamily: EF, background: isChild ? `${primary}18` : (t.progressBg || '#EEF2FF'), borderRadius: '50%', width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: isChild ? `2px solid ${primary}30` : 'none' }}>
              {isChild ? (kid?.avatar || '🧒') : '👔'}
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16 }}>{isChild ? (kid?.name || 'ילד/ה') : 'הורה'}</div>
              <div style={{ fontSize: 12, color: t.textLight, marginTop: 2 }}>{isChild ? 'חשבון ילד' : 'ניהול המשפחה'}</div>
              {isChild && kid && (
                <div style={{ fontSize: 11, color: t.secondary || '#00BCD4', fontWeight: 700, marginTop: 3 }}>
                  <span style={{ fontFamily: EF }}>🔥</span> {kid.streak} ימי סטריק
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* Theme */}
        <Section t={t} title="🎨 מראה האפליקציה">
          {isChild
            ? <GameThemePicker   currentId={t.id} onChange={onThemeChange} />
            : <ParentThemePicker currentId={t.id} onChange={onThemeChange} />
          }
          <div style={{ marginTop: 10, padding: '8px 12px', background: t.headerGrad, borderRadius: t.inputRadius || '10px', color: '#fff', textAlign: 'center', fontSize: 12, fontWeight: 700 }}>
            מראה פעיל: {t.name}
          </div>
        </Section>

        {/* Family — parent only */}
        {!isChild && (
          <Section t={t} title="הגדרות משפחה">
            <div style={{ marginBottom: 12 }}>
              <Lbl t={t}>שם המשפחה</Lbl>
              {editingName ? (
                <div style={{ display: 'flex', gap: 6 }}>
                  <InputF t={t} value={familyName} onChange={e => setFamilyName(e.target.value)} />
                  <button onClick={saveName} disabled={savingName} style={{ padding: '8px 13px', background: t.secondary, color: '#fff', border: 'none', borderRadius: t.inputRadius, fontFamily: "'Heebo',sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>{savingName ? '...' : '✓'}</button>
                  <button onClick={() => setEditingName(false)} style={{ padding: '8px 10px', background: t.progressBg, color: t.text, border: 'none', borderRadius: t.inputRadius, fontFamily: "'Heebo',sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>ביטול</button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: t.progressBg, borderRadius: t.inputRadius }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{family?.name || familyName}</span>
                  <button onClick={() => setEditingName(true)} style={{ background: 'none', border: 'none', color: t.primary, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Heebo',sans-serif" }}>✏️ ערוך</button>
                </div>
              )}
            </div>
            <div style={{ marginBottom: 12 }}>
              <Lbl t={t}>קוד הצטרפות לבן/בת זוג 🔗</Lbl>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <div style={{ flex: 1, padding: '8px 10px', background: t.progressBg, borderRadius: t.inputRadius, fontSize: 11, fontFamily: 'monospace', color: t.textMid, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr', textAlign: 'left' }}>{family?.id || '...'}</div>
                <button onClick={copyCode} style={{ padding: '8px 13px', background: copied ? (t.success || '#00C853') : t.primary, color: '#fff', border: 'none', borderRadius: t.inputRadius, fontFamily: "'Heebo',sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0, transition: 'background .2s' }}>{copied ? '✓ הועתק' : '📋 העתק'}</button>
              </div>
            </div>
            <div>
              <Lbl t={t}>הצטרף למשפחה קיימת</Lbl>
              <div style={{ display: 'flex', gap: 6 }}>
                <InputF t={t} placeholder="הדבק קוד כאן..." value={joinCode} onChange={e => setJoinCode(e.target.value)} />
                <button onClick={handleJoin} disabled={joinLoading} style={{ padding: '8px 13px', background: t.primary, color: '#fff', border: 'none', borderRadius: t.inputRadius, fontFamily: "'Heebo',sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>{joinLoading ? '...' : 'הצטרף'}</button>
              </div>
              {joinErr && <div style={{ fontSize: 11, color: t.danger, marginTop: 4 }}>{joinErr}</div>}
              {joinOk  && <div style={{ fontSize: 11, color: t.success || '#00C853', marginTop: 4, fontWeight: 700 }}>✅ הצטרפת! רענן את הדף.</div>}
            </div>
          </Section>
        )}

        {/* Notifications */}
        <Section t={t} title="🔔 התראות">
          <Row t={t} label="התראות משימות"><Toggle t={t} value={n1} onChange={setN1} /></Row>
          <Row t={t} label="תזכורות יומיות" last><Toggle t={t} value={n2} onChange={setN2} /></Row>
        </Section>

        {/* Logout */}
        <button onClick={onLogout} style={{
          width: '100%', padding: '13px', marginBottom: 4,
          background: t.danger || '#FF3D57',
          color: '#fff', border: 'none',
          borderRadius: t.btnRadius || '50px',
          fontFamily: "'Heebo',sans-serif",
          fontSize: 14, fontWeight: 800, cursor: 'pointer',
          boxShadow: `0 6px 20px ${t.danger || '#FF3D57'}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        }}>
          <span style={{ fontFamily: EF }}>🚪</span> יציאה מהמערכת
        </button>

        <div style={{ textAlign: 'center', fontSize: 10, color: t.textLight, paddingBottom: 8 }}>
          משפחה במשימה v1.0 · עשוי עם ❤️
        </div>
      </div>
    </div>
  );
}
