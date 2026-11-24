"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BagIcon } from "./icons";
import { CART_EVENT } from "@/lib/cart-events";

// Header cart icon with the number of items. Reads the plain "cart_count" cookie, then follows cart events.
export default function CartLink({ lang, label }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )cart_count=(\d+)/);
    setCount(match ? Number(match[1]) : 0);

    const onChange = (event) => setCount(Number(event.detail) || 0);
    window.addEventListener(CART_EVENT, onChange);
    return () => window.removeEventListener(CART_EVENT, onChange);
  }, []);

  const shown = new Intl.NumberFormat(lang === "bn" ? "bn-BD" : "en-US").format(count);

  return (
    <Link
      href={`/${lang}/cart`}
      aria-label={`${label}: ${shown}`}
      className="relative rounded-full p-2 text-heading hover:bg-secondary"
    >
      <BagIcon />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-heading"
        >
          {shown}
        </span>
      )}
    </Link>
  );
}
