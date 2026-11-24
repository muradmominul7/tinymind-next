"use client";

import { useState, useTransition } from "react";
import { addToCart } from "@/actions/cart";
import { announceCart } from "@/lib/cart-events";

export default function AddToCartButton({
  productId,
  quantity = 1,
  lang,
  label,
  doneLabel,
  errorLabel,
  className,
  disabled = false,
}) {
  const [pending, start] = useTransition();
  const [state, setState] = useState("idle");

  function onClick() {
    start(async () => {
      const result = await addToCart({ productId, quantity, lang });
      if (result.ok) announceCart(result.count);
      setState(result.ok ? "done" : "error");
      setTimeout(() => setState("idle"), 2000);
    });
  }

  const text = state === "done" ? doneLabel : state === "error" ? errorLabel : label;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || pending}
      aria-live="polite"
      className={className}
    >
      {text}
    </button>
  );
}
