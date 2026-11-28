"use client";

import { logoutAction } from "@/actions/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { UserIcon } from "./icons";

const item =
  "block rounded-lg px-3 py-2 text-left text-base text-heading hover:bg-secondary";

// The profile icon of the header. It opens a small menu:
// signed in: "Welcome, <name>", Profile, Orders, Log out; signed out: Sign in and Sign up.
// Whether someone is signed in comes from the plain "customer_session" cookie, so the header stays cached;
// the name is asked from /api/auth/me the first time the menu opens.
export default function AccountMenu({ lang, label, className, labels }) {
  const pathname = usePathname();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [name, setName] = useState(null); // null: not asked yet

  useEffect(() => {
    setSignedIn(/(?:^|; )customer_session=1/.test(document.cookie));
    setName(null);
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target))
        setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !signedIn || name !== null) return;

    let cancelled = false;
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.expired) setSignedIn(false);
        else setName(data.name ?? "");
      })
      .catch(() => !cancelled && setName(""));

    return () => {
      cancelled = true;
    };
  }, [open, signedIn, name]);

  const close = () => setOpen(false);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className={className}
        onClick={() => setOpen((value) => !value)}
      >
        <UserIcon />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-subtle bg-white p-4 shadow-lg"
        >
          {signedIn ? (
            <>
              <p className="text-xl font-medium text-body">
                {labels.welcome}
                {name ? ` ${name}` : ""}
              </p>
              <p className="mt-1 text-sm text-body">{labels.manage}</p>
              <hr className="my-3 border-subtle" />

              <nav className="flex flex-col">
                <Link
                  role="menuitem"
                  href={`/${lang}/account`}
                  onClick={close}
                  className={item}
                >
                  {labels.profile}
                </Link>
                <Link
                  role="menuitem"
                  href={`/${lang}/account#orders`}
                  onClick={close}
                  className={item}
                >
                  {labels.orders}
                </Link>
                <Link
                  role="menuitem"
                  href={`/${lang}/wishlist`}
                  onClick={close}
                  className={item}
                >
                  {labels.wishlist}
                </Link>
                <form action={logoutAction.bind(null, lang)}>
                  <button
                    type="submit"
                    role="menuitem"
                    className={`${item} w-full`}
                  >
                    {labels.logout}
                  </button>
                </form>
              </nav>
            </>
          ) : (
            <>
              <p className="text-base font-semibold text-heading">
                {labels.welcomeGuest}
              </p>
              <p className="mt-1 text-sm text-body">{labels.manage}</p>
              <hr className="my-3 border-subtle" />

              <div className="flex gap-2">
                <Link
                  role="menuitem"
                  href={`/${lang}/login`}
                  onClick={close}
                  className="flex-1 rounded-lg bg-brand px-3 py-2 text-center text-sm font-semibold text-white"
                >
                  {labels.signIn}
                </Link>
                <Link
                  role="menuitem"
                  href={`/${lang}/register`}
                  onClick={close}
                  className="flex-1 rounded-lg border border-subtle px-3 py-2 text-center text-sm font-semibold text-heading hover:bg-secondary"
                >
                  {labels.signUp}
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
