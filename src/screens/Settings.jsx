import { useState } from 'react';
import { Btn, InputF, Lbl, Toggle, ThemePicker } from '../components/Atoms.jsx';

const EF = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";

const Section = ({ t, title, children }) => (
  <div style={{ background: '#fff', borderRadius: t.radius, boxShadow: t.shadow, border: t.cardBorder || 'none', padding: '14px 16px', marginBottom: '10px' }}>
    {title && <div style={{ fontWeight: 800, fontSize: '13px', marginBottom: '12px', color: t.text }}>{title}</div>}
    {children}
  </div>
);

const Row = ({ t, label, children, last }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: last ? 'none' : `1px solid ${t.progressBg}` }}>
    <span style={{ fontSize: '13px', fontWeight: 500 }}>{label}</span>
    {children}
  </div>
);

export default function SettingsScreen({ t, user, kids, family, onThemeChange, onUpdateFamilyName, onJoinFamily, onLogout }) {
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

  const kid = kids.find(k => k.id === user.kidId);

  const saveName = async () => {
    setSavingName(true);
    await onUpdateFamilyName?.(familyName.trim());
    setSavingName(false);
    setEditingName(false);
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(family?.id || '').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div style={{ background: t.bgGrad, fontFamily: "'Heebo',sans-serif", color: t.text, minHeight: '100%' }}>

      {/* Header */}
      <div style={{ background: t.headerGrad, padding: '14px 18px 16px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -35, left: -35, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '11px', opacity: .82 }}>{user.role === 'parent' ? 'פאנל ניהול הורה' : 'הגדרות אישיות'}</div>
          <h2 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 900 }}>הגדרות ⚙️</h2>
        </div>
      </div>

      <div style={{ padding: '12px 14px' }}>

        {/* Profile */}
        <Section t={t}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '36px', fontFamily: EF, background: t.progressBg, borderRadius: '50%', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {user.role === 'parent' ? '👨‍👩‍👧' : kid?.avatar || '🧒'}
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '15px' }}>{user.role === 'parent' ? 'הורה' : kid?.name || 'ילד/ה'}</div>
              <div style={{ fontSize: '12px', color: t.textLight }}>{user.role === 'parent' ? 'ניהול המשפחה' : 'חשבון ילד'}</div>
              {user.role === 'child' && kid && (
                <div style={{ fontSize: '11px', color: t.secondary, fontWeight: 700, marginTop: '2px' }}>
                  <span style={{ fontFamily: EF }}>🔥</span> {kid.streak} ימי סטריק
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* 🎨 Theme */}
        <Section t={t} title="🎨 מראה האפליקציה">
          <ThemePicker currentId={t.id} onChange={onThemeChange} />
          <div style={{ marginTop: '9px', padding: '8px 12px', background: t.headerGrad, borderRadius: t.inputRadius, color: '#fff', textAlign: 'center', fontSize: '12px', fontWeight: 700 }}>
            מראה פעיל: {t.name}
          </div>
        </Section>

        {/* 👨‍👩‍👧 Family settings — PARENT ONLY */}
        {user.role === 'parent' && (
          <Section t={t} title="👨‍👩‍👧‍👦 הגדרות משפחה">

            {/* Family name */}
            <div style={{ marginBottom: '12px' }}>
              <Lbl t={t}>שם המשפחה</Lbl>
              {editingName ? (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <InputF t={t} value={familyName} onChange={e => setFamilyName(e.target.value)} />
                  <button onClick={saveName} disabled={savingName} style={{ padding: '8px 12px', background: t.secondary, color: '#fff', border: 'none', borderRadius: t.inputRadius, fontFamily: "'Heebo',sans-serif", fontSize: '12px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                    {savingName ? '...' : '✓'}
                  </button>
                  <button onClick={() => setEditingName(false)} style={{ padding: '8px 10px', background: t.progressBg, color: t.text, border: 'none', borderRadius: t.inputRadius, fontFamily: "'Heebo',sans-serif", fontSize: '12px', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>ביטול</button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: t.progressBg, borderRadius: t.inputRadius }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{family?.name || familyName}</span>
                  <button onClick={() => setEditingName(true)} style={{ background: 'none', border: 'none', color: t.primary, fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Heebo',sans-serif" }}>✏️ ערוך</button>
                </div>
              )}
            </div>

            {/* Invite code */}
            <div style={{ marginBottom: '12px' }}>
              <Lbl t={t}>קוד הצטרפות לבן/בת זוג 🔗</Lbl>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div style={{ flex: 1, padding: '8px 10px', background: t.progressBg, borderRadius: t.inputRadius, fontSize: '11px', fontFamily: 'monospace', color: t.textMid, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr', textAlign: 'left' }}>
                  {family?.id || '...'}
                </div>
                <button onClick={copyCode} style={{ padding: '8px 12px', background: copied ? t.secondary : t.primary, color: '#fff', border: 'none', borderRadius: t.inputRadius, fontFamily: "'Heebo',sans-serif", fontSize: '12px', fontWeight: 700, cursor: 'pointer', flexShrink: 0, transition: 'background .2s' }}>
                  {copied ? '✓ הועתק' : '📋 העתק'}
                </button>
              </div>
            </div>

            {/* Join family */}
            <div>
              <Lbl t={t}>הצטרף למשפחה קיימת</Lbl>
              <div style={{ display: 'flex', gap: '6px' }}>
                <InputF t={t} placeholder="הדבק קוד כאן..." value={joinCode} onChange={e => setJoinCode(e.target.value)} />
                <button onClick={handleJoin} disabled={joinLoading} style={{ padding: '8px 12px', background: t.primary, color: '#fff', border: 'none', borderRadius: t.inputRadius, fontFamily: "'Heebo',sans-serif", fontSize: '12px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                  {joinLoading ? '...' : 'הצטרף'}
                </button>
              </div>
              {joinErr && <div style={{ fontSize: '11px', color: t.danger, marginTop: '4px' }}>{joinErr}</div>}
              {joinOk  && <div style={{ fontSize: '11px', color: t.secondary, marginTop: '4px', fontWeight: 700 }}>✅ הצטרפת! רענן את הדף.</div>}
            </div>
          </Section>
        )}

        {/* 🔔 Notifications */}
        <Section t={t} title="🔔 התראות">
          <Row t={t} label="התראות משימות"><Toggle t={t} value={n1} onChange={setN1} /></Row>
          <Row t={t} label="תזכורות יומיות" last><Toggle t={t} value={n2} onChange={setN2} /></Row>
        </Section>

        {/* Logout */}
        <Btn t={t} color={t.danger} full onClick={onLogout} style={{ padding: '11px', fontSize: '13px' }}>
          🚪 יציאה מהמערכת
        </Btn>

        <div style={{ textAlign: 'center', fontSize: '10px', color: t.textLight, marginTop: '12px' }}>
          משפחה במשימה v1.0 · עשוי עם ❤️
        </div>
      </div>
    </div>
  );
}
