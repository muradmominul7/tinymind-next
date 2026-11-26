// Content that the shop owner edits in the Bagisto admin (Configure > General > Content):
// the offer line of the top bar and the footer copyright.
// It is fetched on the server from tinymind-headless. Next.js reuses the answer for REVALIDATE_SECONDS,
// so a change made in the admin shows up on the storefront within about a minute.

const BASE_URL = process.env.BAGISTO_URL;
const REVALIDATE_SECONDS = 60;

// Returns { offer: { title, link_title, link }, copyright } or null when the backend cannot be reached.
// Callers must cope with null (the storefront then simply leaves that line out).
export async function getSiteContent(lang) {
  if (!BASE_URL) return null;

  try {
    const res = await fetch(`${BASE_URL}/api/tinymind/site-content?lang=${encodeURIComponent(lang)}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("getSiteContent failed", error.message);
    return null;
  }
}

// The admin keeps links the way the old Blade shop used them ("/shop", "https://tinymind-headless.test/...").
// This turns them into links of the Next.js storefront: "/" -> "/bn", "/shop" -> "/bn/shop",
// a link to the backend's own address -> the same path on the storefront. Other sites stay as they are.
// `codes` = the languages of the Bagisto channel, so a link that already starts with one is left alone.
export function localizeLink(link, lang, codes = [lang]) {
  const value = String(link ?? "").trim();
  if (!value) return `/${lang}`;

  let path = value;

  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      if (!BASE_URL || url.origin !== new URL(BASE_URL).origin) return value; // another site
      path = `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return value;
    }
  }

  if (!path.startsWith("/")) path = `/${path}`;
  if (path === "/") return `/${lang}`;
  const first = path.split(/[/?#]/)[1];
  if (codes.includes(first)) return path; // already has a language
  return `/${lang}${path}`;
}
