"use client";

import { useEffect, useState } from "react";
import { MENU_STATE, toggleMenu } from "@/lib/menu-events";

// Hamburger button that turns into an X while the menu panel is open.
export default function MenuButton({ label, closeLabel, className = "" }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onState = (event) => setOpen(Boolean(event.detail));
    window.addEventListener(MENU_STATE, onState);
    return () => window.removeEventListener(MENU_STATE, onState);
  }, []);

  return (
    <button
      type="button"
      onClick={toggleMenu}
      aria-label={open ? closeLabel : label}
      aria-expanded={open}
      className={className}
    >
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
        {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
      </svg>
    </button>
  );
}
