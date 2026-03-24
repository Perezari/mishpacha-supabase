# 👨‍👩‍👧‍👦 משפחה במשימה

אפליקציית משימות ומטרות לילדים ומשפחות — עם 5 ערכות עיצוב, אימות משתמשים, ושמירה ב-Supabase.

---

## 🚀 הגדרה ב-5 דקות

### 1. צור פרויקט Supabase
1. היכנס ל-[app.supabase.com](https://app.supabase.com) וצור פרויקט חדש
2. עבור ל-**SQL Editor** ← **New query**
3. הדבק את תוכן `supabase/schema.sql` והרץ

### 2. קבל את מפתחות ה-API
עבור ל-**Project Settings → API** והעתק:
- `Project URL` → זה `VITE_SUPABASE_URL`
- `anon public` key → זה `VITE_SUPABASE_ANON_KEY`

### 3. הגדר משתני סביבה
```bash
cp .env.example .env
# ערוך את .env והכנס את המפתחות שלך
```

### 4. הרץ מקומית
```bash
npm install
npm run dev
# פותח על http://localhost:5173
```

---

## ☁️ פריסה ל-GitHub Pages

1. דחוף את הקוד ל-GitHub
2. עבור ל-**Settings → Secrets → Actions** והוסף:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. עבור ל-**Settings → Pages** ← Source: **GitHub Actions**
4. הדפלוי יתחיל אוטומטית בכל push ל-main

---

## 🗄️ מבנה הנתונים (Supabase)

```
profiles      — משתמשים (מרחיב את auth.users)
  id, role, theme_id, family_id

families      — יחידה משפחתית
  id, name, created_by

kids          — ילדים
  id, family_id, name, age, avatar
  goal_name, goal_icon, goal_amount, earned
  theme_id, streak

tasks         — משימות
  id, kid_id, family_id, title, description
  reward, status, requires_approval
```

---

## 📁 מבנה הקוד

```
src/
├── lib/
│   ├── supabase.js      ← Supabase client
│   ├── db.js            ← כל פעולות ה-DB
│   └── useAppData.js    ← hook ראשי — state + sync
├── themes.js            ← 5 ערכות עיצוב
├── data.js              ← קבועים (shop, badges, avatars)
├── components/
│   └── Atoms.jsx        ← רכיבי UI בסיסיים
└── screens/
    ├── Login.jsx         ← כניסה + הרשמה
    ├── Settings.jsx      ← הגדרות + בורר מראה
    ├── parent/
    │   ├── Dashboard.jsx
    │   └── ParentScreens.jsx
    └── child/
        └── ChildScreens.jsx
```
