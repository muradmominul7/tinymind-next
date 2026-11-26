import { notFound } from "next/navigation";
import ContactForm from "@/components/ContactForm";
import { getDictionary, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!(await isLocale(lang))) return {};
  const t = await getDictionary(lang);

  return { title: `${t.contact.title} | ${t.site.name}` };
}

export default async function ContactPage({ params }) {
  const { lang } = await params;
  if (!(await isLocale(lang))) notFound();

  const t = await getDictionary(lang);
  const c = t.contact;

  return (
    <section className="mx-auto max-w-4xl rounded-2xl border border-subtle p-6 sm:p-10 md:p-14">
      <h1 className="text-3xl font-bold text-heading">{c.title}</h1>
      <p className="mt-3 text-lg">{c.subtitle}</p>

      <div className="mt-8">
        <ContactForm lang={lang} labels={c} />
      </div>
    </section>
  );
}
