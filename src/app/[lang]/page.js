import ProductCard from "@/components/ProductCard";
import { bagistoList } from "@/lib/bagisto";
import { getDictionary, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function Home({ params }) {
  const { lang } = await params;
  if (!(await isLocale(lang))) notFound();
  const t = await getDictionary(lang);

  const { items } = await bagistoList("/products?per_page=12", {
    locale: lang,
  });

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold text-heading md:text-3xl">
        {t.home.title}
      </h1>

      {items.length ? (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} lang={lang} t={t} />
          ))}
        </ul>
      ) : (
        <p>{t.home.empty}</p>
      )}
    </section>
  );
}
