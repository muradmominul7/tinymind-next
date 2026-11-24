import { cookies } from "next/headers";
import { bagistoFetch } from "./bagisto";

// The cart token is a secret: it lives in an httpOnly cookie and is only used on the server.
// "cart_count" is a plain cookie with just a number, so the header badge can show it without a server call.
export const TOKEN_COOKIE = "cart_token";
export const COUNT_COOKIE = "cart_count";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

// POST to a cart endpoint. revalidate: 0 means the answer is never cached (a cart is per person).
export function cartApi(path, body, { token, locale } = {}) {
  return bagistoFetch(path, {
    method: "POST",
    body: JSON.stringify(body ?? {}),
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    locale,
    revalidate: 0,
  });
}

// Current cart for this visitor, or null when there is none yet.
export async function readCart(lang) {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) return null;

  try {
    return await cartApi("/cart", {}, { token, locale: lang });
  } catch (error) {
    console.error("readCart failed", error.message);
    return null;
  }
}

// The API gives the cart line image as a JSON string with several sizes.
export function cartImage(item) {
  try {
    const data = typeof item.baseImage === "string" ? JSON.parse(item.baseImage) : item.baseImage;
    return data?.medium_image_url || data?.small_image_url || data?.original_image_url || null;
  } catch {
    return null;
  }
}
