"use server";

import { headers } from "next/headers";
import { isLocale } from "@/lib/i18n";

const BASE_URL = process.env.BAGISTO_URL;
const TOKEN = process.env.BAGISTO_TRACKING_TOKEN;

// Looks up an order by order number + phone through POST /api/tinymind/track-order on the Bagisto backend.
// The backend decides what the customer may see, counts wrong attempts and writes the texts in the right language.
export async function trackOrder({ lang, orderNumber, phone }) {
  if (!isLocale(lang)) return { ok: false, reason: "failed" };

  const number = String(orderNumber ?? "").trim();
  const digits = String(phone ?? "").trim();
  if (!number || !digits) return { ok: false, reason: "invalid" };

  if (!BASE_URL || !TOKEN) {
    console.error("trackOrder: BAGISTO_URL or BAGISTO_TRACKING_TOKEN is missing in .env.local");
    return { ok: false, reason: "failed" };
  }

  // The backend counts wrong attempts per customer, so it needs the customer's address, not ours.
  // The last entry is the one added by the server in front of the app.
  const forwarded = (await headers()).get("x-forwarded-for") ?? "";
  const clientIp = forwarded.split(",").pop().trim();

  try {
    const res = await fetch(`${BASE_URL}/api/tinymind/track-order`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Tracking-Token": TOKEN,
      },
      body: JSON.stringify({
        order_number: number.slice(0, 50),
        phone: digits.slice(0, 30),
        lang,
        client_ip: clientIp.slice(0, 64),
      }),
    });

    const body = await res.json().catch(() => null);

    if (res.ok && body) return { ok: true, order: body };

    if ((res.status === 404 || res.status === 429) && body) {
      return { ok: false, reason: body.error ?? "failed", message: body.message ?? "" };
    }

    console.error("trackOrder failed", res.status, body?.error ?? "");
    return { ok: false, reason: "failed" };
  } catch (error) {
    console.error("trackOrder failed", error.message);
    return { ok: false, reason: "failed" };
  }
}
