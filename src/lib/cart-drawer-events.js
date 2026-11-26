// Any cart button asks the cart drawer (CartWidget) to open through this event.
export const CART_DRAWER_OPEN = "tinymind:cart-drawer-open";

export function openCartDrawer() {
  window.dispatchEvent(new Event(CART_DRAWER_OPEN));
}
