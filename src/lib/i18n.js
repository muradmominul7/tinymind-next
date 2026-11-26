// The storefront's languages are NOT decided here. They come from the default channel of Bagisto
// (Admin > Settings > Channels): its default locale and the locales it offers.
// They are fetched on the server from tinymind-headless (GET /api/tinymind/locale).
// Next.js reuses the answer for REVALIDATE_SECONDS, so a change in Bagisto shows up within about a minute.

const BASE_URL = process.env.BAGISTO_URL;
const REVALIDATE_SECONDS = 60;
const CODE = /^[A-Za-z]{2,3}(?:[_-][A-Za-z0-9]{2,8})?$/;

// Used only when the backend cannot be reached, so the storefront still opens.
const FALLBACK = {
  channel: null,
  defaultLocale: "en",
  locales: [
    { code: "en", name: "English", direction: "ltr" },
    { code: "bn", name: "বাংলা", direction: "ltr" },
  ],
};

// { channel, defaultLocale, locales: [{ code, name, direction }] }
export async function getLocaleSettings() {
  if (!BASE_URL) return FALLBACK;

  try {
    const res = await fetch(`${BASE_URL}/api/tinymind/locale`, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return FALLBACK;

    const body = await res.json();
    const locales = (Array.isArray(body?.locales) ? body.locales : [])
      .filter((l) => l && typeof l.code === "string" && CODE.test(l.code))
      .map((l) => ({
        code: l.code,
        name: String(l.name || l.code),
        direction: l.direction === "rtl" ? "rtl" : "ltr",
      }));
    if (!locales.length) return FALLBACK;

    const defaultLocale = locales.some((l) => l.code === body.default_locale)
      ? body.default_locale
      : locales[0].code;

    return { channel: body.channel ?? null, defaultLocale, locales };
  } catch (error) {
    console.error("getLocaleSettings failed", error.message);
    return FALLBACK;
  }
}

export async function getLocales() {
  return (await getLocaleSettings()).locales.map((l) => l.code);
}

export async function getDefaultLocale() {
  return (await getLocaleSettings()).defaultLocale;
}

// Async now, because the list of languages comes from Bagisto. Always use it as: await isLocale(lang)
export async function isLocale(value) {
  return typeof value === "string" && (await getLocales()).includes(value);
}

const dictionaries = {
  bn: () => import("@/dictionaries/bn.json").then((m) => m.default),
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
};

// The language files in src/dictionaries hold only the texts that Bagisto does not have.
// All others (labels, footer, product, cart and contact texts, ...) come from Bagisto's own language files and
// theme settings through tinymind-headless, so each text is edited in one place only.
// If both have the same entry, Bagisto's text wins. See src/lib/texts.js.
// A language that has no file here (a new locale added in the Bagisto channel) uses the English file
// for the storefront's own texts, and Bagisto's texts for everything else.
export async function getDictionary(locale) {
  const { getBagistoTexts, mergeTexts } = await import("@/lib/texts");
  const own = await (dictionaries[locale] ?? dictionaries.en)();

  return mergeTexts(own, await getBagistoTexts(locale));
}
