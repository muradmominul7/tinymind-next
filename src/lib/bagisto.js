const BASE_URL = process.env.BAGISTO_URL;
const STOREFRONT_KEY = process.env.BAGISTO_STOREFRONT_KEY;

// Server-side only. The storefront key never reaches the browser.
export async function bagistoFetch(path, { locale, headers = {}, ...options } = {}) {
  if (!BASE_URL || !STOREFRONT_KEY) {
    throw new Error("BAGISTO_URL or BAGISTO_STOREFRONT_KEY is missing in .env.local");
  }

  const res = await fetch(`${BASE_URL}/api/shop${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      Accept: "application/json",
      "X-STOREFRONT-KEY": STOREFRONT_KEY,
      ...(locale ? { "X-Locale": locale } : {}),
      ...headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Bagisto API error ${res.status} on ${path}`);
  }

  return res.json();
}
