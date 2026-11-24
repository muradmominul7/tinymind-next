"use client";

import { useState } from "react";

// Quantity picker and buy buttons. The cart itself is wired up in the cart phase.
export default function ProductActions({ labels, disabled = false }) {
  const [qty, setQty] = useState(1);
  const step = "px-3 py-3 text-lg leading-none text-brand disabled:opacity-40";

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
            disabled={disabled}
            onClick={() => setQty((q) => q + 1)}
            className={step}
          >
            +
          </button>
        </div>

        <button
          type="button"
          disabled={disabled}
          className="flex-1 rounded-lg border border-brand px-6 py-3 font-display font-semibold text-brand hover:bg-secondary disabled:opacity-40"
        >
          {labels.addToCart}
        </button>
      </div>

      <button
        type="button"
        disabled={disabled}
        className="rounded-lg bg-brand px-6 py-3 font-display font-semibold text-white hover:bg-brand-alt disabled:opacity-40"
      >
        {labels.buyNow}
      </button>
    </div>
  );
}
