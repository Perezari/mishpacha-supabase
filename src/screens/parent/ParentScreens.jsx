// Parent screens — compact v3
import { useState } from 'react';
import THEMES from '../../themes.js';
import { AVATARS, TASK_EXAMPLES, GOAL_OPTS } from '../../data.js';
import { Btn, InputF, TextareaF, SelectF, Lbl, ProgressBar, Toggle, Confetti, EmptyState, Header, SavedModal } from '../../components/Atoms.jsx';

const EF = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";

const Field = ({ t, label, children }) => (
  <div><Lbl t={t}>{label}</Lbl>{children}</div>
);

/* ════════════════════════════════════════════════
   KID DETAIL
════════════════════════════════════════════════ */
export function KidDetailScreen({ t, kid, onBack, onAddTask, onApprove, onReject }) {
  if (!kid) return null;
  const pct = Math.round((kid.earned / kid.goalAmount) * 100);
  return (
    <div style={{ background: t.bgGrad, fontFamily: "'Heebo',sans-serif", color: t.text, minHeight: '100%' }}>
      <Header t={t} back="חזרה" onBack={onBack}
        title={<span><span style={{ fontFamily: EF }}>{kid.avatar}</span> {kid.name}</span>}
        subtitle={`גיל ${kid.age} · 🔥 ${kid.streak} ימי סטריק`}
        right={<span style={{ fontSize: '36px', fontFamily: EF }}>{kid.goalIcon}</span>}
      />
      <div style={{ padding: '12px 14px' }}>

        {/* Goal */}
        <div style={{ background: t.headerGrad, borderRadius: t.radius, padding: '13px', marginBottom: '10px', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '10px', opacity: .8 }}>המטרה</div>
              <div style={{ fontSize: '16px', fontWeight: 900 }}><span style={{ fontFamily: EF }}>{kid.goalIcon}</span> {kid.goalName}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 900 }}>₪{kid.earned}</div>
              <div style={{ fontSize: '9px', opacity: .8 }}>/ ₪{kid.goalAmount}</div>
            </div>
          </div>
          <ProgressBar t={t} value={pct} bgO="rgba(255,255,255,.3)" fillO="#fff" />
        </div>

        {/* Tasks header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontWeight: 800, fontSize: '13px' }}>📋 המשימות ({kid.tasks.length})</div>
          <button onClick={onAddTask} style={{ padding: '5px 12px', background: t.primary, color: '#fff', border: 'none', borderRadius: '50px', fontFamily: "'Heebo',sans-serif", fontSize: '11px', fontWeight: 700, cursor: 'pointer', boxShadow: t.btnShadow }}>+ הוסף</button>
        </div>

        {kid.tasks.length === 0
          ? <EmptyState t={t} icon="📋" title="אין משימות" action="+ הוסף" onAction={onAddTask} />
          : kid.tasks.map(task => {
            const sm = { done: { c: t.secondary, l: '✅ הושלם' }, pending: { c: '#F59E0B', l: '⏳ ממתין לאישור' }, todo: { c: t.textLight, l: '📌 לביצוע' }, rejected: { c: t.danger, l: '❌ נדחה' } }[task.status];
            return (
              <div key={task.id} style={{ background: '#fff', borderRadius: t.radius, boxShadow: t.shadow, border: t.cardBorder || 'none', padding: '10px 12px', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: sm?.c+'18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0, fontFamily: EF }}>
                    {task.status === 'done' ? '✅' : task.status === 'pending' ? '⏳' : task.status === 'rejected' ? '❌' : '📌'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px' }}>{task.title}</span>
                      {task.isDaily && <span style={{ fontSize: '9px', background: '#FFF3CD', color: '#856404', padding: '1px 5px', borderRadius: '50px', fontWeight: 700, border: '1px solid #ffc10744' }}>🌅 יומי</span>}
                    </div>
                    {task.desc && <div style={{ fontSize: '11px', color: t.textLight }}>{task.desc}</div>}
                    <div style={{ fontSize: '11px', color: sm?.c, fontWeight: 700, marginTop: '1px' }}>{sm?.l}</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: t.primary, flexShrink: 0 }}>₪{task.reward}</div>
                </div>
                {task.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    <Btn t={t} color={t.secondary} full sm onClick={() => onApprove(kid.id, task.id)}>✅ אשר</Btn>
                    <Btn t={t} color={t.danger}    full sm onClick={() => onReject(kid.id, task.id)}>❌ דחה</Btn>
                  </div>
                )}
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   ADD CHILD
════════════════════════════════════════════════ */
export function AddChildScreen({ t, onSave, onBack }) {
  const [name,    setName]    = useState('');
  const [age,     setAge]     = useState('');
  const [avatar,  setAvatar]  = useState('🐱');
  const [tid,     setTid]     = useState('GAME');
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!name || !age) return;
    setLoading(true);
    await onSave({ name, age: parseInt(age), avatar, themeId: tid, goalAmount: 100, goalName: 'המטרה שלי', goalIcon: '🎯', earned: 0, streak: 0 });
    setLoading(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); onBack(); }, 1200);
  };

  return (
    <div style={{ background: t.bgGrad, fontFamily: "'Heebo',sans-serif", color: t.text, minHeight: '100%' }}>
      <Header t={t} title="הוסף ילד/ה חדש/ה 👶" back="חזרה" onBack={onBack} />
      {saved && <SavedModal t={t} icon="🎉" text="נוסף! משימות יומיות נוצרו ✅" />}
      <div style={{ padding: '12px 14px' }}>

        {/* Info banner */}
        <div style={{ background: t.secondary+'18', border: `1.5px solid ${t.secondary}33`, borderRadius: t.radius, padding: '10px 13px', marginBottom: '12px', fontSize: '12px', color: t.text, lineHeight: 1.5 }}>
          <strong>🌅 משימות יומיות:</strong> יווצרו אוטומטית 8 משימות שגרה (₪1 כל אחת)
        </div>

        <div style={{ background: '#fff', borderRadius: t.radius, boxShadow: t.shadow, padding: '16px' }}>
          {/* Avatar picker */}
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '52px', fontFamily: EF, marginBottom: '6px' }}>{avatar}</div>
            <div style={{ fontSize: '11px', color: t.textLight, marginBottom: '7px' }}>בחר/י אווטאר:</div>
            <div className="avatar-grid">
              {AVATARS.map(a => (
                <button key={a} onClick={() => setAvatar(a)} style={{ fontSize: '19px', padding: '5px', borderRadius: t.radius, fontFamily: EF, background: avatar === a ? t.primary+'22' : t.progressBg, border: avatar === a ? `2px solid ${t.primary}` : '2px solid transparent' }}>{a}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Field t={t} label="שם ✏️"><InputF t={t} placeholder="שם הילד/ה..." value={name} onChange={e => setName(e.target.value)} /></Field>
            <Field t={t} label="גיל 🎂"><InputF t={t} placeholder="גיל" type="number" value={age} onChange={e => setAge(e.target.value)} /></Field>
            <div>
              <Lbl t={t}>מראה 🎨</Lbl>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {Object.values(THEMES).map(th => (
                  <button key={th.id} onClick={() => setTid(th.id)} style={{ padding: '5px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: 700, fontFamily: "'Heebo',sans-serif", background: tid === th.id ? th.primary : th.progressBg, border: 'none', color: tid === th.id ? '#fff' : th.text, boxShadow: tid === th.id ? th.btnShadow : 'none' }}>
                    <span style={{ fontFamily: EF }}>{th.name.split(' ').at(-1)}</span> {tid === th.id ? '✓' : ''}
                  </button>
                ))}
              </div>
            </div>
            <Btn t={t} onClick={handle} full disabled={!name || !age || loading} style={{ padding: '11px', fontSize: '14px' }}>
              {loading ? '⏳ יוצר...' : '💾 שמור ילד/ה'}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   ADD TASK
════════════════════════════════════════════════ */
export function AddTaskScreen({ t, kids, preKidId, onSave, onBack }) {
  const [title,  setTitle]  = useState('');
  const [desc,   setDesc]   = useState('');
  const [reward, setReward] = useState('');
  const [kidId,  setKidId]  = useState(preKidId || kids[0]?.id || '');
  const [appr,   setAppr]   = useState(true);
  const [saved,  setSaved]  = useState(false);
  const [err,    setErr]    = useState('');

  const handle = async () => {
    setErr('');
    if (!title)  { setErr('נא להכניס שם למשימה'); return; }
    if (!reward) { setErr('נא להכניס סכום');       return; }
    if (!kidId)  { setErr('נא לבחור ילד/ה');       return; }
    const result = await onSave({ title, desc, reward: parseFloat(reward), kidId, requiresApproval: appr });
    if (result?.error) { setErr('שגיאה — נסה שוב'); return; }
    setSaved(true);
    setTimeout(() => { setSaved(false); onBack(); }, 1100);
  };

  return (
    <div style={{ background: t.bgGrad, fontFamily: "'Heebo',sans-serif", color: t.text, minHeight: '100%' }}>
      <Header t={t} title="הוסף משימה ➕" back="חזרה" onBack={onBack} />
      {saved && <SavedModal t={t} icon="✅" text="משימה נוספה!" />}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ background: '#fff', borderRadius: t.radius, boxShadow: t.shadow, padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
            <Field t={t} label="שם המשימה 📝"><InputF t={t} placeholder="לדוגמה: צחצוח שיניים..." value={title} onChange={e => setTitle(e.target.value)} autoFocus /></Field>
            <Field t={t} label="תיאור (לא חובה)"><TextareaF t={t} placeholder="הסבר קצר..." value={desc} onChange={e => setDesc(e.target.value)} /></Field>
            <div>
              <Lbl t={t}>💡 דוגמאות:</Lbl>
              <div className="chips-row">
                {TASK_EXAMPLES.map((ex, i) => (
                  <button key={i} onClick={() => { setTitle(ex.t); setReward(String(ex.r)); }} className="chip-btn"
                    style={{ background: t.progressBg, border: 'none', color: t.text, fontFamily: "'Heebo',sans-serif" }}>
                    {ex.t} · ₪{ex.r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Lbl t={t}>תגמול 💰</Lbl>
              <div style={{ position: 'relative' }}>
                <InputF t={t} type="number" placeholder="0" value={reward} onChange={e => setReward(e.target.value)} />
                <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', fontWeight: 900, color: t.primary, fontSize: '15px', pointerEvents: 'none' }}>₪</span>
              </div>
            </div>
            <Field t={t} label="שייך לילד/ה 👦">
              <SelectF t={t} value={kidId} onChange={e => setKidId(e.target.value)}>
                {kids.map(k => <option key={k.id} value={k.id}>{k.avatar} {k.name}</option>)}
              </SelectF>
            </Field>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: t.progressBg, padding: '9px 12px', borderRadius: t.inputRadius }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '12px' }}>נדרש אישור הורה 👁️</div>
                <div style={{ fontSize: '10px', color: t.textLight, marginTop: '1px' }}>הורה יאשר כשהמשימה תסתיים</div>
              </div>
              <Toggle t={t} value={appr} onChange={setAppr} />
            </div>
            {err && <div style={{ fontSize: '12px', color: t.danger, padding: '8px 11px', background: t.danger+'12', borderRadius: t.inputRadius, fontWeight: 600 }}>⚠️ {err}</div>}
            <Btn t={t} onClick={handle} full style={{ padding: '11px', fontSize: '14px' }}>✅ שמור משימה</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   GOAL SETTING — compact grid
════════════════════════════════════════════════ */
export function GoalSettingScreen({ t, kids, onSave, onBack }) {
  const [kidId, setKidId] = useState(kids[0]?.id || '');
  const [gi,    setGi]    = useState('🎮');
  const [gn,    setGn]    = useState('');
  const [ga,    setGa]    = useState('');
  const [saved, setSaved] = useState(false);
  const [err,   setErr]   = useState('');

  const kid = kids.find(k => k.id === kidId);
  const pct = kid && ga ? Math.round((kid.earned / parseFloat(ga)) * 100) : 0;

  const handle = async () => {
    setErr('');
    if (!gn)    { setErr('נא להכניס שם למטרה'); return; }
    if (!ga)    { setErr('נא להכניס סכום');      return; }
    if (!kidId) { setErr('נא לבחור ילד/ה');      return; }
    const result = await onSave({ kidId, goalName: gn, goalIcon: gi, goalAmount: parseFloat(ga) });
    if (result?.error) { setErr('שגיאה — נסה שוב'); return; }
    setSaved(true);
    setTimeout(() => { setSaved(false); onBack(); }, 1200);
  };

  return (
    <div style={{ background: t.bgGrad, fontFamily: "'Heebo',sans-serif", color: t.text, minHeight: '100%' }}>
      <Header t={t} title="הגדר מטרה 🎯" back="חזרה" onBack={onBack} />
      {saved && <SavedModal t={t} icon="🎯" text="מטרה הוגדרה!" />}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ background: '#fff', borderRadius: t.radius, boxShadow: t.shadow, padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            <Field t={t} label="מטרה עבור:">
              <SelectF t={t} value={kidId} onChange={e => setKidId(e.target.value)}>
                {kids.map(k => <option key={k.id} value={k.id}>{k.avatar} {k.name}</option>)}
              </SelectF>
            </Field>

            {/* Goal type — compact 4-col grid */}
            <div>
              <Lbl t={t}>סוג המטרה 🎁</Lbl>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '5px' }}>
                {GOAL_OPTS.map(g => (
                  <button key={g.icon} onClick={() => setGi(g.icon)} style={{
                    textAlign: 'center', padding: '7px 3px',
                    background:   gi === g.icon ? t.primary+'20' : t.progressBg,
                    borderRadius: '8px',
                    border:       gi === g.icon ? `2px solid ${t.primary}` : '2px solid transparent',
                    cursor: 'pointer', transition: 'all .12s',
                  }}>
                    <div style={{ fontSize: '18px', fontFamily: EF }}>{g.icon}</div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: t.text, marginTop: '2px', lineHeight: 1.1 }}>{g.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <Field t={t} label="שם המטרה ✏️">
              <InputF t={t} placeholder="לדוגמה: נינטנדו סוויץ'..." value={gn} onChange={e => setGn(e.target.value)} />
            </Field>

            <div>
              <Lbl t={t}>סכום המטרה 💰</Lbl>
              <div style={{ position: 'relative' }}>
                <InputF t={t} type="number" placeholder="100" value={ga} onChange={e => setGa(e.target.value)} />
                <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', fontWeight: 900, color: t.primary, fontSize: '15px', pointerEvents: 'none' }}>₪</span>
              </div>
            </div>

            {/* Live preview — compact */}
            {kid && gn && ga && (
              <div style={{ background: t.progressBg, borderRadius: t.radius, padding: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '28px', fontFamily: EF }}>{gi}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '13px' }}>{gn}</div>
                    <div style={{ fontSize: '11px', color: t.textLight }}>₪{kid.earned} / ₪{ga}</div>
                  </div>
                </div>
                <ProgressBar t={t} value={pct} showLabel />
              </div>
            )}

            {err && <div style={{ fontSize: '12px', color: t.danger, padding: '8px 11px', background: t.danger+'12', borderRadius: t.inputRadius, fontWeight: 600 }}>⚠️ {err}</div>}

            <Btn t={t} onClick={handle} full style={{ padding: '11px', fontSize: '14px' }}>🎯 שמור מטרה</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   APPROVALS
════════════════════════════════════════════════ */
export function ApprovalsScreen({ t, kids, onApprove, onReject }) {
  const [celebrating, setCelebrating] = useState(false);
  const pending = kids.flatMap(k => k.tasks.filter(x => x.status === 'pending').map(x => ({ ...x, kid: k })));
  const STICKERS = ['🌟','🎉','🏆','💪','🎈','🥳'];

  const handleApprove = (ki, ti) => {
    onApprove(ki, ti);
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 1700);
  };

  return (
    <div style={{ background: t.bgGrad, fontFamily: "'Heebo',sans-serif", color: t.text, minHeight: '100%' }}>
      {celebrating && <Confetti />}
      <Header t={t} title="אישורים ממתינים ⏳" subtitle={`${pending.length} בקשות מחכות לך`}
        right={<div style={{ background: 'rgba(255,255,255,.25)', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '15px', border: '2px solid rgba(255,255,255,.4)' }}>{pending.length}</div>}
      />
      <div style={{ padding: '12px 14px' }}>
        {pending.length === 0
          ? <EmptyState t={t} icon="🎉" title="הכל מאושר!" sub="אין בקשות ממתינות כרגע" />
          : <>
            <div style={{ fontSize: '12px', color: t.textMid, textAlign: 'center', marginBottom: '10px', padding: '9px', background: t.progressBg, borderRadius: t.radius, lineHeight: 1.5 }}>
              💡 הילדים מחכים לאישורך!
            </div>
            {pending.map(item => (
              <div key={`${item.kid.id}-${item.id}`} style={{ background: '#fff', borderRadius: t.radius, boxShadow: t.shadow, border: t.cardBorder || 'none', padding: '13px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '32px', fontFamily: EF, flexShrink: 0 }}>{item.kid.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 900, fontSize: '14px' }}>{item.kid.name}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>{item.title}</div>
                    {item.desc && <div style={{ fontSize: '11px', color: t.textLight }}>{item.desc}</div>}
                    {item.isDaily && <span style={{ fontSize: '9px', background: '#FFF3CD', color: '#856404', padding: '1px 5px', borderRadius: '50px', fontWeight: 700, border: '1px solid #ffc10744' }}>🌅 משימה יומית</span>}
                  </div>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: t.primary }}>₪{item.reward}</div>
                    <div style={{ fontSize: '9px', color: t.textLight }}>תגמול</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '7px' }}>
                  <Btn t={t} color={t.secondary} full sm onClick={() => handleApprove(item.kid.id, item.id)}>✅ אשר ותגמל</Btn>
                  <Btn t={t} color={t.danger}    full sm onClick={() => onReject(item.kid.id, item.id)}>❌ דחה</Btn>
                </div>
              </div>
            ))}
            <div style={{ background: '#fff', borderRadius: t.radius, boxShadow: t.shadow, padding: '12px', textAlign: 'center', marginTop: '4px' }}>
              <div style={{ fontSize: '11px', color: t.textLight, marginBottom: '8px', fontWeight: 600 }}>🎖️ מדבקות שמחכות לאחר האישור:</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                {STICKERS.map((emoji, i) => (
                  <span key={i} style={{ fontSize: '26px', fontFamily: EF, display: 'inline-block', animation: `pulse 1.6s ${i * .18}s infinite` }}>{emoji}</span>
                ))}
              </div>
            </div>
          </>
        }
      </div>
    </div>
  );
}
