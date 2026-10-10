# AppliTech - אתר תדמית

אתר תדמית בעברית (RTL) ל-AppliTech, בנוי עם Astro + Tailwind CSS v4, וטופס יצירת קשר ששולח מייל באמצעות Resend.

## מבנה

```
src/
  layouts/Layout.astro        # html lang="he" dir="rtl", פונט Heebo
  components/                 # Header, Hero, Services, WhyUs, Contact, Footer
  pages/index.astro           # הדף הראשי (סטטי - SSG)
  pages/api/contact.ts        # POST /api/contact - ולידציה + שליחה ב-Resend
  styles/global.css           # Tailwind + theme
render.yaml                   # הגדרות פריסה ב-Render
```

האתר נבנה סטטית (`output: 'static'`); רק נתיב ה-API רץ בשרת (`prerender = false`) דרך מתאם Node.
Tailwind v4 מוגדר דרך `@theme` ב-`global.css`, ולכן אין קובץ `tailwind.config`.

## הרצה מקומית

דרישות: Node.js 20 ומעלה.

```bash
npm install
cp .env.example .env     # ב-Windows PowerShell: Copy-Item .env.example .env
# ערכו את .env והוסיפו RESEND_API_KEY ו-CONTACT_TO_EMAIL
npm run dev
```

האתר יעלה בכתובת http://localhost:4321

בדיקת build ופרודקשן מקומית:

```bash
npm run build
npm start
```

## משתני סביבה

| משתנה | תיאור |
| --- | --- |
| `RESEND_API_KEY` | מפתח API מ-https://resend.com/api-keys (חובה) |
| `CONTACT_TO_EMAIL` | הכתובת שתקבל את הפניות (חובה) |
| `CONTACT_FROM_EMAIL` | כתובת השולח. ברירת מחדל: `AppliTech <onboarding@resend.dev>` |

הערה: עם `onboarding@resend.dev` ניתן לשלוח רק לכתובת המייל של חשבון Resend שלכם. לשליחה לכל כתובת יש לאמת דומיין ב-Resend ולעדכן את `CONTACT_FROM_EMAIL`.

## פריסה ל-Render

### אפשרות א': Blueprint (render.yaml)

1. דחפו את הפרויקט ל-GitHub/GitLab.
2. ב-Render: **New → Blueprint** ובחרו את הריפוזיטורי.
3. Render יזהה את `render.yaml`. הזינו את הערכים של `RESEND_API_KEY` ו-`CONTACT_TO_EMAIL` כשתתבקשו.
4. לחצו **Apply**. לאחר הבנייה האתר יהיה זמין בכתובת `*.onrender.com`.

### אפשרות ב': דרך הממשק

1. **New → Web Service** ובחרו את הריפוזיטורי.
2. הגדרות:
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
3. תחת **Environment** הוסיפו: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, ו-`HOST=0.0.0.0`.
4. לחצו **Create Web Service**.

> שימו לב: זהו Web Service (לא Static Site), כי נתיב ה-API דורש שרת. ב-Render, Static Site אינו מריץ קוד שרת.
