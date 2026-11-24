"use client";

import { openMenu } from "@/lib/menu-events";

// Hamburger button. It only asks the drawer (MenuDrawer) to open.
export default function MenuButton({ label, className = "" }) {
  return (
    <button type="button" onClick={openMenu} aria-label={label} aria-haspopup="dialog" className={className}>
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}
