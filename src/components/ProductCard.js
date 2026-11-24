import Link from "next/link";
import { formatPrice, isOnSale, productHref } from "@/lib/product";
import AddToCartButton from "./AddToCartButton";
import { HeartIcon } from "./icons";

const buttonClass =
  "block w-full rounded-lg bg-brand py-2.5 text-center font-semibold text-white hover:bg-brand-alt disabled:opacity-60";

// variant "grid" (default): image on top. variant "list": image on the left, details on the right.
export default function ProductCard({ product: p, lang, t, variant = "grid" }) {
  const onSale = isOnSale(p);
  const list = variant === "list";
  const href = productHref(lang, p);
  // Only simple products can be added straight from the card; others need their options chosen first.
  const simple = !p.type || p.type === "simple" || p.type === "virtual";

  const price = (
    <p className="flex items-baseline gap-2">
      {onSale ? (
        <>
          <span className="text-sm line-through">{formatPrice(p.price, lang)}</span>
          <span className="text-lg font-bold text-brand">{formatPrice(p.specialPrice, lang)}</span>
        </>
      ) : (
        <span className="text-lg font-bold text-brand">{formatPrice(p.price, lang)}</span>
      )}
    </p>
  );

  const action = simple ? (
    <AddToCartButton
      productId={p.id}
      lang={lang}
      label={t.card.addToCart}
      doneLabel={t.cart.added}
      errorLabel={t.cart.error}
      disabled={p.isSaleable === false}
      className={buttonClass}
    />
  ) : (
    <Link href={href} className={buttonClass}>
      {t.card.viewOptions}
    </Link>
  );

  const badge = onSale && (
    <span className="absolute left-2 top-2 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-heading">
      {t.card.offer}
    </span>
  );

  // Wishlist comes in a later phase.
  const heart = (
    <button
      type="button"
      aria-label={t.card.wishlist}
      className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-heading hover:text-brand-alt"
    >
      <HeartIcon className="h-5 w-5" />
    </button>
  );

  if (list) {
    return (
      <li className="relative flex overflow-hidden rounded-xl border border-subtle bg-page">
        <Link href={href} className="block w-40 shrink-0 sm:w-60">
          <img src={p.baseImageUrl} alt={p.name} className="aspect-square h-full w-full object-cover" />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
          <Link href={href} className="line-clamp-2 text-lg font-medium text-heading hover:text-brand-alt">
            {p.name}
          </Link>
          {price}
          <div className="mt-auto max-w-xs">{action}</div>
        </div>
        {badge}
        {heart}
      </li>
    );
  }

  return (
    <li className="relative flex flex-col overflow-hidden rounded-xl border border-subtle bg-page">
      <Link href={href} className="flex flex-1 flex-col">
        <img src={p.baseImageUrl} alt={p.name} className="aspect-square w-full object-cover" />
        <div className="flex flex-1 flex-col px-3 pt-3">
          <p className="line-clamp-2 font-medium text-heading">{p.name}</p>
          <div className="mt-auto pt-3">{price}</div>
        </div>
      </Link>
      {badge}
      {heart}
      <div className="p-3">{action}</div>
    </li>
  );
}
