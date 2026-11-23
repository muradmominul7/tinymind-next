import Link from "next/link";
import { formatPrice, isOnSale, productHref } from "@/lib/product";

export default function ProductCard({ product: p, lang }) {
  const onSale = isOnSale(p);

  return (
    <li className="rounded-xl border border-subtle bg-page p-3">
      <Link href={productHref(lang, p)} className="block">
        <img src={p.baseImageUrl} alt={p.name} className="mb-2 w-full rounded-lg" />
        <p className="font-semibold text-heading">{p.name}</p>
        <p className="mt-1">
          {onSale ? (
            <>
              <span className="font-bold text-brand">{formatPrice(p.specialPrice, lang)}</span>{" "}
              <span className="text-sm line-through">{formatPrice(p.price, lang)}</span>
            </>
          ) : (
            <span className="font-bold text-brand">{formatPrice(p.price, lang)}</span>
          )}
        </p>
      </Link>
    </li>
  );
}
