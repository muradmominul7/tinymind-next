"use server";

import { cartImage, readCart } from "@/lib/cart";
import { formatPrice } from "@/lib/product";

// What the cart drawer and the floating cart show: the lines (already formatted) and the grand total.
// The cart token stays in its httpOnly cookie; this only reads the cart.
export async function getCartSnapshot(lang) {
  const locale = lang === "bn" ? "bn" : "en";
  const cart = await readCart(locale);
  const lines = cart?.items ?? [];
  const number = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-US");

  return {
    total: Number(cart?.grandTotal) || 0,
    items: lines.map((line) => ({
      id: line.id,
      name: line.name,
      quantity: line.quantity,
      quantityText: number.format(line.quantity),
      image: cartImage(line),
      href: `/${locale}/product/${line.productId}-${line.productUrlKey}`,
      priceText: formatPrice(line.price, locale),
      totalText: formatPrice(line.total, locale),
    })),
  };
}
