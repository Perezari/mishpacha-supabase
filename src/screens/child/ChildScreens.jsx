// ═══════════════════════════════════════════════════════
//  ChildScreens v2 — Galaxy Kids
//  Fixes:
//  · No empty orange space at bottom
//  · Badge icons: softer opacity (not full grayscale)
//  · Shop emoji: colored, not gray
//  · Cleaner spacing throughout
//  · Progress bar visible even at 0%
// ═══════════════════════════════════════════════════════
import { useState, useCallback } from 'react';
import { ALL_BADGES } from '../../data.js';

const EF = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";

/* ── Helpers ─────────────────────────────── */

const CoinRain = ({ active }) => {
  if (!active) return null;
  return (
    <div className="coin-rain-container">
      {Array.from({ length: 16 }, (_, i) => (
        <span key={i} className="coin-rain-item" style={{
          left: `${5 + i * 5.8}%`, top: '-20px',
          fontSize: `${14 + (i % 3) * 5}px`,
          animationDelay: `${i * 0.06}s`,
          animationDuration: `${0.85 + (i % 4) * 0.18}s`,
          '--drift': `${(i % 2 === 0 ? 1 : -1) * (10 + i * 4)}px`,
        }}>🪙</span>
      ))}
    </div>
  );
};

const Confetti = () => (
  <div className="confetti-overlay">
    {Array.from({ length: 22 }, (_, i) => (
      <span key={i} style={{
        position: 'absolute',
        left: `${3 + i * 4.3}%`, top: `${12 + (i % 5) * 8}%`,
        fontSize: `${12 + (i % 4) * 5}px`,
        animation: `confetti ${0.65 + (i % 3) * 0.25}s ease-out ${i * 0.05}s both`,
        fontFamily: EF,
      }}>
        {['⭐','🎉','✨','🌟','💫','🎊','🏆','💎','🪙','🎈'][i % 10]}
      </span>
    ))}
  </div>
);

// Shimmer progress bar — always shows something even at 0%
const GameBar = ({ pct, gradient, height = 20, bg = '#EDE7F6' }) => {
  const w = Math.max(0, Math.min(100, pct));
  return (
    <div style={{ height, borderRadius: 50, overflow: 'hidden', background: bg, boxShadow: 'inset 0 2px 5px rgba(0,0,0,.10)', position: 'relative' }}>
      {/* Track always shows gradient at 8% min so bar is visible */}
      <div style={{
        height: '100%', borderRadius: 50,
        width: `${Math.max(w > 0 ? w : 0, w === 0 ? 0 : 5)}%`,
        background: gradient,
        boxShadow: w > 2 ? `0 2px 10px rgba(124,77,255,.3)` : 'none',
        transition: 'width .9s cubic-bezier(.22,.68,0,1.2)',
        position: 'relative', overflow: 'hidden', minWidth: w > 0 ? 8 : 0,
      }}>
        {w > 12 && (
          <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,.9)' }}>{Math.round(w)}%</span>
        )}
        <div style={{ position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.42),transparent)', animation: 'shimmer 2s ease-in-out infinite', backgroundSize: '200% 100%' }}/>
      </div>
    </div>
  );
};

const StarRow = ({ filled, total = 5, size = 17 }) => (
  <div style={{ display: 'flex', gap: 3 }}>
    {Array.from({ length: total }, (_, i) => (
      <span key={i} style={{
        fontSize: size, fontFamily: EF, lineHeight: 1,
        filter: i < filled ? 'drop-shadow(0 1px 3px rgba(255,200,0,.55))' : 'grayscale(1) opacity(.3)',
        animation: i < filled ? `pulse 2.2s ${i * .15}s ease-in-out infinite` : 'none',
      }}>⭐</span>
    ))}
  </div>
);

// Task status config
const ST = {
  todo:     { color: '#7C4DFF', bg: '#F3EEFF', icon: '📌', label: 'לביצוע',           btnBg: 'linear-gradient(135deg,#00BCD4,#00ACC1)', btnShadow: '0 5px 16px rgba(0,188,212,.45)' },
  pending:  { color: '#FF9800', bg: '#FFF8F0', icon: '⏳', label: 'ממתין לאישור הורה', btnBg: null },
  done:     { color: '#00C853', bg: '#E8F5E9', icon: '✅', label: '!הושלם',            btnBg: null },
  rejected: { color: '#FF3D57', bg: '#FFEBEE', icon: '❌', label: 'נדחה — נסה שוב',   btnBg: null },
};

/* ── Task Card ───────────────────────────── */
function TaskCard({ task, onComplete, isCompleting, justDone }) {
  const st = ST[task.status] || ST.todo;
  return (
    <div
      className={`game-task-card ${task.status === 'done' ? 'done' : ''} ${justDone ? 'anim-wiggle' : 'anim-in'}`}
      style={{ marginBottom: 8 }}
    >
      {/* Status stripe — right edge */}
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 5, background: st.color, borderRadius: '0 20px 20px 0' }}/>

      <div style={{ padding: '11px 15px 11px 11px', display: 'flex', alignItems: 'center', gap: 11 }}>

        {/* Icon */}
        <div style={{ width: 44, height: 44, borderRadius: 14, background: st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontFamily: EF, flexShrink: 0, boxShadow: `0 2px 8px ${st.color}22` }}>
          {st.icon}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: 14, color: '#1A0033', lineHeight: 1.2 }}>{task.title}</span>
            {task.isDaily && <span className="daily-badge">🌅 יומי</span>}
          </div>
          {task.desc && <div style={{ fontSize: 11, color: '#7B5EA7', marginTop: 2, lineHeight: 1.3 }}>{task.desc}</div>}
          <div style={{ fontSize: 11, fontWeight: 700, color: st.color, marginTop: 3 }}>{st.label}</div>
        </div>

        {/* Reward + CTA */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 6, justifyContent: 'flex-end' }}>
            <span style={{ fontFamily: EF, fontSize: 13 }}>🪙</span>
            <span style={{ fontWeight: 900, fontSize: 14, color: '#7C4DFF' }}>₪{task.reward}</span>
          </div>
          {task.status === 'todo' && (
            <button
              onClick={onComplete}
              disabled={isCompleting}
              style={{
                padding: '7px 14px', border: 'none', borderRadius: 50,
                background: isCompleting ? '#ccc' : st.btnBg,
                color: '#fff', fontFamily: "'Heebo',sans-serif",
                fontSize: 11, fontWeight: 800, cursor: isCompleting ? 'wait' : 'pointer',
                boxShadow: isCompleting ? 'none' : st.btnShadow,
                whiteSpace: 'nowrap',
                transition: 'transform .12s, opacity .12s',
              }}
            >{isCompleting ? '⏳' : '✓ סיימתי'}</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   CHILD DASHBOARD
════════════════════════════════════════════════════ */
export function ChildDashboard({ t, kid, onCompleteTask, onNav }) {
  const [completingId, setCompletingId] = useState(null);
  const [showCoins,    setShowCoins]    = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [justDoneId,   setJustDoneId]   = useState(null);

  const handleComplete = useCallback(async (task) => {
    setCompletingId(task.id);
    await onCompleteTask(task.id);
    setCompletingId(null);
    setJustDoneId(task.id);
    if (!task.requiresApproval) {
      setShowCoins(true); setShowConfetti(true);
      setTimeout(() => { setShowCoins(false); setShowConfetti(false); }, 1800);
    }
    setTimeout(() => setJustDoneId(null), 2200);
  }, [onCompleteTask]);

  if (!kid) return null;

  const pct   = Math.round(Math.min(100, (kid.earned / kid.goalAmount) * 100));
  const stars = Math.min(5, Math.floor(pct / 20));
  const todoT = kid.tasks.filter(t => t.status === 'todo');
  const pendT = kid.tasks.filter(t => t.status === 'pending');
  const doneT = kid.tasks.filter(t => t.status === 'done');
  const rejT  = kid.tasks.filter(t => t.status === 'rejected');

  const encourage = pct >= 95 ? '🎉 כמעט הגעת למטרה!'
    : pct >= 75 ? '🚀 כמעט שם! המשך!'
    : pct >= 40 ? '💪 כל הכבוד, ממשיך!'
    : pct >= 10 ? '⭐ התחלה נהדרת!'
    : `!שלום ${kid.name} 👋 בוא נתחיל`;

  // Derive gradient from t, fallback to violet→teal
  const barGrad = t.progressGrad || 'linear-gradient(90deg,#7C4DFF,#00BCD4)';
  const primary = t.primary || '#7C4DFF';

  const Sec = ({ icon, label, count, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, marginBottom: 8 }}>
      <span style={{ fontSize: 15, fontFamily: EF }}>{icon}</span>
      <span style={{ fontWeight: 800, fontSize: 12, color }}>{label}</span>
      <span style={{ background: color + '22', color, borderRadius: 50, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>{count}</span>
    </div>
  );

  return (
    <div style={{ background: t.bgGrad, minHeight: '100%', fontFamily: "'Heebo',sans-serif", display: 'flex', flexDirection: 'column' }}>
      <CoinRain active={showCoins} />
      {showConfetti && <Confetti />}

      {/* ── HEADER ─────────────────────────── */}
      <div style={{ padding: '18px 16px 14px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        {/* Floating decor */}
        {[{t:8,l:12,s:17,d:0,o:.38},{t:22,l:58,s:13,d:1.2,o:.28},{t:5,l:104,s:15,d:.7,o:.32}].map((p,i)=>(
          <span key={i} style={{ position:'absolute', top:p.t, left:p.l, fontSize:p.s, fontFamily:EF, opacity:p.o, pointerEvents:'none', animation:`floatB ${3+p.d}s ease-in-out infinite ${p.d}s` }}>⭐</span>
        ))}

        {/* Greeting + coin */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.72)', fontWeight: 600, marginBottom: 2 }}>שלום, {kid.name}! 👋</div>
            <div style={{ fontSize: 21, fontWeight: 900, color: '#fff', letterSpacing: '-.3px', lineHeight: 1.15 }}>המשימות שלי</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(12px)', borderRadius: 16, padding: '8px 13px', border: '1.5px solid rgba(255,255,255,.3)', textAlign: 'center' }}>
            <span style={{ fontSize: 22, fontFamily: EF, display: 'block', lineHeight: 1 }}>🪙</span>
            <div style={{ fontWeight: 900, fontSize: 16, color: '#FFD54F', lineHeight: 1.1 }}>₪{kid.earned}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>מטבעות</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 6, position: 'relative', zIndex: 1 }}>
          {[
            { icon: '✅', v: doneT.length, l: 'הושלמו',  c: '#00E676' },
            { icon: '📌', v: todoT.length, l: 'לביצוע',  c: '#93C5FD' },
            { icon: '🔥', v: kid.streak,   l: 'סטריק',   c: '#FFD54F' },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,.18)', borderRadius: 12, padding: '7px 4px', textAlign: 'center', border: '1px solid rgba(255,255,255,.22)' }}>
              <span style={{ fontSize: 14, fontFamily: EF, display: 'block', lineHeight: 1, marginBottom: 2 }}>{s.icon}</span>
              <div style={{ fontWeight: 900, fontSize: 16, color: s.c, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.68)', fontWeight: 600, marginTop: 1 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── GOAL CARD ──────────────────────── */}
      <div style={{ padding: '0 14px 12px', flexShrink: 0 }}>
        <div style={{ background: 'rgba(255,255,255,.97)', borderRadius: 20, padding: '15px', boxShadow: '0 6px 24px rgba(0,0,0,.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 11 }}>
            <div>
              <div style={{ fontSize: 10, color: '#7B5EA7', fontWeight: 700, marginBottom: 3, letterSpacing: '.3px' }}>🎯 המטרה שלי</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#1A0033' }}>
                <span style={{ fontFamily: EF }}>{kid.goalIcon}</span> {kid.goalName}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: primary }}>₪{kid.goalAmount - kid.earned}</div>
              <div style={{ fontSize: 9, color: '#7B5EA7', fontWeight: 600 }}>נשאר</div>
            </div>
          </div>
          <GameBar pct={pct} gradient={barGrad} height={20} bg="#EDE7F6" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 7 }}>
            <StarRow filled={stars} total={5} size={15} />
            <div style={{ fontSize: 11, fontWeight: 800, color: pct >= 100 ? '#00C853' : primary }}>{encourage}</div>
          </div>
        </div>
      </div>

      {/* ── TASK SHEET ─────────────────────────────────────
          flex: 1 means it fills ALL remaining space —
          no empty orange gap below the sheet ever.
      ─────────────────────────────────────────────────── */}
      <div style={{
        background: t.sheetBg || '#F0EEFF',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '0 14px 24px',
        flex: 1,          /* fills remaining height */
        overflow: 'auto',
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
          <div style={{ width: 32, height: 4, borderRadius: 2, background: 'rgba(0,0,0,.12)' }}/>
        </div>

        {/* Empty state */}
        {kid.tasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '36px 20px' }}>
            <span style={{ fontSize: 52, fontFamily: EF, display: 'block', marginBottom: 10 }}>🎮</span>
            <div style={{ fontWeight: 800, fontSize: 16, color: primary, marginBottom: 5 }}>אין משימות עדיין</div>
            <div style={{ fontSize: 12, color: '#7B5EA7' }}>ההורים יוסיפו משימות בקרוב!</div>
          </div>
        )}

        {todoT.length > 0 && <><Sec icon="📌" label="לביצוע" count={todoT.length} color="#7C4DFF" />{todoT.map(task => <TaskCard key={task.id} task={task} isCompleting={completingId === task.id} justDone={justDoneId === task.id} onComplete={() => handleComplete(task)} />)}</>}
        {pendT.length > 0 && <><Sec icon="⏳" label="ממתין לאישור" count={pendT.length} color="#FF9800" />{pendT.map(task => <TaskCard key={task.id} task={task} />)}</>}
        {doneT.length > 0 && <><Sec icon="✅" label="הושלמו" count={doneT.length} color="#00C853" />{doneT.map(task => <TaskCard key={task.id} task={task} />)}</>}
        {rejT.length > 0  && <><Sec icon="❌" label="נדחו" count={rejT.length} color="#FF3D57" />{rejT.map(task => <TaskCard key={task.id} task={task} />)}</>}

        {/* Badge quick-strip */}
        {doneT.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: primary, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontFamily: EF }}>🏅</span> התגים שלי
              </div>
              <button onClick={() => onNav('badges')} style={{ background: 'none', border: 'none', color: primary, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'Heebo',sans-serif" }}>
                הצג הכל →
              </button>
            </div>
            <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4 }} className="scroll-hide">
              {[
                { icon: '⚡', name: 'ראשון',  earned: doneT.length >= 1  },
                { icon: '🧹', name: 'ניקיון', earned: doneT.length >= 3  },
                { icon: '📚', name: 'לימוד',  earned: doneT.length >= 5  },
                { icon: '🔥', name: '7 ימים', earned: kid.streak >= 7    },
                { icon: '💎', name: 'כוכב',   earned: pct >= 100         },
              ].map((b, i) => (
                <div key={i} style={{
                  textAlign: 'center', minWidth: 54, flexShrink: 0,
                  background: b.earned ? 'linear-gradient(145deg,#EDE7F6,#F3E5F5)' : '#fff',
                  borderRadius: 12, padding: '8px 5px',
                  border: b.earned ? `2px solid ${primary}44` : '2px solid #eee',
                  boxShadow: b.earned ? `0 3px 10px ${primary}18` : 'none',
                  opacity: b.earned ? 1 : .65,
                }}>
                  {/* colored even when unearthed — just dimmed with opacity, not grayscale */}
                  <div style={{ fontSize: 20, fontFamily: EF, lineHeight: 1 }}>{b.icon}</div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: b.earned ? primary : '#999', marginTop: 3 }}>{b.name}</div>
                  {b.earned && <div style={{ fontSize: 8, color: '#00C853', fontWeight: 700 }}>✓</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   BADGES SCREEN
════════════════════════════════════════════════════ */
export function BadgesScreen({ t, kid }) {
  if (!kid) return null;

  const done   = kid.tasks.filter(x => x.status === 'done').length;
  const pct    = Math.round(Math.min(100, (kid.earned / kid.goalAmount) * 100));
  const badges = ALL_BADGES(done, pct, kid.streak, kid.earned);
  const earned = badges.filter(b => b.earned).length;
  const primary = t.primary || '#7C4DFF';
  const barGrad = t.progressGrad || 'linear-gradient(90deg,#7C4DFF,#00BCD4)';

  return (
    <div style={{ background: t.bgGrad, minHeight: '100%', fontFamily: "'Heebo',sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '18px 16px 14px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <span style={{ position:'absolute', top:6,  left:14, fontSize:15, fontFamily:EF, opacity:.35, animation:'floatB 3.5s ease-in-out infinite' }}>🏅</span>
        <span style={{ position:'absolute', top:22, left:60, fontSize:12, fontFamily:EF, opacity:.28, animation:'floatB 4.2s ease-in-out infinite .8s' }}>⭐</span>
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 48, fontFamily: EF, display: 'block', lineHeight: 1, marginBottom: 5, animation: 'float 3s ease-in-out infinite', filter: 'drop-shadow(0 4px 10px rgba(255,200,0,.45))' }}>🏆</span>
          <div style={{ fontSize: 21, fontWeight: 900, color: '#fff' }}>התגים שלי</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.75)', marginTop: 3 }}>{earned} מתוך {badges.length} הושגו</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 8 }}>
            {Array.from({ length: badges.length }, (_, i) => (
              <span key={i} style={{ fontSize: 11, fontFamily: EF, opacity: i < earned ? 1 : .25 }}>⭐</span>
            ))}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ padding: '0 14px 12px', flexShrink: 0 }}>
        <div style={{ background: 'rgba(255,255,255,.97)', borderRadius: 18, padding: '13px 15px', boxShadow: '0 6px 22px rgba(0,0,0,.14)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: primary, marginBottom: 7 }}>התקדמות כללית</div>
          <GameBar pct={Math.round(earned / badges.length * 100)} gradient={barGrad} height={18} bg="#EDE7F6" />
          <div style={{ textAlign: 'center', fontSize: 11, color: primary, fontWeight: 700, marginTop: 5 }}>{earned}/{badges.length} תגים</div>
        </div>
      </div>

      {/* Badge grid — flex:1 eliminates empty space */}
      <div style={{ background: t.sheetBg || '#F0EEFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: '14px 14px 24px', flex: 1, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 12px' }}>
          <div style={{ width: 32, height: 4, borderRadius: 2, background: 'rgba(0,0,0,.12)' }}/>
        </div>

        <div className="badge-grid">
          {badges.map((b, i) => (
            <div key={i} className="badge-card" style={{
              background: b.earned ? 'linear-gradient(145deg,#EDE7F6,#F3E5F5)' : '#fff',
              boxShadow: b.earned ? `0 4px 16px ${primary}28, 0 0 0 2px ${primary}35` : '0 2px 10px rgba(0,0,0,.06)',
              opacity: b.earned ? 1 : .7,  /* NOT full grayscale — just dimmed */
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '18px 18px 0 0', background: b.earned ? barGrad : '#EEE' }}/>
              {/* Emoji stays colored — filter only on icon container */}
              <div style={{
                fontSize: 26, fontFamily: EF, lineHeight: 1, marginBottom: 5,
                /* No grayscale filter — opacity on parent handles "unearthed" look */
              }}>{b.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: b.earned ? '#3D0066' : '#888', lineHeight: 1.2 }}>{b.name}</div>
              {b.earned && <div style={{ fontSize: 9, color: '#00C853', fontWeight: 700, marginTop: 2 }}>✓ הושג!</div>}
            </div>
          ))}
        </div>

        {/* Streak */}
        <div style={{ marginTop: 14, background: '#fff', borderRadius: 20, padding: '13px 14px', boxShadow: '0 3px 12px rgba(0,0,0,.06)' }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#3D0066', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontFamily: EF }}>🔥</span> סטריק שבועי — {kid.streak} ימים!
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {['א','ב','ג','ד','ה','ו','ש'].map((d, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ height: 36, borderRadius: 9, background: i < kid.streak ? barGrad : '#EDE7F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontFamily: EF, boxShadow: i < kid.streak ? `0 3px 8px ${primary}30` : 'none', transition: 'all .2s' }}>
                  {i < kid.streak ? '🔥' : '·'}
                </div>
                <div style={{ fontSize: 9, color: '#7B5EA7', marginTop: 3 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   SHOP SCREEN
════════════════════════════════════════════════════ */
const CoinRain2 = ({ active }) => {
  if (!active) return null;
  return (
    <div className="coin-rain-container">
      {Array.from({ length: 16 }, (_, i) => (
        <span key={i} className="coin-rain-item" style={{
          left: `${5 + i * 5.8}%`, top: '-20px',
          fontSize: `${14 + (i % 3) * 5}px`,
          animationDelay: `${i * 0.06}s`,
          animationDuration: `${0.85 + (i % 4) * 0.18}s`,
          '--drift': `${(i % 2 === 0 ? 1 : -1) * (10 + i * 4)}px`,
        }}>🪙</span>
      ))}
    </div>
  );
};

export function ShopScreen({ t, kid, shopItems = [], purchases = [], onBuy }) {
  const [tab,       setTab]       = useState('shop');
  const [flashItem, setFlashItem] = useState(null);
  const [showRain,  setShowRain]  = useState(false);
  const [buying,    setBuying]    = useState(null);

  if (!kid) return null;

  const primary        = t.primary || '#7C4DFF';
  const kidPurchases   = purchases.filter(p => p.kidId === kid.id);
  const pendingSpend   = kidPurchases.filter(p => p.status === 'pending').reduce((s, p) => s + p.itemPrice, 0);
  const available      = kid.earned - pendingSpend;

  const ACCENTS = ['#7C4DFF','#00BCD4','#FF9800','#E91E63','#4CAF50','#FF5722','#3F51B5','#009688'];

  const handleBuy = async (item) => {
    if (available < item.price || buying) return;
    setBuying(item.id);
    const result = await onBuy(item);
    setBuying(null);
    if (!result?.error) {
      setFlashItem(item);
      setShowRain(true);
      setTimeout(() => { setFlashItem(null); setShowRain(false); }, 1600);
    }
  };

  const EF2 = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";
  const statusLabel = { pending: '⏳ ממתין לאישור', approved: '✅ אושר', rejected: '❌ נדחה' };
  const statusColor = { pending: '#FF9800', approved: '#00C853', rejected: '#FF3D57' };
  const formatDate = (iso) => { if (!iso) return ''; const d = new Date(iso); return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; };

  return (
    <div style={{ background: t.bgGrad, minHeight: '100%', fontFamily: "'Heebo',sans-serif", display: 'flex', flexDirection: 'column' }}>
      <CoinRain2 active={showRain} />

      {flashItem && (
        <div className="modal-overlay">
          <div className="anim-pop" style={{ background: '#fff', borderRadius: 26, padding: '30px 42px', textAlign: 'center', boxShadow: `0 24px 60px ${primary}44` }}>
            <div style={{ fontSize: 68, fontFamily: EF2, animation: 'starBurst .5s ease-out' }}>{flashItem.icon}</div>
            <div style={{ fontWeight: 900, fontSize: 19, color: '#1A0033', marginTop: 9 }}>בקשה נשלחה! 🎉</div>
            <div style={{ fontSize: 13, color: primary, marginTop: 4, fontWeight: 700 }}>{flashItem.name}</div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>ממתין לאישור הורה</div>
          </div>
        </div>
      )}

      <div style={{ padding: '18px 16px 14px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 46, fontFamily: EF2, display: 'block', lineHeight: 1, marginBottom: 5, animation: 'float 3s ease-in-out infinite' }}>🏪</span>
          <div style={{ fontSize: 21, fontWeight: 900, color: '#fff' }}>החנות שלי</div>
        </div>
      </div>

      <div style={{ padding: '0 14px 10px', flexShrink: 0 }}>
        <div style={{ background: 'rgba(255,255,255,.97)', borderRadius: 20, padding: '13px 15px', boxShadow: '0 6px 22px rgba(0,0,0,.14)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, color: '#7B5EA7', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.3px' }}>יתרה זמינה</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 24, fontFamily: EF2 }}>🪙</span>
              <span style={{ fontSize: 24, fontWeight: 900, color: primary }}>₪{available}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#7B5EA7', marginBottom: 2 }}>צברת: <strong style={{ color: primary }}>₪{kid.earned}</strong></div>
            {pendingSpend > 0 && <div style={{ fontSize: 11, color: '#FF9800', fontWeight: 700 }}>ממתין: ₪{pendingSpend}</div>}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', padding: '0 14px', gap: 6, flexShrink: 0 }}>
        {[{ id: 'shop', l: '🛍️ חנות' }, { id: 'history', l: `🧾 רכישות (${kidPurchases.length})` }].map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{
            flex: 1, padding: '8px 10px', borderRadius: '12px 12px 0 0',
            fontFamily: "'Heebo',sans-serif", fontSize: 12, fontWeight: tab === tb.id ? 800 : 500,
            border: 'none',
            background: tab === tb.id ? (t.sheetBg || '#F0EEFF') : 'rgba(255,255,255,.18)',
            color: tab === tb.id ? primary : 'rgba(255,255,255,.8)',
          }}>{tb.l}</button>
        ))}
      </div>

      <div style={{ background: t.sheetBg || '#F0EEFF', flex: 1, overflow: 'auto', padding: '14px 14px 28px' }}>

        {tab === 'shop' && (
          shopItems.length === 0
            ? <div style={{ textAlign: 'center', padding: '36px 20px' }}>
                <span style={{ fontSize: 48, fontFamily: EF2, display: 'block', marginBottom: 10 }}>🏪</span>
                <div style={{ fontWeight: 800, fontSize: 15, color: primary }}>החנות ריקה</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 5 }}>ההורים יוסיפו פריטים לחנות</div>
              </div>
            : <>
                {available < 5 && <div style={{ marginBottom: 10, padding: '8px 14px', background: 'rgba(255,255,255,.4)', borderRadius: 12, fontSize: 11, color: primary, fontWeight: 700, textAlign: 'center' }}>💡 השלם עוד משימות כדי לצבור מטבעות!</div>}
                <div className="shop-grid">
                  {shopItems.map((item, idx) => {
                    const canBuy     = available >= item.price && !buying;
                    const accent     = ACCENTS[idx % ACCENTS.length];
                    const hasPending = kidPurchases.some(p => p.itemName === item.name && p.status === 'pending');
                    return (
                      <div key={item.id} className={`shop-card ${canBuy && !hasPending ? 'available' : ''}`}
                        onClick={() => !hasPending && handleBuy(item)}
                        style={{ opacity: canBuy || hasPending ? 1 : .6, cursor: canBuy && !hasPending ? 'pointer' : 'default' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: accent, borderRadius: '20px 20px 0 0' }}/>
                        <div style={{ fontSize: 36, fontFamily: EF2, display: 'block', marginBottom: 7, marginTop: 4, opacity: canBuy||hasPending ? 1 : .55, animation: canBuy && !hasPending ? 'floatB 3.5s ease-in-out infinite' : 'none' }}>{item.icon}</div>
                        <div style={{ fontWeight: 700, fontSize: 12, color: '#1A0033', marginBottom: 5 }}>{item.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', marginBottom: 9 }}>
                          <span style={{ fontFamily: EF2, fontSize: 13 }}>🪙</span>
                          <span style={{ fontWeight: 900, fontSize: 14, color: accent }}>₪{item.price}</span>
                        </div>
                        <button style={{
                          width: '100%', padding: '8px 4px', border: 'none', borderRadius: 50,
                          background: hasPending ? '#FFF3E0' : canBuy ? `linear-gradient(135deg,${accent},${accent}CC)` : '#F0F0F0',
                          color: hasPending ? '#FF9800' : canBuy ? '#fff' : '#999',
                          fontFamily: "'Heebo',sans-serif", fontSize: 11, fontWeight: 800,
                          cursor: canBuy && !hasPending ? 'pointer' : 'default',
                          boxShadow: canBuy && !hasPending ? `0 5px 14px ${accent}44` : 'none',
                        }}>
                          {buying === item.id ? '⏳...' : hasPending ? '⏳ ממתין' : canBuy ? '🛒 קנה!' : '🔒 צריך עוד'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
        )}

        {tab === 'history' && (
          kidPurchases.length === 0
            ? <div style={{ textAlign: 'center', padding: '36px 20px' }}>
                <span style={{ fontSize: 48, fontFamily: EF2, display: 'block', marginBottom: 10 }}>🧾</span>
                <div style={{ fontWeight: 800, fontSize: 15, color: primary }}>אין רכישות עדיין</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 5 }}>לחץ "קנה!" כדי לבקש פריט</div>
              </div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {kidPurchases.map(p => (
                  <div key={p.id} style={{ background: '#fff', borderRadius: 16, padding: '12px 14px', boxShadow: '0 3px 12px rgba(0,0,0,.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 32, fontFamily: EF2, flexShrink: 0 }}>{p.itemIcon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#1A0033' }}>{p.itemName}</div>
                      <div style={{ fontSize: 11, color: statusColor[p.status] || '#999', fontWeight: 700, marginTop: 2 }}>{statusLabel[p.status] || p.status}</div>
                      <div style={{ fontSize: 10, color: '#999', marginTop: 1 }}>{formatDate(p.createdAt)}</div>
                    </div>
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontWeight: 900, fontSize: 15, color: primary }}>₪{p.itemPrice}</div>
                    </div>
                  </div>
                ))}
              </div>
        )}
      </div>
    </div>
  );
}
