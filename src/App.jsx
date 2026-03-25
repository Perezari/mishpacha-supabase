import { useState, useEffect } from 'react';
import THEMES from './themes.js';
import { useAppData } from './lib/useAppData.js';
import { BottomNav, Sidebar } from './components/Atoms.jsx';

import LoginScreen     from './screens/Login.jsx';
import SettingsScreen  from './screens/Settings.jsx';
import ParentDashboard from './screens/parent/Dashboard.jsx';
import { KidDetailScreen, AddChildScreen, AddTaskScreen, GoalSettingScreen, ApprovalsScreen, EditChildScreen, DeleteChildModal, ManageShopScreen } from './screens/parent/ParentScreens.jsx';
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

const EF_LOADER = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";

/* ── Beautiful loader — adapts to child/parent theme ── */
const Loader = ({ isChild = false, bg, primary }) => {
  // Both parent and child get the beautiful dark gradient loader
  const bgGrad = bg || (isChild
    ? 'linear-gradient(160deg, #3D0066 0%, #5E35B1 50%, #283593 100%)'
    : 'linear-gradient(160deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)');
  const col  = primary || (isChild ? '#7C4DFF' : '#5E60CE');
  const emoji = isChild ? '🚀' : '👔';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: bgGrad, gap: 20, fontFamily: "'Heebo',sans-serif",
      direction: 'rtl',
    }}>
      <div style={{
        fontSize: 72, fontFamily: EF_LOADER, lineHeight: 1,
        animation: 'float 2s ease-in-out infinite',
        filter: 'drop-shadow(0 4px 20px rgba(255,255,255,.2))',
      }}>
        {emoji}
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-.3px', lineHeight: 1.2 }}>
          <span style={{ color: col }}>משפחה</span>
          {' '}
          <span style={{ color: '#00BCD4' }}>במשימה</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', marginTop: 4, fontWeight: 500 }}>
          {isChild ? 'טוען את המשימות שלך...' : 'מתחבר...'}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: col,
            animation: `bounce .9s ease-in-out ${i * .18}s infinite`,
          }}/>
        ))}
      </div>

      <style>{`
        @keyframes bounce {
          0%,100% { transform: translateY(0); opacity: .4; }
          50%      { transform: translateY(-10px); opacity: 1; }
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

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
    shopItems, purchases,
  } = useAppData();

  const [screen, setScreen] = useState('dashboard');
  const [selKid, setSelKid]     = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const isDesktop = useIsDesktop();

  const t   = THEMES[themeId] || THEMES['C'];
  const nav = sc => setScreen(sc);

  const activeKid = role === 'child'
    ? kids.find(k => k.id === childSession?.kidId) || kids[0]
    : kids.find(k => k.id === selKid);

  const kidThemeId = activeKid?.themeId || 'GALAXY';
  const childT = THEMES[kidThemeId] || THEMES['GALAXY'];
  const effT   = role === 'child' ? childT : t;

  const userName = role === 'child'
    ? (activeKid?.name || 'ילד/ה')
    : (family?.name || 'הורה');

  /* ── PWA Dynamic Theme Color ──────────── */
  useEffect(() => {
    if (!effT) return;
    // Use headerGrad for richer notch color on parent themes
    const gradStr  = effT.headerGrad || effT.bgGrad;
    const match    = gradStr.match(/#[0-9a-fA-F]{3,8}/);
    const topColor = match ? match[0] : (effT.primary || '#ffffff');
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'theme-color'; document.head.appendChild(meta); }
    meta.setAttribute('content', topColor);
    document.body.style.backgroundColor = topColor;
  }, [effT]);

  const showLoader = loading && !profile && !childSession;
  // While child session exists but data not yet loaded — show child loader
  const showChildLoader = loading && !!childSession && kids.length === 0;
  if (showLoader || showChildLoader) return <Loader isChild={!!(childSession || showChildLoader)} bg={effT?.bgGrad} primary={effT?.primary} />;

  if (!isLoggedIn) return (
    <div style={{ minHeight: '100vh', background: effT.bgGrad, overflowY: 'auto' }}>
      <LoginScreen
        onParentLogin={async (e, p) => { const r = await actions.signIn(e, p); if (!r.error) setScreen('dashboard'); return r; }}
        onParentSignUp={(e, p) => actions.signUp(e, p)}
        onChildLogin={(kidId, fId) => { setScreen('dashboard'); actions.childLogin(kidId, fId); }}
      />
    </div>
  );

  /* ── Nav config ─────────────────────── */
  const pendingTaskCount     = kids.flatMap(k => k.tasks).filter(t => t.status === 'pending').length;
  const pendingPurchaseCount = purchases.filter(p => p.status === 'pending').length;
  const pendingCount         = pendingTaskCount + pendingPurchaseCount;
  const activeNav      = role === 'parent' ? PARENT_NAV : CHILD_NAV;
  const navWithBadge   = activeNav.map(item =>
    item.id === 'approvals' && pendingCount > 0 ? { ...item, badge: pendingCount } : item
  );
  const activeScreenId = role === 'child' && screen === 'dashboard' ? 'childHome' : screen;

  /* ── Screen content ─────────────────── */
  const getContent = () => {
    if (role === 'parent') {
      switch (screen) {
        case 'dashboard':  return <ParentDashboard t={t} kids={kids} onNav={nav} onKidSelect={id => setSelKid(id)} pendingPurchases={pendingPurchaseCount} onApprove={(ki,ti) => actions.approveTask(ki,ti)} onReject={(ki,ti) => actions.rejectTask(ki,ti)} />;
        case 'kidDetail':  return <KidDetailScreen t={t} kid={activeKid} onBack={() => nav('dashboard')} onAddTask={() => nav('addTask')} onApprove={(ki,ti,msg) => actions.approveTask(ki,ti,msg)} onReject={(ki,ti) => actions.rejectTask(ki,ti)} onEdit={() => nav('editChild')} onDelete={() => setShowDelete(true)} />;
        case 'editChild':   return <EditChildScreen t={t} kid={activeKid} onBack={() => nav('kidDetail')} onSave={async (updates) => { await actions.updateKidProfile(selKid, updates); }} />;
        case 'addChild':   return <AddChildScreen t={t} onSave={async d => { await actions.addKid(d); nav('dashboard'); }} onBack={() => nav('dashboard')} />;
        case 'addTask':    return <AddTaskScreen t={t} kids={kids} preKidId={selKid} onSave={d => actions.addTask(d)} onBack={() => nav(selKid ? 'kidDetail' : 'dashboard')} />;
        case 'goals':      return <GoalSettingScreen t={t} kids={kids} onSave={({ kidId, goalName, goalIcon, goalAmount }) => actions.setGoal(kidId, { goalName, goalIcon, goalAmount })} onBack={() => nav('dashboard')} />;
        case 'approvals':  return <ApprovalsScreen t={t} kids={kids} onApprove={(ki,ti,msg) => actions.approveTask(ki,ti,msg)} onReject={(ki,ti) => actions.rejectTask(ki,ti)} purchases={purchases} onApprovePurchase={actions.approvePurchase} onRejectPurchase={actions.rejectPurchase} />;
        case 'manageShop': return <ManageShopScreen t={t} shopItems={shopItems} onAdd={actions.addShopItem} onDelete={actions.deleteShopItem} onBack={() => nav('dashboard')} />;
        case 'settings':   return <SettingsScreen t={t} user={{ role: 'parent', userId: profile?.id }} family={family} kids={kids} onThemeChange={actions.changeTheme} onLogout={actions.signOut} onUpdateFamilyName={actions.updateFamilyName} onJoinFamily={actions.joinFamily} />;
        default:           return <ParentDashboard t={t} kids={kids} onNav={nav} onKidSelect={id => setSelKid(id)} />;
      }
    } else {
      switch (screen) {
        case 'childHome':
        case 'dashboard':  return <ChildDashboard t={childT} kid={activeKid} onCompleteTask={id => actions.completeTask(id)} onNav={nav} />;
        case 'badges':     return <BadgesScreen t={childT} kid={activeKid} />;
        case 'shop':       return <ShopScreen t={childT} kid={activeKid} shopItems={shopItems} purchases={purchases} onBuy={actions.buyItem} />;
        case 'settings':   return <SettingsScreen t={childT} user={{ role: 'child', kidId: activeKid?.id }} family={family} kids={kids} onThemeChange={id => actions.changeKidTheme(activeKid?.id, id)} onLogout={actions.signOut} onUpdateFamilyName={actions.updateFamilyName} />;
        default:           return <ChildDashboard t={childT} kid={activeKid} onCompleteTask={id => actions.completeTask(id)} onNav={nav} />;
      }
    }
  };

  const handleDeleteKid = async () => {
    setDeleting(true);
    await actions.deleteKid(selKid);
    setDeleting(false);
    setShowDelete(false);
    setSelKid(null);
    nav('dashboard');
  };

  /* ════════════════════════════════════════════════════
     DESKTOP — Sidebar + COMPACT centered content column
     Content is max 520px wide, centered, card-like.
     Gradient background visible on both sides of content.
  ════════════════════════════════════════════════════ */
  if (isDesktop) return (
    <div style={{
      display: 'flex',
      height: '100vh',
      direction: 'rtl',
      overflow: 'hidden',
      background: effT.bgGrad,
      fontFamily: "'Heebo',sans-serif",
    }}>

      {/* Sidebar — fixed on right */}
      <Sidebar
        t={effT}
        items={navWithBadge}
        active={activeScreenId}
        onNav={nav}
        familyName={family?.name}
        role={role}
        userName={userName}
        onLogout={() => { setScreen('dashboard'); actions.signOut(); }}
      />

      {/* Main area — gradient bg, centered content column */}
      {/* ── Centered phone-column ── */}
      <div style={{
        flex: 1,
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
      }}>
        {/* Card = fixed height, like a phone screen */}
        <div style={{
          width: '100%',
          maxWidth: 480,
          height: 'calc(100vh - 32px)',   /* fixed height — always fills viewport */
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 8px 36px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.07)',
          display: 'flex',
          flexDirection: 'column',
          background: effT.bgGrad,        /* card bg = theme gradient, no white gap */
          position: 'relative',
        }}>
          {error && <ErrorBanner msg={error} />}

          {/* Screen content — scrolls inside the fixed-height card */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}>
            {getContent()}
          </div>

          {showDelete && <DeleteChildModal t={t} kid={activeKid} loading={deleting} onConfirm={handleDeleteKid} onCancel={() => setShowDelete(false)} />}

          <BottomNav t={effT} items={navWithBadge} active={activeScreenId} onNav={nav} />
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════
     MOBILE — Full screen + bottom nav
  ════════════════════════════════════════════════════ */
  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden', fontFamily: "'Heebo',sans-serif" }}>
      {error && <ErrorBanner msg={error} />}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {getContent()}
      </div>
      {showDelete && <DeleteChildModal t={t} kid={activeKid} loading={deleting} onConfirm={handleDeleteKid} onCancel={() => setShowDelete(false)} />}
      <BottomNav t={effT} items={navWithBadge} active={activeScreenId} onNav={nav} />
    </div>
  );
}
