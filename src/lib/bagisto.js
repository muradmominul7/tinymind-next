const BASE_URL = process.env.BAGISTO_URL;
const STOREFRONT_KEY = process.env.BAGISTO_STOREFRONT_KEY;

export async function bagistoFetch(path, options = {}) {
  if (!BASE_URL || !STOREFRONT_KEY) {
    throw new Error(
      "BAGISTO_URL or BAGISTO_STOREFRONT_KEY is missing in .env.local",
    );
  }

  const res = await fetch(`${BASE_URL}/api/shop${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "X-STOREFRONT-KEY": STOREFRONT_KEY,
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Bagisto API error ${res.status} on ${path}`);
  }

  return res.json();
}
