import { cookies } from "next/headers";
import { bagistoFetch } from "./bagisto";

// The customer token is a secret: it lives in an httpOnly cookie and is only used on the server.
// "customer_session" is a plain cookie that holds just "1", so the header icon can choose between
// the sign in page and the account page without a server call.
// The cart has its own token (see cart.js). Signing in does not change how the cart or checkout work.
export const CUSTOMER_TOKEN_COOKIE = "customer_token";
export const CUSTOMER_FLAG_COOKIE = "customer_session";
export const CUSTOMER_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

// Old accounts that were made without an email carry <mobile number>@nomail.com. New accounts need a real
// email. Such an address is never shown on the account page, which offers to add a real one instead.
export const FALLBACK_EMAIL_DOMAIN = "nomail.com";

const cookieBase = () => ({
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: CUSTOMER_COOKIE_MAX_AGE,
});

export function setCustomerCookies(jar, token) {
  jar.set(CUSTOMER_TOKEN_COOKIE, token, { ...cookieBase(), httpOnly: true });
  jar.set(CUSTOMER_FLAG_COOKIE, "1", { ...cookieBase(), httpOnly: false });
}

export function clearCustomerCookies(jar) {
  jar.delete(CUSTOMER_TOKEN_COOKIE);
  jar.delete(CUSTOMER_FLAG_COOKIE);
}

export async function getCustomerToken() {
  return (await cookies()).get(CUSTOMER_TOKEN_COOKIE)?.value ?? null;
}

// Bangladeshi mobile number: 01XXXXXXXXX (also accepts +880 / 880 in front). Returns the 11 digits or null.
export function normalizePhone(value) {
  let digits = String(value ?? "").replace(/\D/g, "");
  if (digits.startsWith("880")) digits = `0${digits.slice(3)}`;
  return /^01[3-9]\d{8}$/.test(digits) ? digits : null;
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? ""));
}

// The API answers a successful sign in with a token. The field name is read from a few likely places.
export function pickToken(answer) {
  return answer?.token ?? answer?.apiToken ?? answer?.accessToken ?? answer?.data?.token ?? null;
}

// Call the Bagisto API as a customer. Never cached.
export function customerApi(path, { method = "GET", body, token, locale } = {}) {
  return bagistoFetch(path, {
    method,
    ...(body ? { body: JSON.stringify(body) } : {}),
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    locale,
    revalidate: 0,
  });
}

// The first (or only) item of an answer that can be a list, a { member: [...] } list or a single object.
export function firstItem(answer) {
  if (Array.isArray(answer)) return answer[0] ?? null;
  if (Array.isArray(answer?.member)) return answer.member[0] ?? null;
  return answer && typeof answer === "object" ? answer : null;
}

export function listItems(answer) {
  if (Array.isArray(answer)) return answer;
  if (Array.isArray(answer?.member)) return answer.member;
  return [];
}

// POST to one of our own endpoints in tinymind-headless (/api/tinymind/...), which are not part of /api/shop.
export async function tinymindPost(path, body) {
  const base = process.env.BAGISTO_URL;
  if (!base) throw new Error("BAGISTO_URL is missing in .env.local");

  const res = await fetch(`${base}/api/tinymind${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const error = new Error(`tinymind API error ${res.status} on ${path}`);
    error.status = res.status;
    throw error;
  }

  return res.json().catch(() => ({}));
}

// Attaches an order that was just placed to the signed-in customer, so it shows in "My orders".
// The checkout works with the cart token, so the order starts as a guest order; tinymind-headless
// (POST /api/tinymind/link-order) turns it into the customer's order. Needs ORDER_LINK_TOKEN (same value in
// tinymind-headless/.env). Never throws and never blocks the order: a refusal only means a guest order.
export async function linkOrderToCustomer(orderId) {
  const customerToken = await getCustomerToken();
  const secret = process.env.ORDER_LINK_TOKEN;
  const base = process.env.BAGISTO_URL;
  const id = Number(orderId);

  if (!customerToken) return false; // a guest: nothing to attach
  if (!secret || !base || !Number.isInteger(id) || id < 1) {
    console.error("link order skipped: ORDER_LINK_TOKEN, BAGISTO_URL or the order id is missing");
    return false;
  }

  try {
    const res = await fetch(`${base}/api/tinymind/link-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ orderId: id, customerToken }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("link order refused", res.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("link order failed", error.message);
    return false;
  }
}

// What the checkout form starts with for a signed-in customer: name and mobile number from the profile,
// district and address from the delivery place of the customer's latest order (tinymind-headless
// POST /api/tinymind/checkout-defaults). Missing parts stay empty. Never throws: the checkout must always open.
export async function getCheckoutDefaults(lang) {
  const token = await getCustomerToken();
  if (!token) return null;

  const base = process.env.BAGISTO_URL;
  const secret = process.env.ORDER_LINK_TOKEN;

  const profileCall = customerApi("/customer-profile", { token, locale: lang })
    .then(firstItem)
    .catch((error) => {
      console.error("checkout defaults: profile failed", error.status ?? "", error.message);
      return null;
    });

  const placeCall =
    base && secret
      ? fetch(`${base}/api/tinymind/checkout-defaults`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${secret}` },
          body: JSON.stringify({ customerToken: token }),
          cache: "no-store",
        })
          .then((res) => (res.ok ? res.json() : null))
          .catch((error) => {
            console.error("checkout defaults: latest order place failed", error.message);
            return null;
          })
      : Promise.resolve(null);

  const [profile, place] = await Promise.all([profileCall, placeCall]);

  const name = [profile?.firstName ?? profile?.first_name, profile?.lastName ?? profile?.last_name]
    .filter((part) => part && part !== "-")
    .join(" ");

  return {
    name,
    phone: String(profile?.phone ?? ""),
    district: String(place?.district ?? ""),
    address: String(place?.address ?? ""),
  };
}
