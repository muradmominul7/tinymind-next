"use client";

import Link from "next/link";
import { useTransition } from "react";
import { removeCartItem, updateCartItem } from "@/actions/cart";
import { announceCart } from "@/lib/cart-events";

// Cart lines with quantity buttons and remove. Texts and prices arrive already formatted from the server.
export default function CartItems({ lang, items, labels }) {
  const [pending, start] = useTransition();

  function run(action, args) {
    start(async () => {
      const result = await action({ ...args, lang });
      announceCart(result.count);
    });
  }

  const step = "px-3 py-1.5 text-lg leading-none text-brand disabled:opacity-40";

  return (
    <ul
      className={`divide-y divide-subtle rounded-xl border border-subtle ${pending ? "opacity-60" : ""}`}
      aria-busy={pending}
    >
      {items.map((item) => (
        <li key={item.id} className="flex gap-4 p-4">
          {item.image && (
            <Link href={item.href} className="shrink-0">
              <img src={item.image} alt="" className="h-24 w-24 rounded-lg object-cover" />
            </Link>
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Link href={item.href} className="line-clamp-2 font-medium text-heading hover:text-brand-alt">
              {item.name}
            </Link>
            <p className="text-sm">{item.priceText}</p>

            <div className="mt-auto flex flex-wrap items-center gap-4">
              <div
                role="group"
                aria-label={labels.quantity}
                className="flex items-center rounded-lg border border-brand"
              >
                <button
                  type="button"
                  aria-label={labels.decrease}
                  disabled={pending || item.quantity <= 1}
                  onClick={() => run(updateCartItem, { itemId: item.id, quantity: item.quantity - 1 })}
                  className={step}
                >
                  −
                </button>
                <span className="w-9 text-center font-semibold text-heading">{item.quantityText}</span>
                <button
                  type="button"
                  aria-label={labels.increase}
                  disabled={pending || item.quantity >= 99}
                  onClick={() => run(updateCartItem, { itemId: item.id, quantity: item.quantity + 1 })}
                  className={step}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                disabled={pending}
                onClick={() => run(removeCartItem, { itemId: item.id })}
                className="text-sm font-semibold text-red-600 underline disabled:opacity-40"
              >
                {labels.remove}
              </button>
            </div>
          </div>

          <p className="shrink-0 text-lg font-bold text-brand">{item.totalText}</p>
        </li>
      ))}
    </ul>
  );
}
