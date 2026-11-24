import Link from "next/link";
import { formatPrice, isOnSale, productHref } from "@/lib/product";
import { HeartIcon } from "./icons";

export default function ProductCard({ product: p, lang, t }) {
  const onSale = isOnSale(p);

  return (
    <li className="relative flex flex-col overflow-hidden rounded-xl border border-subtle bg-page">
      <Link href={productHref(lang, p)} className="flex flex-1 flex-col">
        <img src={p.baseImageUrl} alt={p.name} className="aspect-square w-full object-cover" />
        <div className="flex flex-1 flex-col px-3 pt-3">
          <p className="line-clamp-2 font-medium text-heading">{p.name}</p>
          <p className="mt-auto flex items-baseline gap-2 pt-3">
            {onSale ? (
              <>
                <span className="text-sm line-through">{formatPrice(p.price, lang)}</span>
                <span className="text-lg font-bold text-brand">{formatPrice(p.specialPrice, lang)}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-brand">{formatPrice(p.price, lang)}</span>
            )}
          </p>
        </div>
      </Link>

      {onSale && (
        <span className="absolute left-2 top-2 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-heading">
          {t.card.offer}
        </span>
      )}

      {/* Wishlist and add to cart are wired up in the cart phase. */}
      <button
        type="button"
        aria-label={t.card.wishlist}
        className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-heading hover:text-brand-alt"
      >
        <HeartIcon className="h-5 w-5" />
      </button>

      <div className="p-3">
        <button
          type="button"
          className="w-full rounded-lg bg-brand py-2.5 font-display font-semibold text-white hover:bg-brand-alt"
        >
          {t.card.addToCart}
        </button>
      </div>
    </li>
  );
}
