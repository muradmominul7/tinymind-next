import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getPage } from "@/lib/pages";

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  if (!(await isLocale(lang))) return {};

  const page = await getPage(slug, lang);
  if (!page) return {};

  const t = await getDictionary(lang);

  return {
    title: page.metaTitle || `${page.title} | ${t.site.name}`,
    description: page.metaDescription || undefined,
  };
}

// CMS pages (terms-conditions, privacy-policy, policies, ...) at /{lang}/{url_key}.
// The text is managed in the Bagisto admin panel. Routes of the app itself (cart, checkout, contact, ...)
// have their own folders and win over this one.
export default async function CmsPage({ params }) {
  const { lang, slug } = await params;
  if (!(await isLocale(lang))) notFound();

  const page = await getPage(slug, lang);
  if (!page) notFound();

  return <article dangerouslySetInnerHTML={{ __html: page.html }} />;
}
