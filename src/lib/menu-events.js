// The two hamburger buttons (logo row and the compact search row) open the one drawer through this event.
export const MENU_EVENT = "tinymind:menu";

export function openMenu() {
  window.dispatchEvent(new Event(MENU_EVENT));
}
