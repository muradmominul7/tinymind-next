import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { bagistoList } from "@/lib/bagisto";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function Home({ params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);

  const { items } = await bagistoList("/products?per_page=12", { locale: lang });

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold text-heading">{t.home.title}</h1>

      {items.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} lang={lang} />
          ))}
        </ul>
      ) : (
        <p>{t.home.empty}</p>
      )}
    </section>
  );
}
