import Link from "next/link";
import { notFound } from "next/navigation";
import CartItems from "@/components/CartItems";
import { cartImage, readCart } from "@/lib/cart";
import { getDictionary, isLocale } from "@/lib/i18n";
import { formatPrice } from "@/lib/product";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);

  return { title: `${t.cart.title} | ${t.site.name}` };
}

export default async function CartPage({ params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const t = await getDictionary(lang);
  const cart = await readCart(lang);
  const lines = cart?.items ?? [];
  const number = new Intl.NumberFormat(lang === "bn" ? "bn-BD" : "en-US");

  if (!lines.length) {
    return (
      <section className="py-8 text-center">
        <h1 className="mb-4 text-2xl font-bold text-heading md:text-3xl">{t.cart.title}</h1>
        <p className="mb-6">{t.cart.empty}</p>
        <Link
          href={`/${lang}`}
          className="inline-block rounded-lg bg-brand px-6 py-3 font-display font-semibold text-white hover:bg-brand-alt"
        >
          {t.cart.continue}
        </Link>
      </section>
    );
  }

  const items = lines.map((line) => ({
    id: line.id,
    name: line.name,
    quantity: line.quantity,
    quantityText: number.format(line.quantity),
    image: cartImage(line),
    href: `/${lang}/product/${line.productId}-${line.productUrlKey}`,
    priceText: formatPrice(line.price, lang),
    totalText: formatPrice(line.total, lang),
  }));

  const labels = {
    quantity: t.cart.quantity,
    decrease: t.cart.decrease,
    increase: t.cart.increase,
    remove: t.cart.remove,
  };

  const discount = Number(cart.discountAmount) || 0;
  const row = "flex items-center justify-between";

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold text-heading md:text-3xl">{t.cart.title}</h1>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <CartItems lang={lang} items={items} labels={labels} />

        <aside className="h-fit rounded-xl border border-subtle p-5">
          <div className={row}>
            <span>{t.cart.subtotal}</span>
            <span className="font-semibold text-heading">{formatPrice(cart.subtotal, lang)}</span>
          </div>

          {discount > 0 && (
            <div className={`${row} mt-2`}>
              <span>{t.cart.discount}</span>
              <span className="font-semibold text-brand-alt">−{formatPrice(discount, lang)}</span>
            </div>
          )}

          <div className={`${row} mt-4 border-t border-subtle pt-4`}>
            <span className="font-display text-lg font-semibold text-heading">{t.cart.total}</span>
            <span className="font-display text-2xl font-bold text-brand">
              {formatPrice(cart.grandTotal, lang)}
            </span>
          </div>

          <p className="mt-2 text-sm">{t.cart.shippingNote}</p>

          {/* Checkout is built in the next phase. */}
          <button
            type="button"
            disabled
            className="mt-5 w-full rounded-lg bg-brand px-6 py-3 font-display font-semibold text-white opacity-60"
          >
            {t.cart.checkout}
          </button>

          <Link
            href={`/${lang}`}
            className="mt-3 block text-center text-sm font-semibold text-brand underline"
          >
            {t.cart.continue}
          </Link>
        </aside>
      </div>
    </section>
  );
}
