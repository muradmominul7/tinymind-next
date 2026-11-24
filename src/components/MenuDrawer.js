"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MENU_EVENT } from "@/lib/menu-events";

// Phone menu: slides in from the left and lists every category at once.
export default function MenuDrawer({ labels, items }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeButton = useRef(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(MENU_EVENT, onOpen);
    return () => window.removeEventListener(MENU_EVENT, onOpen);
  }, []);

  // Moving to another page closes the menu.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // the page behind does not scroll
    closeButton.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className={`md:hidden ${open ? "" : "pointer-events-none"}`}>
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={labels.title}
        inert={!open}
        className={`fixed inset-y-0 left-0 z-[70] flex w-[85%] max-w-sm flex-col bg-page shadow-xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-subtle bg-brand px-4 py-3 text-white">
          <p className="text-lg font-semibold">{labels.title}</p>
          <button
            ref={closeButton}
            type="button"
            onClick={() => setOpen(false)}
            aria-label={labels.close}
            className="rounded-full p-2 hover:bg-white/10"
          >
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="divide-y divide-subtle">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="block px-5 py-3.5 text-base font-medium text-heading hover:bg-secondary"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}
