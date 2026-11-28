// Texts of the sign in, sign up and account pages, one file per language in src/dictionaries/auth.
const texts = {
  bn: () => import("@/dictionaries/auth/bn.json").then((m) => m.default),
  en: () => import("@/dictionaries/auth/en.json").then((m) => m.default),
};

export async function getAuthTexts(lang) {
  return (texts[lang] ?? texts.en)();
}

// Only real texts are taken from Bagisto's answer, so nothing else can end up in the menu.
const onlyTexts = (object) =>
  Object.fromEntries(
    Object.entries(object ?? {}).filter(([, value]) => typeof value === "string" && value.trim() !== "")
  );

// The texts of the profile menu in the header. Bagisto holds them (its own dropdown has the same ones,
// see config/tinymind_account_texts.php in tinymind-headless), so they are asked from /api/tinymind/texts.
// The ones in src/dictionaries/auth/<lang>.json (menu) are the fallback for when Bagisto cannot be reached
// or has no such entry.
export async function getAccountMenuTexts(lang) {
  const own = (await getAuthTexts(lang)).menu;

  try {
    const { getBagistoTexts } = await import("@/lib/texts");
    const remote = await getBagistoTexts(lang);

    return { ...own, ...onlyTexts(remote?.accountMenu) };
  } catch (error) {
    console.error("getAccountMenuTexts: Bagisto texts not available", error.message);
    return own;
  }
}
