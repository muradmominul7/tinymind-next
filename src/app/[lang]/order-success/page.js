import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);

  return { title: `${t.checkout.title} | ${t.site.name}`, robots: { index: false } };
}

export default async function OrderSuccessPage({ params, searchParams }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const t = await getDictionary(lang);
  const query = await searchParams;
  const raw = typeof query?.o === "string" ? query.o : "";
  const orderNo = /^[\w-]{1,30}$/.test(raw) ? raw : null;

  return (
    <section className="py-10 text-center">
      <h1 className="mb-4 text-2xl font-bold text-heading md:text-3xl">{t.checkout.successTitle}</h1>
      {orderNo && (
        <p className="mb-6 text-lg">
          {t.checkout.orderNumber}: <span className="font-bold text-brand">{orderNo}</span>
        </p>
      )}
      <Link
        href={`/${lang}`}
        className="inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-alt"
      >
        {t.cart.continue}
      </Link>
    </section>
  );
}
