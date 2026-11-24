// Tiny browser-side signal so the header cart badge updates right after an add/update/remove.
export const CART_EVENT = "cart:count";

export function announceCart(count) {
  window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: Number(count) || 0 }));
}
