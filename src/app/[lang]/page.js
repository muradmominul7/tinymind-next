import { Suspense } from "react";
import { notFound } from "next/navigation";
import { bagistoFetch } from "@/lib/bagisto";
import { formatMoney } from "@/lib/format";
import { getDictionary, isLocale } from "@/lib/i18n";

async function ProductList({ lang, t }) {
  const products = await bagistoFetch("/products?per_page=12", { locale: lang });

  if (!products.length) {
    return <p>{t.home.empty}</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => {
        const onSale = p.specialPrice && Number(p.specialPrice) < Number(p.price);

        return (
          <li key={p.id} className="rounded-xl border border-subtle bg-page p-3">
            <img src={p.baseImageUrl} alt={p.name} className="mb-2 w-full rounded-lg" />
            <p className="font-semibold text-heading">{p.name}</p>
            <p className="mt-1">
              {onSale ? (
                <>
                  <span className="font-bold text-brand">{formatMoney(p.specialPrice, lang)}</span>{" "}
                  <span className="text-sm line-through">{formatMoney(p.price, lang)}</span>
                </>
              ) : (
                <span className="font-bold text-brand">{formatMoney(p.price, lang)}</span>
              )}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export default async function Home({ params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold text-heading">{t.home.title}</h1>
      <Suspense fallback={<p>{t.home.loading}</p>}>
        <ProductList lang={lang} t={t} />
      </Suspense>
    </section>
  );
}
