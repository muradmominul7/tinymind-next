"use client";

import { removeCartItem, updateCartItem } from "@/actions/cart";
import { getCartSnapshot } from "@/actions/cart-drawer";
import { CART_DRAWER_OPEN } from "@/lib/cart-drawer-events";
import { announceCart, CART_EVENT } from "@/lib/cart-events";
import { formatPrice } from "@/lib/product";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

const EMPTY = { items: [], total: 0 };

// The cart drawer (slides in from the right edge) and the floating cart at the right edge of the screen
// (item count and cart amount). Both open from the same place and share one copy of the cart.
export default function CartWidget({ lang, labels }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [snapshot, setSnapshot] = useState(null);
  const [pending, start] = useTransition();
  const request = useRef(0);
  const closeRef = useRef(null);

  const number = new Intl.NumberFormat(lang === "bn" ? "bn-BD" : "en-US");
  const items = snapshot?.items ?? [];
  const total = snapshot?.total ?? 0;

  const refresh = useCallback(async () => {
    const id = ++request.current;
    try {
      const data = await getCartSnapshot(lang);
      if (id === request.current) setSnapshot(data);
    } catch (error) {
      console.error("CartWidget: could not load the cart", error);
    }
  }, [lang]);

  // First load: the count comes from the plain cookie; the amount is fetched only when the cart is not empty.
  // Afterwards every cart event (add, change, remove anywhere on the site) updates both.
  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )cart_count=(\d+)/);
    const initial = match ? Number(match[1]) : 0;
    setCount(initial);
    if (initial > 0) refresh();

    const onChange = (event) => {
      const next = Number(event.detail) || 0;
      setCount(next);
      if (next > 0) {
        refresh();
      } else {
        request.current += 1;
        setSnapshot(EMPTY);
      }
    };
    const onOpen = () => {
      setOpen(true);
      refresh();
    };

    window.addEventListener(CART_EVENT, onChange);
    window.addEventListener(CART_DRAWER_OPEN, onOpen);
    return () => {
      window.removeEventListener(CART_EVENT, onChange);
      window.removeEventListener(CART_DRAWER_OPEN, onOpen);
    };
  }, [refresh]);

  // Moving to another page closes the drawer.
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
    const focusTimer = setTimeout(() => closeRef.current?.focus(), 60);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  function run(action, args) {
    start(async () => {
      const result = await action({ ...args, lang });
      if (result?.count != null) announceCart(result.count);
      else refresh();
    });
  }

  const close = () => setOpen(false);
  const shownCount = number.format(count);
  const hidePill = /^\/(bn|en)\/(cart|checkout)(\/|$)/.test(pathname || "");
  const step =
    "px-3 py-1.5 text-lg leading-none text-brand disabled:opacity-40";

  return (
    <>
      {!hidePill && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            refresh();
          }}
          aria-label={`${labels.cart}: ${shownCount}`}
          className="fixed right-0 top-1/2 z-20 w-14 -translate-y-1/2 overflow-hidden rounded-l-lg border border-r-0 border-subtle bg-white text-center shadow-lg"
        >
          <span className="flex flex-col items-center bg-accent px-1 py-1.5 text-heading">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 4h2l2.4 11h10.2l2-8H6.2" />
              <circle cx="9" cy="19" r="1.4" />
              <circle cx="17" cy="19" r="1.4" />
            </svg>
            <span className="text-[11px] font-bold leading-tight">
              {shownCount} {labels.items}
            </span>
          </span>
          <span className="block px-1 py-1.5 text-[11px] font-bold leading-tight text-brand">
            {formatPrice(total, lang)}
          </span>
        </button>
      )}

      <div className={open ? "" : "pointer-events-none"}>
        <div
          aria-hidden="true"
          onClick={close}
          className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 motion-reduce:transition-none ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          inert={!open}
          role="dialog"
          aria-modal="true"
          aria-label={labels.title}
          className={`fixed inset-y-0 right-0 z-[60] flex w-full max-w-sm flex-col bg-page transition-transform duration-300 ease-out motion-reduce:transition-none ${
            open ? "translate-x-0 shadow-xl" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
            <span className="font-display text-lg font-semibold text-heading">
              {labels.title}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label={labels.close}
              className="-mr-2 rounded-full p-2 text-heading hover:bg-secondary"
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
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 overflow-y-auto px-4 py-10 text-center">
              <p className="mb-6">{labels.empty}</p>
              <Link
                href={`/${lang}`}
                onClick={close}
                className="inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-alt"
              >
                {labels.continue}
              </Link>
            </div>
          ) : (
            <>
              <ul
                className={`flex-1 divide-y divide-subtle overflow-y-auto ${pending ? "opacity-60" : ""}`}
                aria-busy={pending}
              >
                {items.map((item) => (
                  <li key={item.id} className="flex gap-3 p-4">
                    {item.image && (
                      <Link
                        href={item.href}
                        onClick={close}
                        className="shrink-0"
                      >
                        <img
                          src={item.image}
                          alt=""
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      </Link>
                    )}

                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <Link
                        href={item.href}
                        onClick={close}
                        className="line-clamp-2 font-medium text-heading hover:text-brand-alt"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm">{item.priceText}</p>

                      <div className="mt-auto flex flex-wrap items-center gap-3">
                        <div
                          role="group"
                          aria-label={labels.quantity}
                          className="flex items-center rounded-lg border border-brand"
                        >
                          <button
                            type="button"
                            aria-label={labels.decrease}
                            disabled={pending || item.quantity <= 1}
                            onClick={() =>
                              run(updateCartItem, {
                                itemId: item.id,
                                quantity: item.quantity - 1,
                              })
                            }
                            className={step}
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-semibold text-heading">
                            {item.quantityText}
                          </span>
                          <button
                            type="button"
                            aria-label={labels.increase}
                            disabled={pending || item.quantity >= 99}
                            onClick={() =>
                              run(updateCartItem, {
                                itemId: item.id,
                                quantity: item.quantity + 1,
                              })
                            }
                            className={step}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            run(removeCartItem, { itemId: item.id })
                          }
                          className="text-sm font-semibold text-red-600 underline disabled:opacity-40"
                        >
                          {labels.remove}
                        </button>
                      </div>
                    </div>

                    <p className="shrink-0 font-bold text-brand">
                      {item.totalText}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="border-t border-subtle p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-heading">
                    {labels.total}
                  </span>
                  <span className="text-xl font-bold text-brand">
                    {formatPrice(total, lang)}
                  </span>
                </div>

                <Link
                  href={`/${lang}/checkout`}
                  onClick={close}
                  className="mt-4 block w-full rounded-lg bg-brand px-6 py-3 text-center font-semibold text-white hover:bg-brand-alt"
                >
                  {labels.checkout}
                </Link>
                <Link
                  href={`/${lang}/cart`}
                  onClick={close}
                  className="mt-3 block w-full rounded-lg border-2 border-brand px-6 py-2.5 text-center font-semibold text-brand hover:bg-secondary"
                >
                  {labels.viewCart}
                </Link>
              </div>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
