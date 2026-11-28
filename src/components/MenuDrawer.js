"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/actions/auth";
import { MENU_STATE, MENU_TOGGLE } from "@/lib/menu-events";

// Phone menu panel. It opens right under the header (the header stays visible), with the Sign in and
// Sign up buttons first (My account and Log out when someone is signed in) and then every category. It slides in from the left edge and slides back out to it.
export default function MenuDrawer({ lang, labels, items }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(0); // where the header ends, in px from the top of the screen
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const onToggle = () => setOpen((value) => !value);
    window.addEventListener(MENU_TOGGLE, onToggle);
    return () => window.removeEventListener(MENU_TOGGLE, onToggle);
  }, []);

  // Whether someone is signed in comes from the plain "customer_session" cookie (see lib/customer.js).
  useEffect(() => {
    setSignedIn(/(?:^|; )customer_session=1/.test(document.cookie));
  }, [pathname, open]);

  // Moving to another page closes the menu.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(MENU_STATE, { detail: open }));
    if (!open) return;

    const measure = () => {
      const header = document.querySelector(".hdr");
      if (header) setTop(Math.max(0, Math.round(header.getBoundingClientRect().bottom)));
      if (window.innerWidth >= 768) setOpen(false); // the menu is for phones only
    };
    measure();
    const later = setTimeout(measure, 350); // the header may still be sliding when the menu opens
    window.addEventListener("resize", measure);

    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // the page behind does not scroll

    return () => {
      clearTimeout(later);
      window.removeEventListener("resize", measure);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className={`md:hidden ${open ? "" : "pointer-events-none"}`}>
      <div
        inert={!open}
        style={{ top }}
        className={`fixed inset-x-0 bottom-0 z-30 overflow-y-auto bg-page transition duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-4 pb-8 pt-4">
          {signedIn ? (
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`/${lang}/account`}
                className="rounded-lg bg-brand px-4 py-2.5 text-center font-semibold text-white hover:bg-brand-alt"
              >
                {labels.account}
              </Link>
              <Link
                href={`/${lang}/account#orders`}
                className="rounded-lg border-2 border-brand px-4 py-2.5 text-center font-semibold text-brand hover:bg-secondary"
              >
                {labels.orders}
              </Link>
              <Link
                href={`/${lang}/wishlist`}
                className="rounded-lg border-2 border-brand px-4 py-2.5 text-center font-semibold text-brand hover:bg-secondary"
              >
                {labels.wishlist}
              </Link>
              <form action={logoutAction.bind(null, lang)}>
                <button
                  type="submit"
                  className="w-full rounded-lg border-2 border-brand px-4 py-2.5 text-center font-semibold text-brand hover:bg-secondary"
                >
                  {labels.logout}
                </button>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`/${lang}/login`}
                className="rounded-lg bg-brand px-4 py-2.5 text-center font-semibold text-white hover:bg-brand-alt"
              >
                {labels.signIn}
              </Link>
              <Link
                href={`/${lang}/register`}
                className="rounded-lg border-2 border-brand px-4 py-2.5 text-center font-semibold text-brand hover:bg-secondary"
              >
                {labels.signUp}
              </Link>
            </div>
          )}

          <nav className="mt-4 border-t border-subtle pt-2">
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="block px-1 py-3 text-base text-heading hover:text-brand-alt">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
