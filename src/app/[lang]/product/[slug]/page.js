import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { bagistoFetch } from "@/lib/bagisto";
import { getDictionary, isLocale } from "@/lib/i18n";
import {
  decodeSlug,
  formatPrice,
  isOnSale,
  parseProductId,
  productImages,
  stripHtml,
} from "@/lib/product";
import ProductGallery from "@/components/ProductGallery";
import ProductActions from "@/components/ProductActions";

// Styles for HTML written in the admin (descriptions): lists, headings, links.
const richText =
  "leading-7 text-body [&_a]:text-brand-alt [&_a]:underline [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-heading [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:font-bold [&_h3]:text-heading [&_img]:h-auto [&_img]:max-w-full [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6";

// Fetch by id (this API cannot filter by url_key). Same call in metadata and page is de-duplicated by Next.js.
async function getProduct(id, lang) {
  try {
    const product = await bagistoFetch(`/products/${id}`, { locale: lang });
    return product && product.status !== false ? product : null;
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const id = parseProductId(slug);
  if (!id) return {};

  const product = await getProduct(id, lang);
  if (!product) return {};

  const description = stripHtml(product.shortDescription || product.description).slice(0, 160);
  const image = productImages(product)[0];

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      type: "website",
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ProductPage({ params }) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const id = parseProductId(slug);
  if (!id) notFound();

  const [t, product] = await Promise.all([getDictionary(lang), getProduct(id, lang)]);
  if (!product) notFound();

  // One canonical URL per product and language.
  const canonical = `${product.id}-${product.urlKey}`;
  if (decodeSlug(slug) !== canonical) {
    redirect(`/${lang}/product/${encodeURIComponent(canonical)}`);
  }

  const images = productImages(product);
  const onSale = isOnSale(product);
  const price = onSale ? product.specialPrice : product.price;
  const inStock = product.isSaleable !== false;

  const labels = {
    quantity: t.product.quantity,
    decrease: t.product.decrease,
    increase: t.product.increase,
    addToCart: t.product.addToCart,
    buyNow: t.product.buyNow,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    image: images,
    description: stripHtml(product.shortDescription || product.description).slice(0, 500),
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: Number(price),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div>
      <nav aria-label="breadcrumb" className="mb-6 flex items-center gap-2 text-sm">
        <Link href={`/${lang}`} className="font-medium text-heading hover:text-brand-alt">
          {t.product.home}
        </Link>
        <span aria-hidden="true">›</span>
        <span className="line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <ProductGallery images={images} name={product.name} />

        <div>
          <h1 className="text-2xl font-bold text-heading md:text-3xl">{product.name}</h1>

          {product.shortDescription && (
            <div
              className={`mt-4 ${richText}`}
              dangerouslySetInnerHTML={{ __html: product.shortDescription }}
            />
          )}

          <p className="mt-5 flex items-baseline gap-3">
            {onSale && (
              <span className="text-lg line-through">{formatPrice(product.price, lang)}</span>
            )}
            <span className="font-display text-3xl font-bold text-brand">
              {formatPrice(price, lang)}
            </span>
          </p>

          <p className={`mt-2 text-sm font-semibold ${inStock ? "text-brand-alt" : "text-red-600"}`}>
            {inStock ? t.product.inStock : t.product.outOfStock}
          </p>

          <ProductActions labels={labels} disabled={!inStock} />
        </div>
      </div>

      {product.description && (
        <section className="mt-12">
          <div className="flex justify-center rounded-lg bg-secondary">
            <h2 className="border-b-2 border-brand px-8 py-3 font-display text-lg font-semibold text-heading">
              {t.product.description}
            </h2>
          </div>
          <div
            className={`pt-8 ${richText}`}
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
