"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatPrice, isOnSale } from "@/lib/product";

const MIN_LENGTH = 2;

// Header search: suggestions appear while typing (after a short pause). Enter or the button opens the full results.
export default function SearchBox({ lang, labels }) {
  const router = useRouter();
  const box = useRef(null);
  const [value, setValue] = useState("");
  const [results, setResults] = useState(null); // null = nothing searched yet
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const text = value.trim();

  useEffect(() => {
    if (text.length < MIN_LENGTH) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(text)}&lang=${lang}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        setResults(json.items ?? []);
        setActive(-1);
      } catch (error) {
        if (error.name !== "AbortError") setResults([]);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [text, lang]);

  // Close the list when the visitor clicks somewhere else.
  useEffect(() => {
    const onDown = (event) => {
      if (box.current && !box.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const showList = open && text.length >= MIN_LENGTH && results !== null;
  const hrefOf = (p) => `/${lang}/product/${p.id}-${p.urlKey}`;

  function onKeyDown(event) {
    if (!showList) return;
    if (event.key === "Escape") setOpen(false);
    else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(-1, i - 1));
    }
  }

  function onSubmit(event) {
    // With a suggestion highlighted, Enter opens that product; otherwise the form goes to the results page.
    if (showList && active >= 0 && results[active]) {
      event.preventDefault();
      setOpen(false);
      router.push(hrefOf(results[active]));
    }
  }

  return (
    <div ref={box} className="relative order-last w-full md:order-none md:ml-auto md:max-w-lg">
      <form
        action={`/${lang}/search`}
        onSubmit={onSubmit}
        className="flex items-center rounded-full bg-secondary pl-4"
      >
        <input
          name="q"
          type="search"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={labels.placeholder}
          autoComplete="off"
          enterKeyHint="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls="search-suggestions"
          className="w-full bg-transparent py-2 text-sm outline-none"
        />
        <button
          type="submit"
          aria-label={labels.button}
          className="flex items-center justify-center rounded-full bg-brand p-2 text-white transition-colors hover:bg-brand-alt md:px-5 md:text-sm md:font-semibold"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 md:hidden"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <span className="hidden md:inline">{labels.button}</span>
        </button>
      </form>

      {showList && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-subtle bg-white shadow-lg">
          {results.length ? (
            <>
              <ul id="search-suggestions" role="listbox">
                {results.map((p, i) => (
                  <li key={p.id} role="option" aria-selected={i === active}>
                    <Link
                      href={hrefOf(p)}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 hover:bg-secondary ${
                        i === active ? "bg-secondary" : ""
                      }`}
                    >
                      {p.image && <img src={p.image} alt="" className="h-12 w-12 rounded-lg object-cover" />}
                      <span className="line-clamp-2 min-w-0 flex-1 text-sm text-heading">{p.name}</span>
                      <span className="whitespace-nowrap text-sm font-semibold text-brand">
                        {formatPrice(isOnSale(p) ? p.specialPrice : p.price, lang)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/${lang}/search?q=${encodeURIComponent(text)}`}
                onClick={() => setOpen(false)}
                className="block border-t border-subtle px-3 py-2 text-center text-sm font-semibold text-brand hover:bg-secondary"
              >
                {labels.viewAll}
              </Link>
            </>
          ) : (
            <p id="search-suggestions" className="px-3 py-3 text-sm">
              {labels.noResults}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
