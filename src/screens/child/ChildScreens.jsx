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
import { SHOP_ITEMS, ALL_BADGES } from '../../data.js';

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
            {task.dueDate && !task.isDaily && (() => {
              const due  = new Date(task.dueDate);
              const now  = new Date();
              const days = Math.ceil((due - now) / 86400000);
              const over = days < 0;
              const soon = days >= 0 && days <= 2;
              return (
                <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 50, fontWeight: 700, border: '1px solid', background: over ? '#FFEBEE' : soon ? '#FFF8E1' : '#E8F5E9', color: over ? '#C62828' : soon ? '#E65100' : '#2E7D32', borderColor: over ? '#FFCDD2' : soon ? '#FFE0B2' : '#C8E6C9' }}>
                  📅 {over ? `פג ${Math.abs(days)}d` : days === 0 ? 'היום!' : `${days}d`}
                </span>
              );
            })()}
          </div>
          {task.desc && <div style={{ fontSize: 11, color: '#7B5EA7', marginTop: 2, lineHeight: 1.3 }}>{task.desc}</div>}
          <div style={{ fontSize: 11, fontWeight: 700, color: st.color, marginTop: 3 }}>{st.label}</div>
          {/* Parent message — shown on done tasks */}
          {task.status === 'done' && task.parentMessage && (
            <div style={{ marginTop: 5, padding: '5px 9px', background: 'linear-gradient(135deg,#FFF9C4,#FFF3E0)', borderRadius: 10, border: '1px solid #FFE082', display: 'flex', alignItems: 'flex-start', gap: 5 }}>
              <span style={{ fontSize: 12, fontFamily: EF, flexShrink: 0 }}>💬</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#E65100', lineHeight: 1.3 }}>{task.parentMessage}</span>
            </div>
          )}
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

/* ── Level system ──────────────────────────────── */
const LEVEL_THRESHOLDS = [0, 10, 25, 50, 100, 175, 275, 400, 560, 750, 1000];
const LEVEL_NAMES = ['מתחיל','חוקר','חרוץ','מיומן','גיבור','אלוף','מאסטר','אגדה','על-אנושי','אלמותי'];
const LEVEL_ICONS = ['🌱','🔍','⚡','🛡️','💪','🏆','🎯','🌟','🚀','👑'];
function getLevel(te) { let l=1; for(let i=1;i<LEVEL_THRESHOLDS.length;i++){if(te>=LEVEL_THRESHOLDS[i])l=i+1;else break;} return Math.min(l,10); }
function getLevelPct(te) { const l=getLevel(te); if(l>=10)return 100; const f=LEVEL_THRESHOLDS[l-1],t=LEVEL_THRESHOLDS[l]; return Math.round(((te-f)/(t-f))*100); }
function getNextCoins(te) { const l=getLevel(te); return l>=10?0:LEVEL_THRESHOLDS[l]-te; }

function getWeeklyEarnings(tasks,weeks=6){
  const now=new Date(),result=[];
  for(let w=weeks-1;w>=0;w--){
    const s=new Date(now); s.setDate(s.getDate()-(w+1)*7);
    const e=new Date(now); e.setDate(e.getDate()-w*7);
    const label=w===0?'השבוע':w===1?'שבוע שעבר':`לפני ${w}`;
    const sum=tasks.filter(t=>t.status==='done'&&t.createdAt).filter(t=>{const d=new Date(t.createdAt);return d>=s&&d<e;}).reduce((s,t)=>s+t.reward,0);
    result.push({label,sum});
  }
  return result;
}

function EarningsChart({tasks,primary}){
  const weeks=getWeeklyEarnings(tasks,6);
  const maxVal=Math.max(...weeks.map(w=>w.sum),1);
  return (
    <div style={{background:'#fff',borderRadius:18,padding:'12px 14px',boxShadow:'0 3px 12px rgba(0,0,0,.07)',marginBottom:8}}>
      <div style={{fontWeight:800,fontSize:12,color:primary,marginBottom:10,display:'flex',alignItems:'center',gap:5}}>
        <span style={{fontFamily:EF}}>📊</span> היסטוריית הרווחים
      </div>
      <div style={{display:'flex',alignItems:'flex-end',gap:5,height:64}}>
        {weeks.map((w,i)=>{
          const pct=w.sum/maxVal; const isLast=i===weeks.length-1;
          return (
            <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
              <div style={{fontSize:9,fontWeight:700,color:isLast?primary:'#aaa',height:11,lineHeight:'11px',whiteSpace:'nowrap'}}>
                {w.sum>0?`₪${w.sum}`:''}
              </div>
              <div style={{width:'100%',borderRadius:'4px 4px 0 0',height:`${Math.max(pct*44,w.sum>0?3:2)}px`,background:isLast?`linear-gradient(180deg,${primary},${primary}77)`:`${primary}28`,transition:'height .5s',minHeight:2}}/>
            </div>
          );
        })}
      </div>
      <div style={{display:'flex',gap:5,marginTop:3}}>
        {weeks.map((w,i)=>(
          <div key={i} style={{flex:1,textAlign:'center',fontSize:8,color:i===weeks.length-1?primary:'#bbb',fontWeight:i===weeks.length-1?800:500,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{w.label}</div>
        ))}
      </div>
    </div>
  );
}

function LevelBadge({totalEarned,primary,barGrad}){
  const lvl=getLevel(totalEarned),pct=getLevelPct(totalEarned),next=getNextCoins(totalEarned);
  return (
    <div style={{background:'#fff',borderRadius:18,padding:'11px 14px',boxShadow:'0 3px 12px rgba(0,0,0,.07)',marginBottom:8}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:38,height:38,borderRadius:'50%',background:`linear-gradient(135deg,${primary},${primary}77)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:19,fontFamily:EF,flexShrink:0,boxShadow:`0 3px 10px ${primary}44`}}>
          {LEVEL_ICONS[lvl-1]}
        </div>
        <div style={{flex:1}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
            <div style={{fontWeight:900,fontSize:12,color:'#1A0033'}}>רמה {lvl} — {LEVEL_NAMES[lvl-1]}</div>
            {lvl<10?<div style={{fontSize:9,color:'#aaa'}}>עוד ₪{next}</div>:<div style={{fontSize:10,color:primary,fontWeight:800}}>👑 מקסימלי!</div>}
          </div>
          <div style={{height:6,borderRadius:50,background:`${primary}18`,overflow:'hidden'}}>
            <div style={{height:'100%',borderRadius:50,background:barGrad,width:`${pct}%`,transition:'width .8s'}}/>
          </div>
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

  const isGame     = !!t.isGame;
  const hdrText    = isGame ? '#fff'                       : (t.text      || '#1A1A2E');
  const hdrSubText = isGame ? 'rgba(255,255,255,.72)'      : (t.textLight || '#888');
  const hdrMuted   = isGame ? 'rgba(255,255,255,.68)'      : (t.textLight || '#aaa');
  const statBg     = isGame ? 'rgba(255,255,255,.18)'      : 'rgba(0,0,0,.06)';
  const statBorder = isGame ? '1px solid rgba(255,255,255,.22)' : '1px solid rgba(0,0,0,.08)';
  const coinBg     = isGame ? 'rgba(255,255,255,.2)'       : `${t.primary || '#7C4DFF'}18`;
  const coinBorder = isGame ? '1.5px solid rgba(255,255,255,.3)' : `1.5px solid ${t.primary || '#7C4DFF'}33`;

  const pct   = Math.round(Math.min(100, (kid.earned / kid.goalAmount) * 100));
  const stars = Math.min(5, Math.floor(pct / 20));
  const pendT    = kid.tasks.filter(t => t.status === 'pending');
  const doneT    = kid.tasks.filter(t => t.status === 'done');
  const rejT     = kid.tasks.filter(t => t.status === 'rejected');
  // Split todo into sub-groups
  const todoAll  = kid.tasks.filter(t => t.status === 'todo');
  const todoDaily  = todoAll.filter(t => t.isDaily);
  const todoDue    = todoAll.filter(t => !t.isDaily && t.dueDate);
  const todoRegular= todoAll.filter(t => !t.isDaily && !t.dueDate);
  const todoT    = todoAll; // keep for stats

  const encourage = pct >= 95 ? '🎉 כמעט הגעת למטרה!'
    : pct >= 75 ? '🚀 כמעט שם! המשך!'
    : pct >= 40 ? '💪 כל הכבוד, ממשיך!'
    : pct >= 10 ? '⭐ התחלה נהדרת!'
    : `!שלום ${kid.name} 👋 בוא נתחיל`;

  // Derive gradient from t, fallback to violet→teal
  const barGrad     = t.progressGrad || 'linear-gradient(90deg,#7C4DFF,#00BCD4)';
  const primary     = t.primary || '#7C4DFF';
  const totalEarned = kid.totalEarned ?? kid.earned;

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
            <div style={{ fontSize: 12, color: hdrSubText, fontWeight: 600, marginBottom: 2 }}>שלום, {kid.name}! 👋</div>
            <div style={{ fontSize: 21, fontWeight: 900, color: hdrText, letterSpacing: '-.3px', lineHeight: 1.15 }}>המשימות שלי</div>
          </div>
          <div style={{ background: coinBg, backdropFilter: 'blur(12px)', borderRadius: 16, padding: '8px 13px', border: coinBorder, textAlign: 'center' }}>
            <span style={{ fontSize: 22, fontFamily: EF, display: 'block', lineHeight: 1 }}>🪙</span>
            <div style={{ fontWeight: 900, fontSize: 16, color: '#FFD54F', lineHeight: 1.1 }}>₪{kid.earned}</div>
            <div style={{ fontSize: 9, color: hdrSubText, fontWeight: 600 }}>מטבעות</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 6, position: 'relative', zIndex: 1 }}>
          {[
            { icon: '✅', v: doneT.length, l: 'הושלמו',  c: '#00E676' },
            { icon: '📌', v: todoT.length, l: 'לביצוע',  c: '#93C5FD' },
            { icon: '🔥', v: kid.streak,   l: 'סטריק',   c: '#FFD54F' },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, background: statBg, borderRadius: 12, padding: '7px 4px', textAlign: 'center', border: statBorder }}>
              <span style={{ fontSize: 14, fontFamily: EF, display: 'block', lineHeight: 1, marginBottom: 2 }}>{s.icon}</span>
              <div style={{ fontWeight: 900, fontSize: 16, color: s.c, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 9, color: hdrMuted, fontWeight: 600, marginTop: 1 }}>{s.l}</div>
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
        {/* Level + Chart */}
        <LevelBadge totalEarned={totalEarned} primary={primary} barGrad={barGrad} />
        <EarningsChart tasks={kid.tasks} primary={primary} />

        {kid.tasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '36px 20px' }}>
            <span style={{ fontSize: 52, fontFamily: EF, display: 'block', marginBottom: 10 }}>🎮</span>
            <div style={{ fontWeight: 800, fontSize: 16, color: primary, marginBottom: 5 }}>אין משימות עדיין</div>
            <div style={{ fontSize: 12, color: '#7B5EA7' }}>ההורים יוסיפו משימות בקרוב!</div>
          </div>
        )}

        {/* ── Pending approval ── */}
        {pendT.length > 0 && <>
          <Sec icon="⏳" label="ממתין לאישור הורה" count={pendT.length} color="#FF9800" />
          {pendT.map(task => <TaskCard key={task.id} task={task} />)}
        </>}

        {/* ── Due date tasks (urgent) ── */}
        {todoDue.length > 0 && <>
          <Sec icon="📅" label="עם תאריך יעד" count={todoDue.length} color="#E65100" />
          {todoDue.map(task => <TaskCard key={task.id} task={task} isCompleting={completingId === task.id} justDone={justDoneId === task.id} onComplete={() => handleComplete(task)} />)}
        </>}

        {/* ── Daily routine ── */}
        {todoDaily.length > 0 && <>
          <Sec icon="🌅" label="שגרה יומית" count={todoDaily.length} color={primary} />
          {todoDaily.map(task => <TaskCard key={task.id} task={task} isCompleting={completingId === task.id} justDone={justDoneId === task.id} onComplete={() => handleComplete(task)} />)}
        </>}

        {/* ── Regular tasks ── */}
        {todoRegular.length > 0 && <>
          <Sec icon="📌" label="משימות" count={todoRegular.length} color="#5C6BC0" />
          {todoRegular.map(task => <TaskCard key={task.id} task={task} isCompleting={completingId === task.id} justDone={justDoneId === task.id} onComplete={() => handleComplete(task)} />)}
        </>}

        {/* ── Completed ── */}
        {doneT.length > 0 && <>
          <Sec icon="✅" label="הושלמו היום" count={doneT.length} color="#00C853" />
          {doneT.map(task => <TaskCard key={task.id} task={task} />)}
        </>}

        {/* ── Rejected ── */}
        {rejT.length > 0 && <>
          <Sec icon="❌" label="נדחו — נסה שוב" count={rejT.length} color="#FF3D57" />
          {rejT.map(task => <TaskCard key={task.id} task={task} />)}
        </>}

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

  const isGame     = !!t.isGame;
  const hdrText    = isGame ? '#fff' : (t.text || '#1A1A2E');
  const hdrSubText = isGame ? 'rgba(255,255,255,.75)' : (t.textLight || '#888');
  const done   = kid.tasks.filter(x => x.status === 'done').length;
  const pct    = Math.round(Math.min(100, (kid.earned / kid.goalAmount) * 100));
  const badges = ALL_BADGES(done, pct, kid.streak, kid.earned);
  const earned = badges.filter(b => b.earned).length;
  const primary     = t.primary || '#7C4DFF';
  const barGrad     = t.progressGrad || 'linear-gradient(90deg,#7C4DFF,#00BCD4)';
  const totalEarned = kid.totalEarned ?? kid.earned;

  return (
    <div style={{ background: t.bgGrad, minHeight: '100%', fontFamily: "'Heebo',sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '18px 16px 14px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <span style={{ position:'absolute', top:6,  left:14, fontSize:15, fontFamily:EF, opacity:.35, animation:'floatB 3.5s ease-in-out infinite' }}>🏅</span>
        <span style={{ position:'absolute', top:22, left:60, fontSize:12, fontFamily:EF, opacity:.28, animation:'floatB 4.2s ease-in-out infinite .8s' }}>⭐</span>
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 48, fontFamily: EF, display: 'block', lineHeight: 1, marginBottom: 5, animation: 'float 3s ease-in-out infinite', filter: 'drop-shadow(0 4px 10px rgba(255,200,0,.45))' }}>🏆</span>
          <div style={{ fontSize: 21, fontWeight: 900, color: hdrText }}>התגים שלי</div>
          <div style={{ fontSize: 12, color: hdrSubText, marginTop: 3 }}>{earned} מתוך {badges.length} הושגו</div>
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
export function ShopScreen({ t, kid }) {
  const [bought,    setBought]    = useState([]);
  const [flashItem, setFlashItem] = useState(null);
  const [showRain,  setShowRain]  = useState(false);

  if (!kid) return null;

  const isGame     = !!t.isGame;
  const hdrText    = isGame ? '#fff' : (t.text || '#1A1A2E');
  const hdrSubText = isGame ? 'rgba(255,255,255,.72)' : (t.textLight || '#888');
  const spent     = bought.reduce((s, id) => { const it = SHOP_ITEMS.find(i => i.id === id); return s + (it?.price || 0); }, 0);
  const available = kid.earned - spent;
  const primary   = t.primary || '#7C4DFF';
  const barGrad   = t.progressGrad || 'linear-gradient(90deg,#7C4DFF,#00BCD4)';

  // Distinct accent per slot — always colored regardless of affordability
  const ACCENTS = ['#7C4DFF','#00BCD4','#FF9800','#E91E63','#4CAF50','#FF5722','#3F51B5','#009688'];

  const buy = item => {
    if (available < item.price || bought.includes(item.id)) return;
    setBought(b => [...b, item.id]);
    setFlashItem(item);
    setShowRain(true);
    setTimeout(() => { setFlashItem(null); setShowRain(false); }, 1600);
  };

  return (
    <div style={{ background: t.bgGrad, minHeight: '100%', fontFamily: "'Heebo',sans-serif", display: 'flex', flexDirection: 'column' }}>
      <CoinRain active={showRain} />

      {/* Flash modal */}
      {flashItem && (
        <div className="modal-overlay">
          <div className="anim-pop" style={{ background: '#fff', borderRadius: 26, padding: '30px 42px', textAlign: 'center', boxShadow: `0 24px 60px ${primary}44, 0 0 0 3px ${primary}22` }}>
            <div style={{ fontSize: 68, fontFamily: EF, animation: 'starBurst .5s ease-out' }}>{flashItem.icon}</div>
            <div style={{ fontWeight: 900, fontSize: 19, color: '#1A0033', marginTop: 9 }}>נקנה! 🎉</div>
            <div style={{ fontSize: 13, color: primary, marginTop: 4, fontWeight: 700 }}>{flashItem.name}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '18px 16px 14px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <span style={{ position:'absolute', top:8,  left:12, fontSize:16, fontFamily:EF, opacity:.32, animation:'floatB 3.5s ease-in-out infinite' }}>🛍️</span>
        <span style={{ position:'absolute', top:22, left:56, fontSize:13, fontFamily:EF, opacity:.26, animation:'floatB 4.3s ease-in-out infinite .9s' }}>⭐</span>
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 46, fontFamily: EF, display: 'block', lineHeight: 1, marginBottom: 5, animation: 'float 3s ease-in-out infinite' }}>🏪</span>
          <div style={{ fontSize: 21, fontWeight: 900, color: hdrText }}>החנות שלי</div>
          <div style={{ fontSize: 12, color: hdrSubText, marginTop: 2 }}>מה תרצה לקנות?</div>
        </div>
      </div>

      {/* Balance card */}
      <div style={{ padding: '0 14px 12px', flexShrink: 0 }}>
        <div style={{ background: 'rgba(255,255,255,.97)', borderRadius: 20, padding: '13px 15px', boxShadow: '0 6px 22px rgba(0,0,0,.14)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, color: '#7B5EA7', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.3px' }}>יתרה לקנייה</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 24, fontFamily: EF }}>🪙</span>
              <span style={{ fontSize: 24, fontWeight: 900, color: primary }}>₪{available}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#7B5EA7', marginBottom: 2 }}>צברת: <strong style={{ color: primary }}>₪{kid.earned}</strong></div>
            <div style={{ fontSize: 11, color: '#7B5EA7' }}>קנית: <strong>₪{spent}</strong></div>
          </div>
        </div>
        {available < 5 && (
          <div style={{ marginTop: 8, padding: '8px 14px', background: 'rgba(255,255,255,.18)', borderRadius: 12, fontSize: 11, color: primary, fontWeight: 700, textAlign: 'center', border: `1px solid ${primary}44` }}>
            💡 השלם עוד משימות כדי לצבור מטבעות!
          </div>
        )}
      </div>

      {/* Shop grid — flex:1, no empty gap */}
      <div style={{ background: t.sheetBg || '#F0EEFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: '10px 14px 28px', flex: 1, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 12px' }}>
          <div style={{ width: 32, height: 4, borderRadius: 2, background: 'rgba(0,0,0,.12)' }}/>
        </div>
        <div style={{ fontWeight: 800, fontSize: 14, color: '#1A0033', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: EF }}>🎁</span> מה אפשר לקנות?
        </div>

        <div className="shop-grid">
          {SHOP_ITEMS.map((item, idx) => {
            const canBuy    = available >= item.price;
            const wasBought = bought.includes(item.id);
            const accent    = ACCENTS[idx % ACCENTS.length];

            return (
              <div key={item.id} className={`shop-card ${canBuy && !wasBought ? 'available' : ''}`}
                onClick={() => buy(item)}
                style={{ cursor: canBuy && !wasBought ? 'pointer' : 'default' }}
              >
                {/* Colored stripe — always shown */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: accent, borderRadius: '20px 20px 0 0' }}/>

                {/* Emoji icon — NO grayscale, just opacity if locked */}
                <div style={{
                  fontSize: 36, fontFamily: EF, display: 'block',
                  marginBottom: 7, marginTop: 5,
                  opacity: canBuy || wasBought ? 1 : .55,
                  animation: canBuy && !wasBought ? 'floatB 3.5s ease-in-out infinite' : 'none',
                }}>{item.icon}</div>

                <div style={{ fontWeight: 700, fontSize: 12, color: '#1A0033', marginBottom: 5 }}>{item.name}</div>

                {/* Price — colored even when locked */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', marginBottom: 9 }}>
                  <span style={{ fontFamily: EF, fontSize: 13 }}>🪙</span>
                  <span style={{ fontWeight: 900, fontSize: 14, color: accent }}>₪{item.price}</span>
                </div>

                <button style={{
                  width: '100%', padding: '8px 4px',
                  border: 'none', borderRadius: 50,
                  background: wasBought ? '#E8F5E9'
                    : canBuy ? `linear-gradient(135deg, ${accent}, ${accent}CC)`
                    : '#F0F0F0',
                  color: wasBought ? '#00C853' : canBuy ? '#fff' : '#999',
                  fontFamily: "'Heebo',sans-serif",
                  fontSize: 11, fontWeight: 800,
                  cursor: canBuy && !wasBought ? 'pointer' : 'default',
                  boxShadow: canBuy && !wasBought ? `0 5px 14px ${accent}44` : 'none',
                }}>
                  {wasBought ? '✅ נקנה!' : canBuy ? '🛒 קנה!' : '🔒 צריך עוד'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
