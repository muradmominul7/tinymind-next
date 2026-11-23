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

export function getDictionary(locale) {
  return dictionaries[locale]();
}
