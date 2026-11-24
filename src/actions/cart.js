"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isLocale } from "@/lib/i18n";
import { cartApi, COOKIE_MAX_AGE, COUNT_COOKIE, TOKEN_COOKIE } from "@/lib/cart";

const secure = process.env.NODE_ENV === "production";

function remember(jar, token, cart) {
  const base = { secure, sameSite: "lax", path: "/", maxAge: COOKIE_MAX_AGE };
  jar.set(TOKEN_COOKIE, token, { ...base, httpOnly: true });
  jar.set(COUNT_COOKIE, String(Number(cart?.itemsQty) || 0), { ...base, httpOnly: false });
}

async function newToken() {
  const cart = await cartApi("/cart-tokens", {});
  return cart.cartToken;
}

function toInt(value, min, max) {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

// Runs one cart call. If the saved cart token is no longer accepted, starts a fresh cart once and retries.
async function withCart(lang, path, body) {
  const jar = await cookies();
  let token = jar.get(TOKEN_COOKIE)?.value;

  for (const attempt of [0, 1]) {
    try {
      if (!token) token = await newToken();
      const cart = await cartApi(path, body, { token, locale: lang });
      remember(jar, token, cart);
      return { ok: cart.success !== false, count: Number(cart.itemsQty) || 0 };
    } catch (error) {
      if (attempt === 0 && [401, 403, 404].includes(error.status)) {
        token = null;
        continue;
      }
      console.error("cart action failed", path, error.message);
      break;
    }
  }

  return { ok: false, count: Number(jar.get(COUNT_COOKIE)?.value) || 0 };
}

const invalid = { ok: false, count: 0 };

export async function addToCart({ productId, quantity = 1, lang }) {
  const id = toInt(productId, 1, 1_000_000_000);
  const qty = toInt(quantity, 1, 99);
  if (!id || !qty || !isLocale(lang)) return invalid;

  return withCart(lang, "/add-product-in-cart", { productId: id, quantity: qty });
}

export async function updateCartItem({ itemId, quantity, lang }) {
  const id = toInt(itemId, 1, 1_000_000_000);
  const qty = toInt(quantity, 1, 99);
  if (!id || !qty || !isLocale(lang)) return invalid;

  const result = await withCart(lang, "/update-cart-item", { cartItemId: id, quantity: qty });
  revalidatePath(`/${lang}/cart`);
  return result;
}

export async function removeCartItem({ itemId, lang }) {
  const id = toInt(itemId, 1, 1_000_000_000);
  if (!id || !isLocale(lang)) return invalid;

  const result = await withCart(lang, "/remove-cart-item", { cartItemId: id });
  revalidatePath(`/${lang}/cart`);
  return result;
}
