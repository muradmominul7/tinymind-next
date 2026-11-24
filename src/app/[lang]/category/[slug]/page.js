import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { bagistoList } from "@/lib/bagisto";
import { getCategory } from "@/lib/categories";
import { formatNumber } from "@/lib/format";
import { getDictionary, isLocale } from "@/lib/i18n";

const PER_PAGE = 24;

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

  const { items, totalPages } = await bagistoList(
    `/products?category_id=${id}&per_page=${PER_PAGE}&page=${page}`,
    { locale: lang }
  );

  const base = `/${lang}/category/${slug}`;
  const pages = totalPages || 1;

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold text-heading md:text-3xl">{category.translation?.name}</h1>

      {items.length ? (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} lang={lang} t={t} />
          ))}
        </ul>
      ) : (
        <p>{t.category.empty}</p>
      )}

      {pages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-4 text-sm font-semibold">
          {page > 1 && (
            <Link href={`${base}?page=${page - 1}`} className="rounded-full bg-secondary px-4 py-2 text-brand">
              {t.category.prev}
            </Link>
          )}
          <span>
            {t.category.page} {formatNumber(page, lang)} / {formatNumber(pages, lang)}
          </span>
          {page < pages && (
            <Link href={`${base}?page=${page + 1}`} className="rounded-full bg-secondary px-4 py-2 text-brand">
              {t.category.next}
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
