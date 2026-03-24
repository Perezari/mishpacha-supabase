// ═══════════════════════════════════════════════════════
//  Child Screens — Game UI v5
//  Works with SUNNY / COSMIC / FOREST themes.
//  Uses theme.primary, .secondary, .accent, .coinBg etc.
// ═══════════════════════════════════════════════════════
import { useState } from 'react';
import { SHOP_ITEMS, ALL_BADGES } from '../../data.js';

const EF = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";

/* ── Helpers ─────────────────────────────── */
const isDark = (t) => t.id === 'COSMIC';

const textOn  = (t) => isDark(t) ? '#fff' : '#1A1A2E';
const textSub = (t) => isDark(t) ? 'rgba(255,255,255,.70)' : t.textLight || '#888';

/* ── Coin Rain ────────────────────────────── */
const CoinRain = ({ active }) => !active ? null : (
  <div className="coin-rain-container">
    {Array.from({ length: 16 }, (_, i) => (
      <span key={i} className="coin-rain-item" style={{ left: `${5 + i * 5.8}%`, top: '-24px', fontSize: `${15 + (i % 3) * 5}px`, animationDelay: `${i * .06}s`, animationDuration: `${.9 + (i % 4) * .2}s`, '--drift': `${(i % 2 === 0 ? 1 : -1) * (20 + i * 4)}px` }}>🪙</span>
    ))}
  </div>
);

/* ── Confetti ─────────────────────────────── */
const Confetti = () => (
  <div className="confetti-overlay">
    {Array.from({ length: 26 }, (_, i) => (
      <span key={i} style={{ position: 'absolute', left: `${3 + i * 3.7}%`, top: `${12 + (i % 4) * 8}%`, fontSize: `${12 + (i % 3) * 6}px`, animation: `confetti ${.7 + (i % 4) * .2}s ease-out ${i * .045}s both`, fontFamily: EF }}>
        {['⭐','🎊','✨','🌟','💫','🎉','🏆','💎','🪙','🎈'][ i % 10]}
      </span>
    ))}
  </div>
);

/* ── Star Burst ───────────────────────────── */
const StarBurst = ({ show }) => !show ? null : (
  <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9997, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span style={{ fontSize: '90px', fontFamily: EF, animation: 'starBurst .65s ease-out' }}>⭐</span>
  </div>
);

/* ── Coin Bubble ──────────────────────────── */
const CoinBubble = ({ amount, t, size = 'md', glow = false }) => {
  const big = size === 'lg';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: big ? '10px' : '6px' }}>
      <div className={`game-coin ${big ? 'game-coin-lg' : ''} ${glow ? 'anim-pulse' : ''}`}
        style={{ background: t.coinBg }}>
        <span style={{ fontFamily: EF }}>🪙</span>
      </div>
      <span style={{ fontWeight: 900, fontSize: big ? '30px' : '18px', color: t.primary, letterSpacing: '-.5px' }}>
        ₪{amount}
      </span>
    </div>
  );
};

/* ── Progress Bar (game style) ────────────── */
const GameBar = ({ value, t, height = 22, label }) => {
  const pct = Math.max(0, Math.min(100, value || 0));
  return (
    <div>
      <div className="game-progress-bg" style={{ height, background: t.progressBg }}>
        <div className="game-progress-fill" style={{ width: `${pct}%`, background: t.progressGrad }}>
          {pct > 15 && <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,.95)' }}>{pct}%</span>}
        </div>
      </div>
      {label && <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', fontWeight: 700, color: textSub(t) }}>
        <span>{pct}% הושג</span>
        <span>{label}</span>
      </div>}
    </div>
  );
};

/* ── Stars Row ────────────────────────────── */
const Stars = ({ filled, total = 5 }) => (
  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
    {Array.from({ length: total }, (_, i) => (
      <span key={i} style={{ fontSize: '16px', fontFamily: EF, opacity: i < filled ? 1 : .25, filter: i < filled ? 'none' : 'grayscale(1)', transition: 'all .3s', transitionDelay: `${i * .05}s` }}>⭐</span>
    ))}
  </div>
);

/* ── Floating Decorations ─────────────────── */
const FloatDeco = ({ t }) => (
  <>
    <span className="anim-float"  style={{ position: 'absolute', top: 10, left: 14, fontSize: '22px', opacity: .4, fontFamily: EF, pointerEvents: 'none' }}>⭐</span>
    <span className="anim-float2" style={{ position: 'absolute', top: 32, left: 46, fontSize: '14px', opacity: .3, fontFamily: EF, pointerEvents: 'none' }}>✨</span>
    <span className="anim-float3" style={{ position: 'absolute', bottom: 12, left: 28, fontSize: '17px', opacity: .28, fontFamily: EF, pointerEvents: 'none' }}>💫</span>
  </>
);

/* ════════════════════════════════════════════════════════
   CHILD DASHBOARD
════════════════════════════════════════════════════════ */
export function ChildDashboard({ t, kid, onCompleteTask, onNav }) {
  const [completingId, setCompletingId] = useState(null);
  const [showCoins,    setShowCoins]    = useState(false);
  const [showStar,     setShowStar]     = useState(false);
  const [justDoneId,   setJustDoneId]   = useState(null);
  if (!kid) return null;

  const pct  = Math.min(100, Math.round((kid.earned / kid.goalAmount) * 100));
  const done = kid.tasks.filter(x => x.status === 'done').length;
  const todo = kid.tasks.filter(x => x.status === 'todo').length;
  const starsEarned = Math.min(5, Math.floor(pct / 20));

  const todoTasks     = kid.tasks.filter(x => x.status === 'todo');
  const pendingTasks  = kid.tasks.filter(x => x.status === 'pending');
  const doneTasks     = kid.tasks.filter(x => x.status === 'done');
  const rejectedTasks = kid.tasks.filter(x => x.status === 'rejected');

  const handleComplete = async (task) => {
    setCompletingId(task.id);
    await onCompleteTask(task.id);
    setCompletingId(null);
    setJustDoneId(task.id);
    if (!task.requiresApproval) {
      setShowCoins(true); setShowStar(true);
      setTimeout(() => { setShowCoins(false); setShowStar(false); }, 1700);
    }
    setTimeout(() => setJustDoneId(null), 2000);
  };

  const encouragements = [
    { pct: 0,  text: `!שלום ${kid.name} 👋 בוא נתחיל!` },
    { pct: 25, text: '!מגניב! ממשיך כמו גיבור 💪' },
    { pct: 50, text: '!חצי דרך! אתה מדהים 🚀' },
    { pct: 75, text: '!כמעט שם! עוד קצת 🏆' },
    { pct: 90, text: '!וואו! כמעט הגעת למטרה 🎉' },
  ];
  const msg = encouragements.filter(e => pct >= e.pct).pop()?.text || `!שלום ${kid.name}`;

  // Dark theme text
  const headerText = '#fff';
  const sheetBg = t.sheetBg || '#FFFBF0';

  return (
    <div style={{ background: t.bgGrad, minHeight: '100%', fontFamily: "'Heebo',sans-serif", position: 'relative' }}>
      <CoinRain active={showCoins} />
      <StarBurst show={showStar} />

      {/* ════ HEADER ════ */}
      <div style={{ padding: '20px 18px 16px', position: 'relative', overflow: 'hidden' }}>
        <FloatDeco t={t} />

        {/* Avatar + greeting */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '16px',
              background: 'rgba(255,255,255,.22)', border: '2px solid rgba(255,255,255,.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', fontFamily: EF,
            }}>{kid.avatar}</div>
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.8)', fontWeight: 600 }}>שלום,</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: headerText, letterSpacing: '-.3px', lineHeight: 1.1 }}>{kid.name} !</div>
            </div>
          </div>

          {/* Coin balance badge */}
          <div style={{
            background: 'rgba(255,255,255,.22)', backdropFilter: 'blur(10px)',
            borderRadius: '18px', padding: '10px 16px',
            border: '1.5px solid rgba(255,255,255,.4)', textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,.15)',
          }}>
            <span style={{ fontSize: '22px', fontFamily: EF, display: 'block', lineHeight: 1 }}>🪙</span>
            <div style={{ fontWeight: 900, fontSize: '18px', color: headerText, lineHeight: 1.1 }}>₪{kid.earned}</div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,.78)', fontWeight: 600 }}>מטבעות</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', position: 'relative', zIndex: 1 }}>
          {[
            { icon: '✅', v: done,       l: 'הושלמו',  color: t.success  || '#00C853' },
            { icon: '📌', v: todo,       l: 'לביצוע',  color: t.secondary },
            { icon: '🔥', v: kid.streak, l: 'סטריק',   color: t.warning || '#FF9800' },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, background: 'rgba(255,255,255,.18)', borderRadius: '14px',
              padding: '9px 4px', textAlign: 'center',
              border: '1px solid rgba(255,255,255,.28)',
              backdropFilter: 'blur(6px)',
            }}>
              <span style={{ fontSize: '16px', fontFamily: EF, display: 'block', lineHeight: 1 }}>{s.icon}</span>
              <div style={{ fontWeight: 900, fontSize: '18px', color: headerText, lineHeight: 1.1, marginTop: '1px' }}>{s.v}</div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,.78)', fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ════ GOAL CARD ════ */}
      <div style={{ padding: '0 14px 14px', position: 'relative', zIndex: 1 }}>
        <div style={{
          background: isDark(t) ? 'rgba(255,255,255,.09)' : 'rgba(255,255,255,.93)',
          borderRadius: '22px', padding: '16px 18px',
          boxShadow: isDark(t) ? '0 4px 24px rgba(0,0,0,.35)' : '0 6px 24px rgba(0,0,0,.12)',
          border: isDark(t) ? '1px solid rgba(255,255,255,.14)' : 'none',
          backdropFilter: isDark(t) ? 'blur(12px)' : 'none',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '10px', color: textSub(t), fontWeight: 700, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '.5px' }}>🎯 המטרה שלי</div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: textOn(t) }}>
                <span style={{ fontFamily: EF }}>{kid.goalIcon}</span> {kid.goalName}
              </div>
            </div>
            <div style={{ textAlign: 'center', background: t.primary + '18', borderRadius: '12px', padding: '7px 12px', border: `1px solid ${t.primary}30` }}>
              <div style={{ fontWeight: 900, fontSize: '18px', color: t.primary }}>₪{Math.max(0, kid.goalAmount - kid.earned)}</div>
              <div style={{ fontSize: '9px', color: textSub(t), fontWeight: 700 }}>נשאר</div>
            </div>
          </div>

          <GameBar value={pct} t={t} label={pct >= 100 ? '🎉 הושג!' : pct >= 75 ? '🚀 כמעט!' : '⭐ מתקדם!'} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <Stars filled={starsEarned} total={5} />
            <div style={{ fontSize: '12px', fontWeight: 800, color: t.primary }}>₪{kid.earned} / ₪{kid.goalAmount}</div>
          </div>

          {/* Encouragement pill */}
          <div style={{
            marginTop: '10px', padding: '8px 14px',
            background: `${t.primary}18`,
            borderRadius: '50px', border: `1px solid ${t.primary}28`,
            fontSize: '12px', fontWeight: 700, color: t.primary, textAlign: 'center',
          }}>{msg}</div>
        </div>
      </div>

      {/* ════ TASKS SHEET ════ */}
      <div style={{
        background: sheetBg, borderTopLeftRadius: '28px', borderTopRightRadius: '28px',
        padding: '6px 14px 24px', minHeight: '260px', position: 'relative', zIndex: 1,
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 10px' }}>
          <div style={{ width: '38px', height: '4px', background: 'rgba(0,0,0,.12)', borderRadius: '2px' }} />
        </div>

        {/* TODO */}
        {todoTasks.length > 0 && (
          <TaskSection icon="📌" label="לביצוע" count={todoTasks.length} color={t.secondary} t={t}>
            {todoTasks.map((task, i) => (
              <TaskRow key={task.id} task={task} t={t}
                isCompleting={completingId === task.id}
                justDone={justDoneId === task.id}
                onComplete={() => handleComplete(task)}
                delay={i * .06}
              />
            ))}
          </TaskSection>
        )}

        {/* PENDING */}
        {pendingTasks.length > 0 && (
          <TaskSection icon="⏳" label="ממתין לאישור" count={pendingTasks.length} color={t.warning || '#FF9800'} t={t}>
            {pendingTasks.map(task => <TaskRow key={task.id} task={task} t={t} pending />)}
          </TaskSection>
        )}

        {/* DONE */}
        {doneTasks.length > 0 && (
          <TaskSection icon="✅" label="הושלמו" count={doneTasks.length} color={t.success || '#00C853'} t={t}>
            {doneTasks.map(task => <TaskRow key={task.id} task={task} t={t} done />)}
          </TaskSection>
        )}

        {/* REJECTED */}
        {rejectedTasks.length > 0 && (
          <TaskSection icon="❌" label="נדחו" count={rejectedTasks.length} color={t.danger} t={t}>
            {rejectedTasks.map(task => <TaskRow key={task.id} task={task} t={t} rejected />)}
          </TaskSection>
        )}

        {kid.tasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <span style={{ fontSize: '56px', fontFamily: EF, display: 'block', marginBottom: '10px', animation: 'floatB 3s ease-in-out infinite' }}>🎮</span>
            <div style={{ fontWeight: 800, fontSize: '16px', color: t.primary, marginBottom: '5px' }}>אין משימות עדיין</div>
            <div style={{ fontSize: '12px', color: textSub(t) }}>ההורים יוסיפו משימות בקרוב!</div>
          </div>
        )}

        {/* Quick badge peek */}
        {doneTasks.length >= 1 && (
          <div style={{ marginTop: '18px', background: isDark(t) ? 'rgba(255,255,255,.07)' : '#fff', borderRadius: '16px', padding: '13px', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: t.primary }}>🏅 התגים שלי</div>
              <button onClick={() => onNav('badges')} style={{ background: 'none', border: 'none', fontSize: '11px', color: t.primary, fontWeight: 700, cursor: 'pointer', fontFamily: "'Heebo',sans-serif" }}>הצג הכל →</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }} className="scroll-hide">
              {[
                { icon: '⚡', name: 'ראשון!',  earned: doneTasks.length >= 1 },
                { icon: '🧹', name: 'ניקיון',  earned: doneTasks.length >= 3 },
                { icon: '📚', name: 'לימוד',   earned: doneTasks.length >= 5 },
                { icon: '🔥', name: '7 ימים',  earned: kid.streak >= 7 },
                { icon: '💎', name: 'כוכב',    earned: pct >= 100 },
              ].map((b, i) => (
                <div key={i} style={{
                  textAlign: 'center', minWidth: '58px', flexShrink: 0,
                  background: b.earned ? `linear-gradient(145deg, #FFF9C4, #FFFDE7)` : (isDark(t) ? 'rgba(255,255,255,.06)' : '#F8F8F8'),
                  borderRadius: '14px', padding: '8px 6px',
                  border: b.earned ? `2px solid rgba(255,193,7,.55)` : '2px solid transparent',
                  opacity: b.earned ? 1 : .55, transition: 'all .3s',
                  animation: b.earned ? `badgePop .4s ease-out ${i * .1}s both` : 'none',
                }}>
                  <span style={{ fontSize: '22px', fontFamily: EF, filter: b.earned ? 'none' : 'grayscale(1)' }}>{b.icon}</span>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: b.earned ? t.primary : textSub(t), marginTop: '3px' }}>{b.name}</div>
                  {b.earned && <div style={{ fontSize: '8px', color: t.success || '#00C853', fontWeight: 700 }}>✓</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Task Section Header ──────────────────── */
const TaskSection = ({ icon, label, count, color, t, children }) => (
  <div style={{ marginBottom: '14px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
      <span style={{ fontFamily: EF, fontSize: '14px' }}>{icon}</span>
      <span style={{ fontWeight: 800, fontSize: '12px', color }}>{label}</span>
      <div style={{ background: color + '22', borderRadius: '50px', padding: '1px 8px', fontSize: '10px', fontWeight: 700, color }}>{count}</div>
    </div>
    {children}
  </div>
);

/* ── Task Row ────────────────────────────── */
const TaskRow = ({ task, t, onComplete, isCompleting, justDone, pending, done, rejected, delay = 0 }) => {
  const status = done ? 'done' : pending ? 'pending' : rejected ? 'rejected' : 'todo';
  const stripe = { done: t.success||'#00C853', pending: t.warning||'#FF9800', rejected: t.danger||'#FF3D57', todo: t.secondary }[status];
  const statusText = { done: '✅ הושלם!', pending: '⏳ ממתין לאישור הורה', rejected: '❌ נדחה — נסה שוב', todo: '' }[status];
  const statusIcon = { done: '✅', pending: '⏳', rejected: '❌', todo: '📌' }[status];

  return (
    <div className={`game-task-card anim-in ${done ? 'done' : ''} ${justDone ? 'anim-wiggle' : ''}`}
      style={{ marginBottom: '8px', animationDelay: `${delay}s`, opacity: (done || rejected) ? .8 : 1 }}>

      {/* Left stripe */}
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '5px', background: stripe, borderRadius: '0 20px 20px 0' }} />

      <div style={{ padding: '12px 18px 12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Icon */}
        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: stripe + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontFamily: EF, flexShrink: 0 }}>
          {statusIcon}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', marginBottom: '2px' }}>
            <span style={{ fontWeight: 800, fontSize: '14px', color: '#1A1A2E' }}>{task.title}</span>
            {task.isDaily && <span className="daily-badge">🌅 יומי</span>}
          </div>
          {task.desc && <div style={{ fontSize: '11px', color: '#999', marginBottom: '2px' }}>{task.desc}</div>}
          {statusText && <div style={{ fontSize: '11px', fontWeight: 700, color: stripe }}>{statusText}</div>}
        </div>

        {/* Reward + action */}
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 900, fontSize: '14px', color: '#FF6B00', marginBottom: '5px', justifyContent: 'flex-end' }}>
            <span style={{ fontFamily: EF, fontSize: '14px' }}>🪙</span>
            <span>₪{task.reward}</span>
          </div>
          {status === 'todo' && (
            <button
              onClick={onComplete}
              disabled={isCompleting}
              className="game-btn-complete"
              style={{
                background: isCompleting ? '#ccc' : t.successGrad,
                boxShadow: isCompleting ? 'none' : t.successShadow,
              }}
            >
              {isCompleting ? '⏳' : '✓ סיימתי!'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════
   BADGES SCREEN
════════════════════════════════════════════════════════ */
export function BadgesScreen({ t, kid }) {
  if (!kid) return null;
  const done  = kid.tasks.filter(x => x.status === 'done').length;
  const pct   = Math.min(100, Math.round((kid.earned / kid.goalAmount) * 100));
  const badges = ALL_BADGES(done, pct, kid.streak, kid.earned);
  const earnedCount = badges.filter(b => b.earned).length;
  const sheetBg = t.sheetBg || '#FFFBF0';

  // Badge colors per index
  const badgeColors = ['#FF5722','#7C4DFF','#00BCD4','#00C853','#FF9800','#E91E63','#2196F3','#4CAF50','#FF5722','#9C27B0','#03A9F4','#FFC107'];

  return (
    <div style={{ background: t.bgGrad, minHeight: '100%', fontFamily: "'Heebo',sans-serif" }}>

      {/* Header */}
      <div style={{ padding: '20px 18px 16px', position: 'relative', overflow: 'hidden' }}>
        <FloatDeco t={t} />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <span className="anim-float" style={{ fontSize: '52px', fontFamily: EF, display: 'block', marginBottom: '6px' }}>🏆</span>
          <h2 style={{ fontWeight: 900, fontSize: '22px', color: '#fff', margin: 0, letterSpacing: '-.3px' }}>התגים שלי</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,.82)', margin: '4px 0 12px' }}>
            {earnedCount} מתוך {badges.length} הושגו
          </p>
          {/* Star row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
            {badges.map((_, i) => (
              <span key={i} style={{ fontSize: '14px', fontFamily: EF, opacity: i < earnedCount ? 1 : .2, transition: `opacity .3s ${i * .04}s` }}>⭐</span>
            ))}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ padding: '0 14px 14px', position: 'relative', zIndex: 1 }}>
        <div style={{
          background: isDark(t) ? 'rgba(255,255,255,.10)' : 'rgba(255,255,255,.94)',
          borderRadius: '18px', padding: '14px 16px',
          boxShadow: t.cardShadow, backdropFilter: isDark(t) ? 'blur(10px)' : 'none',
          border: isDark(t) ? '1px solid rgba(255,255,255,.14)' : 'none',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: textSub(t), marginBottom: '7px' }}>התקדמות כללית</div>
          <GameBar value={Math.round(earnedCount / badges.length * 100)} t={t} height={18} />
          <div style={{ fontSize: '12px', fontWeight: 800, color: t.primary, textAlign: 'center', marginTop: '5px' }}>
            {earnedCount}/{badges.length} תגים הושגו
          </div>
        </div>
      </div>

      {/* Badge grid */}
      <div style={{ background: sheetBg, borderTopLeftRadius: '28px', borderTopRightRadius: '28px', padding: '14px 14px 24px', zIndex: 1, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0 0 12px' }}>
          <div style={{ width: '38px', height: '4px', background: 'rgba(0,0,0,.12)', borderRadius: '2px' }} />
        </div>

        <div className="badge-grid">
          {badges.map((b, i) => (
            <div key={i} className={`badge-card ${b.earned ? 'earned' : ''} anim-in`}
              style={{ animationDelay: `${i * 0.04}s` }}>
              {/* Color top stripe */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: b.earned ? badgeColors[i % 12] : '#ddd', borderRadius: '18px 18px 0 0', transition: 'background .3s' }} />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: b.earned ? badgeColors[i % 12] : '#eee', borderRadius: '18px 18px 0 0' }} />

              <div style={{ marginTop: '8px', fontSize: '30px', fontFamily: EF, lineHeight: 1, marginBottom: '6px', filter: b.earned ? 'none' : 'grayscale(1)', transition: 'filter .3s', animation: b.earned ? `badgePop .4s ease-out ${i * .08}s both` : 'none' }}>
                {b.icon}
              </div>
              <div style={{ fontSize: '10px', fontWeight: 800, color: b.earned ? textOn(t) : '#aaa', lineHeight: 1.2, marginBottom: '4px' }}>{b.name}</div>
              {b.earned
                ? <div style={{ fontSize: '9px', color: t.success || '#00C853', fontWeight: 800 }}>✓ הושג!</div>
                : <div style={{ fontSize: '9px', color: '#bbb', fontWeight: 600 }}>טרם הושג</div>
              }
            </div>
          ))}
        </div>

        {/* Streak calendar */}
        <div style={{ marginTop: '16px', background: isDark(t) ? 'rgba(255,255,255,.07)' : '#fff', borderRadius: '18px', padding: '14px', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <div style={{ fontWeight: 800, fontSize: '13px', color: t.warning || '#FF9800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontFamily: EF }}>🔥</span> סטריק שבועי — {kid.streak} ימים!
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            {['א','ב','ג','ד','ה','ו','ש'].map((d, i) => {
              const active = i < kid.streak;
              return (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    height: '40px', borderRadius: '10px',
                    background: active ? t.progressGrad : (isDark(t) ? 'rgba(255,255,255,.08)' : '#F0F0F0'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontFamily: EF,
                    boxShadow: active ? t.btnShadow : 'none',
                    transition: 'all .3s',
                    animation: active ? `badgePop .4s ease-out ${i * .07}s both` : 'none',
                  }}>
                    {active ? '🔥' : '·'}
                  </div>
                  <div style={{ fontSize: '9px', color: textSub(t), marginTop: '3px', fontWeight: 600 }}>{d}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SHOP SCREEN
════════════════════════════════════════════════════════ */
export function ShopScreen({ t, kid }) {
  const [bought,   setBought]   = useState([]);
  const [flash,    setFlash]    = useState(null);
  const [showRain, setShowRain] = useState(false);
  if (!kid) return null;

  const spent     = bought.reduce((s, id) => { const it = SHOP_ITEMS.find(i => i.id === id); return s + (it?.price || 0); }, 0);
  const available = kid.earned - spent;
  const sheetBg   = t.sheetBg || '#FFFBF0';

  const buy = (item) => {
    if (available < item.price) return;
    setBought(b => [...b, item.id]);
    setFlash(item);
    setShowRain(true);
    setTimeout(() => { setFlash(null); setShowRain(false); }, 1500);
  };

  const itemColors = [
    { top: '#FF5722', btn: 'linear-gradient(135deg,#FF5722,#FF9800)' },
    { top: '#00BCD4', btn: 'linear-gradient(135deg,#00BCD4,#26C6DA)' },
    { top: '#7C4DFF', btn: 'linear-gradient(135deg,#7C4DFF,#B388FF)' },
    { top: '#E91E63', btn: 'linear-gradient(135deg,#E91E63,#F48FB1)' },
    { top: '#00C853', btn: 'linear-gradient(135deg,#00C853,#69F0AE)' },
    { top: '#FF9800', btn: 'linear-gradient(135deg,#FF9800,#FFB74D)' },
    { top: '#2196F3', btn: 'linear-gradient(135deg,#2196F3,#64B5F6)' },
    { top: '#9C27B0', btn: 'linear-gradient(135deg,#9C27B0,#CE93D8)' },
  ];

  return (
    <div style={{ background: t.bgGrad, minHeight: '100%', fontFamily: "'Heebo',sans-serif" }}>
      <CoinRain active={showRain} />

      {/* Purchase modal */}
      {flash && (
        <div className="modal-overlay">
          <div className="anim-pop" style={{
            background: isDark(t) ? 'rgba(30,10,60,.95)' : '#fff',
            borderRadius: '28px', padding: '36px 48px', textAlign: 'center',
            boxShadow: '0 24px 64px rgba(0,0,0,.35)',
            border: isDark(t) ? '1px solid rgba(255,255,255,.15)' : 'none',
          }}>
            <span style={{ fontSize: '72px', fontFamily: EF, display: 'block', animation: 'starBurst .5s ease-out' }}>{flash.icon}</span>
            <div style={{ fontWeight: 900, fontSize: '22px', color: t.primary, marginTop: '12px' }}>נקנה!</div>
            <div style={{ fontSize: '14px', color: textSub(t), marginTop: '4px', fontWeight: 600 }}>{flash.name}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '8px' }}>
              {[1,2,3].map(i => <span key={i} style={{ fontSize: '24px', fontFamily: EF, animationDelay: `${i * .12}s` }} className="anim-pop">⭐</span>)}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '20px 18px 16px', position: 'relative', overflow: 'hidden' }}>
        <FloatDeco t={t} />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <span className="anim-float" style={{ fontSize: '50px', fontFamily: EF, display: 'block', marginBottom: '6px' }}>🏪</span>
          <h2 style={{ fontWeight: 900, fontSize: '22px', color: '#fff', margin: 0, letterSpacing: '-.3px' }}>החנות שלי</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,.82)', margin: '4px 0 0' }}>מה תרצה לקנות?</p>
        </div>
      </div>

      {/* Balance card */}
      <div style={{ padding: '0 14px 14px', position: 'relative', zIndex: 1 }}>
        <div style={{
          background: isDark(t) ? 'rgba(255,255,255,.10)' : 'rgba(255,255,255,.94)',
          borderRadius: '22px', padding: '16px 18px',
          boxShadow: t.cardShadow, backdropFilter: isDark(t) ? 'blur(10px)' : 'none',
          border: isDark(t) ? '1px solid rgba(255,255,255,.14)' : 'none',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '10px', color: textSub(t), fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>יתרה לקנייה</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '28px', fontFamily: EF }}>🪙</span>
                <span style={{ fontWeight: 900, fontSize: '28px', color: t.primary, letterSpacing: '-.5px' }}>₪{available}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: textSub(t), marginBottom: '2px' }}>צברת: <strong style={{ color: textOn(t) }}>₪{kid.earned}</strong></div>
              <div style={{ fontSize: '11px', color: textSub(t) }}>קנית: <strong style={{ color: textOn(t) }}>₪{spent}</strong></div>
            </div>
          </div>

          {available < 5 && (
            <div style={{ marginTop: '10px', padding: '9px 14px', background: `${t.primary}14`, borderRadius: '12px', border: `1px solid ${t.primary}25`, fontSize: '12px', color: t.primary, fontWeight: 700, textAlign: 'center' }}>
              💡 השלם עוד משימות כדי לצבור מטבעות!
            </div>
          )}
        </div>
      </div>

      {/* Shop grid */}
      <div style={{ background: sheetBg, borderTopLeftRadius: '28px', borderTopRightRadius: '28px', padding: '8px 14px 28px', zIndex: 1, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 12px' }}>
          <div style={{ width: '38px', height: '4px', background: 'rgba(0,0,0,.12)', borderRadius: '2px' }} />
        </div>

        <div style={{ fontWeight: 800, fontSize: '14px', color: t.primary, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontFamily: EF }}>🎁</span> מה אפשר לקנות?
        </div>

        <div className="shop-grid">
          {SHOP_ITEMS.map((item, idx) => {
            const canBuy    = available >= item.price;
            const wasBought = bought.includes(item.id);
            const col       = itemColors[idx % 8];
            return (
              <div key={item.id}
                className={`shop-card ${canBuy && !wasBought ? 'available' : ''} anim-in`}
                onClick={() => !wasBought && canBuy && buy(item)}
                style={{ animationDelay: `${idx * .05}s`, opacity: canBuy || wasBought ? 1 : .62 }}>

                {/* Color top stripe */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: wasBought ? '#00C853' : col.top, borderRadius: '20px 20px 0 0' }} />

                <div style={{ marginTop: '8px', fontSize: '40px', fontFamily: EF, display: 'block', marginBottom: '8px', animation: canBuy && !wasBought ? 'floatB 3s ease-in-out infinite' : 'none' }}>
                  {item.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#1A1A2E', marginBottom: '5px' }}>{item.name}</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'center', marginBottom: '10px' }}>
                  <span style={{ fontFamily: EF, fontSize: '13px' }}>🪙</span>
                  <span style={{ fontWeight: 900, fontSize: '15px', color: canBuy ? col.top : '#aaa' }}>₪{item.price}</span>
                </div>

                <button
                  style={{
                    width: '100%', padding: '8px 4px', border: 'none', borderRadius: '50px',
                    background: wasBought
                      ? 'linear-gradient(135deg,#E8F5E9,#C8E6C9)'
                      : canBuy ? col.btn : '#EFEFEF',
                    color: wasBought ? '#00C853' : canBuy ? '#fff' : '#bbb',
                    fontFamily: "'Heebo',sans-serif", fontSize: '12px', fontWeight: 800,
                    cursor: canBuy && !wasBought ? 'pointer' : 'default',
                    boxShadow: canBuy && !wasBought ? `0 4px 14px ${col.top}44` : 'none',
                    transition: 'all .15s',
                  }}
                >
                  {wasBought ? '✅ נקנה!' : canBuy ? '🛒 קנה!' : '🔒 צריך יותר מטבעות'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
