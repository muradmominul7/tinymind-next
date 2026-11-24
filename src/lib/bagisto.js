const BASE_URL = process.env.BAGISTO_URL;
const STOREFRONT_KEY = process.env.BAGISTO_STOREFRONT_KEY;

// Server-side only. The storefront key never reaches the browser.
// `revalidate` = how many seconds Next.js may reuse a cached API answer (0 = never).
export async function bagistoRequest(
  path,
  { locale, revalidate = 60, headers = {}, ...options } = {}
) {
  if (!BASE_URL || !STOREFRONT_KEY) {
    throw new Error("BAGISTO_URL or BAGISTO_STOREFRONT_KEY is missing in .env.local");
  }

  const res = await fetch(`${BASE_URL}/api/shop${path}`, {
    ...options,
    next: { revalidate },
    headers: {
      Accept: "application/json",
      "X-STOREFRONT-KEY": STOREFRONT_KEY,
      ...(locale ? { "X-Locale": locale } : {}),
      ...headers,
    },
  });

  if (!res.ok) {
    const error = new Error(`Bagisto API error ${res.status} on ${path}`);
    error.status = res.status;
    // The API explains failures in the body ("Cart is empty", ...). Kept for server logs only.
    try {
      const body = await res.json();
      error.detail = body?.detail ?? body?.message ?? null;
    } catch {
      error.detail = null;
    }
    throw error;
  }

  return res;
}

export async function bagistoFetch(path, options) {
  const res = await bagistoRequest(path, options);
  return res.json();
}

// For list endpoints: returns the items plus the paging numbers from the response headers.
export async function bagistoList(path, options) {
  const res = await bagistoRequest(path, options);
  const json = await res.json();
  const num = (name) => {
    const v = Number(res.headers.get(name));
    return Number.isFinite(v) && v > 0 ? v : null;
  };

  return {
    items: Array.isArray(json) ? json : json?.member || [],
    total: num("X-Total-Count"),
    totalPages: num("X-Total-Pages"),
  };
}
