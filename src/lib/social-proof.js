// "Someone just bought" pop-up: the recent purchases come from tinymind-headless
// (GET /api/tinymind/social-proof). Name, city, product line and "5 minutes ago" are already written in the
// right language by Bagisto (lang/<code>/social-proof.php), so they are edited there only.
// The answer is reused for 5 minutes. This runs on the server only; the browser asks /api/social-proof.

const BASE_URL = process.env.BAGISTO_URL;

const texts = {
  bn: () => import("@/dictionaries/social-proof/bn.json").then((m) => m.default),
  en: () => import("@/dictionaries/social-proof/en.json").then((m) => m.default),
};

export async function getSocialProofTexts(lang) {
  return (texts[lang] ?? texts.en)();
}

export async function getSocialProof(lang) {
  if (!BASE_URL) return [];

  try {
    const res = await fetch(`${BASE_URL}/api/tinymind/social-proof?lang=${encodeURIComponent(lang)}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];

    const body = await res.json();

    return (Array.isArray(body) ? body : [])
      .filter((item) => item && item.productId && item.urlKey)
      .map((item) => ({
        name: String(item.name || ""),
        city: String(item.city || ""),
        product: String(item.product || ""),
        time: String(item.time || ""),
        image: typeof item.image === "string" && item.image ? item.image : null,
        href: `/${lang}/product/${item.productId}-${encodeURIComponent(item.urlKey)}`,
      }));
  } catch (error) {
    console.error("getSocialProof failed", error.message);
    return [];
  }
}
