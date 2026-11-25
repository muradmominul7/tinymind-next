import { notFound } from "next/navigation";
import TrackForm from "@/components/TrackForm";
import { getDictionary, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);

  return { title: `${t.track.title} | ${t.site.name}`, robots: { index: false } };
}

export default async function TrackOrderPage({ params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const t = await getDictionary(lang);
  const c = t.track;

  return (
    <section className="mx-auto max-w-2xl py-6">
      <h1 className="text-3xl font-bold text-heading">{c.title}</h1>
      <p className="mt-3 text-lg">{c.subtitle}</p>

      <div className="mt-8">
        <TrackForm lang={lang} labels={c} />
      </div>
    </section>
  );
}
