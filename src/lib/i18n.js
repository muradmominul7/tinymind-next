export const locales = ["bn", "en"];

// Change this one line to make Bengali the default language.
export const defaultLocale = "en";

export function isLocale(value) {
  return locales.includes(value);
}

const dictionaries = {
  bn: () => import("@/dictionaries/bn.json").then((m) => m.default),
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
};

// The language files in src/dictionaries hold only the texts that Bagisto does not have.
// All others (labels, footer, product, cart and contact texts, ...) come from Bagisto's own language files and
// theme settings through tinymind-headless, so each text is edited in one place only.
// If both have the same entry, Bagisto's text wins. See src/lib/texts.js.
export async function getDictionary(locale) {
  const { getBagistoTexts, mergeTexts } = await import("@/lib/texts");
  const own = await dictionaries[locale]();

  return mergeTexts(own, await getBagistoTexts(locale));
}
