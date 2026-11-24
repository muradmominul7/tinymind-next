import Link from "next/link";
import { Suspense } from "react";
import CategoryNav from "./CategoryNav";
import LocaleSwitcher from "./LocaleSwitcher";
import CartLink from "./CartLink";
import SearchBox from "./SearchBox";
import { UserIcon } from "./icons";

export default function Header({ lang, t }) {
  const other = lang === "bn" ? "en" : "bn";
  const iconButton = "rounded-full p-2 text-heading hover:bg-secondary";

  return (
    <header>
      <div className="bg-brand text-sm text-white">
        <div className="mx-auto flex max-w-site items-center justify-between gap-3 px-4 py-1.5 md:grid md:grid-cols-[1fr_auto_1fr]">
          <p className="md:col-start-2 md:text-center">
            {t.header.promo}{" "}
            <Link href={`/${lang}`} className="font-semibold underline">
              {t.header.shopNow}
            </Link>
          </p>
          <div className="flex shrink-0 justify-end md:col-start-3">
            <Suspense fallback={null}>
              <LocaleSwitcher lang={lang} label={t.language[other]} />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="border-b border-subtle bg-page">
        <div className="mx-auto flex max-w-site flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
          <Link href={`/${lang}`} aria-label={t.site.name} className="shrink-0">
            <img src="/logo.svg" alt={t.site.name} className="h-10 w-auto md:h-12" />
          </Link>

          <SearchBox
            lang={lang}
            labels={{
              placeholder: t.header.searchPlaceholder,
              button: t.header.searchButton,
              viewAll: t.header.viewAll,
              noResults: t.header.noResults,
            }}
          />

          {/* Account comes in a later phase. */}
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <CartLink lang={lang} label={t.header.cart} />
            <button type="button" aria-label={t.header.account} className={iconButton}>
              <UserIcon />
            </button>
          </div>
        </div>
      </div>

      <CategoryNav lang={lang} />
    </header>
  );
}
