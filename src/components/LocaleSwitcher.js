"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Shows only the OTHER language, as a button-style link, and keeps the current page.
export default function LocaleSwitcher({ lang, label }) {
  const pathname = usePathname() || `/${lang}`;
  const other = lang === "bn" ? "en" : "bn";
  const href = pathname.replace(/^\/(bn|en)(?=\/|$)/, `/${other}`);

  return (
    <Link
      href={href}
      hrefLang={other}
      className="rounded-full bg-white px-3 py-0.5 text-xs font-semibold text-brand hover:bg-accent"
    >
      {label}
    </Link>
  );
}
