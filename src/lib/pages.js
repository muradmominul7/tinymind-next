import { bagistoList } from "./bagisto";

const MAX_LIST_PAGES = 6; // how many list pages are searched at most (the API lists 10 CMS pages per page)

// First address segments that belong to the app itself. A link such as "/cart" in a CMS page stays as it is.
const APP_ROUTES = new Set([
  "bn",
  "en",
  "api",
  "cart",
  "category",
  "checkout",
  "contact",
  "order-success",
  "product",
  "search",
  "track-order",
]);

// CMS pages were written for the old site, where a page lived at "/return-policy" or "/page/return-policy".
// Here a page lives at "/{lang}/return-policy", so links inside the content get the language in front.
// Some links were saved with the full address of the old site (for example the local test address),
// so those are handled as well.
const OLD_SITE = "(?:https?:\\/\\/(?:www\\.)?(?:tinymind-2\\.5\\.0\\.test|tinymind-headless\\.test|tinymind\\.com\\.bd))?";
const LINK = new RegExp(`href="${OLD_SITE}\\/(?:page\\/)?([a-z0-9-]+)\\/?"`, "gi");

function fixLinks(html, lang) {
  return html.replace(LINK, (match, key) =>
    APP_ROUTES.has(key.toLowerCase()) ? match : `href="/${lang}/${key}"`
  );
}

// The content comes from the admin panel, so it is trusted; scripts are removed anyway.
function cleanHtml(html, lang) {
  return fixLinks(String(html ?? "").replace(/<script\b[\s\S]*?<\/script>/gi, ""), lang);
}

// Finds one CMS page by its url key (for example "terms-conditions") in the given language.
export async function getPage(urlKey, lang) {
  if (!/^[a-z0-9-]{1,80}$/.test(urlKey)) return null;

  let previousFirst = null;

  for (let page = 1; page <= MAX_LIST_PAGES; page += 1) {
    const { items, totalPages } = await bagistoList(`/pages?page=${page}`, {
      locale: lang,
      revalidate: 300,
    });

    const found = items.find((item) => item.translation?.urlKey === urlKey);
    if (found) {
      const t = found.translation;
      return {
        title: t.pageTitle ?? "",
        html: cleanHtml(t.htmlContent, lang),
        metaTitle: t.metaTitle ?? "",
        metaDescription: t.metaDescription ?? "",
      };
    }

    const firstId = items[0]?._id ?? null;
    const lastPage = !items.length || (totalPages && page >= totalPages) || firstId === previousFirst;
    if (lastPage) break;
    previousFirst = firstId;
  }

  return null;
}
