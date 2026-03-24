// ═══════════════════════════════════════════
//  App data & constants
// ═══════════════════════════════════════════

export const AVATARS = [
  '🐱','🐶','🐼','🦊','🐸','🦁','🐨','🐯',
  '🐻','🦋','🐬','🦄','🐧','🐙','🦕','🌈',
];

export const TASK_EXAMPLES = [
  { t: 'צחצוח שיניים', r: 1 },
  { t: 'ניקוי חדר',    r: 5 },
  { t: 'מבחן מוצלח',  r: 10 },
  { t: 'שטיפת כלים',  r: 3 },
  { t: 'הוצאת כלב',   r: 4 },
  { t: 'סידור מיטה',  r: 2 },
];

export const GOAL_OPTS = [
  { icon: '🎮', name: 'קונסולה' }, { icon: '🚲', name: 'אופניים' },
  { icon: '🧸', name: 'צעצוע'   }, { icon: '⚽', name: 'ספורט'   },
  { icon: '📱', name: 'טלפון'   }, { icon: '🎒', name: 'תיק'     },
  { icon: '🍦', name: 'גלידה'   }, { icon: '🎠', name: 'יום כיף' },
  { icon: '🎨', name: 'ציוד'    }, { icon: '🎵', name: 'מוזיקה'  },
  { icon: '🏕️', name: 'טיול'   }, { icon: '🎪', name: 'בילוי'   },
];

export const SHOP_ITEMS = [
  { id: 1, icon: '🍦', name: 'גלידה',           price: 5  },
  { id: 2, icon: '🍿', name: 'סרט בבית',        price: 10 },
  { id: 3, icon: '🎠', name: 'יום כיף',         price: 12 },
  { id: 4, icon: '🧸', name: 'צעצוע קטן',       price: 15 },
  { id: 5, icon: '🎮', name: 'משחק מחשב',       price: 25 },
  { id: 6, icon: '🚲', name: 'קורס / חוג',       price: 50 },
  { id: 7, icon: '🎪', name: 'פארק שעשועים',     price: 30 },
  { id: 8, icon: '📱', name: 'אביזר טכנולוגי',   price: 40 },
];

export const ALL_BADGES = (done, pct, streak, earned) => [
  { icon: '🧹', name: 'אלוף ניקיון',   earned: done >= 3     },
  { icon: '📚', name: 'תלמיד מצטיין', earned: done >= 5     },
  { icon: '🔥', name: '7 ימים רצוף',  earned: streak >= 7   },
  { icon: '💎', name: 'סופר-כוכב',    earned: pct >= 100    },
  { icon: '⚡', name: 'מהיר הברק',    earned: done >= 1     },
  { icon: '🏆', name: 'אלוף אלופים',  earned: done >= 10    },
  { icon: '🌟', name: 'כוכב השבוע',   earned: done >= 5     },
  { icon: '💪', name: 'גיבור עבודה',  earned: done >= 20    },
  { icon: '🎯', name: 'צלף המטרות',   earned: pct >= 90     },
  { icon: '🌈', name: 'צובר ניסיון',  earned: earned >= 50  },
  { icon: '🚀', name: 'לרקיע שחקים', earned: earned >= 100 },
  { icon: '🎁', name: 'מלך/ת מתנות', earned: false         },
];

/* ─────────────────────────────────────────────
   DAILY ROUTINE TASKS
   Auto-created for every new kid.
   All require parent approval (1 ₪ each).
   Icons are stored as plain text so DB handles them fine.
───────────────────────────────────────────── */
export const DAILY_TASKS = [
  {
    title: 'צחצוח שיניים',
    desc:  'בוקר וערב — 2 דקות כל פעם',
    icon:  '🦷',
    reward: 1,
  },
  {
    title: 'סידור המיטה',
    desc:  'כל בוקר לפני בית הספר',
    icon:  '🛏️',
    reward: 1,
  },
  {
    title: 'ניקוי החדר',
    desc:  'סדר את הצעצועים והבגדים',
    icon:  '🧹',
    reward: 1,
  },
  {
    title: 'שטיפת ידיים',
    desc:  'לפני כל ארוחה ואחרי שירותים',
    icon:  '🧼',
    reward: 1,
  },
  {
    title: 'שיעורי בית',
    desc:  'סיים את כל השיעורים לפני מסכים',
    icon:  '📚',
    reward: 1,
  },
  {
    title: 'עזרה בסידור השולחן',
    desc:  'לפני ארוחת הערב',
    icon:  '🍽️',
    reward: 1,
  },
  {
    title: 'מקלחת / אמבטיה',
    desc:  'כל יום — שמור על ניקיון',
    icon:  '🚿',
    reward: 1,
  },
  {
    title: 'כיבוי אורות ומסכים',
    desc:  'לפני השינה — חוסך חשמל!',
    icon:  '💡',
    reward: 1,
  },
];
