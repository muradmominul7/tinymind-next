"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addToCart } from "@/actions/cart";
import { announceCart } from "@/lib/cart-events";
import AddToCartButton from "./AddToCartButton";

// Quantity picker, "add to cart" and "buy now" (adds the product, then opens the cart).
export default function ProductActions({ productId, lang, labels, disabled = false }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [failed, setFailed] = useState(false);
  const [pending, start] = useTransition();
  const step = "px-3 py-3 text-lg leading-none text-brand disabled:opacity-40";

  function buyNow() {
    start(async () => {
      const result = await addToCart({ productId, quantity: qty, lang });
      if (result.ok) {
        announceCart(result.count);
        router.push(`/${lang}/cart`);
      } else {
        setFailed(true);
      }
    });
  }

  return (
    <div className="mt-6 flex max-w-md flex-col gap-3">
      <div className="flex gap-3">
        <div
          role="group"
          aria-label={labels.quantity}
          className="flex items-center rounded-lg border border-brand"
        >
          <button
            type="button"
            aria-label={labels.decrease}
            disabled={disabled || qty <= 1}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className={step}
          >
            −
          </button>
          <span className="w-10 text-center font-semibold text-heading">{qty}</span>
          <button
            type="button"
            aria-label={labels.increase}
            disabled={disabled || qty >= 99}
            onClick={() => setQty((q) => q + 1)}
            className={step}
          >
            +
          </button>
        </div>

        <AddToCartButton
          productId={productId}
          quantity={qty}
          lang={lang}
          label={labels.addToCart}
          doneLabel={labels.added}
          errorLabel={labels.error}
          disabled={disabled}
          className="flex-1 rounded-lg border border-brand px-6 py-3 font-semibold text-brand hover:bg-secondary disabled:opacity-40"
        />
      </div>

      <button
        type="button"
        disabled={disabled || pending}
        onClick={buyNow}
        className="rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-alt disabled:opacity-40"
      >
        {labels.buyNow}
      </button>

      {failed && (
        <p role="alert" className="text-sm font-semibold text-red-600">
          {labels.error}
        </p>
      )}
    </div>
  );
}
