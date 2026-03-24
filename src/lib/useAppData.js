// ═══════════════════════════════════════════════════════
//  useAppData — auth + state + Supabase
//
//  Loader strategy (simple & reliable):
//  - `loading` = true only while fetching initial data
//  - App.jsx shows loader only when loading=true AND no data yet
//    (so tab-refocus token refreshes don't show a spinner)
// ═══════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react';
import * as db from './db.js';
import { DAILY_TASKS } from '../data.js';

const CHILD_SESSION_KEY = 'mishpacha_child_session';

export function useAppData() {
  const [session,      setSession]      = useState(null);
  const [childSession, setChildSession] = useState(null);
  const [profile,      setProfile]      = useState(null);
  const [family,       setFamily]       = useState(null);
  const [kids,         setKids]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  /* ── Derived ──────────────────────────────────────── */
  const role     = childSession ? 'child' : (profile?.role || 'parent');
  const familyId = childSession?.familyId || profile?.family_id;
  const themeId  = childSession
    ? (kids.find(k => k.id === childSession.kidId)?.themeId || 'SUNNY')
    : (profile?.theme_id || 'C');

  /* ── Load parent data ─────────────────────────────── */
  const loadParent = useCallback(async (sess) => {
    setLoading(true);
    setError(null);
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
    } catch (e) {
      setError(e.message || 'שגיאה בטעינה');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Load child data (no Supabase auth) ──────────── */
  const loadChild = useCallback(async (cs) => {
    setLoading(true);
    setError(null);
    try {
      const { data: fam } = await db.getFamily(cs.familyId);
      setFamily(fam || null);
      await reloadForFamily(cs.familyId);
    } catch (e) {
      setError(e.message || 'שגיאה בטעינה');
    } finally {
      setLoading(false);
    }
  }, []);

  const reloadForFamily = async (fid) => {
    const [{ data: kRows, error: ke }, { data: tRows, error: te }] = await Promise.all([
      db.getKids(fid),
      db.getTasks(fid),
    ]);
    if (ke || te) return;
    setKids((kRows || []).map(k => ({
      ...db.normalizeKid(k),
      tasks: (tRows || []).filter(t => t.kid_id === k.id).map(db.normalizeTask),
    })));
  };

  const reloadKids = useCallback(() => {
    if (familyId) reloadForFamily(familyId);
  }, [familyId]);

  /* ── Boot ─────────────────────────────────────────── */
  useEffect(() => {
    // Child session: read from localStorage synchronously
    const saved = localStorage.getItem(CHILD_SESSION_KEY);
    if (saved) {
      try {
        const cs = JSON.parse(saved);
        setChildSession(cs);
        loadChild(cs);
        return;
      } catch { localStorage.removeItem(CHILD_SESSION_KEY); }
    }

    // Parent: check Supabase session
    db.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      if (sess) loadParent(sess);
      else setLoading(false);
    });

    const { data: { subscription } } = db.onAuthChange((event, sess) => {
      setSession(sess);
      if (sess) {
        // Only call loadParent if this is a genuine sign-in event,
        // not just a TOKEN_REFRESHED that happens on tab-focus.
        // For TOKEN_REFRESHED, we already have profile loaded — no need to re-fetch.
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          // INITIAL_SESSION is handled by getSession() above if no session.
          // If there IS a session on INITIAL_SESSION, getSession() also fires → don't double-load.
          // So only call loadParent for SIGNED_IN (actual fresh login).
          if (event === 'SIGNED_IN') {
            loadParent(sess);
          }
        }
        // TOKEN_REFRESHED: session renewed, no reload needed
      } else {
        setProfile(null);
        setFamily(null);
        setKids([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ── Realtime ─────────────────────────────────────── */
  useEffect(() => {
    if (!familyId) return;
    const ts = db.subscribeToTasks(familyId, reloadKids);
    const ks = db.subscribeToKids(familyId,  reloadKids);
    return () => { ts.unsubscribe(); ks.unsubscribe(); };
  }, [familyId]);

  /* ════════════════════════════════════════════════════
     ACTIONS
  ════════════════════════════════════════════════════ */
  const actions = {
    signIn:  (e, p) => db.authSignIn(e, p),
    signUp:  (e, p) => db.authSignUp(e, p),

    signOut: async () => {
      if (childSession) {
        localStorage.removeItem(CHILD_SESSION_KEY);
        setChildSession(null);
        setFamily(null);
        setKids([]);
        setLoading(false);
      } else {
        await db.authSignOut();
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
      setKids(ks => ks.map(k => k.id === kidId ? { ...k, themeId: tid } : k));
      await db.updateKid(kidId, { themeId: tid });
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
        DAILY_TASKS.map(dt =>
          db.createTask(fid, { kidId: newKid.id, title: dt.title, desc: dt.desc, reward: dt.reward, requiresApproval: true })
        )
      );
      const createdTasks = dailyResults.filter(r => !r.error).map(r => db.normalizeTask(r.data));
      setKids(ks => [...ks, { ...newKid, tasks: createdTasks }]);
      return { data, error: null };
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
        earned: newStatus === 'done' ? k.earned + task.reward : k.earned,
        tasks:  k.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t),
      }));
      const { error } = await db.completeTask(task, kid);
      if (error) reloadKids();
    },

    approveTask: async (kidId, taskId) => {
      const kid  = kids.find(k => k.id === kidId);
      const task = kid?.tasks.find(t => t.id === taskId);
      if (!task || !kid) return;
      setKids(ks => ks.map(k => k.id !== kidId ? k : {
        ...k,
        earned: k.earned + task.reward,
        streak: k.streak + 1,
        tasks:  k.tasks.map(t => t.id === taskId ? { ...t, status: 'done' } : t),
      }));
      const { error } = await db.approveTask(task, kid);
      if (error) reloadKids();
    },

    rejectTask: async (kidId, taskId) => {
      setKids(ks => ks.map(k => k.id !== kidId ? k : {
        ...k, tasks: k.tasks.map(t => t.id === taskId ? { ...t, status: 'rejected' } : t),
      }));
      const { error } = await db.rejectTask(taskId);
      if (error) reloadKids();
    },
  };

  return {
    session, childSession, profile, family, kids, loading, error, actions,
    themeId, role, familyId,
    userId:    session?.user?.id,
    isLoggedIn: !!(session || childSession),
  };
}
