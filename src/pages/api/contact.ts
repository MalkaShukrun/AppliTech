import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// This route runs on the server at request time; the rest of the site is static.
export const prerender = false;

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const env = (key: string): string | undefined =>
  process.env[key] ?? (import.meta.env[key] as string | undefined);

export const POST: APIRoute = async ({ request }) => {
  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return json({ success: false, error: 'בקשה לא תקינה.' }, 400);
  }

  // Honeypot: pretend success so bots don't retry.
  if (typeof data.website === 'string' && data.website.trim() !== '') {
    return json({ success: true });
  }

  const name = String(data.name ?? '').trim();
  const email = String(data.email ?? '').trim();
  const phone = String(data.phone ?? '').trim();
  const message = String(data.message ?? '').trim();

  if (name.length < 2 || name.length > 100) {
    return json({ success: false, error: 'נא להזין שם מלא.' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 150) {
    return json({ success: false, error: 'כתובת הדוא"ל אינה תקינה.' }, 400);
  }
  if (!/^[0-9+\-()\s]{7,20}$/.test(phone)) {
    return json({ success: false, error: 'מספר הטלפון אינו תקין.' }, 400);
  }
  if (message.length < 5 || message.length > 3000) {
    return json({ success: false, error: 'נא לתאר את הפרויקט (לפחות כמה מילים).' }, 400);
  }

  const apiKey = env('RESEND_API_KEY');
  const to = env('CONTACT_TO_EMAIL');
  const from = env('CONTACT_FROM_EMAIL') ?? 'AppliTech <onboarding@resend.dev>';

  if (!apiKey || !to) {
    console.error('Missing RESEND_API_KEY or CONTACT_TO_EMAIL');
    return json({ success: false, error: 'שירות המייל אינו מוגדר כרגע.' }, 500);
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `פנייה חדשה מהאתר - ${name}`,
      html: `
        <div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>פנייה חדשה מאתר AppliTech</h2>
          <p><strong>שם:</strong> ${escapeHtml(name)}</p>
          <p><strong>דוא"ל:</strong> ${escapeHtml(email)}</p>
          <p><strong>טלפון:</strong> ${escapeHtml(phone)}</p>
          <p><strong>תיאור הפרויקט:</strong></p>
          <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
        </div>`,
      text: `שם: ${name}\nדוא"ל: ${email}\nטלפון: ${phone}\n\n${message}`,
    });

    if (error) {
      console.error('Resend error:', error);
      return json({ success: false, error: 'שליחת ההודעה נכשלה. נסו שוב מאוחר יותר.' }, 502);
    }
    return json({ success: true });
  } catch (err) {
    console.error('Contact route error:', err);
    return json({ success: false, error: 'אירעה שגיאה בשרת.' }, 500);
  }
};
