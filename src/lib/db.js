import { supabase } from './supabase.js';

export const authSignUp = (email, pass) => supabase.auth.signUp({
  email, password: pass,
  options: { emailRedirectTo: 'https://perezari.github.io/mishpacha-supabase/' },
});
export const authSignIn   = (email, pass) => supabase.auth.signInWithPassword({ email, password: pass });
export const authSignOut  = ()            => supabase.auth.signOut();
export const getSession   = ()            => supabase.auth.getSession();
export const onAuthChange = (cb)          => supabase.auth.onAuthStateChange(cb);

export const getProfile    = (userId)          => supabase.from('profiles').select('*').eq('id', userId).single();
export const updateProfile = (userId, updates) => supabase.from('profiles').update(updates).eq('id', userId).select().single();

export const createFamily = async (userId, name = 'המשפחה שלי') => {
  const { data: family, error: fe } = await supabase.from('families').insert({ name, created_by: userId }).select().single();
  if (fe) return { data: null, error: fe };
  const { error: pe } = await supabase.from('profiles').update({ family_id: family.id }).eq('id', userId);
  if (pe) return { data: null, error: pe };
  return { data: family, error: null };
};
export const getFamily = async (familyId) => {
  // Use RPC so children (no auth session) can also read family data
  const { data, error } = await supabase.rpc('get_family_for_child', { p_family_id: familyId });
  if (error) return { data: null, error };
  const row = Array.isArray(data) ? data[0] : data;
  return { data: row || null, error: null };
};
export const updateFamily = (familyId, updates) => supabase.from('families').update(updates).eq('id', familyId).select().single();
export const joinFamily   = async (userId, familyId) => {
  const { data: fam, error: fe } = await supabase.from('families').select('id').eq('id', familyId).single();
  if (fe) return { error: { message: 'קוד משפחה לא נמצא' } };
  const { error } = await supabase.from('profiles').update({ family_id: familyId }).eq('id', userId);
  return { data: fam, error };
};
export const getKidsForLogin = async (familyId) => {
  const { data, error } = await supabase.rpc('get_kids_for_login', { p_family_id: familyId });
  return { data: data || [], error };
};

export const getKids  = (familyId) => supabase.rpc('get_kids_for_family',  { p_family_id: familyId });
export const updateKid = (kidId, updates) => {
  const map = {};
  if (updates.themeId    !== undefined) map.theme_id    = updates.themeId;
  if (updates.goalName   !== undefined) map.goal_name   = updates.goalName;
  if (updates.goalIcon   !== undefined) map.goal_icon   = updates.goalIcon;
  if (updates.goalAmount !== undefined) map.goal_amount = updates.goalAmount;
  if (updates.earned     !== undefined) map.earned      = updates.earned;
  if (updates.streak          !== undefined) map.streak           = updates.streak;
  if (updates.lastStreakDate  !== undefined) map.last_streak_date = updates.lastStreakDate;
  if (updates.name       !== undefined) map.name        = updates.name;
  if (updates.age        !== undefined) map.age         = updates.age;
  if (updates.avatar     !== undefined) map.avatar      = updates.avatar;
  return supabase.from('kids').update(map).eq('id', kidId).select().single();
};
export const createKid = (familyId, kid) =>
  supabase.from('kids').insert({
    family_id: familyId, name: kid.name, age: kid.age, avatar: kid.avatar,
    theme_id: kid.themeId || 'A', goal_name: kid.goalName || 'המטרה שלי',
    goal_icon: kid.goalIcon || '🎯', goal_amount: kid.goalAmount || 100,
    earned: 0, streak: 0, sort_order: kid.sortOrder || 0,
  }).select().single();
export const deleteKid = (kidId) => supabase.from('kids').delete().eq('id', kidId);
export const updateKidProfile = (kidId, updates) => {
  const map = {};
  if (updates.name   !== undefined) map.name   = updates.name;
  if (updates.age    !== undefined) map.age    = updates.age;
  if (updates.avatar !== undefined) map.avatar = updates.avatar;
  return supabase.from('kids').update(map).eq('id', kidId).select().single();
};

export const getTasks = (familyId) => supabase.rpc('get_tasks_for_family', { p_family_id: familyId });
export const createTask = (familyId, task) =>
  supabase.from('tasks').insert({
    family_id: familyId, kid_id: task.kidId,
    title: task.title, description: task.desc || null,
    reward: task.reward, requires_approval: task.requiresApproval,
    is_daily: task.isDaily ?? false, status: 'todo',
  }).select().single();
// Uses security-definer RPC so children (no auth) can also update their own tasks
export const updateTaskStatus = async (taskId, status, kidId) => {
  const { error } = await supabase.rpc('update_task_status_for_kid', {
    p_task_id: taskId,
    p_kid_id:  kidId || '00000000-0000-0000-0000-000000000000',
    p_status:  status,
  });
  // Return in same shape as before so callers don't break
  return error ? { error } : { data: { id: taskId, status }, error: null };
};
export const completeTask = async (task, kid) => {
  if (task.requiresApproval) return updateTaskStatus(task.id, 'pending', kid.id);
  const [tr, kr] = await Promise.all([
    updateTaskStatus(task.id, 'done', kid.id),
    updateKid(kid.id, { earned: Number(kid.earned) + Number(task.reward) }),
  ]);
  return tr.error ? tr : kr.error ? kr : { data: { task: tr.data, kid: kr.data }, error: null };
};
export const approveTask = async (task, kid, addStreak = false) => {
  const today = new Date().toISOString().slice(0, 10);
  const kidUpdates = { earned: Number(kid.earned) + Number(task.reward) };
  if (addStreak) {
    kidUpdates.streak = kid.streak + 1;
    kidUpdates.lastStreakDate = today;
  }
  const [tr, kr] = await Promise.all([
    updateTaskStatus(task.id, 'done', kid.id),
    updateKid(kid.id, kidUpdates),
  ]);
  return tr.error ? tr : kr.error ? kr : { data: { task: tr.data, kid: kr.data }, error: null };
};
export const rejectTask = (taskId, kidId) => updateTaskStatus(taskId, 'rejected', kidId);

export const resetDailyTasks = (familyId) =>
  supabase.from('tasks')
    .update({ status: 'todo', completed_at: null })
    .eq('family_id', familyId)
    .eq('is_daily', true)
    .neq('status', 'todo');

// Shop items — RPC for child (no-auth) access
export const getShopItems = (familyId) =>
  supabase.rpc('get_shop_items_for_family', { p_family_id: familyId });
export const createShopItem = (familyId, { name, icon, price, sortOrder = 0 }) =>
  supabase.from('shop_items').insert({
    family_id: familyId, name, icon, price: Number(price), sort_order: sortOrder,
  }).select().single();
export const deleteShopItem = (itemId) =>
  supabase.from('shop_items').delete().eq('id', itemId);

// Purchases — RPC for child (no-auth) access
export const getPurchases = (familyId) =>
  supabase.rpc('get_purchases_for_family', { p_family_id: familyId });
export const createPurchase = (kidId, familyId, { itemName, itemIcon, itemPrice }) =>
  supabase.rpc('create_purchase_for_kid', {
    p_kid_id: kidId, p_family_id: familyId,
    p_item_name: itemName, p_item_icon: itemIcon, p_item_price: Number(itemPrice),
  });
export const approvePurchase = async (purchaseId, kidId, price, currentEarned) => {
  const [pr, kr] = await Promise.all([
    supabase.from('purchases').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', purchaseId),
    updateKid(kidId, { earned: Math.max(0, Number(currentEarned) - Number(price)) }),
  ]);
  return pr.error ? pr : kr.error ? kr : { error: null };
};
export const rejectPurchase = (purchaseId) =>
  supabase.from('purchases').update({ status: 'rejected' }).eq('id', purchaseId);

export const subscribeToTasks = (familyId, cb) =>
  supabase.channel(`tasks:${familyId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `family_id=eq.${familyId}` }, cb)
    .subscribe();
export const subscribeToKids = (familyId, cb) =>
  supabase.channel(`kids:${familyId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'kids', filter: `family_id=eq.${familyId}` }, cb)
    .subscribe();
export const subscribeToPurchases = (familyId, cb) =>
  supabase.channel(`purchases:${familyId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'purchases', filter: `family_id=eq.${familyId}` }, cb)
    .subscribe();
export const subscribeToShopItems = (familyId, cb) =>
  supabase.channel(`shop_items:${familyId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_items', filter: `family_id=eq.${familyId}` }, cb)
    .subscribe();

export const normalizeKid = (row) => ({
  id: row.id, familyId: row.family_id, name: row.name, age: row.age, avatar: row.avatar,
  goalName: row.goal_name, goalIcon: row.goal_icon,
  goalAmount: Number(row.goal_amount), earned: Number(row.earned),
  themeId: row.theme_id, streak: row.streak,
  lastStreakDate: row.last_streak_date || null,
  tasks: [],
});
export const normalizeTask = (row) => ({
  id: row.id, kidId: row.kid_id, familyId: row.family_id,
  title: row.title, desc: row.description,
  reward: Number(row.reward), status: row.status,
  requiresApproval: row.requires_approval, isDaily: !!row.is_daily,
  createdAt: row.created_at,
});
export const normalizeShopItem = (row) => ({
  id: row.id, familyId: row.family_id,
  name: row.name, icon: row.icon,
  price: Number(row.price), sortOrder: row.sort_order,
});
export const normalizePurchase = (row) => ({
  id: row.id, kidId: row.kid_id, familyId: row.family_id,
  itemName: row.item_name, itemIcon: row.item_icon,
  itemPrice: Number(row.item_price), status: row.status,
  createdAt: row.created_at, approvedAt: row.approved_at,
});
