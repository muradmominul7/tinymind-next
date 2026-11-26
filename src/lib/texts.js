// Texts that Bagisto already holds (its language files and the Services Content section of the theme).
// They are fetched on the server from tinymind-headless (GET /api/tinymind/texts), which says in
// config/tinymind_texts.php which storefront text comes from which Bagisto entry.
// Next.js reuses the answer for REVALIDATE_SECONDS, so a change in Bagisto shows up within about a minute.

const BASE_URL = process.env.BAGISTO_URL;
const REVALIDATE_SECONDS = 60;

const isPlainObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

// The answer has the same shape as the storefront's own language file. Returns {} when the backend
// cannot be reached; the storefront then has only its own (smaller) language file.
export async function getBagistoTexts(lang) {
  if (!BASE_URL) return {};

  try {
    const res = await fetch(`${BASE_URL}/api/tinymind/texts?lang=${encodeURIComponent(lang)}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return {};

    const body = await res.json();
    return isPlainObject(body) ? body : {};
  } catch (error) {
    console.error("getBagistoTexts failed", error.message);
    return {};
  }
}

// Lays `extra` over `base`: objects are merged entry by entry, everything else (texts, lists) is replaced.
export function mergeTexts(base, extra) {
  if (!isPlainObject(extra)) return base;

  const merged = { ...base };
  for (const [key, value] of Object.entries(extra)) {
    merged[key] = isPlainObject(value) && isPlainObject(base?.[key]) ? mergeTexts(base[key], value) : value;
  }
  return merged;
}
