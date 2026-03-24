// ═══════════════════════════════════════════════════════
//  Database helpers
// ═══════════════════════════════════════════════════════
import { supabase } from './supabase.js';

/* ── AUTH ───────────────────────────────────────────── */
export const authSignUp   = (email, pass) => supabase.auth.signUp({ email, password: pass });
export const authSignIn   = (email, pass) => supabase.auth.signInWithPassword({ email, password: pass });
export const authSignOut  = ()            => supabase.auth.signOut();
export const getSession   = ()            => supabase.auth.getSession();
export const onAuthChange = (cb)          => supabase.auth.onAuthStateChange(cb);

/* ── PROFILE ────────────────────────────────────────── */
export const getProfile    = (userId)          => supabase.from('profiles').select('*').eq('id', userId).single();
export const updateProfile = (userId, updates) => supabase.from('profiles').update(updates).eq('id', userId).select().single();

/* ── FAMILY ─────────────────────────────────────────── */
export const createFamily = async (userId, name = 'המשפחה שלי') => {
  const { data: family, error: fe } = await supabase
    .from('families').insert({ name, created_by: userId }).select().single();
  if (fe) return { data: null, error: fe };

  const { error: pe } = await supabase
    .from('profiles').update({ family_id: family.id }).eq('id', userId);
  if (pe) return { data: null, error: pe };

  return { data: family, error: null };
};

export const getFamily    = (familyId)          => supabase.from('families').select('*').eq('id', familyId).single();
export const updateFamily = (familyId, updates) => supabase.from('families').update(updates).eq('id', familyId).select().single();

export const joinFamily = async (userId, familyId) => {
  const { data: fam, error: fe } = await supabase.from('families').select('id').eq('id', familyId).single();
  if (fe) return { error: { message: 'קוד משפחה לא נמצא' } };
  const { error } = await supabase.from('profiles').update({ family_id: familyId }).eq('id', userId);
  return { data: fam, error };
};

/* ── CHILD LOGIN (no auth required) ─────────────────── */
/**
 * Called from the child login screen BEFORE authentication.
 * Uses a security-definer RPC that only returns name+avatar+id.
 * The family UUID acts as the "password" — hard to guess.
 */
export const getKidsForLogin = async (familyId) => {
  const { data, error } = await supabase
    .rpc('get_kids_for_login', { p_family_id: familyId });
  return { data: data || [], error };
};

/* ── KIDS ────────────────────────────────────────────── */
export const getKids  = (familyId) => supabase.from('kids').select('*').eq('family_id', familyId).order('sort_order');
export const updateKid = (kidId, updates) => {
  const map = {};
  if (updates.themeId    !== undefined) map.theme_id    = updates.themeId;
  if (updates.goalName   !== undefined) map.goal_name   = updates.goalName;
  if (updates.goalIcon   !== undefined) map.goal_icon   = updates.goalIcon;
  if (updates.goalAmount !== undefined) map.goal_amount = updates.goalAmount;
  if (updates.earned     !== undefined) map.earned      = updates.earned;
  if (updates.streak     !== undefined) map.streak      = updates.streak;
  if (updates.name       !== undefined) map.name        = updates.name;
  if (updates.age        !== undefined) map.age         = updates.age;
  if (updates.avatar     !== undefined) map.avatar      = updates.avatar;
  return supabase.from('kids').update(map).eq('id', kidId).select().single();
};

export const createKid = (familyId, kid) =>
  supabase.from('kids').insert({
    family_id:   familyId,
    name:        kid.name,
    age:         kid.age,
    avatar:      kid.avatar,
    theme_id:    kid.themeId    || 'A',
    goal_name:   kid.goalName   || 'המטרה שלי',
    goal_icon:   kid.goalIcon   || '🎯',
    goal_amount: kid.goalAmount || 100,
    earned:      0, streak: 0, sort_order: kid.sortOrder || 0,
  }).select().single();

/* ── TASKS ───────────────────────────────────────────── */
export const getTasks = (familyId) => supabase.from('tasks').select('*').eq('family_id', familyId).order('created_at');

export const createTask = (familyId, task) =>
  supabase.from('tasks').insert({
    family_id:         familyId,
    kid_id:            task.kidId,   // UUID string — no parseInt!
    title:             task.title,
    description:       task.desc || null,
    reward:            task.reward,
    requires_approval: task.requiresApproval,
    status:            'todo',
  }).select().single();

export const updateTaskStatus = (taskId, status) => {
  const updates = { status };
  if (status === 'done') updates.completed_at = new Date().toISOString();
  return supabase.from('tasks').update(updates).eq('id', taskId).select().single();
};

/* ── COMPOUND ACTIONS ────────────────────────────────── */
export const completeTask = async (task, kid) => {
  if (task.requiresApproval) return updateTaskStatus(task.id, 'pending');
  const [tr, kr] = await Promise.all([
    updateTaskStatus(task.id, 'done'),
    updateKid(kid.id, { earned: Number(kid.earned) + Number(task.reward) }),
  ]);
  return tr.error ? tr : kr.error ? kr : { data: { task: tr.data, kid: kr.data }, error: null };
};

export const approveTask = async (task, kid) => {
  const [tr, kr] = await Promise.all([
    updateTaskStatus(task.id, 'done'),
    updateKid(kid.id, { earned: Number(kid.earned) + Number(task.reward), streak: kid.streak + 1 }),
  ]);
  return tr.error ? tr : kr.error ? kr : { data: { task: tr.data, kid: kr.data }, error: null };
};

export const rejectTask = (taskId) => updateTaskStatus(taskId, 'rejected');

/* ── REALTIME ────────────────────────────────────────── */
export const subscribeToTasks = (familyId, cb) =>
  supabase.channel(`tasks:${familyId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `family_id=eq.${familyId}` }, cb)
    .subscribe();

export const subscribeToKids = (familyId, cb) =>
  supabase.channel(`kids:${familyId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'kids', filter: `family_id=eq.${familyId}` }, cb)
    .subscribe();

/* ── KID MUTATIONS ───────────────────────────────────── */
export const deleteKid = (kidId) =>
  supabase.from('kids').delete().eq('id', kidId);

// update name, age, avatar (profile fields — separate from goal/theme)
export const updateKidProfile = (kidId, { name, age, avatar }) => {
  const map = {};
  if (name   !== undefined) map.name   = name;
  if (age    !== undefined) map.age    = age;
  if (avatar !== undefined) map.avatar = avatar;
  return supabase.from('kids').update(map).eq('id', kidId).select().single();
};

/* ── NORMALIZERS ─────────────────────────────────────── */
export const normalizeKid = (row) => ({
  id: row.id, familyId: row.family_id,
  name: row.name, age: row.age, avatar: row.avatar,
  goalName: row.goal_name, goalIcon: row.goal_icon,
  goalAmount: Number(row.goal_amount), earned: Number(row.earned),
  themeId: row.theme_id, streak: row.streak,
  tasks: [],
});

export const normalizeTask = (row) => ({
  id: row.id, kidId: row.kid_id, familyId: row.family_id,
  title: row.title, desc: row.description,
  reward: Number(row.reward), status: row.status,
  requiresApproval: row.requires_approval, createdAt: row.created_at,
});
