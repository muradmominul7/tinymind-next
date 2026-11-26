"use server";

import { bagistoFetch } from "@/lib/bagisto";
import { isLocale } from "@/lib/i18n";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Sends the contact form to the Bagisto API (POST /api/shop/contact-us). Bagisto then mails it to the shop.
export async function sendContact({ lang, name, email, phone, message, website }) {
  if (!(await isLocale(lang))) return { ok: false, reason: "failed" };

  // "website" is a hidden field that only bots fill in. They are told it worked, nothing is sent.
  if (website) return { ok: true };

  const cleanName = String(name ?? "").trim();
  const cleanEmail = String(email ?? "").trim();
  const cleanPhone = String(phone ?? "").trim();
  const cleanMessage = String(message ?? "").trim();

  const errors = {};
  if (!cleanName) errors.name = true;
  if (!EMAIL.test(cleanEmail)) errors.email = true;
  if (cleanMessage.length < 2) errors.message = true;
  if (Object.keys(errors).length) return { ok: false, errors };

  try {
    await bagistoFetch("/contact-us", {
      method: "POST",
      locale: lang,
      revalidate: 0,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: cleanName.slice(0, 100),
        email: cleanEmail.slice(0, 150),
        contact: cleanPhone.slice(0, 30),
        message: cleanMessage.slice(0, 2000),
      }),
    });

    return { ok: true };
  } catch (error) {
    console.error("sendContact failed", error.status ?? "", error.message, error.detail ?? "");
    return { ok: false, reason: "failed" };
  }
}
