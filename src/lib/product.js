// Helpers for product pages and cards.
// URL shape: /bn/product/144-zayan-entelligence-book  (id first, so language switch never breaks the link)

export function productHref(lang, product) {
  return `/${lang}/product/${product.id}-${product.urlKey}`;
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function decodeSlug(slug) {
  return safeDecode(slug);
}

// "144-some-name" -> 144 (null if the slug does not start with a number)
export function parseProductId(slug) {
  const match = /^(\d+)(?:-|$)/.exec(safeDecode(slug));
  return match ? Number(match[1]) : null;
}

// Symbol first, digits follow the language: ৳৯৫০ (bn) / ৳950 (en). ".00" is dropped.
export function formatPrice(value, lang) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  const digits = new Intl.NumberFormat(lang === "bn" ? "bn-BD" : "en-US", {
    maximumFractionDigits: 2,
  }).format(number);
  return `৳${digits}`;
}

export function isOnSale(product) {
  const special = Number(product.specialPrice);
  return Number.isFinite(special) && special > 0 && special < Number(product.price);
}

export function productImages(product) {
  const list = (product.images || [])
    .slice()
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((img) => img.publicPath)
    .filter(Boolean);

  if (list.length) return list;
  return product.baseImageUrl ? [product.baseImageUrl] : [];
}

export function stripHtml(html = "") {
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
