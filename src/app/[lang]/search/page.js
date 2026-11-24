import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { bagistoList } from "@/lib/bagisto";
import { formatNumber } from "@/lib/format";
import { getDictionary, isLocale } from "@/lib/i18n";

const PER_PAGE = 24;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);

  return { title: `${t.search.title} | ${t.site.name}`, robots: { index: false } };
}

export default async function SearchPage({ params, searchParams }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const t = await getDictionary(lang);
  const query = await searchParams;
  const q = (typeof query?.q === "string" ? query.q : "").trim().slice(0, 100);
  const page = Math.max(1, Number.parseInt(query?.page, 10) || 1);

  let items = [];
  let pages = 1;
  if (q) {
    const result = await bagistoList(
      `/products?query=${encodeURIComponent(q)}&per_page=${PER_PAGE}&page=${page}`,
      { locale: lang }
    );
    items = result.items;
    pages = result.totalPages || 1;
  }

  const href = (n) => `/${lang}/search?q=${encodeURIComponent(q)}${n > 1 ? `&page=${n}` : ""}`;

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold text-heading md:text-3xl">
        {q ? `${t.search.resultsFor}: ${q}` : t.search.title}
      </h1>

      {!q ? (
        <p>{t.search.prompt}</p>
      ) : items.length ? (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} lang={lang} t={t} />
          ))}
        </ul>
      ) : (
        <p>{t.search.empty}</p>
      )}

      {pages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-4 text-sm font-semibold">
          {page > 1 && (
            <Link href={href(page - 1)} className="rounded-full bg-secondary px-4 py-2 text-brand">
              {t.category.prev}
            </Link>
          )}
          <span>
            {t.category.page} {formatNumber(page, lang)} / {formatNumber(pages, lang)}
          </span>
          {page < pages && (
            <Link href={href(page + 1)} className="rounded-full bg-secondary px-4 py-2 text-brand">
              {t.category.next}
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
