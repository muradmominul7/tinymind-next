import CheckoutForm from "@/components/CheckoutForm";
import { cartImage, readCart } from "@/lib/cart";
import { getCheckoutDefaults } from "@/lib/customer";
import { districtByCode, districtOptions } from "@/lib/districts";
import { getDictionary, isLocale } from "@/lib/i18n";
import { formatPrice } from "@/lib/product";
import { notFound, redirect } from "next/navigation";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!(await isLocale(lang))) return {};
  const t = await getDictionary(lang);

  return {
    title: `${t.checkout.title} | ${t.site.name}`,
    robots: { index: false },
  };
}

export default async function CheckoutPage({ params }) {
  const { lang } = await params;
  if (!(await isLocale(lang))) notFound();

  const cart = await readCart(lang);
  const lines = cart?.items ?? [];
  if (!lines.length) redirect(`/${lang}/cart`);

  // A signed-in customer gets the form filled in; a guest gets an empty form.
  const initial = await getCheckoutDefaults(lang);
  if (initial && !districtByCode(initial.district)) initial.district = "";

  const t = await getDictionary(lang);
  const number = new Intl.NumberFormat(lang === "bn" ? "bn-BD" : "en-US");

  const summary = {
    subtotal: Number(cart.subtotal) || 0,
    discount: Number(cart.discountAmount) || 0,
    items: lines.map((line) => ({
      id: line.id,
      name: line.name,
      quantityText: number.format(line.quantity),
      image: cartImage(line),
      totalText: formatPrice(line.total, lang),
    })),
  };

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold text-heading md:text-3xl">
        {t.checkout.title}
      </h1>
      <CheckoutForm
        lang={lang}
        labels={t.checkout}
        districts={districtOptions()}
        summary={summary}
        initial={initial}
      />
    </section>
  );
}
