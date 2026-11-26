"use server";

import { bagistoFetch } from "@/lib/bagisto";
import {
  cartApi,
  COOKIE_MAX_AGE,
  COUNT_COOKIE,
  TOKEN_COOKIE,
} from "@/lib/cart";
import {
  ADDRESS_FALLBACK,
  CITY_FALLBACK,
  fallbackEmail,
  NO_DISTRICT_STATE,
  normalizePhone,
  splitName,
  validateCheckout,
} from "@/lib/checkout";
import { districtByCode } from "@/lib/districts";
import { isLocale } from "@/lib/i18n";
import { cookies } from "next/headers";

const PAYMENT_METHOD = "cashondelivery"; // the only payment method for now

const list = (json) => (Array.isArray(json) ? json : (json?.member ?? []));

function log(label, error) {
  console.error(label, error.status ?? "", error.message, error.detail ?? "");
}

function rates(token, lang) {
  return bagistoFetch("/checkout-shipping-methods", {
    headers: { Authorization: `Bearer ${token}` },
    locale: lang,
    revalidate: 0,
  });
}

// The district is optional. Without one the state is something the delivery rules do not know,
// so the API gives its default delivery charge (the highest one).
function placeFields(district) {
  const place = districtByCode(district);
  return {
    billingState: place?.code ?? NO_DISTRICT_STATE,
    billingCity: place?.en ?? CITY_FALLBACK,
    billingCountry: "BD",
  };
}

// Shows the delivery charge for a district (or the default one when district is "") before the order is placed.
// It saves a throw-away address on the cart; the real one replaces it when the order is placed.
export async function quoteDelivery({ lang, district }) {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!(await isLocale(lang)) || !token) return { ok: false };
  if (district && !districtByCode(district)) return { ok: false };

  try {
    await cartApi(
      "/checkout-addresses",
      {
        billingFirstName: "Customer",
        billingLastName: "-",
        billingPhoneNumber: "01000000000",
        billingAddress: ADDRESS_FALLBACK,
        ...placeFields(district),
        useForShipping: true,
      },
      { token, locale: lang },
    );
    const rate = list(await rates(token, lang))[0];
    return rate ? { ok: true, price: Number(rate.price) || 0 } : { ok: false };
  } catch (error) {
    log("quoteDelivery failed", error);
    return { ok: false };
  }
}

export async function placeOrder({ lang, name, phone, district, address }) {
  if (!(await isLocale(lang))) return { ok: false, reason: "failed" };
  if (district && !districtByCode(district))
    return { ok: false, reason: "failed" };

  const errors = validateCheckout({ phone });
  if (Object.keys(errors).length) return { ok: false, errors };

  const jar = await cookies();
  const token = jar.get(TOKEN_COOKIE)?.value;
  if (!token) return { ok: false, reason: "empty" };

  const { first, last } = splitName(name);
  const auth = { token, locale: lang };

  try {
    await cartApi(
      "/checkout-addresses",
      {
        billingFirstName: first.slice(0, 100),
        billingLastName: last.slice(0, 100),
        billingEmail: fallbackEmail(phone),
        billingPhoneNumber: normalizePhone(phone),
        billingAddress:
          String(address ?? "")
            .trim()
            .slice(0, 300) || ADDRESS_FALLBACK,
        ...placeFields(district),
        useForShipping: true,
      },
      auth,
    );

    const rate = list(await rates(token, lang))[0];
    if (!rate) return { ok: false, reason: "failed" };

    await cartApi(
      "/checkout-shipping-methods",
      { shippingMethod: rate.method },
      auth,
    );
    await cartApi(
      "/checkout-payment-methods",
      { paymentMethod: PAYMENT_METHOD },
      auth,
    );
    const order = await cartApi("/checkout-orders", {}, auth);

    // The order response shape was not checked beforehand, so its keys are logged once for the server console.
    console.log(
      "order placed, response keys:",
      Object.keys(order ?? {}).join(","),
    );

    // The cart is closed once it becomes an order: forget its token.
    jar.delete(TOKEN_COOKIE);
    jar.set(COUNT_COOKIE, "0", {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      httpOnly: false,
    });

    const orderNo = order?.incrementId ?? null;

    return { ok: true, orderNo: orderNo === null ? null : String(orderNo) };
  } catch (error) {
    log("placeOrder failed", error);
    return { ok: false, reason: "failed" };
  }
}
