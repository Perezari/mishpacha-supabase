import { useState, useEffect } from 'react';
import THEMES from './themes.js';
import { useAppData } from './lib/useAppData.js';
import { BottomNav, Sidebar } from './components/Atoms.jsx';

import LoginScreen     from './screens/Login.jsx';
import SettingsScreen  from './screens/Settings.jsx';
import ParentDashboard from './screens/parent/Dashboard.jsx';
import { KidDetailScreen, AddChildScreen, AddTaskScreen, GoalSettingScreen, ApprovalsScreen } from './screens/parent/ParentScreens.jsx';
import { ChildDashboard, BadgesScreen, ShopScreen } from './screens/child/ChildScreens.jsx';

const PARENT_NAV = [
  { id: 'dashboard', icon: '🏠', label: 'ראשי'    },
  { id: 'approvals', icon: '✅', label: 'אישורים' },
  { id: 'goals',     icon: '🎯', label: 'מטרות'   },
  { id: 'settings',  icon: '⚙️', label: 'הגדרות'  },
];
const CHILD_NAV = [
  { id: 'childHome', icon: '🏠', label: 'ראשי'   },
  { id: 'badges',    icon: '🏅', label: 'תגים'   },
  { id: 'shop',      icon: '🛍️', label: 'חנות'   },
  { id: 'settings',  icon: '⚙️', label: 'הגדרות' },
];

const Loader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(145deg,#F4F6FF,#E8FFF9)', gap: '14px' }}>
    <span style={{ fontSize: '58px', fontFamily: "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif" }}>👨‍👩‍👧‍👦</span>
    <div style={{ fontSize: '14px', fontWeight: 700, color: '#5E60CE', fontFamily: "'Heebo',sans-serif" }}>טוען... ⏳</div>
  </div>
);

const ErrorBanner = ({ msg }) => (
  <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#EF476F', color: '#fff', padding: '9px 16px', fontSize: '13px', fontWeight: 700, textAlign: 'center', direction: 'rtl', fontFamily: "'Heebo',sans-serif" }}>
    ⚠️ {msg}
  </div>
);

function useIsDesktop() {
  const [desk, setDesk] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  useEffect(() => {
    const fn = () => setDesk(window.innerWidth >= 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return desk;
}

export default function App() {
  const {
    session, childSession, profile, family, kids,
    loading, error, actions, themeId, role, isLoggedIn,
  } = useAppData();

  const [screen, setScreen] = useState('dashboard');
  const [selKid, setSelKid] = useState(null);
  const isDesktop = useIsDesktop();

  const t      = THEMES[themeId] || THEMES['C'];
  const nav    = sc => setScreen(sc);

  const activeKid = role === 'child'
    ? kids.find(k => k.id === childSession?.kidId) || kids[0]
    : kids.find(k => k.id === selKid);

  // Kids get their chosen theme (SUNNY/COSMIC/FOREST), defaulting to SUNNY
  const kidThemeId = activeKid?.themeId || 'SUNNY';
  const childT = THEMES[kidThemeId] || THEMES['SUNNY'];
  const effT   = role === 'child' ? childT : t;

  const userName = role === 'child'
    ? (activeKid?.name || 'ילד/ה')
    : (family?.name || 'הורה');

  /* ── PWA Dynamic Theme Color ────────────────────── */
  useEffect(() => {
    if (!effT) return;
    
    const targetColor = effT.primary || '#ffffff'; 

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', targetColor);

    // השורה החדשה! נשנה את הרקע של כל העמוד (מחוץ לאפליקציה של הריאקט) 
    // כדי שספארי יבין שזה צבע הרקע העליון
    document.body.style.backgroundColor = targetColor; 

  }, [effT]); 
  /* ───────────────────────────────────────────────── */

  /* ── Show loader ONLY on first load (no data yet).
     If loading but we already have profile/childSession,
     that's a background refresh — don't interrupt the user. ── */
  const showLoader = loading && !profile && !childSession;

  if (showLoader) return <Loader />;

  if (!isLoggedIn) return (
    <div style={{ minHeight: '100vh', background: effT.bgGrad, overflowY: 'auto' }}>
      <LoginScreen
        onParentLogin={(e, p) => actions.signIn(e, p)}
        onParentSignUp={(e, p) => actions.signUp(e, p)}
        onChildLogin={(kidId, fId) => actions.childLogin(kidId, fId)}
      />
    </div>
  );

  /* ── Nav config ─────────────────────────────────── */
  const pendingCount   = kids.flatMap(k => k.tasks).filter(t => t.status === 'pending').length;
  const activeNav      = role === 'parent' ? PARENT_NAV : CHILD_NAV;
  const navWithBadge   = activeNav.map(item =>
    item.id === 'approvals' && pendingCount > 0 ? { ...item, badge: pendingCount } : item
  );
  const activeScreenId = role === 'child' && screen === 'dashboard' ? 'childHome' : screen;

  /* ── Screen content ─────────────────────────────── */
  const getContent = () => {
    if (role === 'parent') {
      switch (screen) {
        case 'dashboard':  return <ParentDashboard t={t} kids={kids} onNav={nav} onKidSelect={id => setSelKid(id)} />;
        case 'kidDetail':  return <KidDetailScreen t={t} kid={activeKid} onBack={() => nav('dashboard')} onAddTask={() => nav('addTask')} onApprove={(ki,ti) => actions.approveTask(ki,ti)} onReject={(ki,ti) => actions.rejectTask(ki,ti)} />;
        case 'addChild':   return <AddChildScreen t={t} onSave={async d => { await actions.addKid(d); nav('dashboard'); }} onBack={() => nav('dashboard')} />;
        case 'addTask':    return <AddTaskScreen t={t} kids={kids} preKidId={selKid} onSave={d => actions.addTask(d)} onBack={() => nav(selKid ? 'kidDetail' : 'dashboard')} />;
        case 'goals':      return <GoalSettingScreen t={t} kids={kids} onSave={({ kidId, goalName, goalIcon, goalAmount }) => actions.setGoal(kidId, { goalName, goalIcon, goalAmount })} onBack={() => nav('dashboard')} />;
        case 'approvals':  return <ApprovalsScreen t={t} kids={kids} onApprove={(ki,ti) => actions.approveTask(ki,ti)} onReject={(ki,ti) => actions.rejectTask(ki,ti)} />;
        case 'settings':   return <SettingsScreen t={t} user={{ role: 'parent', userId: profile?.id }} family={family} kids={kids} onThemeChange={actions.changeTheme} onLogout={actions.signOut} onUpdateFamilyName={actions.updateFamilyName} onJoinFamily={actions.joinFamily} />;
        default:           return <ParentDashboard t={t} kids={kids} onNav={nav} onKidSelect={id => setSelKid(id)} />;
      }
    } else {
      switch (screen) {
        case 'childHome':
        case 'dashboard':  return <ChildDashboard t={childT} kid={activeKid} onCompleteTask={id => actions.completeTask(id)} onNav={nav} />;
        case 'badges':     return <BadgesScreen t={childT} kid={activeKid} />;
        case 'shop':       return <ShopScreen t={childT} kid={activeKid} />;
        case 'settings':   return <SettingsScreen t={childT} user={{ role: 'child', kidId: activeKid?.id }} family={family} kids={kids} onThemeChange={id => actions.changeKidTheme(activeKid?.id, id)} onLogout={actions.signOut} onUpdateFamilyName={actions.updateFamilyName} />;
        default:           return <ChildDashboard t={childT} kid={activeKid} onCompleteTask={id => actions.completeTask(id)} onNav={nav} />;
      }
    }
  };

  /* ════════════════════════════════════════
     DESKTOP — Sidebar + full content
  ════════════════════════════════════════ */
  if (isDesktop) return (
    <div style={{ display: 'flex', height: '100vh', direction: 'rtl', overflow: 'hidden', background: effT.bgGrad, fontFamily: "'Heebo',sans-serif" }}>
      <Sidebar
        t={effT}
        items={navWithBadge}
        active={activeScreenId}
        onNav={nav}
        familyName={family?.name}
        role={role}
        userName={userName}
        onLogout={actions.signOut}
      />
      <main style={{ flex: 1, height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: effT.bgGrad, minWidth: 0 }}>
        {error && <ErrorBanner msg={error} />}
        {getContent()}
      </main>
    </div>
  );

  /* ════════════════════════════════════════
     MOBILE — Full screen + bottom nav
  ════════════════════════════════════════ */
  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden', fontFamily: "'Heebo',sans-serif" }}>
      {error && <ErrorBanner msg={error} />}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {getContent()}
      </div>
      <BottomNav t={effT} items={navWithBadge} active={activeScreenId} onNav={nav} />
    </div>
  );
}