import Link from "next/link";
import { formatMoney } from "@/lib/format";

export default function ProductCard({ product: p, lang }) {
  const onSale = p.specialPrice && Number(p.specialPrice) < Number(p.price);

  return (
    <li className="rounded-xl border border-subtle bg-page p-3">
      <Link href={`/${lang}/product/${p.urlKey}`} className="block">
        <img src={p.baseImageUrl} alt={p.name} className="mb-2 w-full rounded-lg" />
        <p className="font-semibold text-heading">{p.name}</p>
        <p className="mt-1">
          {onSale ? (
            <>
              <span className="font-bold text-brand">{formatMoney(p.specialPrice, lang)}</span>{" "}
              <span className="text-sm line-through">{formatMoney(p.price, lang)}</span>
            </>
          ) : (
            <span className="font-bold text-brand">{formatMoney(p.price, lang)}</span>
          )}
        </p>
      </Link>
    </li>
  );
}
