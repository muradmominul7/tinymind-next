"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "./social-proof.css";

// Shown only on: home, category pages, product pages and search. Never on cart, checkout, order success,
// order tracking, contact and CMS pages, so a page added later does not get the pop-up by accident.
const SHOW_ON = /^\/[^/]+(?:\/(?:category\/.+|product\/.+|search))?\/?$/;
const IS_PRODUCT = /^\/[^/]+\/product\//;

const FIRST_DELAY = 4000; // first pop-up after the page opened
const VISIBLE = 5000; // how long one pop-up stays
const CYCLE = 12000; // time from one pop-up to the next

function wasClosed() {
  try {
    return sessionStorage.getItem("sp_closed") === "1";
  } catch {
    return false;
  }
}

export default function SocialProof({ lang, labels }) {
  const pathname = usePathname() || "";
  const allowed = SHOW_ON.test(pathname);
  const [item, setItem] = useState(null);
  const [shown, setShown] = useState(false);
  const [closed, setClosed] = useState(false);
  const cache = useRef({ lang: null, items: null });
  const index = useRef(0);

  useEffect(() => {
    if (wasClosed()) setClosed(true);
  }, []);

  useEffect(() => {
    if (!allowed || closed) {
      setShown(false);
      return;
    }

    let cancelled = false;
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    async function load() {
      if (cache.current.lang === lang && cache.current.items) return cache.current.items;

      try {
        const res = await fetch(`/api/social-proof?lang=${encodeURIComponent(lang)}`);
        if (!res.ok) return [];
        const data = await res.json();
        const items = Array.isArray(data) ? data : [];
        cache.current = { lang, items };
        return items;
      } catch {
        return []; // not kept, so the next page tries again
      }
    }

    function cycle(items) {
      if (cancelled || !items.length) return;
      setItem(items[index.current++ % items.length]);
      setShown(true);
      later(() => setShown(false), VISIBLE);
      later(() => cycle(items), CYCLE);
    }

    later(async () => {
      const items = await load();
      if (!cancelled) cycle(items);
    }, FIRST_DELAY);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      setShown(false);
    };
  }, [allowed, closed, lang]);

  function close(event) {
    event.preventDefault();
    event.stopPropagation();
    try {
      sessionStorage.setItem("sp_closed", "1");
    } catch {
      // closed for this page view only
    }
    setClosed(true);
    setShown(false);
  }

  if (!allowed || closed || !item) return null;

  return (
    <Link
      href={item.href}
      className={`sp-toast${shown ? " sp-show" : ""}${IS_PRODUCT.test(pathname) ? " sp-product" : ""}`}
      aria-hidden={shown ? "false" : "true"}
      tabIndex={shown ? 0 : -1}
    >
      <span
        className="sp-x"
        role="button"
        tabIndex={shown ? 0 : -1}
        aria-label={labels.close}
        onClick={close}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") close(event);
        }}
      >
        ×
      </span>
      {item.image && <img src={item.image} alt="" />}
      <div>
        <div>
          <strong>{item.name}</strong> <span>{item.city}</span>
        </div>
        <div>{item.product}</div>
        <small>{item.time}</small>
      </div>
    </Link>
  );
}
