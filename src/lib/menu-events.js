// The two hamburger buttons (logo row and the compact search row) and the menu panel talk through these events.
// A button asks the panel to open or close; the panel tells every button whether it is open, so they can show an X.
export const MENU_TOGGLE = "tinymind:menu-toggle";
export const MENU_STATE = "tinymind:menu-state";

export function toggleMenu() {
  window.dispatchEvent(new Event(MENU_TOGGLE));
}
