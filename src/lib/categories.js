import { bagistoFetch } from "./bagisto";

function asList(json) {
  return Array.isArray(json) ? json : json?.member || [];
}

// Top-level categories for the header (the hidden "Root" category is skipped).
// Uses the nested-set numbers (_lft/_rgt) so sub-categories never show up in the top row.
export async function getTopCategories(lang) {
  const all = asList(await bagistoFetch("/categories?per_page=60", { locale: lang }));
  const usable = all.filter((c) => c.status && c.id !== 1);

  return usable
    .filter(
      (c) => !usable.some((d) => d.id !== c.id && d._lft < c._lft && c._rgt < d._rgt)
    )
    .sort((a, b) => a._lft - b._lft)
    .map((c) => ({
      id: c.id,
      name: c.translation?.name ?? "",
      slug: c.translation?.slug ?? "",
    }))
    .filter((c) => c.name);
}

export async function getCategory(id, lang) {
  try {
    const category = await bagistoFetch(`/categories/${id}`, { locale: lang });
    return category && category.status ? category : null;
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

// Category links are "/{lang}/category/{id}-{slug}". The id decides the page,
// the slug is only for readable URLs, so switching language never breaks the link.
export function categoryHref(lang, category) {
  return `/${lang}/category/${category.id}${category.slug ? `-${category.slug}` : ""}`;
}
