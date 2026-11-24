import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import CategoryToolbar from "@/components/CategoryToolbar";
import ProductCard from "@/components/ProductCard";
import { bagistoList } from "@/lib/bagisto";
import { getCategory } from "@/lib/categories";
import { formatNumber } from "@/lib/format";
import { getDictionary, isLocale } from "@/lib/i18n";

// The first value of each list is the default and is left out of the URL.
const SORTS = ["created_at-desc", "created_at-asc", "price-asc", "price-desc"];
const PER_PAGE = [12, 24, 36, 48]; // the API allows at most 50

function parseId(slug) {
  const id = Number.parseInt(slug, 10);
  return Number.isInteger(id) && id > 1 ? id : null;
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const id = parseId(slug);
  if (!isLocale(lang) || !id) return {};

  const [category, t] = await Promise.all([getCategory(id, lang), getDictionary(lang)]);
  const name = category?.translation?.name;

  return name ? { title: `${name} | ${t.site.name}` } : {};
}

export default async function CategoryPage({ params, searchParams }) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const id = parseId(slug);
  if (!id) notFound();

  const category = await getCategory(id, lang);
  if (!category) notFound();

  const t = await getDictionary(lang);
  const query = await searchParams;
  const page = Math.max(1, Number.parseInt(query?.page, 10) || 1);
  const sort = SORTS.includes(query?.sort) ? query.sort : SORTS[0];
  const perPage = PER_PAGE.includes(Number(query?.per_page)) ? Number(query.per_page) : PER_PAGE[0];
  const view = query?.view === "list" ? "list" : "grid";

  const { items, totalPages } = await bagistoList(
    `/products?category_id=${id}&per_page=${perPage}&page=${page}&sort=${sort}`,
    { locale: lang }
  );

  const base = `/${lang}/category/${slug}`;
  const pages = totalPages || 1;

  // Page links keep the chosen sort, page size and view.
  const pageHref = (n) => {
    const q = new URLSearchParams();
    if (n > 1) q.set("page", String(n));
    if (sort !== SORTS[0]) q.set("sort", sort);
    if (perPage !== PER_PAGE[0]) q.set("per_page", String(perPage));
    if (view === "list") q.set("view", "list");
    const s = q.toString();
    return s ? `${base}?${s}` : base;
  };

  const sortOptions = SORTS.map((value) => ({ value, label: t.category.sortOptions[value] }));

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold text-heading md:text-3xl">{category.translation?.name}</h1>

      <Suspense fallback={null}>
        <CategoryToolbar
          labels={t.category}
          sort={sort}
          perPage={perPage}
          view={view}
          sortOptions={sortOptions}
          perPageOptions={PER_PAGE}
        />
      </Suspense>

      {items.length ? (
        <ul
          className={
            view === "list" ? "grid grid-cols-1 gap-4" : "grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
          }
        >
          {items.map((p) => (
            <ProductCard key={p.id} product={p} lang={lang} t={t} variant={view} />
          ))}
        </ul>
      ) : (
        <p>{t.category.empty}</p>
      )}

      {pages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-4 text-sm font-semibold">
          {page > 1 && (
            <Link href={pageHref(page - 1)} className="rounded-full bg-secondary px-4 py-2 text-brand">
              {t.category.prev}
            </Link>
          )}
          <span>
            {t.category.page} {formatNumber(page, lang)} / {formatNumber(pages, lang)}
          </span>
          {page < pages && (
            <Link href={pageHref(page + 1)} className="rounded-full bg-secondary px-4 py-2 text-brand">
              {t.category.next}
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
