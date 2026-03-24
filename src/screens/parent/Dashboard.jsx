import { useState } from 'react';
import { ProgressBar, EmptyState } from '../../components/Atoms.jsx';

const EF = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";

const Chip = ({ label, value, color, onClick, badge }) => (
  <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: 'rgba(255,255,255,.22)', borderRadius: '50px', cursor: onClick ? 'pointer' : 'default', position: 'relative', border: badge ? '1.5px solid rgba(255,255,255,.4)' : 'none' }}>
    {badge > 0 && <div style={{ position: 'absolute', top: -5, right: -5, background: '#FF4444', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,.6)' }}>{badge}</div>}
    <span style={{ fontSize: '15px', fontWeight: 900, color: '#fff' }}>{value}</span>
    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,.82)', fontWeight: 500 }}>{label}</span>
  </div>
);

export default function ParentDashboard({ t, kids, onNav, onKidSelect }) {
  const [tab, setTab] = useState('kids');

  const allTasks    = kids.flatMap(k => k.tasks);
  const pending     = allTasks.filter(x => x.status === 'pending').length;
  const done        = allTasks.filter(x => x.status === 'done').length;
  const totalEarned = kids.reduce((s, k) => s + k.earned, 0);

  return (
    <div style={{ background: t.bgGrad, fontFamily: "'Heebo',sans-serif", color: t.text, minHeight: '100%' }}>

      {/* ── Header: compact ─────────────────── */}
      <div style={{ background: t.headerGrad, padding: '14px 18px 16px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -35, left: -35, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />

        {/* Title row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ fontSize: '11px', opacity: .82, fontWeight: 500 }}>שלום, הורים! 👋</div>
            <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-.2px', lineHeight: 1.2 }}>לוח הבקרה</div>
          </div>
          <span style={{ fontSize: '32px', fontFamily: EF, lineHeight: 1 }}>👨‍👩‍👧‍👦</span>
        </div>

        {/* Stat chips inline */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <Chip value={allTasks.length}    label="משימות"   />
          <Chip value={`₪${totalEarned}`} label="הרוויחו"  />
          <Chip value={pending}            label="ממתינים" badge={pending} onClick={pending > 0 ? () => onNav('approvals') : null} />
          <Chip value={done}               label="הושלמו"   />
        </div>

        {/* Quick actions: compact pill row */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '10px', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
          {[
            { l: 'הוסף משימה', icon: '➕', c: 'rgba(255,255,255,.28)', n: 'addTask'  },
            { l: 'הוסף ילד/ה', icon: '👶', c: 'rgba(255,255,255,.22)', n: 'addChild' },
            { l: 'מטרות',      icon: '🎯', c: 'rgba(255,255,255,.22)', n: 'goals'    },
            { l: `אישורים${pending > 0 ? ` (${pending})` : ''}`, icon: '✅', c: 'rgba(255,255,255,.22)', n: 'approvals' },
          ].map((a, i) => (
            <button key={i} onClick={() => onNav(a.n)} style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '5px 11px', borderRadius: '50px',
              background: a.c, color: '#fff',
              border: '1px solid rgba(255,255,255,.3)',
              fontFamily: "'Heebo',sans-serif", fontSize: '11px', fontWeight: 700,
              cursor: 'pointer', whiteSpace: 'nowrap',
              backdropFilter: 'blur(8px)',
            }}>
              <span style={{ fontFamily: EF, fontSize: '13px', lineHeight: 1 }}>{a.icon}</span>
              {a.l}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabs ────────────────────────────── */}
      <div style={{ display: 'flex', padding: '10px 14px 0', gap: '4px' }}>
        {[{ id: 'kids', l: 'הילדים' }, { id: 'tasks', l: 'משימות' }, { id: 'board', l: 'ניקוד' }].map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{
            padding: '5px 13px', borderRadius: '50px', fontFamily: "'Heebo',sans-serif",
            fontSize: '12px', fontWeight: tab === tb.id ? 800 : 500, border: 'none',
            background: tab === tb.id ? t.primary : t.progressBg,
            color:      tab === tb.id ? '#fff' : t.textLight,
            boxShadow:  tab === tb.id ? t.btnShadow : 'none', transition: 'all .15s',
          }}>{tb.l}</button>
        ))}
      </div>

      {/* ── Tab content ─────────────────────── */}
      <div style={{ padding: '8px 14px 20px' }}>

        {/* KIDS */}
        {tab === 'kids' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {kids.length === 0
              ? <EmptyState t={t} icon="👶" title="אין ילדים עדיין" sub="הוסף את הילד הראשון" action="+ הוסף ילד/ה" onAction={() => onNav('addChild')} />
              : kids.map(kid => {
                const pct = Math.round((kid.earned / kid.goalAmount) * 100);
                const kd  = kid.tasks.filter(x => x.status === 'done').length;
                const kp  = kid.tasks.filter(x => x.status === 'pending').length;
                return (
                  <div key={kid.id} className="anim-in"
                    onClick={() => { onKidSelect(kid.id); onNav('kidDetail'); }}
                    style={{ background: '#fff', borderRadius: t.radius, boxShadow: t.shadow, border: t.cardBorder || 'none', padding: '11px 13px', cursor: 'pointer', transition: 'transform .12s, box-shadow .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow=t.btnShadow; }}
                    onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=t.shadow; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '7px' }}>
                      <div style={{ fontSize: '26px', fontFamily: EF, background: t.progressBg, borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {kid.avatar}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '-.1px' }}>{kid.name}</div>
                        <div style={{ fontSize: '11px', color: t.textLight }}>
                          גיל {kid.age} · <span style={{ fontFamily: EF }}>{kid.goalIcon}</span> {kid.goalName}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 900, color: t.primary }}>₪{kid.earned}</div>
                        <div style={{ fontSize: '9px', color: t.textLight }}>/ ₪{kid.goalAmount}</div>
                      </div>
                    </div>
                    <ProgressBar t={t} value={pct} height={6} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {kd > 0 && <span style={{ fontSize: '10px', background: t.secondary+'18', color: t.secondary, padding: '1px 6px', borderRadius: '50px', fontWeight: 700 }}>✅ {kd}</span>}
                        {kp > 0 && <span style={{ fontSize: '10px', background: '#F59E0B18', color: '#92600A', padding: '1px 6px', borderRadius: '50px', fontWeight: 700 }}>⏳ {kp}</span>}
                        <span style={{ fontSize: '10px', color: t.textLight }}>🔥 {kid.streak}d</span>
                      </div>
                      <span style={{ fontSize: '10px', color: t.primary, fontWeight: 700 }}>פרטים ←</span>
                    </div>
                  </div>
                );
              })
            }
            <button onClick={() => onNav('addChild')} style={{
              width: '100%', padding: '8px', background: 'transparent',
              border: `2px dashed ${t.primary}33`, borderRadius: t.radius,
              color: t.primary, fontFamily: "'Heebo',sans-serif",
              fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'background .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = t.primary+'08'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >+ הוסף ילד/ה חדש/ה</button>
          </div>
        )}

        {/* TASKS */}
        {tab === 'tasks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {allTasks.length === 0
              ? <EmptyState t={t} icon="📋" title="אין משימות" action="+ הוסף משימה" onAction={() => onNav('addTask')} />
              : kids.flatMap(kid => kid.tasks.map(task => ({ ...task, kidName: kid.name, kidAvatar: kid.avatar }))).map(task => {
                const s = { done: { c: t.secondary, l: '✅ הושלם' }, pending: { c: '#F59E0B', l: '⏳ ממתין' }, todo: { c: t.textLight, l: '📌 לביצוע' }, rejected: { c: t.danger, l: '❌ נדחה' } }[task.status];
                return (
                  <div key={task.id} style={{ background: '#fff', borderRadius: t.radius, boxShadow: t.shadow, border: t.cardBorder || 'none', padding: '9px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px', fontFamily: EF, flexShrink: 0 }}>{task.kidAvatar}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '12px' }}>{task.title}</div>
                        <div style={{ fontSize: '10px', color: s?.c, fontWeight: 600 }}>{task.kidName} · {s?.l}</div>
                      </div>
                      <div style={{ fontWeight: 800, color: t.primary, fontSize: '12px', flexShrink: 0 }}>₪{task.reward}</div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        )}

        {/* LEADERBOARD */}
        {tab === 'board' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ background: '#fff', borderRadius: t.radius, boxShadow: t.shadow, border: t.cardBorder || 'none', padding: '12px 14px' }}>
              <div style={{ fontWeight: 800, fontSize: '12px', marginBottom: '8px', color: t.textMid }}>🏆 לוח ניקוד</div>
              {kids.length === 0 ? <EmptyState t={t} icon="🏆" title="אין ילדים עדיין" /> :
                [...kids].sort((a, b) => b.earned - a.earned).map((kid, i) => {
                  const pct = Math.round((kid.earned / kid.goalAmount) * 100);
                  return (
                    <div key={kid.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 0', borderBottom: i < kids.length - 1 ? `1px solid ${t.progressBg}` : 'none' }}>
                      <span style={{ fontSize: '16px', fontFamily: EF, width: '20px', textAlign: 'center', flexShrink: 0 }}>{['🥇','🥈','🥉'][i] || '🏅'}</span>
                      <span style={{ fontSize: '18px', fontFamily: EF }}>{kid.avatar}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '2px' }}>{kid.name}</div>
                        <ProgressBar t={t} value={pct} height={5} />
                      </div>
                      <div style={{ textAlign: 'center', minWidth: '42px', flexShrink: 0 }}>
                        <div style={{ fontWeight: 900, fontSize: '12px', color: t.primary }}>₪{kid.earned}</div>
                        <div style={{ fontSize: '9px', color: t.textLight }}>{pct}%</div>
                      </div>
                    </div>
                  );
                })
              }
            </div>

            {kids.length > 0 && (
              <div style={{ background: '#fff', borderRadius: t.radius, boxShadow: t.shadow, border: t.cardBorder || 'none', padding: '11px 13px' }}>
                <div style={{ fontWeight: 800, fontSize: '12px', marginBottom: '8px', color: t.textMid }}>🔥 סטריקים</div>
                {kids.map(kid => (
                  <div key={kid.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '15px', fontFamily: EF }}>{kid.avatar}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, minWidth: '30px', color: t.text }}>{kid.name}</span>
                    <div style={{ display: 'flex', gap: '2px', flex: 1 }}>
                      {['א','ב','ג','ד','ה'].map((d, i) => (
                        <div key={i} style={{ flex: 1, height: '18px', borderRadius: '4px', background: i < kid.streak ? t.primary : t.progressBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontFamily: i < kid.streak ? EF : 'inherit' }}>
                          {i < kid.streak ? '🔥' : '·'}
                        </div>
                      ))}
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: t.primary, flexShrink: 0 }}>{kid.streak}<span style={{ fontFamily: EF }}>🔥</span></span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
