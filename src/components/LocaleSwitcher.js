"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
    </svg>
  );
}

// Keeps the current page and swaps only the language part (the first segment) of the address.
function hrefFor(pathname, lang, code) {
  const parts = (pathname || `/${lang}`).split("/");
  parts[1] = code;
  return parts.join("/");
}

// variant "bar" (top bar, wide screens): both languages are shown. The current one is a white pill
// with brand-colored text, the other one is plain white text.
// variant "compact" (phones): only the OTHER language is shown, next to a globe icon
// (with more than two languages, the next one in the list).
// `codes` = the languages of the Bagisto channel, `labels` = text to show for each code.
export default function LocaleSwitcher({ lang, codes, labels, variant = "bar" }) {
  const pathname = usePathname();

  if (variant === "compact") {
    const other = codes[(codes.indexOf(lang) + 1) % codes.length];

    return (
      <Link
        href={hrefFor(pathname, lang, other)}
        hrefLang={other}
        className="flex items-center gap-1.5 rounded-full px-2 py-2 text-sm font-semibold text-heading hover:bg-secondary"
      >
        <GlobeIcon />
        {labels[other]}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-1 text-xs font-semibold">
      {codes.map((code) =>
        code === lang ? (
          <span key={code} aria-current="true" className="rounded-full bg-white px-3 py-0.5 text-brand">
            {labels[code]}
          </span>
        ) : (
          <Link
            key={code}
            href={hrefFor(pathname, lang, code)}
            hrefLang={code}
            className="rounded-full px-3 py-0.5 text-white hover:text-accent"
          >
            {labels[code]}
          </Link>
        )
      )}
    </div>
  );
}
