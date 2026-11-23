import Link from "next/link";
import { Suspense } from "react";
import CategoryNav from "./CategoryNav";
import LocaleSwitcher from "./LocaleSwitcher";

export default function Header({ lang, t }) {
  const other = lang === "bn" ? "en" : "bn";

  return (
    <header>
      <div className="bg-brand text-sm text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5">
          <p>
            {t.header.promo}{" "}
            <Link href={`/${lang}`} className="font-semibold underline">
              {t.header.shopNow}
            </Link>
          </p>
          <Suspense fallback={null}>
            <LocaleSwitcher lang={lang} label={t.language[other]} />
          </Suspense>
        </div>
      </div>

      <div className="border-b border-subtle bg-page">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link href={`/${lang}`} className="text-2xl font-extrabold text-brand">
            {t.site.name}
          </Link>

          <form
            action={`/${lang}/search`}
            className="ml-auto flex w-full max-w-md items-center rounded-full bg-secondary pl-4"
          >
            <input
              name="q"
              type="search"
              placeholder={t.header.searchPlaceholder}
              className="w-full bg-transparent py-2 text-sm outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
            >
              {t.header.searchButton}
            </button>
          </form>
        </div>
      </div>

      <CategoryNav lang={lang} />
    </header>
  );
}
