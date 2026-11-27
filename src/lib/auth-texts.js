// Texts of the sign in, sign up and account pages, one file per language in src/dictionaries/auth.
const texts = {
  bn: () => import("@/dictionaries/auth/bn.json").then((m) => m.default),
  en: () => import("@/dictionaries/auth/en.json").then((m) => m.default),
};

export async function getAuthTexts(lang) {
  return (texts[lang] ?? texts.en)();
}
