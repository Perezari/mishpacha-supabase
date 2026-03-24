import { useState } from 'react';
import THEMES from '../themes.js';
import { Btn, Card, InputF, Lbl } from '../components/Atoms.jsx';
import * as db from '../lib/db.js';

const EF = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";

export default function LoginScreen({ onParentLogin, onParentSignUp, onChildLogin }) {

  const [who,       setWho]       = useState(null);
  const [themeId,   setThemeId]   = useState('C');
  const t = THEMES[themeId];

  const reset = () => {
    setWho(null);
    setParentMode('login');
    setChildStep('code');
    setEmail(''); setPass(''); setPass2('');
    setFamilyCode(''); setKidList([]); setPickedKid(null);
    setErr(''); setInfo('');
  };

  const [parentMode, setParentMode] = useState('login');
  const [email,      setEmail]      = useState('');
  const [pass,       setPass]       = useState('');
  const [pass2,      setPass2]      = useState('');
  const [joinCode,   setJoinCode]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [err,        setErr]        = useState('');
  const [info,       setInfo]       = useState('');

  const [childStep,  setChildStep]  = useState('code');
  const [familyCode, setFamilyCode] = useState('');
  const [kidList,    setKidList]    = useState([]);
  const [pickedKid,  setPickedKid]  = useState(null);
  const [kidLoading, setKidLoading] = useState(false);

  const tr = (msg = '') => {
    if (msg.includes('Invalid login'))       return '❌ אימייל או סיסמה שגויים';
    if (msg.includes('already registered'))  return '❌ אימייל זה כבר רשום — עבור להתחברות';
    if (msg.includes('Email not confirmed')) return '📧 אמת את האימייל שלך ואז התחבר';
    if (msg.includes('not found') || msg.includes('לא נמצא')) return '❌ קוד משפחה לא נמצא';
    return msg;
  };

  const handleParentSubmit = async () => {
    setErr(''); setInfo('');
    if (!email || !pass) { setErr('נא למלא אימייל וסיסמה'); return; }
    if (parentMode === 'signup') {
      if (pass !== pass2)  { setErr('הסיסמאות אינן תואמות'); return; }
      if (pass.length < 6) { setErr('סיסמה חייבת להיות לפחות 6 תווים'); return; }
    }
    setLoading(true);
    try {
      if (parentMode === 'login') {
        const { error } = await onParentLogin(email, pass);
        if (error) setErr(tr(error.message));
      } else if (parentMode === 'signup') {
        const { error } = await onParentSignUp(email, pass);
        if (error) setErr(tr(error.message));
        else setInfo('✅ נשלח אימייל אימות — בדוק תיבת הדואר ואז התחבר');
      } else {
        if (!joinCode.trim()) { setErr('נא להכניס קוד משפחה'); return; }
        const { error: se } = await onParentLogin(email, pass);
        if (se) { setErr(tr(se.message)); return; }
        setInfo(`JOIN:${joinCode.trim()}`);
      }
    } finally { setLoading(false); }
  };

  const handleFamilyCodeSubmit = async () => {
    setErr('');
    const code = familyCode.trim();
    if (!code) { setErr('נא להכניס קוד משפחה'); return; }
    setKidLoading(true);
    const { data, error } = await db.getKidsForLogin(code);
    setKidLoading(false);
    if (error || !data || data.length === 0) {
      setErr('קוד משפחה לא נמצא — בדוק שהקלדת נכון');
      return;
    }
    setKidList(data);
    setChildStep('pick');
    setErr('');
  };

  const handleKidPick = (kid) => {
    setPickedKid(kid);
    onChildLogin(kid.id, familyCode.trim());
  };

  /* ─────────────────────────────────────────────────────
     OUTER WRAPPER:
     - minHeight: 100vh  → fills screen, never shorter
     - overflowY: auto   → scrolls when content is taller
       (this is the key fix for mobile cut-off)
     - NO overflow:hidden anywhere
  ───────────────────────────────────────────────────── */
  return (
    <div style={{
      minHeight:  '100vh',
      overflowY:  'auto',
      display:    'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: t.bgGrad,
      direction:  'rtl',
      fontFamily: "'Heebo',sans-serif",
      padding:    '24px 16px',
      position:   'relative',
    }}>

      {/* Decorative blobs — pointer-events:none so they don't block scroll */}
      <div style={{ position: 'fixed', top: -80, right: -80, width: 220, height: 220, borderRadius: '50%', background: t.primary, opacity: .07, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: -60, left: -60, width: 190, height: 190, borderRadius: '50%', background: t.secondary, opacity: .09, pointerEvents: 'none', zIndex: 0 }} />

      {/* All content sits above blobs */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '0px' }}>

        {/* ── Logo — compact on mobile ───────────────── */}
        <div className="anim-pop" style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '56px', lineHeight: 1, fontFamily: EF, filter: 'drop-shadow(0 3px 10px rgba(0,0,0,.12))' }}>
            👨‍👩‍👧‍👦
          </span>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: t.text, margin: '10px 0 4px', letterSpacing: '-.4px', fontFamily: "'Heebo',sans-serif" }}>
            <span style={{ color: t.primary }}>משפחה</span>{' '}
            <span style={{ color: t.secondary }}>במשימה</span>
          </h1>
          <p style={{ color: t.textLight, fontSize: '13px', fontWeight: 500, margin: 0 }}>
            יחד מגיעים לכל מטרה 🎯
          </p>
        </div>

        {/* ════════════════════════════════════════════
            STEP 1 — Who are you?
        ════════════════════════════════════════════ */}
        {!who && (
          <div className="anim-in">
            <div style={{ fontSize: '14px', fontWeight: 700, textAlign: 'center', color: t.textMid, marginBottom: '14px' }}>
              מי אתה/את?
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>

              {/* Parent */}
              <button onClick={() => setWho('parent')} style={{
                padding: '24px 12px', borderRadius: t.radius,
                background: '#fff', border: `2px solid ${t.primary}22`,
                boxShadow: t.shadow, cursor: 'pointer', transition: 'all .18s',
                textAlign: 'center', fontFamily: "'Heebo',sans-serif",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=t.btnShadow; }}
              onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=t.shadow; }}
              >
                <div style={{ fontSize: '46px', lineHeight: 1, marginBottom: '8px', fontFamily: EF }}>👨‍👩‍👧</div>
                <div style={{ fontSize: '17px', fontWeight: 900, color: t.text }}>אני הורה</div>
                <div style={{ fontSize: '11px', color: t.textLight, marginTop: '3px', fontWeight: 500 }}>
                  כניסה עם<br/>אימייל וסיסמה
                </div>
              </button>

              {/* Child */}
              <button onClick={() => setWho('child')} style={{
                padding: '24px 12px', borderRadius: t.radius,
                background: '#fff', border: `2px solid ${t.secondary}22`,
                boxShadow: t.shadow, cursor: 'pointer', transition: 'all .18s',
                textAlign: 'center', fontFamily: "'Heebo',sans-serif",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 6px 24px ${t.secondary}44`; }}
              onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=t.shadow; }}
              >
                <div style={{ fontSize: '46px', lineHeight: 1, marginBottom: '8px', fontFamily: EF }}>🧒</div>
                <div style={{ fontSize: '17px', fontWeight: 900, color: t.text }}>אני ילד/ה</div>
                <div style={{ fontSize: '11px', color: t.textLight, marginTop: '3px', fontWeight: 500 }}>
                  כניסה עם<br/>קוד משפחה
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            PARENT FLOW
        ════════════════════════════════════════════ */}
        {who === 'parent' && (
          <div className="anim-in">
            <Card t={t} style={{ padding: '22px', boxShadow: '0 8px 32px rgba(0,0,0,.10)' }}>

              <button onClick={reset} style={{ background: 'none', border: 'none', color: t.textLight, fontSize: '13px', fontWeight: 600, marginBottom: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'Heebo',sans-serif", padding: 0 }}>
                → חזרה
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <span style={{ fontSize: '30px', fontFamily: EF }}>👨‍👩‍👧</span>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '17px', color: t.text }}>כניסת הורה</div>
                  <div style={{ fontSize: '12px', color: t.textLight }}>נהל משימות ומטרות לילדים</div>
                </div>
              </div>

              {/* Mode tabs */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '18px', background: t.progressBg, borderRadius: t.inputRadius, padding: '4px' }}>
                {[
                  { id: 'login',  label: 'התחברות'     },
                  { id: 'signup', label: 'הרשמה'        },
                  { id: 'join',   label: 'הצטרף למשפחה' },
                ].map(m => (
                  <button key={m.id} onClick={() => { setParentMode(m.id); setErr(''); setInfo(''); }} style={{
                    flex: m.id === 'join' ? 1.3 : 1,
                    padding: '7px 4px',
                    borderRadius: `calc(${t.inputRadius} - 2px)`,
                    background:  parentMode === m.id ? '#fff' : 'transparent',
                    border:      'none',
                    color:       parentMode === m.id ? t.primary : t.textLight,
                    fontFamily:  "'Heebo',sans-serif",
                    fontSize:    '11px',
                    fontWeight:  parentMode === m.id ? 800 : 500,
                    boxShadow:   parentMode === m.id ? '0 1px 6px rgba(0,0,0,.08)' : 'none',
                    transition:  'all .15s',
                  }}>{m.label}</button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                <div>
                  <Lbl t={t}>אימייל 📧</Lbl>
                  <InputF t={t} placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div>
                  <Lbl t={t}>סיסמה 🔐</Lbl>
                  <div style={{ position: 'relative' }}>
                    <InputF t={t} type={showPass ? 'text' : 'password'} placeholder="לפחות 6 תווים" value={pass} onChange={e => setPass(e.target.value)} />
                    <span onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '16px', userSelect: 'none', fontFamily: EF }}>
                      {showPass ? '🙈' : '👁️'}
                    </span>
                  </div>
                </div>

                {parentMode === 'signup' && (
                  <div>
                    <Lbl t={t}>אימות סיסמה 🔐</Lbl>
                    <InputF t={t} type="password" placeholder="חזור על הסיסמה" value={pass2} onChange={e => setPass2(e.target.value)} />
                  </div>
                )}

                {parentMode === 'join' && (
                  <div>
                    <Lbl t={t}>קוד משפחה 👨‍👩‍👧‍👦</Lbl>
                    <InputF t={t} placeholder="הכנס את קוד המשפחה מההגדרות" value={joinCode} onChange={e => setJoinCode(e.target.value)} />
                  </div>
                )}

                {err  && <div style={{ fontSize: '13px', color: t.danger,    padding: '9px 12px', background: t.danger + '15',    borderRadius: t.inputRadius, fontWeight: 600 }}>{err}</div>}
                {info && !info.startsWith('JOIN:') && (
                  <div style={{ fontSize: '13px', color: t.secondary, padding: '9px 12px', background: t.secondary + '20', borderRadius: t.inputRadius, fontWeight: 600 }}>{info}</div>
                )}

                <Btn t={t} onClick={handleParentSubmit} full disabled={loading} style={{ padding: '13px', fontSize: '15px', fontWeight: 800, marginTop: '2px' }}>
                  {loading ? '⏳ רגע...' : parentMode === 'login' ? '🚀 כניסה' : parentMode === 'signup' ? '✨ צור חשבון' : '👥 הצטרף'}
                </Btn>

                {parentMode === 'signup' && (
                  <div style={{ fontSize: '11px', color: t.textLight, textAlign: 'center', padding: '8px', background: t.progressBg, borderRadius: t.inputRadius, lineHeight: 1.5 }}>
                    💡 הרשמה יוצרת משפחה חדשה אוטומטית
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* ════════════════════════════════════════════
            CHILD — Step 1: Family code
        ════════════════════════════════════════════ */}
        {who === 'child' && childStep === 'code' && (
          <div className="anim-in">
            <Card t={t} style={{ padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,.10)' }}>

              <button onClick={reset} style={{ background: 'none', border: 'none', color: t.textLight, fontSize: '13px', fontWeight: 600, marginBottom: '14px', cursor: 'pointer', fontFamily: "'Heebo',sans-serif", padding: 0 }}>
                → חזרה
              </button>

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '50px', lineHeight: 1, fontFamily: EF, display: 'block', marginBottom: '8px' }}>🧒</span>
                <div style={{ fontSize: '19px', fontWeight: 900, color: t.text }}>כניסת ילד/ה</div>
                <div style={{ fontSize: '12px', color: t.textLight, marginTop: '4px', fontWeight: 500, lineHeight: 1.5 }}>
                  בקש מההורה את <strong style={{ color: t.primary }}>קוד המשפחה</strong><br/>
                  ורשום אותו כאן 👇
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <Lbl t={t}>קוד המשפחה 🔑</Lbl>
                  <input
                    placeholder="הכנס את הקוד..."
                    value={familyCode}
                    onChange={e => setFamilyCode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleFamilyCodeSubmit()}
                    style={{
                      width: '100%', padding: '12px 16px',
                      borderRadius: t.inputRadius,
                      border: t.cardBorder || '2px solid rgba(0,0,0,.08)',
                      fontSize: '14px', color: t.text, background: t.inputBg,
                      outline: 'none', direction: 'ltr', textAlign: 'center',
                      fontWeight: 400,
                    }}
                  />
                </div>

                {err && <div style={{ fontSize: '13px', color: t.danger, padding: '9px 12px', background: t.danger + '15', borderRadius: t.inputRadius, fontWeight: 600, textAlign: 'center' }}>{err}</div>}

                <Btn t={t} onClick={handleFamilyCodeSubmit} full disabled={kidLoading} style={{ padding: '13px', fontSize: '15px', fontWeight: 800 }}>
                  {kidLoading ? '⏳ מחפש...' : '🔍 מצא את המשפחה שלי'}
                </Btn>

                <div style={{ textAlign: 'center', fontSize: '12px', color: t.textLight, lineHeight: 1.5 }}>
                  💡 הקוד נמצא אצל ההורה בהגדרות האפליקציה
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ════════════════════════════════════════════
            CHILD — Step 2: Pick avatar
        ════════════════════════════════════════════ */}
        {who === 'child' && childStep === 'pick' && (
          <div className="anim-in">
            <Card t={t} style={{ padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,.10)' }}>

              <button onClick={() => { setChildStep('code'); setErr(''); }} style={{ background: 'none', border: 'none', color: t.textLight, fontSize: '13px', fontWeight: 600, marginBottom: '14px', cursor: 'pointer', fontFamily: "'Heebo',sans-serif", padding: 0 }}>
                → חזרה
              </button>

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '19px', fontWeight: 900, color: t.text }}>מי אתה/את? 👋</div>
                <div style={{ fontSize: '12px', color: t.textLight, marginTop: '4px' }}>לחץ/י על הדמות שלך</div>
              </div>

              {kidList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: t.textLight }}>
                  <span style={{ fontSize: '36px', fontFamily: EF, display: 'block', marginBottom: '8px' }}>🤔</span>
                  <div style={{ fontWeight: 700 }}>לא נמצאו ילדים במשפחה</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>ההורה צריך להוסיף אותך קודם</div>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: kidList.length === 1 ? '1fr' : kidList.length === 2 ? '1fr 1fr' : 'repeat(3, 1fr)',
                  gap: '10px',
                }}>
                  {kidList.map(kid => {
                    const kidTheme  = THEMES[kid.theme_id] || THEMES['A'];
                    const isSelected = pickedKid?.id === kid.id;
                    return (
                      <button
                        key={kid.id}
                        onClick={() => handleKidPick(kid)}
                        style={{
                          padding:    '18px 10px',
                          borderRadius: t.radius,
                          background:  isSelected ? kidTheme.headerGrad : kidTheme.progressBg,
                          border:      isSelected ? 'none' : `2px solid ${kidTheme.primary}22`,
                          boxShadow:   isSelected ? kidTheme.btnShadow : '0 2px 8px rgba(0,0,0,.05)',
                          cursor:      'pointer',
                          transition:  'all .2s',
                          textAlign:   'center',
                          fontFamily:  "'Heebo',sans-serif",
                          transform:   isSelected ? 'scale(1.04)' : 'scale(1)',
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.transform = 'scale(1)'; }}
                      >
                        <div style={{ fontSize: '40px', lineHeight: 1, marginBottom: '7px', fontFamily: EF }}>{kid.avatar}</div>
                        <div style={{ fontSize: '14px', fontWeight: 900, color: isSelected ? '#fff' : kidTheme.text }}>
                          {kid.name}
                        </div>
                        {isSelected && (
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.82)', marginTop: '3px', fontWeight: 600 }}>
                            ✓ נכנס/ת...
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
