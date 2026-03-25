import { useState, useEffect, useCallback } from 'react';
import * as db from './db.js';
import { DAILY_TASKS, SHOP_ITEMS } from '../data.js';

const CHILD_SESSION_KEY  = 'mishpacha_child_session';
const LAST_RESET_KEY     = 'mishpacha_last_reset';
const SHOP_SEEDED_KEY   = 'mishpacha_shop_seeded_'; // + familyId

export function useAppData() {
  const [session,      setSession]      = useState(null);
  const [childSession, setChildSession] = useState(null);
  const [profile,      setProfile]      = useState(null);
  const [family,       setFamily]       = useState(null);
  const [kids,         setKids]         = useState([]);
  const [shopItems,    setShopItems]    = useState([]);
  const [purchases,    setPurchases]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const role     = childSession ? 'child' : (profile?.role || 'parent');
  const familyId = childSession?.familyId || profile?.family_id;
  const themeId  = childSession
    ? (kids.find(k => k.id === childSession.kidId)?.themeId || 'SUNNY')
    : (profile?.theme_id || 'C');

  /* ── Daily reset ─────────────────────────────────── */
  const checkAndResetDaily = async (fid) => {
    const now = new Date();
    now.setHours(now.getHours() - 8);
    const logicalToday = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const last = localStorage.getItem(LAST_RESET_KEY);
    if (last === logicalToday) return;
    try {
      await db.resetDailyTasks(fid);
      localStorage.setItem(LAST_RESET_KEY, logicalToday);
      setKids(ks => ks.map(k => ({
        ...k,
        tasks: k.tasks.map(t => t.isDaily && t.status !== 'todo' ? { ...t, status: 'todo' } : t),
      })));
    } catch (_) {}
  };

  /* ── Seed default shop items (once per family) ───── */
  const seedShopIfEmpty = async (fid, items) => {
    const seedKey = SHOP_SEEDED_KEY + fid;
    if (items.length > 0 || localStorage.getItem(seedKey)) return items;
    try {
      await Promise.all(
        SHOP_ITEMS.map((item, i) =>
          db.createShopItem(fid, { name: item.name, icon: item.icon, price: item.price, sortOrder: i })
        )
      );
      localStorage.setItem(seedKey, '1');
      const { data: fresh } = await db.getShopItems(fid);
      return (fresh || []).map(db.normalizeShopItem);
    } catch (_) { return items; }
  };

  /* ── Load parent ─────────────────────────────────── */
  const loadParent = useCallback(async (sess) => {
    setLoading(true); setError(null);
    try {
      const userId = sess.user.id;
      let { data: prof, error: pe } = await db.getProfile(userId);
      if (pe) throw pe;
      if (!prof.family_id) {
        const { data: fam, error: fe } = await db.createFamily(userId);
        if (fe) throw fe;
        prof = { ...prof, family_id: fam.id };
        setFamily(fam);
      } else {
        const { data: fam } = await db.getFamily(prof.family_id);
        setFamily(fam);
      }
      setProfile(prof);
      await reloadForFamily(prof.family_id);
      await checkAndResetDaily(prof.family_id);
    } catch (e) {
      setError(e.message || 'שגיאה בטעינה');
    } finally { setLoading(false); }
  }, []);

  /* ── Load child ──────────────────────────────────── */
  const loadChild = useCallback(async (cs) => {
    setLoading(true); setError(null);
    try {
      const { data: fam } = await db.getFamily(cs.familyId);
      setFamily(fam || null);
      await reloadForFamily(cs.familyId);
      await checkAndResetDaily(cs.familyId);
    } catch (e) {
      setError(e.message || 'שגיאה בטעינה');
    } finally { setLoading(false); }
  }, []);

  /* ── Reload all data for a family ───────────────── */
  const reloadForFamily = async (fid) => {
    const [
      { data: kRows,  error: ke },
      { data: tRows,  error: te },
      { data: siRows, error: se },
      { data: prRows, error: pre },
    ] = await Promise.all([
      db.getKids(fid),
      db.getTasks(fid),
      db.getShopItems(fid),
      db.getPurchases(fid),
    ]);

    if (!ke && !te) {
      setKids((kRows || []).map(k => ({
        ...db.normalizeKid(k),
        tasks: (tRows || []).filter(t => t.kid_id === k.id).map(db.normalizeTask),
      })));
    }

    // Shop items — show immediately, seed in background (don't block)
    const items = se ? [] : (siRows || []).map(db.normalizeShopItem);
    setShopItems(items);
    if (!se) seedShopIfEmpty(fid, items).then(seeded => {
      if (seeded !== items) setShopItems(seeded);
    });

    if (!pre) setPurchases((prRows || []).map(db.normalizePurchase));
  };

  const reloadKids = useCallback(() => {
    if (familyId) reloadForFamily(familyId);
  }, [familyId]);

  /* ── Boot ────────────────────────────────────────── */
  useEffect(() => {
    const saved = localStorage.getItem(CHILD_SESSION_KEY);
    if (saved) {
      try {
        const cs = JSON.parse(saved);
        setChildSession(cs);
        loadChild(cs);
        return;
      } catch { localStorage.removeItem(CHILD_SESSION_KEY); }
    }
    db.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      if (sess) loadParent(sess);
      else setLoading(false);
    });
    const { data: { subscription } } = db.onAuthChange((event, sess) => {
      // INITIAL_SESSION: handled by getSession() above — skip to avoid double load
      // SIGNED_IN: handled directly by signIn action — skip
      // TOKEN_REFRESHED: silent renewal — skip
      // SIGNED_OUT: clear state immediately
      if (!sess) {
        setSession(null);
        setProfile(null); setFamily(null); setKids([]);
        setShopItems([]); setPurchases([]);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  /* ── Realtime ────────────────────────────────────── */
  useEffect(() => {
    if (!familyId) return;
    const ts  = db.subscribeToTasks(familyId,     reloadKids);
    const ks  = db.subscribeToKids(familyId,      reloadKids);
    const ps  = db.subscribeToPurchases(familyId, () => reloadForFamily(familyId));
    const sis = db.subscribeToShopItems(familyId, () => reloadForFamily(familyId));
    return () => { ts.unsubscribe(); ks.unsubscribe(); ps.unsubscribe(); sis.unsubscribe(); };
  }, [familyId]);

  /* ── Actions ─────────────────────────────────────── */
  const actions = {
    signIn: async (e, p) => {
      const result = await db.authSignIn(e, p);
      if (!result.error && result.data?.session) {
        setSession(result.data.session);
        loadParent(result.data.session);
      }
      return result;
    },
    signUp:  (e, p) => db.authSignUp(e, p),

    signOut: async () => {
      if (childSession) {
        localStorage.removeItem(CHILD_SESSION_KEY);
        setChildSession(null); setFamily(null); setKids([]);
        setShopItems([]); setPurchases([]); setLoading(false);
      } else {
        // Clear state immediately — don't wait for authSignOut round-trip
        setSession(null); setProfile(null); setFamily(null); setKids([]);
        setShopItems([]); setPurchases([]);
        db.authSignOut(); // fire-and-forget — just invalidates token on server
      }
    },

    childLogin: (kidId, fId) => {
      const cs = { kidId, familyId: fId };
      localStorage.setItem(CHILD_SESSION_KEY, JSON.stringify(cs));
      setChildSession(cs);
      loadChild(cs);
    },

    joinFamily: async (fId) => {
      if (!session) return { error: { message: 'לא מחובר' } };
      const { data, error } = await db.joinFamily(session.user.id, fId.trim());
      if (!error) {
        const newProf = { ...profile, family_id: data.id };
        setProfile(newProf);
        const { data: fam } = await db.getFamily(data.id);
        setFamily(fam);
        await reloadForFamily(data.id);
      }
      return { data, error };
    },

    changeTheme: async (tid) => {
      if (!session) return;
      setProfile(p => ({ ...p, theme_id: tid }));
      await db.updateProfile(session.user.id, { theme_id: tid });
    },
    changeKidTheme: async (kidId, tid) => {
      // Optimistic update immediately
      setKids(ks => ks.map(k => k.id === kidId ? { ...k, themeId: tid } : k));
      // Use RPC so child (no auth session) can also save their theme
      await db.updateKidTheme(kidId, tid);
    },
    updateFamilyName: async (name) => {
      if (!family?.id) return;
      setFamily(f => ({ ...f, name }));
      await db.updateFamily(family.id, { name });
    },

    addKid: async (kidData) => {
      const fid = familyId;
      if (!fid) return { error: 'No family' };
      const { data, error } = await db.createKid(fid, kidData);
      if (error) return { data, error };
      const newKid = { ...db.normalizeKid(data), tasks: [] };
      const dailyResults = await Promise.all(
        DAILY_TASKS.map(dt => db.createTask(fid, { kidId: newKid.id, title: dt.title, desc: dt.desc, reward: dt.reward, requiresApproval: true, isDaily: true }))
      );
      const createdTasks = dailyResults.filter(r => !r.error).map(r => db.normalizeTask(r.data));
      setKids(ks => [...ks, { ...newKid, tasks: createdTasks }]);
      return { data, error: null };
    },
    deleteKid: async (kidId) => {
      const { error } = await db.deleteKid(kidId);
      if (!error) setKids(ks => ks.filter(k => k.id !== kidId));
      return { error };
    },
    updateKidProfile: async (kidId, updates) => {
      const { data, error } = await db.updateKidProfile(kidId, updates);
      if (!error) setKids(ks => ks.map(k => k.id === kidId ? { ...k, ...updates } : k));
      return { data, error };
    },

    setGoal: async (kidId, { goalName, goalIcon, goalAmount }) => {
      setKids(ks => ks.map(k => k.id === kidId ? { ...k, goalName, goalIcon, goalAmount } : k));
      const { error } = await db.updateKid(kidId, { goalName, goalIcon, goalAmount });
      if (error) reloadKids();
      return { error };
    },

    addTask: async (taskData) => {
      const fid = familyId;
      if (!fid) return { error: 'No family' };
      const { data, error } = await db.createTask(fid, taskData);
      if (!error) {
        const task = db.normalizeTask(data);
        setKids(ks => ks.map(k => k.id === task.kidId ? { ...k, tasks: [...k.tasks, task] } : k));
      }
      return { data, error };
    },

    completeTask: async (taskId) => {
      const task = kids.flatMap(k => k.tasks).find(t => t.id === taskId);
      const kid  = kids.find(k => k.id === task?.kidId);
      if (!task || !kid) return;
      const newStatus = task.requiresApproval ? 'pending' : 'done';
      setKids(ks => ks.map(k => k.id !== kid.id ? k : {
        ...k,
        earned:      newStatus === 'done' ? k.earned      + task.reward : k.earned,
        totalEarned: newStatus === 'done' ? k.totalEarned + task.reward : k.totalEarned,
        tasks:  k.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t),
      }));
      const { error } = await db.completeTask(task, kid);
      if (error) reloadKids();
    },

    approveTask: async (kidId, taskId) => {
      const kid  = kids.find(k => k.id === kidId);
      const task = kid?.tasks.find(t => t.id === taskId);
      if (!task || !kid) return;

      // Increment streak only once per calendar day — checked in DB
      const today     = new Date().toISOString().slice(0, 10);
      const addStreak = kid.lastStreakDate !== today;

      setKids(ks => ks.map(k => k.id !== kidId ? k : {
        ...k,
        earned:      k.earned      + task.reward,
        totalEarned: k.totalEarned + task.reward,
        streak: addStreak ? k.streak + 1 : k.streak,
        lastStreakDate: addStreak ? today : k.lastStreakDate,
        tasks:  k.tasks.map(t => t.id === taskId ? { ...t, status: 'done' } : t),
      }));
      const { error } = await db.approveTask(task, kid, addStreak);
      if (error) reloadKids();
    },

    rejectTask: async (kidId, taskId) => {
      setKids(ks => ks.map(k => k.id !== kidId ? k : {
        ...k, tasks: k.tasks.map(t => t.id === taskId ? { ...t, status: 'rejected' } : t),
      }));
      const { error } = await db.rejectTask(taskId);
      if (error) reloadKids();
    },

    /* ── Shop ──────────────────────────────────────── */
    addShopItem: async ({ name, icon, price }) => {
      const fid = familyId;
      if (!fid) return;
      const { data, error } = await db.createShopItem(fid, { name, icon, price, sortOrder: shopItems.length });
      if (!error && data) {
        setShopItems(si => [...si, db.normalizeShopItem(data)]);
      }
      return { error };
    },

    deleteShopItem: async (itemId) => {
      const { error } = await db.deleteShopItem(itemId);
      if (!error) setShopItems(si => si.filter(i => i.id !== itemId));
      return { error };
    },

    /* ── Purchases ─────────────────────────────────── */
    buyItem: async (item) => {
      const kid = kids.find(k => k.id === childSession?.kidId) || kids[0];
      if (!kid || !familyId) return { error: 'No kid' };
      // Check sufficient balance (earned minus pending purchases)
      const pendingSpend = purchases
        .filter(p => p.kidId === kid.id && p.status === 'pending')
        .reduce((s, p) => s + p.itemPrice, 0);
      if (kid.earned - pendingSpend < item.price) return { error: 'insufficient' };

      const result = await db.createPurchase(kid.id, familyId, {
        itemName: item.name, itemIcon: item.icon, itemPrice: item.price,
      });
      if (result.error) return { error: result.error };
      // Add to local state
      const newPurchase = {
        id: result.data, kidId: kid.id, familyId,
        itemName: item.name, itemIcon: item.icon,
        itemPrice: item.price, status: 'pending',
        createdAt: new Date().toISOString(), approvedAt: null,
      };
      setPurchases(ps => [newPurchase, ...ps]);
      return { error: null };
    },

    approvePurchase: async (purchaseId) => {
      const purchase = purchases.find(p => p.id === purchaseId);
      const kid      = kids.find(k => k.id === purchase?.kidId);
      if (!purchase || !kid) return;
      // Optimistic update
      setPurchases(ps => ps.map(p => p.id === purchaseId ? { ...p, status: 'approved' } : p));
      setKids(ks => ks.map(k => k.id === kid.id
        ? { ...k, earned: Math.max(0, k.earned - purchase.itemPrice) }
        : k
      ));
      const { error } = await db.approvePurchase(purchaseId, kid.id, purchase.itemPrice, kid.earned);
      if (error) await reloadForFamily(familyId);
    },

    rejectPurchase: async (purchaseId) => {
      setPurchases(ps => ps.map(p => p.id === purchaseId ? { ...p, status: 'rejected' } : p));
      const { error } = await db.rejectPurchase(purchaseId);
      if (error) await reloadForFamily(familyId);
    },
  };

  return {
    session, childSession, profile, family, kids,
    shopItems, purchases,
    loading, error, actions,
    themeId, role, familyId,
    userId:    session?.user?.id,
    isLoggedIn: !!(session || childSession),
  };
}
